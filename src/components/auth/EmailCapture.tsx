'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Sparkles } from 'lucide-react'
import { sbBrowser } from '@/lib/supabase'

interface EmailCaptureProps {
  title?: string
  description?: string
  onSuccess?: () => void
}

export function EmailCapture({ 
  title = "Start Your AI Coaching Journey",
  description = "Enter your email to get instant access. No password needed!",
  onSuccess
}: EmailCaptureProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || loading) return
    
    setLoading(true)
    setError('')
    
    try {
      const supabase = sbBrowser()
      const callbackUrl = `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(window.location.pathname)}`
      
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: callbackUrl
        }
      })
      
      if (signInError) throw signInError
      
      setSuccess(true)
      onSuccess?.()
      
      // Store email for better UX on callback
      localStorage.setItem('pending_auth_email', email)
      
    } catch (err) {
      console.error('Auth error:', err)
      setError('Failed to send magic link. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  if (success) {
    return (
      <Card className="mx-auto max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Mail className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle>Check Your Email!</CardTitle>
          <CardDescription>
            We sent a magic link to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          <p>Click the link in your email to start your coaching journey.</p>
          <p className="mt-2">The link expires in 1 hour.</p>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-500">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              className="text-center text-lg"
              autoComplete="email"
            />
          </div>
          
          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}
          
          <Button 
            type="submit" 
            className="w-full gap-2" 
            size="lg"
            disabled={loading || !email}
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Sending Magic Link...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                Get Started Free
              </>
            )}
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            No credit card required • Instant access • Cancel anytime
          </p>
        </form>
      </CardContent>
    </Card>
  )
}