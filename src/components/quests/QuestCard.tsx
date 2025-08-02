'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Clock, Target, CheckCircle2, Brain } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LikertScale, ValuesLikertScale } from './LikertScale'
import type { ProgressMap, QuestTemplate } from '@/types'


interface QuestCardProps {
  quest: QuestTemplate
  isActive?: boolean
  progress?: ProgressMap
  onStart?: () => void
  onUpdate?: (progress: ProgressMap) => void
  onComplete?: () => void
  onAbandon?: () => void
}

export function QuestCard({
  quest,
  isActive = false,
  progress = {},
  onStart,
  onUpdate,
  onComplete,
  onAbandon
}: QuestCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500'
      case 'medium': return 'text-yellow-500'
      case 'hard': return 'text-red-500'
      default: return 'text-muted-foreground'
    }
  }
  
  const calculateProgress = (): number => {
    if (!isActive) return 0
    
    // For assessment quests, progress is based on how many questions are answered
    if (quest.isAssessment) {
      const answered = Object.keys(progress).length
      const total = quest.tasks.length
      return Math.round((answered / total) * 100)
    }
    
    const totalTasks = quest.tasks.reduce((sum, task) => sum + (task.repeat || 1), 0)
    const completedTasks = Object.values(progress).reduce((sum: number, val) => {
      if (typeof val === 'boolean') return sum + (val ? 1 : 0)
      if (typeof val === 'number') return sum + val
      return sum
    }, 0)
    return Math.round((completedTasks / totalTasks) * 100)
  }
  
  const isQuestComplete = () => {
    if (!isActive) return false
    
    // For assessment quests, complete when all questions are answered
    if (quest.isAssessment) {
      return quest.tasks.every(task => progress[task.id] !== undefined)
    }
    
    return quest.tasks.every(task => {
      const taskProgress = progress[task.id]
      if (task.repeat) {
        return typeof taskProgress === 'number' && taskProgress >= task.repeat
      }
      return taskProgress === true
    })
  }
  
  const handleTaskToggle = (taskId: number, repeat?: number) => {
    if (!onUpdate) return
    
    const currentValue = progress[taskId] ?? (repeat ? 0 : false)
    let newValue: boolean | number
    
    if (repeat) {
      newValue = typeof currentValue === 'number' ? Math.min(currentValue + 1, repeat) : 1
    } else {
      newValue = !currentValue
    }
    
    const newProgress: ProgressMap = { ...progress, [taskId]: newValue }
    onUpdate(newProgress)
    
    // Check if quest is complete
    if (quest.isAssessment) {
      const allAnswered = quest.tasks.every(task => newProgress[task.id] !== undefined)
      if (allAnswered && onComplete) {
        onComplete()
      }
    } else {
      const allTasksComplete = quest.tasks.every(task => {
        const taskProgress = newProgress[task.id]
        if (task.repeat) {
          return typeof taskProgress === 'number' && taskProgress >= task.repeat
        }
        return taskProgress === true
      })
      
      if (allTasksComplete && onComplete) {
        onComplete()
      }
    }
  }
  
  const handleAssessmentAnswer = (taskId: number, value: number) => {
    if (!onUpdate) return
    
    const newProgress: ProgressMap = { ...progress, [taskId]: value }
    onUpdate(newProgress)
    
    // Check if all questions are answered
    const allAnswered = quest.tasks.every(task => newProgress[task.id] !== undefined)
    if (allAnswered && onComplete) {
      onComplete()
    }
  }
  
  const progressPercent = calculateProgress()
  
  return (
    <Card className={cn(
      "transition-all",
      isActive && "border-primary"
    )}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{quest.title}</CardTitle>
            <CardDescription className="mt-1">{quest.description}</CardDescription>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {quest.isAssessment ? (
              <>
                <Brain className="h-4 w-4 text-purple-500" />
                <span className="text-purple-500">Assessment</span>
              </>
            ) : (
              <>
                <Trophy className={cn("h-4 w-4", getDifficultyColor(quest.difficulty))} />
                <span className={getDifficultyColor(quest.difficulty)}>
                  {quest.difficulty}
                </span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{quest.durationDays} days</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            <span>{quest.rewards?.points || 100} points</span>
          </div>
        </div>
        
        {isActive && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">{progressPercent}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary rounded-full h-2 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {(isActive || isExpanded) && (
          <div className="space-y-2 mb-4">
            {quest.isAssessment && isActive ? (
              <>
                <h4 className="text-sm font-medium mb-4">
                  Please rate how much you agree with each statement:
                </h4>
                <div className="space-y-6">
                  {quest.tasks.map(task => {
                    const isValues = quest.id === 'values'
                    const LikertComponent = isValues ? ValuesLikertScale : LikertScale
                    
                    return (
                      <div key={task.id} className="pb-4 border-b last:border-0">
                        <LikertComponent
                          questionText={task.title}
                          value={progress[task.id] as number | undefined}
                          onChange={(value) => handleAssessmentAnswer(task.id, value)}
                          disabled={!isActive}
                        />
                      </div>
                    )
                  })}
                </div>
                
                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Questions answered: {Object.keys(progress).length} of {quest.tasks.length}
                  </p>
                </div>
              </>
            ) : (
              <>
                <h4 className="text-sm font-medium">Tasks:</h4>
                {quest.tasks.map(task => (
                  <div
                    key={task.id}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg",
                      isActive && !quest.isAssessment && "hover:bg-muted cursor-pointer"
                    )}
                    onClick={() => isActive && !quest.isAssessment && handleTaskToggle(task.id, task.repeat)}
                  >
                    <CheckCircle2 className={cn(
                      "h-4 w-4",
                      progress[task.id] ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "text-sm flex-1",
                      progress[task.id] && "line-through text-muted-foreground"
                    )}>
                      {task.title}
                      {task.repeat && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({typeof progress[task.id] === 'number' ? progress[task.id] : 0}/{task.repeat})
                        </span>
                      )}
                    </span>
                    {!task.required && (
                      <span className="text-xs text-muted-foreground">Optional</span>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        )}
        
        <div className="flex gap-2">
          {!isActive ? (
            <>
              <Button
                size="sm"
                onClick={onStart}
                className="flex-1"
              >
                Start Quest
              </Button>
              {!isExpanded && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsExpanded(true)}
                >
                  View Tasks
                </Button>
              )}
            </>
          ) : (
            <>
              {isQuestComplete() ? (
                <Button
                  size="sm"
                  onClick={onComplete}
                  className="flex-1"
                >
                  {quest.isAssessment ? 'Complete Assessment' : 'Complete Quest'}
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onAbandon}
                  className="flex-1"
                >
                  {quest.isAssessment ? 'Abandon Assessment' : 'Abandon Quest'}
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}