# Multimodal AI Health Assistant MVP Plan

## Executive Summary

Building a personal multimodal AI health assistant MVP - initially just for personal use to validate the concept. Inspired by Patrick Hsu's vision, this starts as a simple tool for tracking meals via photos and integrating with personal health data. Once proven valuable, it can scale to serve health-obsessed individuals (Bryan Johnson types, LA health influencers) who are willing to invest in comprehensive health tracking and optimization.

## Vision & Context

### The Problem
- Health data is fragmented across multiple devices, apps, and services
- No unified AI system that can understand the full context of someone's health journey
- High activation barrier for comprehensive health tracking
- Missing the network effects that could enable population-level insights and RCTs

### The Solution
A multimodal AI health assistant that:
- Accepts food photos and analyzes nutritional content
- Integrates with wearables (Whoop, Oura, Apple Watch, etc.)
- Tracks blood work, supplements, medications
- Understands genetic data
- Provides personalized recommendations based on ALL data streams
- Enables community-driven experiments and RCTs

### Target Audience (Initial)
- Health optimization enthusiasts (biohackers)
- High-net-worth individuals focused on longevity
- Health influencers looking for data-driven content
- People with specific health conditions seeking solutions

## Technical Architecture

### Tech Stack (Simple & Minimal)
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: Supabase (Postgres + Storage)
- **AI**: OpenAI GPT-4V
- **Hosting**: Vercel (auto-deploys)
- **Wearables**: Terra API (when ready - handles Whoop, Oura, Apple Health in one SDK)

### Core Components

1. **Data Ingestion Layer**
   - Food photo capture with portion size selector (addresses ±25% AI error)
   - Client-side image optimization (448px) to reduce API costs
   - Response caching to avoid duplicate API calls
   - Terra API for unified wearable data (instead of multiple OAuth flows)
   - Simple supplement/medication tracking

2. **AI Analysis Engine**
   - GPT-4V with structured prompts and portion context
   - Strict JSON schema enforcement
   - Confidence scoring (reject if <0.6)
   - Hash-based caching for identical meals

3. **User Interface**
   - Mobile-first web app (no native app complexity)
   - Simple dashboard with Recharts
   - Export to CSV functionality
   - Progressive web app for "app-like" experience

4. **Backend Infrastructure**
   - Supabase handles auth, database, and file storage (no AWS needed)
   - Simple API routes in Next.js
   - Local storage fallback for offline use

## MVP Feature Set

### Phase 1 - Personal MVP (Week 1)
1. **Food Tracking**
   - Simple photo capture interface (mobile-first)
   - AI analysis of meals (calories, macros, ingredients)
   - Basic meal history
   - Store analysis results locally

2. **Quick Context Entry**
   - Simple forms for supplements/meds
   - One-click mood/energy rating
   - Quick notes field

3. **Basic Insights**
   - Daily summaries
   - Simple patterns (e.g., "You eat more protein on workout days")

### Phase 2 - Integrations (Week 3-4)
1. **Wearable Integration**
   - Whoop API (HRV, sleep, strain)
   - Oura API (sleep, readiness)
   - Apple HealthKit
   - Continuous glucose monitors (Levels)

2. **Lab Data**
   - PDF upload and parsing
   - Key biomarker tracking
   - Trend analysis

### Phase 3 - Advanced Features (Month 2)
1. **Genetic Integration**
   - 23andMe data import
   - Variant interpretation
   - Personalized recommendations

2. **Community Features**
   - Anonymous data sharing
   - Community experiments
   - RCT participation

## Technical Requirements

### APIs & Services Needed

1. **AI/ML**
   - OpenAI API (GPT-4V for image analysis)
   - Anthropic Claude API (alternative/backup)
   - Nutritionix or similar for food database

2. **Wearable APIs**
   - Whoop API (OAuth2)
   - Oura API (OAuth2)
   - Apple HealthKit (iOS SDK)
   - Levels API (CGM data)
   - Eight Sleep API (sleep optimization)

3. **Infrastructure**
   - Vercel/Next.js hosting
   - Supabase or Firebase (auth, database, storage)
   - Stripe (premium subscriptions)

4. **Lab Integration**
   - Quest Diagnostics API (if available)
   - LabCorp API
   - PDF parsing service (for uploaded results)

### Environment Variables (Personal MVP)
```
# AI Services
OPENAI_API_KEY=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Terra (Phase 2)
TERRA_API_KEY=
TERRA_DEV_ID=
```

## Implementation Steps

### Day 1-2: Minimal Foundation
- [ ] Set up Next.js project with TypeScript
- [ ] Create simple photo capture UI (mobile-first)
- [ ] Set up local storage for data (no auth needed initially)
- [ ] Basic Tailwind styling

