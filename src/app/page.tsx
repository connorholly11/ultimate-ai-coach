'use client'

import { AuthGuard } from '@/components/auth/AuthGuard'
import { EmailCapture } from '@/components/auth/EmailCapture'
import { FTUEFlow } from '@/components/onboarding/FTUEFlow'
import { useSession } from '@/hooks/useSession'

export default function Home() {
  const { user, loading } = useSession()

  // Show loading state while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is authenticated, show onboarding flow
  if (user) {
    return <FTUEFlow />
  }

  // If not authenticated, show email capture
  return <EmailCapture />
}