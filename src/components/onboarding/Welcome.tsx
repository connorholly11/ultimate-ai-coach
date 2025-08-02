'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, Brain, Target, Users } from 'lucide-react'

interface WelcomeProps {
  onNext: () => void
}

export function Welcome({ onNext }: WelcomeProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex p-4 bg-primary/10 rounded-2xl mb-6">
            <Brain className="h-16 w-16 text-primary" />
          </div>
          
          <h1 className="text-4xl font-bold mb-4">
            Welcome to Your AI Coach
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Your personal guide to achieving goals and unlocking your potential
          </p>
          
          <Button onClick={onNext} size="lg" className="gap-2">
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <div className="text-center">
            <div className="inline-flex p-3 bg-muted rounded-lg mb-4">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="font-semibold mb-2">Set Clear Goals</h3>
            <p className="text-sm text-muted-foreground">
              Define what you want to achieve and get personalized guidance
            </p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex p-3 bg-muted rounded-lg mb-4">
              <Brain className="h-6 w-6" />
            </div>
            <h3 className="font-semibold mb-2">AI-Powered Insights</h3>
            <p className="text-sm text-muted-foreground">
              Get intelligent advice tailored to your unique situation
            </p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex p-3 bg-muted rounded-lg mb-4">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="font-semibold mb-2">Track Progress</h3>
            <p className="text-sm text-muted-foreground">
              Monitor your journey and celebrate achievements
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}