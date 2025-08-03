import { sbBrowser } from './supabase'
import { sbService } from './supabase/server'
import type { NextRequest } from 'next/server'

/**
 * Get authenticated user from request headers
 * Returns null if not authenticated
 */
export async function getAuthUser(req: NextRequest) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return null
  
  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await sbService().auth.getUser(token)
  
  if (error || !user) return null
  return user
}

/**
 * Create auth response with proper error handling
 */
export function authError(message: string = 'Authentication required', status: number = 401) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}

/**
 * Sign out and clear all auth data
 */
export async function signOut() {
  const supabase = sbBrowser()
  
  // Clear all auth-related data
  localStorage.removeItem('pending_auth_email')
  localStorage.removeItem('purpose_messages')
  localStorage.removeItem('purpose_episode_id')
  localStorage.removeItem('purpose_onboarding')
  
  await supabase.auth.signOut()
  
  // Redirect to home
  window.location.href = '/'
}