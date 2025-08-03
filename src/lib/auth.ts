import { sbBrowser } from './supabase'
export { signOut } from './auth-helpers'

// Helper to get current user session
export async function getCurrentSession() {
  const supabase = sbBrowser()
  return await supabase.auth.getSession()
}