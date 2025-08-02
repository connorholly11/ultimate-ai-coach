import { sbService } from '@/lib/supabase'

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { email, anonUid, onboardingData } = await req.json()
    
    const supabase = sbService()
    
    // Get the authenticated user from the Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401 })
    }
    
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return new Response('Invalid session', { status: 401 })
    }
    
    const realUid = user.id
    
    // Update user record with email, upgraded timestamp, and metadata
    const metadata: Record<string, unknown> = {}
    if (onboardingData) {
      metadata.goals = onboardingData.goals
      metadata.personality = onboardingData.personality
      metadata.onboarding_completed_at = onboardingData.completedAt
    }
    
    await supabase.from('users').upsert({
      uid: realUid,
      email: user.email || email,
      upgraded_at: new Date().toISOString(),
      metadata: Object.keys(metadata).length > 0 ? metadata : null
    })
    
    // Migrate messages from anonymous to authenticated user
    if (anonUid && anonUid !== realUid) {
      await supabase
        .from('messages')
        .update({ uid: realUid })
        .eq('uid', anonUid)
    }
    
    return new Response(null, { status: 204 })
  } catch (error) {
    console.error('Upgrade error:', error)
    return new Response('Internal error', { status: 500 })
  }
}