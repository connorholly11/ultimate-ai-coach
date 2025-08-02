import { NextRequest, NextResponse } from 'next/server'
import { sbService } from '@/lib/supabase'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const anonUid = searchParams.get('anonUid')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    // Determine user ID
    let uid = anonUid
    const authHeader = req.headers.get('Authorization')
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user }, error } = await sbService.auth.getUser(token)
      if (!error && user) {
        uid = user.id
      }
    }
    
    if (!uid) {
      return NextResponse.json({ error: 'Invalid user identifier' }, { status: 401 })
    }
    
    // Fetch memories
    const { data: memories, error: memoriesError } = await sbService
      .from('memories')
      .select('*')
      .or(`uid.eq.${uid},anon_uid.eq.${uid}`)
      .order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1)
    
    if (memoriesError) {
      console.error('Error fetching memories:', memoriesError)
    }
    
    // Fetch conversations
    const { data: conversations, error: conversationsError } = await sbService
      .from('conversations')
      .select('*')
      .or(`uid.eq.${uid},anon_uid.eq.${uid}`)
      .order('started_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1)
    
    if (conversationsError) {
      console.error('Error fetching conversations:', conversationsError)
    }
    
    // Count messages for each conversation
    const conversationsWithCount = await Promise.all(
      (conversations || []).map(async (conv) => {
        const { count } = await sbService
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .or(`uid.eq.${uid},anon_uid.eq.${uid}`)
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