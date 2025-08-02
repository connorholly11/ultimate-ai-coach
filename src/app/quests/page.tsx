'use client'

import { QuestList } from '@/components/quests/QuestList'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function QuestsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/chat">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Chat
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Quests</h1>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Growth Quests</h2>
            <p className="text-muted-foreground">
              Take on challenges to build better habits and achieve your goals. Complete quests to earn points and track your progress.
            </p>
          </div>
          
          <QuestList />
        </div>
      </main>
    </div>
  )
}