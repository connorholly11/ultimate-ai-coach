import { sbService } from '@/lib/supabase'
import { getAuthUser, authError } from '@/lib/auth-helpers'
import type { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    // Require authentication
    const user = await getAuthUser(req)
    if (!user) return authError()
    
    const { email, onboardingData } = await req.json()
    
    const supabase = sbService()
    
    // Update user record with email, upgraded timestamp, and metadata
    const metadata: Record<string, unknown> = {}
    if (onboardingData) {
      metadata.goals = onboardingData.goals
      metadata.personality = onboardingData.personality
      metadata.onboarding_completed_at = onboardingData.completedAt
    }
    
    await supabase.from('users').upsert({
      uid: user.id,
      email: user.email || email,
      upgraded_at: new Date().toISOString(),
      metadata: Object.keys(metadata).length > 0 ? metadata : null
    })
    
    return new Response(null, { status: 204 })
  } catch (error) {
    console.error('Upgrade error:', error)
    return new Response('Internal error', { status: 500 })
  }
}