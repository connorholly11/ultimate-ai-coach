import { sbService } from '@/lib/supabase'

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { uid, ref } = await req.json()
    
    if (!uid) {
      return new Response('UID required', { status: 400 })
    }
    
    const supabase = sbService()
    await supabase.from('users').upsert(
      { 
        uid, 
        referrer_uid: ref ?? null 
      }, 
      { onConflict: 'uid' }
    )
    
    return new Response(null, { status: 204 })
  } catch (error) {
    console.error('Referral error:', error)
    return new Response('Internal error', { status: 500 })
  }
}