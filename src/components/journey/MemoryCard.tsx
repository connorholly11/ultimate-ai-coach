import { cn } from '@/lib/utils'

interface MemoryCardProps {
  memory: {
    id: string
    title: string
    insight: string
    type: 'realization' | 'growth' | 'milestone'
    createdAt: string
  }
}

export function MemoryCard({ memory }: MemoryCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  
  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'realization':
        return 'bg-purple-100 text-purple-700'
      case 'growth':
        return 'bg-green-100 text-green-700'
      case 'milestone':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }
  
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-800">{memory.title}</h4>
        <span className={cn(
          "text-xs px-2 py-1 rounded-full capitalize",
          getTypeStyles(memory.type)
        )}>
          {memory.type}
        </span>
      </div>
      <p className="text-gray-600 text-sm mb-3">{memory.insight}</p>
      <p className="text-xs text-gray-400">{formatDate(memory.createdAt)}</p>
    </div>
  )
}