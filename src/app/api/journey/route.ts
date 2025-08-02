import { NextRequest, NextResponse } from 'next/server'
import { sbService } from '@/lib/supabase'
import { getAuthUser, authError } from '@/lib/auth-helpers'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  try {
    // Require authentication
    const user = await getAuthUser(req)
    if (!user) return authError()
    
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    const uid = user.id
    
    // Fetch memories
    const { data: memories, error: memoriesError } = await sbService()
      .from('memories')
      .select('*')
      .eq('uid', uid)
      .order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1)
    
    if (memoriesError) {
      console.error('Error fetching memories:', memoriesError)
    }
    
    // Fetch conversations
    const { data: conversations, error: conversationsError } = await sbService()
      .from('conversations')
      .select('*')
      .eq('uid', uid)
      .order('started_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1)
    
    if (conversationsError) {
      console.error('Error fetching conversations:', conversationsError)
    }
    
    // Count messages for each conversation
    const conversationsWithCount = await Promise.all(
      (conversations || []).map(async (conv) => {
        const { count } = await sbService()
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('uid', uid)
          .gte('created_at', conv.started_at)
          .lte('created_at', conv.ended_at || new Date().toISOString())
        
        return {
          ...conv,
          messageCount: count || 0
        }
      })
    )
    
    // Format response
    const formattedMemories = (memories || []).map(memory => ({
      id: memory.id.toString(),
      title: memory.title,
      insight: memory.insight,
      type: memory.type,
      conversationId: memory.conversation_id?.toString(),
      createdAt: memory.created_at
    }))
    
    const formattedConversations = conversationsWithCount.map(conv => ({
      id: conv.id.toString(),
      startedAt: conv.started_at,
      endedAt: conv.ended_at,
      summary: conv.summary,
      messageCount: conv.messageCount
    }))
    
    return NextResponse.json({
      memories: formattedMemories,
      conversations: formattedConversations
    })
  } catch (error) {
    console.error('Journey API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}