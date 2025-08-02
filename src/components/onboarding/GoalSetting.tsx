'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ArrowRight, ArrowLeft } from 'lucide-react'

interface GoalSettingProps {
  onNext: (goals: string) => void
  onBack: () => void
}

export function GoalSetting({ onNext, onBack }: GoalSettingProps) {
  const [goals, setGoals] = useState('')
  
  const examples = [
    "I want to improve my productivity and time management",
    "I'm looking to advance my career and develop leadership skills", 
    "I want to build healthier habits and improve my fitness",
    "I need help managing stress and improving work-life balance"
  ]
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (goals.trim()) {
      onNext(goals)
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-4">
            What would you like to achieve?
          </h2>
          <p className="text-muted-foreground">
            Share your goals and aspirations. Be as specific or general as you like.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="goals">Your Goals</Label>
            <Textarea
              id="goals"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="Describe what you want to work on..."
              className="min-h-[150px] resize-none"
              required
            />
          </div>
          
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Need inspiration? Here are some examples:</p>
            <div className="space-y-2">
              {examples.map((example, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setGoals(example)}
                  className="w-full text-left p-3 text-sm rounded-lg border hover:bg-accent transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
          
          <Button 
            type="submit" 
            size="lg" 
            className="w-full gap-2"
            disabled={!goals.trim()}
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}