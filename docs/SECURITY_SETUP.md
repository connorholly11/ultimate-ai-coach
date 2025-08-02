# Ultimate AI Coach - Security Setup Guide

## Quick Start

1. **Set Environment Variables**
   ```bash
   # Copy the example file
   cp .env.example .env.local
   
   # Edit with your values
   ENABLE_CHAT=true
   DAILY_SPEND_LIMIT=2
   MONTHLY_SPEND_LIMIT=50
   COST_PER_MESSAGE=0.003
   MAX_INPUT_CHARS=10000
   ADMIN_EMAIL=your-email@example.com
   NEXT_PUBLIC_ADMIN_EMAIL=your-email@example.com
   ```

2. **Run Supabase Migrations**
   ```bash
   # Apply the spending tracking migration
   supabase db push
   ```

3. **Update Admin Email in Migration**
   Edit `supabase/migrations/20240803_spending_tracking.sql` and replace:
   ```sql
   auth.email() = 'your-admin-email@example.com'
   ```
   with your actual admin email.

## Security Features Implemented

### 1. Rate Limiting (3 Layers)
- **IP-based**: 20 requests/minute per IP address
- **User-based**: 100 messages/day for anonymous, 500 for email users
- **Global spending cap**: $2/day and $50/month limits
- **Character limit**: 10,000 characters per message

### 2. Upgrade Prompts
- **5 messages**: Soft dismissible banner
- **20 messages**: Modal prompt (can dismiss)
- **100 messages**: Required upgrade to continue

### 3. Cost Tracking
- Automatic spending logs for every assistant message
- Daily and monthly spending views
- Real-time spending cap checks

### 4. Emergency Controls
- Kill switch: Set `ENABLE_CHAT=false` to disable service
- Spending caps enforced at API level
- Fail-open design (allows access if DB is down)

## Monitoring

### Admin Dashboard
Visit `/admin` when logged in with your admin email to see:
- Today's message count, cost, and unique users
- This month's totals with spending cap progress
- Current rate limit configuration

### Check Current Spending
```sql
-- Current month spending
SELECT * FROM get_current_month_spending();

-- Current day spending  
SELECT * FROM get_current_day_spending();

-- Daily breakdown
SELECT * FROM daily_spending LIMIT 30;
```

### Monitor Rate Limits
Check application logs for:
- "Spending cap reached" - Monthly/daily limit hit
- "Too many requests" - IP rate limit triggered
- "Daily quota exceeded" - User message limit reached

## Next Steps

1. **Set up Cloudflare** (recommended)
   - Add your domain to Cloudflare
   - Enable proxy (orange cloud)
   - Set rate limiting rules

2. **Configure Alerts**
   - Set up Anthropic API spending alerts
   - Add Discord/Slack webhooks for notifications
   - Monitor Supabase dashboard

3. **Test the System**
   - Try exceeding rate limits
   - Test upgrade prompts
   - Verify spending tracking

## Production Checklist

- [ ] Environment variables set in production
- [ ] Supabase migrations applied
- [ ] Admin email updated in RLS policies
- [ ] Anthropic API spending limit configured
- [ ] Cloudflare proxy enabled
- [ ] Monitoring alerts configured
- [ ] Tested all security features

## Emergency Procedures

### Service Under Attack
1. Set `ENABLE_CHAT=false` immediately
2. Enable Cloudflare "Under Attack" mode
3. Check spending logs for abuse patterns
4. Block malicious IPs in Cloudflare

### Budget Exceeded
1. Service auto-disables at spending caps
2. Check `spending_logs` table for unusual activity
3. Adjust `MONTHLY_SPEND_LIMIT` if needed
4. Review and optimize message costs

### Database Issues
1. Service fails open (allows access)
2. Check Supabase status page
3. Rate limiting still works (in-memory)
4. Monitor error logs for DB connection issues