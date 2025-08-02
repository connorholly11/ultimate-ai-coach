'use client'

import { useEffect, useState } from 'react'
import { sbBrowser } from '@/lib/supabase'
import { useSession } from '@/hooks/useSession'
import { redirect } from 'next/navigation'

interface SpendingData {
  message_count: number
  total_cost: number
  unique_users: number
}

export default function AdminPage() {
  const { user, loading: userLoading } = useSession()
  const [monthData, setMonthData] = useState<SpendingData | null>(null)
  const [dayData, setDayData] = useState<SpendingData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userLoading && (!user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL)) {
      redirect('/')
    }
  }, [user, userLoading])

  useEffect(() => {
    async function fetchData() {
      const supabase = sbBrowser()
      
      const [monthRes, dayRes] = await Promise.all([
        supabase.rpc('get_current_month_spending'),
        supabase.rpc('get_current_day_spending')
      ])

      if (monthRes.data) setMonthData(monthRes.data[0])
      if (dayRes.data) setDayData(dayRes.data[0])
      setLoading(false)
    }

    if (user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      fetchData()
    }
  }, [user])

  if (userLoading || loading) {
    return <div className="p-8">Loading...</div>
  }

  if (!user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    return null
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="space-y-6">
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Today</h2>
          <div className="space-y-1 text-sm">
            <p>Messages: {dayData?.message_count || 0}</p>
            <p>Cost: ${dayData?.total_cost?.toFixed(2) || '0.00'}</p>
            <p>Users: {dayData?.unique_users || 0}</p>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">This Month</h2>
          <div className="space-y-1 text-sm">
            <p>Messages: {monthData?.message_count || 0}</p>
            <p>Cost: ${monthData?.total_cost?.toFixed(2) || '0.00'} / $50.00</p>
            <p>Users: {monthData?.unique_users || 0}</p>
          </div>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <p>Rate Limits: IP: 20/min | Anon: 100/day | Auth: 500/day</p>
          <p>Message Limit: 10,000 chars | Daily Cap: $2 | Monthly Cap: $50</p>
        </div>
      </div>
    </div>
  )
}