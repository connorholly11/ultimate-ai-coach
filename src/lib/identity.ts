export function ensureAnonUid(): string {
  if (typeof window === 'undefined') {
    throw new Error('ensureAnonUid can only be called on the client')
  }
  
  let uid = localStorage.getItem('purpose_uid')
  if (!uid) {
    uid = crypto.randomUUID()
    localStorage.setItem('purpose_uid', uid)
    
    // Register with backend
    fetch('/api/referral', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        uid, 
        ref: new URLSearchParams(window.location.search).get('ref') 
      }) 
    }).catch(console.error)
  }
  return uid
}

export function shareLink(uid: string): string {
  if (typeof window === 'undefined') {
    return ''
  }
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
  return `${baseUrl}?ref=${uid}`
}

export function clearAnonUid(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('purpose_uid')
  }
}