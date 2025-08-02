import { sbBrowser } from './supabase'
import { clearAnonUid } from './identity'

export async function upgradeToEmail(email: string, anonUid: string) {
  const supabase = sbBrowser()
  
  // Sign in with magic link
  const { error: signInError } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    }
  })
  
  if (signInError) {
    throw signInError
  }
  
  // After user clicks the magic link and returns, we need to handle the upgrade
  // This will be called from the callback page
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