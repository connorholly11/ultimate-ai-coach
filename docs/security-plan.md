# Ultimate AI Coach - Security & Rate Limiting Plan

## Overview
This document outlines practical security measures for the Ultimate AI Coach app, focusing on simplicity and rapid implementation while protecting against abuse and controlling costs.

## Current State
- Anonymous users can start immediately (friction-free)
- Optional email upgrade for cross-device sync
- Daily limit: 500 messages per user
- Using Supabase Auth + Edge Functions
- All API keys secured server-side

## Security Implementation Plan

### 1. Rate Limiting Strategy (3-Layer Defense)

#### Layer 1: IP-Based Rate Limiting
```typescript
// Already implemented in /lib/rate-limit.ts
- 20 requests per minute per IP
- In-memory storage (sufficient for 1-5 users)
- Automatic cleanup of old entries
```

#### Layer 2: User-Based Daily Limits
```typescript
// Current: 500 messages/day
// Recommended: Reduce to 100 for anonymous, 500 for email users
if (!user.email && dailyTurns >= 100) {
  return { error: "Daily limit reached. Sign up to continue!" }
}
```

#### Layer 3: Global Spending Cap
```typescript
// Check total monthly spend before each API call
const { allowed, spent } = await checkSpendingCap()
if (!allowed) {
  return { error: "Service temporarily unavailable" }
}
```

### 2. Anonymous → Email Upgrade Flow

#### Trigger Points
1. **After 5 messages**: Soft prompt (dismissible banner)
2. **After 20 messages**: Modal prompt with benefits
3. **At 100 messages**: Required for continuation

#### Implementation
```typescript
// In ChatContext.tsx
useEffect(() => {
  if (messages.length === 5 && !user?.email) {
    showBanner("Save your progress across devices →")
  }
  if (messages.length === 20 && !user?.email) {
    showUpgradeModal()
  }
}, [messages.length, user])
```

### 3. Cross-Device Sync Solution

#### Option A: Magic Link (Recommended)
- User enters email → receives magic link
- Click link on any device → instant sync
- All messages tied to Supabase user ID

#### Option B: Sync Code (Backup)
```typescript
// Generate 6-digit code
const syncCode = Math.random().toString().slice(2, 8)
// Store in Redis/Supabase with 10-min expiry
// Other device enters code → transfers localStorage UID
```

### 4. DDoS Protection

#### Cloudflare (Free Tier)
1. Enable Cloudflare proxy
2. Set up rate limiting rules:
   - 50 requests/min per IP
   - Challenge suspicious patterns
3. Enable "I'm Under Attack" mode if needed

#### Edge Function Protection
```typescript
// Add to all API routes
const { allowed } = await checkRateLimit(getClientIp(req))
if (!allowed) {
  return new Response("Too many requests", { status: 429 })
}
```

### 5. Cost Control & Monitoring

#### Spending Caps
```typescript
// Environment variables
DAILY_SPEND_LIMIT=2      // $2/day
MONTHLY_SPEND_LIMIT=50   // $50/month
COST_PER_MESSAGE=0.003   // Claude Sonnet estimate
```

#### Simple Monitoring
```typescript
// Daily cron job (Vercel Cron or Supabase Edge Functions)
export async function checkDailySpend() {
  const spent = await calculateDailySpend()
  if (spent > DAILY_SPEND_LIMIT * 0.8) {
    // Send alert email/Discord webhook
    await sendAlert(`Daily spend at 80%: $${spent}`)
  }
}
```

### 6. Emergency Shutoff

#### Kill Switch
```typescript
// Environment variable
ENABLE_CHAT=true

// In chat route
if (process.env.ENABLE_CHAT !== 'true') {
  return new Response("Service under maintenance", { status: 503 })
}
```

## Implementation Priority

### Week 1 (High Priority)
1. ✅ IP rate limiting (already done)
2. ✅ Spending cap check (already done)
3. [ ] Reduce anonymous user daily limit to 100
4. [ ] Add upgrade prompts at 5, 20, 100 messages
5. [ ] Set up Cloudflare

### Week 2 (Medium Priority)
1. [ ] Implement sync code for cross-device
2. [ ] Add daily spend monitoring
3. [ ] Create admin dashboard at /admin (locked to your email)

### Week 3 (Nice to Have)
1. [ ] Add Redis for distributed rate limiting
2. [ ] Implement message summarization for cost reduction
3. [ ] Add usage analytics

## Monitoring Dashboard

Create simple `/admin` page showing:
- Total users (anonymous vs email)
- Messages today/week/month
- Estimated spend
- Rate limit hits
- Error rates

```typescript
// Only accessible to you
export async function AdminPage() {
  const user = await getUser()
  if (user?.email !== 'your-email@example.com') {
    redirect('/')
  }
  // Show stats
}
```

## Quick Wins

1. **Immediate**: Set Anthropic API spending limit in their dashboard
2. **Today**: Deploy current rate limiting code
3. **Tomorrow**: Add Cloudflare and reduce anonymous limits
4. **This Week**: Implement upgrade prompts

## Remember
- Keep it simple - you're prototyping
- Monitor manually at first
- Use Supabase dashboard for quick queries
- Set up alerts only for critical thresholds