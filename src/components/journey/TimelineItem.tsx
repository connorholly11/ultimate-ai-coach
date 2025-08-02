interface TimelineItemProps {
  conversation: {
    id: string
    startedAt: string
    endedAt?: string
    summary?: string
    messageCount: number
  }
}

export function TimelineItem({ conversation }: TimelineItemProps) {
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
  
  return (
    <button className="w-full bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all text-left">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-500">{formatDate(conversation.startedAt)}</p>
        <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
          {conversation.messageCount} messages
        </span>
      </div>
      <p className="text-gray-700 text-sm line-clamp-2">
        {conversation.summary || 'Conversation about personal growth and development'}
      </p>
    </button>
  )
}