### Day 3-4: Core Functionality
- [ ] Integrate OpenAI Vision API for food analysis
- [ ] Create simple meal logging flow
- [ ] Add supplement/mood tracking forms
- [ ] Build basic history view

### Day 5-7: Make It Useful
- [ ] Add daily summary generation
- [ ] Create simple insights dashboard
- [ ] Add export functionality
- [ ] Test and refine based on personal use

### Week 2: Core Features
- [ ] Add manual tracking (supplements, mood, notes)
- [ ] Create dashboard with basic insights
- [ ] Implement AI chat interface
- [ ] Add data export functionality
- [ ] Set up user profiles and settings

### Week 3: Integrations
- [ ] Implement Whoop OAuth and data sync
- [ ] Add Oura integration
- [ ] Build unified health metrics view
- [ ] Create correlation analysis features
- [ ] Add notification system

### Week 4: Polish & Launch
- [ ] Implement subscription/payment system
- [ ] Add data privacy controls
- [ ] Create onboarding flow
- [ ] Build landing page
- [ ] Set up analytics
- [ ] Deploy to production

## Data Schema

### Database Tables (Supabase)

```sql
-- Enable RLS from day 1
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Users table (simple for personal use)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meals with analysis cache
CREATE TABLE meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  photo_url TEXT,
  img_hash TEXT UNIQUE, -- Normalized image hash
  schema_ver SMALLINT DEFAULT 1, -- Track prompt versions
  portion_size TEXT CHECK (portion_size IN ('small', 'medium', 'large', 'custom')),
  custom_grams INTEGER,
  
  -- AI analysis
  analysis JSONB,
  confidence FLOAT,
  
  -- Computed macros
  calories INTEGER,
  protein_g FLOAT,
  carbs_g FLOAT,
  fat_g FLOAT,
  
  -- Context
  mood INTEGER CHECK (mood >= 1 AND mood <= 5),
  energy INTEGER CHECK (energy >= 1 AND energy <= 5),
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analysis cache to reduce API calls
CREATE TABLE meal_analysis_cache (
  hash TEXT PRIMARY KEY,
  analysis JSONB,
  schema_ver SMALLINT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health metrics (unified format)
CREATE TABLE health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  source TEXT, -- 'whoop', 'oura', 'manual'
  metric_type TEXT, -- 'hrv', 'sleep_hours', etc
  value FLOAT,
  standard_unit TEXT, -- Normalized unit
  raw_value FLOAT, -- Original value
  raw_unit TEXT, -- Original unit
  raw_data JSONB, -- Keep original for debugging
  recorded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can only see own data" ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can only see own meals" ON meals
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see own metrics" ON health_metrics
  FOR ALL USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_meals_user_created ON meals(user_id, created_at DESC);
CREATE INDEX idx_meals_hash ON meals(img_hash);
CREATE INDEX idx_metrics_user_type ON health_metrics(user_id, metric_type, recorded_at DESC);
```

## Revenue Model

### Subscription Tiers

1. **Basic ($29/month)**
   - Food tracking and analysis
   - Basic insights
   - 100 meal analyses/month

2. **Pro ($99/month)**
   - Unlimited meal analyses
   - All wearable integrations
   - Advanced AI insights
   - Export features

3. **Elite ($299/month)**
   - Everything in Pro
   - Genetic data integration
   - Priority AI model access
   - Personal health experiments
   - RCT participation
   - Quarterly health reports

### Partnership Opportunities
- Bundle deals with Whoop, Levels, Eight Sleep
- Affiliate commissions on supplement recommendations
- Sponsored health experiments
- B2B offerings for wellness companies

## Success Metrics

### User Metrics
- Daily active users
- Photos uploaded per user per day
- Retention rate (30-day, 90-day)
- Integration adoption rate

### Health Outcomes
- User-reported improvements
- Biomarker changes over time
- Successful behavior changes
- Community experiment participation

### Business Metrics
- MRR growth
- CAC vs LTV
- Churn rate by tier
- Partnership revenue

## Privacy & Security Considerations

- HIPAA compliance for health data
- End-to-end encryption for sensitive data
- User data ownership and export rights
- Anonymous data sharing opt-in
- Clear data deletion policies

## Future Expansions

1. **Mobile Apps**
   - Native iOS/Android apps
   - Apple Watch complications
   - Widget support

2. **Advanced AI Features**
   - Predictive health modeling
   - Automated meal planning
   - Supplement optimization
   - Sleep/exercise recommendations

3. **Clinical Integration**
   - Doctor dashboard
   - Clinical trial platform
   - Insurance partnerships

4. **Community Platform**
   - User-generated experiments
   - Health challenges
   - Expert consultations
   - Knowledge sharing

## Narrative & Philosophy

