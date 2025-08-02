'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save } from 'lucide-react'
import { upgradeToEmail } from '@/lib/auth'
import { ensureAnonUid } from '@/lib/identity'
import { useSession } from '@/hooks/useSession'

export function SaveProgressButton() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const { user } = useSession()

  // Don't show if already logged in
  if (user) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || loading) return

    setLoading(true)
    try {
      const anonUid = ensureAnonUid()
      const result = await upgradeToEmail(email, anonUid)
      
      if (result.success) {
        setSuccess(true)
        // Don't close dialog - show success message
      }
    } catch (error) {
      console.error('Save progress error:', error)
      // Could show error toast here
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Save className="h-4 w-4" />
          Save Progress
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Your Progress</DialogTitle>
          <DialogDescription>
            Enter your email to save your chat history and continue on any device.
          </DialogDescription>
        </DialogHeader>
        
        {!success ? (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Magic Link'}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="py-8 text-center">
            <p className="text-green-600 font-medium mb-2">
              Check your email!
            </p>
            <p className="text-sm text-muted-foreground">
              We sent a magic link to {email}. Click it to save your progress.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}