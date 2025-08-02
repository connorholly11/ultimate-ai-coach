import { sbService } from '@/lib/supabase'
import { Anthropic } from '@anthropic-ai/sdk'

export const runtime = 'edge'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

interface ChatRequest {
  message: string
  anonUid?: string
  episodeId?: string
  reset?: boolean
}

export async function POST(req: Request) {
  try {
    const body: ChatRequest = await req.json()
    const { message, anonUid, reset } = body
    
    // Get caller UID from auth header or anonymous UID
    const authHeader = req.headers.get('Authorization')
    const supaJwt = authHeader?.replace('Bearer ', '')
    const supabase = sbService()
    
    let callerUid: string
    if (supaJwt) {
      const { data: { user } } = await supabase.auth.getUser(supaJwt)
      callerUid = user?.id || anonUid || ''
    } else {
      callerUid = anonUid || ''
    }
    
    if (!callerUid) {
      return new Response('No user identifier', { status: 401 })
    }
    
    // Handle episode management
    const episodeId = reset ? crypto.randomUUID() : (body.episodeId || 'default')
    
    // Check daily rate limit
    const { data: dailyTurns } = await supabase
      .from('daily_turns')
      .select('today')
      .eq('uid', callerUid)
      .single()
    
    if (dailyTurns?.today >= 500) {
      return new Response('Daily quota exceeded', { status: 429 })
    }
    
    // Get recent messages for context (last 20 messages)
    const { data: recentMessages } = await supabase
      .from('messages')
      .select('role, content')
      .eq('uid', callerUid)
      .eq('episode_id', episodeId)
      .order('turn_index', { ascending: true })
      .limit(20)
    
    // Calculate next turn index
    const { data: maxTurn } = await supabase
      .from('messages')
      .select('turn_index')
      .eq('uid', callerUid)
      .eq('episode_id', episodeId)
      .order('turn_index', { ascending: false })
      .limit(1)
      .single()
    
    const nextTurnIndex = (maxTurn?.turn_index || 0) + 1
    
    // Store user message
    const { data: userMsg } = await supabase
      .from('messages')
      .insert({
        uid: callerUid,
        episode_id: episodeId,
        turn_index: nextTurnIndex,
        role: 'user',
        content: message,
        char_count: message.length
      })
      .select()
      .single()
    
    // Build messages for Claude
    const messages = [
      ...(recentMessages || []).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      })),
      { role: 'user' as const, content: message }
    ]
    
    // Call Claude
    const claudeResponse = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages,
      system: "You are a helpful AI coach focused on personal development and goal achievement. Be supportive, insightful, and action-oriented."
    })
    
    const assistantContent = claudeResponse.content[0].type === 'text' 
      ? claudeResponse.content[0].text 
      : ''
    
    // Store assistant response
    const { data: assistantMsg } = await supabase
      .from('messages')
      .insert({
        uid: callerUid,
        episode_id: episodeId,
        turn_index: nextTurnIndex + 1,
        role: 'assistant',
        content: assistantContent,
        char_count: assistantContent.length
      })
      .select()
      .single()
    
    return Response.json({
      reply: assistantContent,
      episodeId,
      messageId: assistantMsg?.id
    })
    
  } catch (error) {
    console.error('Chat error:', error)
    return new Response('Internal error', { status: 500 })
  }
}