This isn't just another health tracking app. It's about creating a new paradigm where AI truly understands the full context of your health journey. Every meal photo, every heartbeat measured, every blood test result - they all tell a story. Our AI doesn't just count calories or track steps; it understands the intricate relationships between what you eat, how you sleep, your genetic predispositions, and how you feel.

For the Bryan Johnsons of the world, this is the tool that finally brings all their optimization efforts under one roof. For someone struggling with chronic fatigue, this might be the system that finally identifies the pattern they've been missing. 

The network effects are crucial - when thousands of health optimizers share (anonymized) data, we can run population-level experiments that were previously impossible. Imagine being able to ask: "What happens to HRV when people with my genetic markers eat this specific food?" and getting real answers based on real data.

This MVP is intentionally expensive and exclusive. We're not trying to be MyFitnessPal. We're building the Ferrari of health optimization tools - premium, comprehensive, and obsessively detailed. The early adopters will be our co-creators, helping us understand what the future of personalized health looks like.

## Technical Implementation Details

### Addressing Key Challenges (from Review)

#### 1. Meal Photo Analysis (Solving ±25% Portion Error)
```typescript
// Instead of relying only on AI, add portion selector
interface MealCapture {
  photo: File
  portionSize: 'small' | 'medium' | 'large' | 'custom'
  customGrams?: number
}

// Optimized prompt with portion context
const analyzePrompt = `
Analyze this ${portionSize} portion meal:
1. Identify all visible foods
2. Estimate macros based on ${portionSize} portion
3. Return confidence level (0-1)
4. Flag if portion unclear
Format as strict JSON schema.
`
```

#### 2. Cost Optimization & Performance
- **Image resizing**: 448px max dimension (80% token reduction)
- **Normalize before hashing**: Resize + JPEG encode to avoid duplicate hashes
- **Response caching**: Hash-based deduplication
- **Cold start fix**: Vercel Cron hits `/api/ping` every 5 min to keep warm
- **Estimated cost**: ~$0.0025/meal → $1-3/month personal use

#### 3. Simple Development Flow
```bash
# Quick start
npx create-next-app@latest health-ai --typescript --tailwind --app
npm install @supabase/supabase-js openai recharts date-fns sharp

# Environment setup
echo "OPENAI_API_KEY=sk-..." >> .env.local
echo "NEXT_PUBLIC_SUPABASE_URL=..." >> .env.local

# Run locally
npm run dev
```

#### 4. File Structure
```
/app
  /api
    /analyze/route.ts      -- Vision API endpoint
    /meals/route.ts        -- CRUD operations
  /(app)
    /page.tsx             -- Camera/upload
    /history/page.tsx     -- Meal history
    /insights/page.tsx    -- Simple charts
/components
  /meal-capture.tsx       -- Photo + portion UI
  /meal-card.tsx          -- Display results
/lib
  /supabase.ts           -- Client setup
  /vision.ts             -- OpenAI integration
```

## Implementation Approach

### Lean Background Job Pattern (No Queues)
1. **Photo upload** → `POST /api/analyze`
   - Check cache by normalized hash
   - Call Vision API if miss
   - Store in cache
   - Return immediately

2. **Terra webhook** → `POST /api/terra-ingest`
   - Write raw data fast
   - Don't transform in request

3. **Daily digest** → Vercel Cron → `/api/daily-digest`
   - Postgres function aggregates data
   - Write summary row

### Realistic Timeline (Solo Developer)
| Task | Hours | Notes |
|------|-------|-------|
| Next.js + Supabase setup | 4 | Use `supabase init` |
| Camera upload + Vision API | 6 | Sharp for resize |
| Meal history + CSV export | 4 | TanStack Table |
| Supabase RLS + Auth | 3 | Magic email links |
| Terra integration | 4 | React widget |
| Cron jobs + charts | 3 | Vercel + Recharts |
| **Total** | **~24 hours** | 3 nights + weekend |

### Platform Limits to Watch
- **Vercel Hobby**: 2 Cron jobs, 10s function timeout
- **Supabase Free**: 500MB DB, 1GB storage, pauses after 1 week inactive
- **Terra Free**: 100 API calls/month (upgrade when adding users)

### What to Skip for MVP
- Stripe payments (until second user)
- Genetic data import (month 2)
- Native mobile apps (PWA is enough)
- Complex auth flows (use magic links)

## Next Steps

1. **Hour 1-4**: Set up Next.js + Supabase with RLS enabled
2. **Hour 5-10**: Build normalized photo capture + Vision API
3. **Hour 11-14**: Add meal history with proper caching
4. **Hour 15-18**: Basic auth + personal dashboard
5. **Hour 19-24**: Terra widget + simple insights
6. **Week 2+**: Use it daily, iterate based on actual needs