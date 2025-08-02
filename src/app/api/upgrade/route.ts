import { sbService } from '@/lib/supabase'

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { email, anonUid } = await req.json()
    
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
    
    // Update user record with email and upgraded timestamp
    await supabase.from('users').upsert({
      uid: realUid,
      email: user.email || email,
      upgraded_at: new Date().toISOString()
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