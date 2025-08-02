'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, ArrowLeft, Heart, Zap, BookOpen, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PersonalityChoiceProps {
  onNext: (personality: string) => void
  onBack: () => void
}

const personalities = [
  {
    id: 'supportive',
    name: 'Supportive Friend',
    description: 'Warm, encouraging, and always in your corner',
    icon: Heart,
    color: 'text-pink-500'
  },
  {
    id: 'motivational',
    name: 'Motivational Coach',
    description: 'High-energy, pushing you to reach your potential',
    icon: Zap,
    color: 'text-yellow-500'
  },
  {
    id: 'strategic',
    name: 'Strategic Advisor',
    description: 'Analytical, focused on planning and optimization',
    icon: BookOpen,
    color: 'text-blue-500'
  },
  {
    id: 'accountability',
    name: 'Accountability Partner',
    description: 'Direct, honest, and keeps you on track',
    icon: Shield,
    color: 'text-green-500'
  }
]

export function PersonalityChoice({ onNext, onBack }: PersonalityChoiceProps) {
  const [selected, setSelected] = useState<string>('')
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selected) {
      onNext(selected)
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
            Choose your coaching style
          </h2>
          <p className="text-muted-foreground">
            Select the personality that resonates with you. You can always change this later.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4">
            {personalities.map((personality) => {
              const Icon = personality.icon
              return (
                <button
                  key={personality.id}
                  type="button"
                  onClick={() => setSelected(personality.id)}
                  className={cn(
                    "w-full p-6 rounded-lg border-2 transition-all text-left",
                    selected === personality.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn("p-3 rounded-lg bg-muted", personality.color)}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{personality.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {personality.description}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
          
          <Button 
            type="submit" 
            size="lg" 
            className="w-full gap-2"
            disabled={!selected}
          >
            Complete Setup
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}