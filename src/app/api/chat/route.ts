import { sbService } from '@/lib/supabase'
import { Anthropic } from '@anthropic-ai/sdk'
import { checkRateLimit, checkSpendingCap } from '@/lib/rate-limit'

export const runtime = 'edge'

const MAX_INPUT_CHARS = Number(process.env.MAX_INPUT_CHARS ?? 10_000)

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

interface ChatRequest {
  message: string
  anonUid?: string
  episodeId?: string
  reset?: boolean
  personality?: string
}

export async function POST(req: Request) {
  try {
    // Check if service is enabled (kill switch)
    if (process.env.ENABLE_CHAT === 'false') {
      return new Response('Service under maintenance', { status: 503 })
    }

    // Get client IP for rate limiting
    const clientIp = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown'
    
    // Check IP rate limit
    const { allowed: ipAllowed } = await checkRateLimit(clientIp)
    if (!ipAllowed) {
      return new Response('Too many requests', { status: 429 })
    }
    
    // Check global spending cap
    const { allowed: budgetAllowed, spent } = await checkSpendingCap()
    if (!budgetAllowed) {
      console.error(
        `Spending cap reached — spent this month: $${spent.toFixed(2)} (limit: $${process.env.MONTHLY_SPEND_LIMIT})`
      )
      return new Response('Service temporarily unavailable due to high usage', { status: 503 })
    }
    
    const body: ChatRequest = await req.json()
    const { message, anonUid, reset, personality } = body

    if (typeof message !== 'string' || message.length > MAX_INPUT_CHARS) {
      return new Response(
        `Message too long – max ${MAX_INPUT_CHARS.toLocaleString()} characters.`,
        { status: 400 }
      )
    }
    
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
    const episodeId = reset ? crypto.randomUUID() : (body.episodeId || crypto.randomUUID())
    
    // Check daily rate limit
    const { data: dailyTurns } = await supabase
      .from('daily_turns')
      .select('today')
      .eq('uid', callerUid)
      .single()
    
    const maxDailyTurns = supaJwt ? 500 : 100
    if ((dailyTurns?.today || 0) >= maxDailyTurns) {
      return new Response(
        supaJwt
          ? 'Daily quota exceeded'
          : 'Daily quota exceeded. Sign up with email to get a higher limit!',
        { status: 429 }
      )
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
    await supabase
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
    
    // Call Claude with personality-based system prompt
    const systemPrompts = {
      supportive: "You are a warm, encouraging AI coach who acts like a supportive friend. Use empathetic language, celebrate small wins, and provide gentle encouragement. Focus on emotional support and understanding.",
      motivational: "You are a high-energy, motivational AI coach. Be enthusiastic, use powerful language, and push users to reach their potential. Focus on action, momentum, and breaking through barriers.",
      strategic: "You are an analytical, strategic AI coach. Provide structured advice, help break down complex goals, and focus on optimization and planning. Use data-driven insights when relevant.",
      accountability: "You are a direct, honest AI coach focused on accountability. Be clear and straightforward, call out excuses constructively, and keep users focused on their commitments. Balance firmness with support.",
      default: "You are a helpful AI coach focused on personal development and goal achievement. Be supportive, insightful, and action-oriented."
    }
    
    const systemPrompt = systemPrompts[personality as keyof typeof systemPrompts] || systemPrompts.default
    
    const claudeResponse = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages,
      system: systemPrompt
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