'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, ArrowLeft, ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ValuesRankingStepProps {
  onNext: (values: string[]) => void
  onBack: () => void
}

const coreValues = [
  { id: 'achievement', name: 'Achievement', description: 'Success and accomplishment' },
  { id: 'autonomy', name: 'Autonomy', description: 'Independence and freedom' },
  { id: 'connection', name: 'Connection', description: 'Relationships and belonging' },
  { id: 'growth', name: 'Growth', description: 'Learning and development' },
  { id: 'purpose', name: 'Purpose', description: 'Meaning and contribution' },
  { id: 'security', name: 'Security', description: 'Stability and safety' },
  { id: 'adventure', name: 'Adventure', description: 'Excitement and new experiences' },
  { id: 'balance', name: 'Balance', description: 'Harmony in all life areas' }
]

export function ValuesRankingStep({ onNext, onBack }: ValuesRankingStepProps) {
  const [rankedValues, setRankedValues] = useState<typeof coreValues>([...coreValues])
  
  const moveValue = (index: number, direction: 'up' | 'down') => {
    const newRankedValues = [...rankedValues]
    if (direction === 'up' && index > 0) {
      [newRankedValues[index], newRankedValues[index - 1]] = 
      [newRankedValues[index - 1], newRankedValues[index]]
    } else if (direction === 'down' && index < rankedValues.length - 1) {
      [newRankedValues[index], newRankedValues[index + 1]] = 
      [newRankedValues[index + 1], newRankedValues[index]]
    }
    setRankedValues(newRankedValues)
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Return just the top 5 values
    onNext(rankedValues.slice(0, 5).map(v => v.name))
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
            Rank your core values
          </h2>
          <p className="text-muted-foreground">
            Order these values from most to least important. Your top 5 will guide your coaching experience.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            {rankedValues.map((value, index) => (
              <div
                key={value.id}
                className={cn(
                  "bg-white rounded-xl shadow-sm border p-4 transition-all",
                  index < 5 && "border-primary/50 bg-primary/5"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "text-2xl font-bold w-8 text-center",
                      index < 5 ? "text-primary" : "text-muted-foreground"
                    )}>
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{value.name}</h3>
                      <p className="text-sm text-muted-foreground">{value.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => moveValue(index, 'up')}
                      disabled={index === 0}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => moveValue(index, 'down')}
                      disabled={index === rankedValues.length - 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="pt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Your top 5 values will be saved and used to personalize your coaching experience.
            </p>
            
            <Button 
              type="submit" 
              size="lg" 
              className="w-full gap-2"
            >
              Complete Setup
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}