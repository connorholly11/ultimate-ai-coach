'use client'

import { cn } from '@/lib/utils'

interface LikertScaleProps {
  value?: number
  onChange: (value: number) => void
  disabled?: boolean
  questionText?: string
  showLabels?: boolean
}

const scaleOptions = [
  { value: 1, label: 'Strongly Disagree', color: 'bg-red-500' },
  { value: 2, label: 'Disagree', color: 'bg-orange-500' },
  { value: 3, label: 'Neutral', color: 'bg-yellow-500' },
  { value: 4, label: 'Agree', color: 'bg-blue-500' },
  { value: 5, label: 'Strongly Agree', color: 'bg-green-500' }
]

export function LikertScale({ 
  value, 
  onChange, 
  disabled = false,
  questionText,
  showLabels = false
}: LikertScaleProps) {
  return (
    <div className="space-y-3">
      {questionText && (
        <p className="text-sm font-medium text-gray-700">{questionText}</p>
      )}
      
      <div className="flex justify-between items-center gap-2">
        {scaleOptions.map((option) => (
          <div key={option.value} className="flex flex-col items-center flex-1">
            <button
              type="button"
              onClick={() => onChange(option.value)}
              disabled={disabled}
              className={cn(
                "w-full aspect-square rounded-full border-2 transition-all duration-200",
                "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2",
                "min-w-[40px] max-w-[60px]",
                value === option.value
                  ? `${option.color} border-transparent text-white shadow-lg scale-110`
                  : "bg-gray-100 border-gray-300 hover:border-gray-400",
                disabled && "opacity-50 cursor-not-allowed hover:scale-100"
              )}
              aria-label={option.label}
            >
              <span className="text-sm font-semibold">
                {option.value}
              </span>
            </button>
            
            {showLabels && (
              <span className={cn(
                "text-xs mt-1 text-center",
                value === option.value ? "font-medium" : "text-muted-foreground"
              )}>
                {option.label.split(' ')[0]}
              </span>
            )}
          </div>
        ))}
      </div>
      
      {!showLabels && (
        <div className="flex justify-between text-xs text-muted-foreground px-1">
          <span>Strongly Disagree</span>
          <span>Strongly Agree</span>
        </div>
      )}
    </div>
  )
}

// Variant for Values assessment that shows importance scale
export function ValuesLikertScale({ 
  value, 
  onChange, 
  disabled = false,
  questionText
}: LikertScaleProps) {
  const importanceOptions = [
    { value: 1, label: 'Not Important', color: 'bg-gray-400' },
    { value: 2, label: 'Slightly Important', color: 'bg-blue-400' },
    { value: 3, label: 'Moderately Important', color: 'bg-yellow-500' },
    { value: 4, label: 'Very Important', color: 'bg-orange-500' },
    { value: 5, label: 'Extremely Important', color: 'bg-red-500' }
  ]

  return (
    <div className="space-y-3">
      {questionText && (
        <p className="text-sm font-medium text-gray-700">
          <span className="text-muted-foreground">It's important to me that</span> {questionText}
        </p>
      )}
      
      <div className="flex justify-between items-center gap-2">
        {importanceOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            disabled={disabled}
            className={cn(
              "flex-1 py-2 px-1 rounded-lg border-2 text-xs transition-all duration-200",
              "hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2",
              value === option.value
                ? `${option.color} border-transparent text-white shadow-md`
                : "bg-gray-50 border-gray-300 hover:border-gray-400",
              disabled && "opacity-50 cursor-not-allowed hover:scale-100"
            )}
          >
            {option.value}
          </button>
        ))}
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground px-1">
        <span>Not Important</span>
        <span>Extremely Important</span>
      </div>
    </div>
  )
}