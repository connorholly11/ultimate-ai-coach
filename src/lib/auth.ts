import { sbBrowser } from './supabase'
import { clearAnonUid } from './identity'

export async function upgradeToEmail(email: string, anonUid: string) {
  const supabase = sbBrowser()
  
  // Get the callback URL
  const callbackUrl = `${window.location.origin}/auth/callback`
  
  // Sign in with magic link
  const { error: signInError } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: callbackUrl
    }
  })
  
  if (signInError) {
    throw signInError
  }
  
  // Store the anonymous UID for the callback to use
  localStorage.setItem('pending_upgrade_uid', anonUid)
  
  return { success: true, message: 'Check your email for the magic link!' }
}

export async function handleEmailUpgradeCallback(anonUid: string) {
  // Call the upgrade API to merge accounts
  const response = await fetch('/api/upgrade', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: '', anonUid })
  })
  
  if (response.ok) {
    // Clear the anonymous UID as we've upgraded
    clearAnonUid()
    return true
  }
  
  return false
}