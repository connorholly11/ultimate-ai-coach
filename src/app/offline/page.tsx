import { WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
          <WifiOff className="h-8 w-8 text-muted-foreground" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">You're Offline</h1>
        <p className="text-muted-foreground mb-6">
          It looks like you've lost your internet connection. Some features may be unavailable until you're back online.
        </p>
        
        <Button 
          onClick={() => window.location.reload()}
          className="mb-4"
        >
          Try Again
        </Button>
        
        <p className="text-xs text-muted-foreground">
          Your chat history is saved locally and will sync when you reconnect.
        </p>
      </div>
    </div>
  )
}