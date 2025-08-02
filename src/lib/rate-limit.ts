import { sbService } from './supabase'

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

// const COST_PER_MESSAGE   = parseFloat(process.env.COST_PER_MESSAGE   || '0.003') // $/msg
const DAILY_SPEND_LIMIT  = parseFloat(process.env.DAILY_SPEND_LIMIT  || '2')     // $/day
const MONTHLY_SPEND_LIMIT = parseFloat(process.env.MONTHLY_SPEND_LIMIT || '50')  // $/month

// Simple in-memory store (replace with Redis in production)
const ipRequestCounts = new Map<string, { count: number; resetTime: number }>()

export async function checkRateLimit(
  ip: string,
  config: RateLimitConfig = { maxRequests: 20, windowMs: 60 * 1000 } // 20 requests per minute
): Promise<{ allowed: boolean; remaining: number }> {
  const now = Date.now()
  const record = ipRequestCounts.get(ip)

  if (!record || now > record.resetTime) {
    // New window
    ipRequestCounts.set(ip, {
      count: 1,
      resetTime: now + config.windowMs
    })
    return { allowed: true, remaining: config.maxRequests - 1 }
  }

  if (record.count >= config.maxRequests) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: config.maxRequests - record.count }
}

// Check global spending cap
export async function checkSpendingCap(): Promise<{ allowed: boolean; spent: number }> {
  const supabase = sbService()

  // Fetch total dollars spent this month and today via dedicated SQL functions.
  const [{ data: monthData, error: monthError }, { data: dayData, error: dayError }] =
    await Promise.all([
      supabase.rpc('get_current_month_spending'),
      supabase.rpc('get_current_day_spending')
    ])

  if (monthError) {
    console.error('Error fetching monthly spending:', monthError)
  }
  if (dayError) {
    console.error('Error fetching daily spending:', dayError)
  }

  // Fail-open on any error by allowing the request.
  if (monthError || dayError || monthData === null || dayData === null) {
    return { allowed: true, spent: 0 }
  }

// Supabase RPCs return a single numeric column named "total_cost".
  const spentMonth = Array.isArray(monthData) ? monthData[0]?.total_cost ?? 0 : (monthData as Record<string, any>).total_cost ?? 0
  const spentDay   = Array.isArray(dayData)   ? dayData[0]?.total_cost   ?? 0 : (dayData   as Record<string, any>).total_cost   ?? 0

  if (spentMonth >= 0.8 * MONTHLY_SPEND_LIMIT) {
    console.warn(
      `[SpendingCap] Monthly spend is $${spentMonth.toFixed(2)} — ${(
        (spentMonth / MONTHLY_SPEND_LIMIT) * 100
      ).toFixed(0)}% of the $${MONTHLY_SPEND_LIMIT} limit.`
    )
  }
  if (spentDay >= 0.8 * DAILY_SPEND_LIMIT) {
    console.warn(
      `[SpendingCap] Daily spend is $${spentDay.toFixed(2)} — ${(
        (spentDay / DAILY_SPEND_LIMIT) * 100
      ).toFixed(0)}% of the $${DAILY_SPEND_LIMIT} limit.`
    )
  }

  const allowed =
    spentMonth < MONTHLY_SPEND_LIMIT &&
    spentDay   < DAILY_SPEND_LIMIT

  return {
    allowed,
    spent: spentMonth,
    spentDay,
    spentMonth
  } as unknown as { allowed: boolean; spent: number }
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [ip, record] of ipRequestCounts.entries()) {
    if (now > record.resetTime) {
      ipRequestCounts.delete(ip)
    }
  }
}, 60 * 1000) // Clean every minute