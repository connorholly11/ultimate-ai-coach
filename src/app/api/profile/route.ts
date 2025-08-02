import { NextRequest, NextResponse } from 'next/server'
import { sbService } from '@/lib/supabase'
import type { FTUEData } from '@/types/auth'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { profile, anonUid } = body as { profile: FTUEData; anonUid?: string }
    
    if (!profile || (!anonUid && !req.headers.get('Authorization'))) {
      return NextResponse.json({ error: 'Missing profile data or user identifier' }, { status: 400 })
    }
    
    // Determine user ID
    let uid = anonUid
    const authHeader = req.headers.get('Authorization')
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user }, error } = await sbService().auth.getUser(token)
      if (!error && user) {
        uid = user.id
      }
    }
    
    if (!uid) {
      return NextResponse.json({ error: 'Invalid user identifier' }, { status: 401 })
    }
    
    // Prepare personality profile data
    const profileData = {
      uid,
      anon_uid: anonUid,
      big_five: profile.bigFive || null,
      values: profile.valuesRanking || [],
      attachment_style: profile.attachmentStyle || null,
      updated_at: new Date().toISOString()
    }
    
    // Upsert personality profile
    const { error: profileError } = await sbService()
      .from('personality_profiles')
      .upsert(profileData, { onConflict: 'uid' })
    
    if (profileError) {
      console.error('Error saving personality profile:', profileError)
      return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Profile API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const anonUid = searchParams.get('anonUid')
    
    // Determine user ID
    let uid = anonUid
    const authHeader = req.headers.get('Authorization')
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user }, error } = await sbService().auth.getUser(token)
      if (!error && user) {
        uid = user.id
      }
    }
    
    if (!uid) {
      return NextResponse.json({ error: 'Invalid user identifier' }, { status: 401 })
    }
    
    // Fetch personality profile
    const { data: profile, error } = await sbService()
      .from('personality_profiles')
      .select('*')
      .or(`uid.eq.${uid},anon_uid.eq.${uid}`)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No profile found
        return NextResponse.json({ profile: null })
      }
      console.error('Error fetching personality profile:', error)
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }
    
    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Profile API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}