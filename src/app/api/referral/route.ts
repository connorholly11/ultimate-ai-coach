import { sbService } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, authError } from '@/lib/auth-helpers'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    // Require authentication
    const user = await getAuthUser(req)
    if (!user) return authError()
    
    const { ref } = await req.json()
    
    const supabase = sbService()
    
    // Check if user already has a referrer set to prevent tampering
    const { data: existingUser } = await supabase
      .from('users')
      .select('referrer_uid')
      .eq('uid', user.id)
      .single()
    
    // Only allow setting referrer if not already set
    if (existingUser?.referrer_uid) {
      return NextResponse.json(
        { error: 'Referrer already set' },
        { status: 409 }
      )
    }
    
    await supabase.from('users').upsert(
      { 
        uid: user.id, 
        referrer_uid: ref ?? null 
      }, 
      { onConflict: 'uid' }
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Referral error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}