# Technical Implementation Guide - Simple Stack

## Core Philosophy
Keep it dead simple. No AWS complexity. Just tools that work out of the box.

## Tech Stack (Minimal)

```
Frontend:  Next.js 14 (App Router) + Tailwind
Backend:   Next.js API routes
Database:  Supabase (Postgres + Storage + Auth)
AI:        OpenAI API (GPT-4V)
Hosting:   Vercel (auto-deploys from GitHub)
Wearables: Terra API (when ready)
```

## Key Technical Decisions (Based on Review)

### 1. Meal Photo Pipeline (Addressing ±25% Error Issue)

Instead of relying purely on AI for portion sizes:

```typescript
// components/MealCapture.tsx
interface MealCapture {
  photo: File
  portionSize: 'small' | 'medium' | 'large' | 'custom'
  customGrams?: number
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
}

// AI prompt template
const analyzePrompt = `
Analyze this ${portionSize} portion meal:
1. Identify all foods visible
2. For each food, estimate:
   - Base amount for ${portionSize} portion
   - Macros per 100g
3. Return confidence level (0-1)
4. Flag if portion size unclear

Format as JSON with strict schema.
`
```

### 2. Cost-Optimized Vision API Usage

```typescript
// lib/vision.ts
import crypto from 'crypto'

// Client-side image optimization
export async function optimizeImage(file: File): Promise<string> {
  // Resize to 448px max dimension (reduces tokens by ~80%)
  const resized = await resizeImage(file, 448)
  return resized
}

// Server-side caching
export async function analyzeFood(imageBase64: string, metadata: MealCapture) {
  // Hash the image + portion size
  const hash = crypto
    .createHash('md5')
    .update(imageBase64 + metadata.portionSize)
    .digest('hex')
  
  // Check Supabase cache first
  const cached = await supabase
    .from('meal_analysis_cache')
    .select('*')
    .eq('hash', hash)
    .single()
  
  if (cached.data) {
    return cached.data.analysis
  }
  
  // Call OpenAI only if not cached
  const analysis = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [{
      role: "user",
      content: [
        { type: "text", text: analyzePrompt },
        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` }}
      ]
    }],
    max_tokens: 500
  })
  
  // Cache the result
  await supabase.from('meal_analysis_cache').insert({
    hash,
    analysis: analysis.choices[0].message.content,
    created_at: new Date()
  })
  
  return analysis
}
```

### 3. Simple Data Model (Supabase)

```sql
-- Simple schema that scales
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  photo_url TEXT, -- Supabase Storage URL
  portion_size TEXT,
  analysis JSONB, -- GPT-4V response
  confidence FLOAT,
  
  -- User context
  mood INTEGER CHECK (mood >= 1 AND mood <= 5),
  energy INTEGER CHECK (energy >= 1 AND energy <= 5),
  notes TEXT,
  
  -- Computed from analysis
  calories INTEGER,
  protein_g FLOAT,
  carbs_g FLOAT,
  fat_g FLOAT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- For wearable data (when ready)
CREATE TABLE health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  source TEXT, -- 'whoop', 'manual', etc
  metric_type TEXT, -- 'hrv', 'sleep_hours', etc
  value FLOAT,
  unit TEXT,
  raw_data JSONB, -- Keep original for debugging
  recorded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX idx_meals_user_created ON meals(user_id, created_at DESC);
CREATE INDEX idx_metrics_user_type_time ON health_metrics(user_id, metric_type, recorded_at DESC);
```

### 4. File Structure (Simple)

```
/app
  /api
    /analyze/route.ts      -- Vision API endpoint
    /meals/route.ts        -- CRUD for meals
  /(app)
    /page.tsx             -- Camera/upload
    /history/page.tsx     -- Meal history
    /insights/page.tsx    -- Simple charts
    /layout.tsx           -- Mobile-first layout
/components
  /meal-capture.tsx       -- Photo + portion selector
  /meal-card.tsx          -- Display meal with macros
  /quick-entry.tsx        -- Mood/energy/notes
/lib
  /supabase.ts           -- Client setup
  /vision.ts             -- OpenAI integration
  /utils.ts              -- Image resize, etc
/hooks
  /use-meals.ts          -- Data fetching hooks
```

### 5. Development Timeline (Realistic)

**Week 1: Core MVP**
- Day 1-2: Setup + basic photo capture
- Day 3: Vision API + portion sizing UI
- Day 4: Meal history + basic insights
- Day 5-7: Testing + refinement

**Week 2: Make it Useful**
- Add export to CSV
- Basic correlation charts
- Mobile optimizations

**Week 3+: Integrations (Using Terra)**
```typescript
// When ready for wearables
import { Terra } from 'terra-api'

const terra = new Terra({
  apiKey: process.env.TERRA_API_KEY,
  devId: process.env.TERRA_DEV_ID
})

// One widget handles Whoop, Oura, Apple Health, etc
export async function connectWearable(userId: string) {
  const widget = await terra.generateWidgetSession({
    reference_id: userId,
    providers: ['WHOOP', 'OURA', 'APPLE'],
    auth_success_redirect_url: '/dashboard'
  })
  return widget.url
}
```

### 6. Quick Start Commands

```bash
# 1. Create Next.js app
npx create-next-app@latest health-ai --typescript --tailwind --app

# 2. Install minimal deps
npm install @supabase/supabase-js openai recharts date-fns sharp

# 3. Set up Supabase project (via dashboard)
# 4. Add env vars
echo "OPENAI_API_KEY=sk-..." >> .env.local
echo "NEXT_PUBLIC_SUPABASE_URL=..." >> .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=..." >> .env.local

# 5. Run locally
npm run dev
```

## Cost Breakdown (Personal Use)

- **Supabase**: Free tier (500MB storage, 2GB bandwidth)
- **Vercel**: Free tier (100GB bandwidth)
- **OpenAI**: ~$0.001/meal → $1-3/month for daily use
- **Terra**: Free tier (100 API calls/month) → paid later

Total: ~$5/month personal use

## Why This Works

1. **No AWS complexity** - Supabase handles auth, database, and file storage
2. **One-click deploys** - Push to GitHub → Vercel auto-deploys
3. **Cost controlled** - Image resizing + caching keeps API costs minimal
4. **Future-proof** - Terra integration ready when you want wearables
5. **Local-first dev** - Everything runs on localhost, no cloud setup needed

## Next Steps

1. Clone the repo (once created)
2. Set up Supabase project (5 min)
3. Add OpenAI key
4. Start building!

No DevOps, no Kubernetes, no complexity. Just a simple web app that tracks your food and learns your patterns.