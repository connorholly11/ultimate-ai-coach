import { NextRequest, NextResponse } from 'next/server'
import { Anthropic } from '@anthropic-ai/sdk'
import { sbService } from '@/lib/supabase/server'
import { buildBreakthroughPrompt } from '@/lib/prompt'
import { MODEL_IDS } from '@/lib/constants'
import { getAuthUser, authError } from '@/lib/auth-helpers'

export const runtime = 'edge'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

interface BreakthroughRequest {
  conversationId: string
  messages: Array<{ role: string; content: string }>
  uid: string
}

interface BreakthroughAnalysis {
  hasBreakthrough: boolean
  title?: string
  insight?: string
  type?: 'realization' | 'growth' | 'milestone'
}

export async function POST(req: NextRequest) {
  try {
    // Require authentication
    const user = await getAuthUser(req)
    if (!user) return authError()
    
    const body = await req.json() as BreakthroughRequest
    const { conversationId, messages, uid } = body
    
    if (!messages || messages.length < 5) {
      return NextResponse.json({ success: false, reason: 'Not enough messages' })
    }
    
    // Call Claude to analyze for breakthroughs
    const prompt = buildBreakthroughPrompt(messages)
    
    const response = await anthropic.messages.create({
      model: MODEL_IDS.SONNET,
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
      system: 'You are an AI that analyzes conversations for breakthrough moments. Respond only with valid JSON.'
    })
    
    const content = response.content[0]
    if (content.type !== 'text') {
      return NextResponse.json({ success: false, reason: 'Invalid response' })
    }
    
    let analysis: BreakthroughAnalysis
    try {
      analysis = JSON.parse(content.text)
    } catch (e) {
      console.error('Failed to parse breakthrough analysis:', e)
      return NextResponse.json({ success: false, reason: 'Parse error' })
    }
    
    if (!analysis.hasBreakthrough) {
      return NextResponse.json({ success: false, reason: 'No breakthrough detected' })
    }
    
    // Save the memory
    const { error } = await sbService()
      .from('memories')
      .insert({
        uid: user.id,
        title: analysis.title,
        insight: analysis.insight,
        type: analysis.type,
        conversation_id: conversationId
      })
    
    if (error) {
      console.error('Failed to save memory:', error)
      return NextResponse.json({ success: false, reason: 'Failed to save' })
    }
    
    return NextResponse.json({ 
      success: true, 
      memory: {
        title: analysis.title,
        insight: analysis.insight,
        type: analysis.type
      }
    })
  } catch (error) {
    console.error('Breakthrough API error:', error)
    return NextResponse.json({ success: false, reason: 'Internal error' }, { status: 500 })
  }
}