import { NextRequest, NextResponse } from 'next/server'
import { sbService } from '@/lib/supabase/server'
import type { FTUEData } from '@/types/auth'
import { getAuthUser, authError } from '@/lib/auth-helpers'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    // Require authentication
    const user = await getAuthUser(req)
    if (!user) return authError()
    
    const body = await req.json()
    const { profile } = body as { profile: FTUEData }
    
    if (!profile) {
      return NextResponse.json({ error: 'Missing profile data' }, { status: 400 })
    }
    
    // Prepare personality profile data
    const profileData = {
      uid: user.id,
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
    // Require authentication
    const user = await getAuthUser(req)
    if (!user) return authError()
    
    // Fetch personality profile
    const { data: profile, error } = await sbService()
      .from('personality_profiles')
      .select('*')
      .eq('uid', user.id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No profile found
        return NextResponse.json({ profile: null })
      }
      console.error('Error fetching personality profile:', error)
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }
    
    // Transform database fields to match FTUEData structure
    const transformedProfile = {
      ...profile,
      bigFive: profile.big_five,
      valuesMeta: profile.values_meta,
      attachment: profile.attachment_dimensions,
      regulatoryFocus: profile.regulatory_focus,
      selfEfficacy: profile.self_efficacy
    }
    
    return NextResponse.json({ profile: transformedProfile })
  } catch (error) {
    console.error('Profile API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}