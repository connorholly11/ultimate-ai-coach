# Personal AI Health Assistant - Simplest MVP

## What We're Building (Just for You)

A dead-simple web app where you:
1. Take a photo of your meal
2. Get AI analysis (calories, macros, ingredients)
3. Add quick context (mood, energy, supplements)
4. See patterns over time

## Tech Stack (Minimal)

- **Next.js** - Easy deployment, good mobile experience
- **Local Storage** - No database needed initially
- **OpenAI Vision API** - Analyze food photos
- **Tailwind** - Quick styling

## MVP Features (1 Week)

### Core Flow
1. **Snap** - Take/upload photo
2. **Analyze** - AI extracts nutrition info
3. **Context** - Quick buttons for mood/energy
4. **Save** - Store locally with timestamp

### Data We Track
- Meal photos + AI analysis
- Mood (1-5 scale)
- Energy (1-5 scale)
- Sleep quality (if you want)
- Supplements taken (checkboxes)
- Quick notes

### Simple Insights
- Daily calorie/macro totals
- Meal timing patterns
- Mood/energy correlations with foods
- Weekly trends

## Implementation (Quick & Dirty)

### Day 1: Setup
```bash
npx create-next-app health-tracker --typescript --tailwind --app
npm install openai react-webcam recharts date-fns
```

### Day 2: Photo Capture
- Mobile-friendly camera component
- Image preview
- Upload to OpenAI Vision

### Day 3: AI Analysis
- Send photo to GPT-4V
- Parse nutrition estimates
- Display results

### Day 4: Context & Storage
- Quick entry forms
- Local storage persistence
- Basic history view

### Day 5: Insights
- Daily summaries
- Simple charts
- Pattern detection

## File Structure
```
/app
  /page.tsx          - Camera/upload
  /history/page.tsx  - Meal history
  /insights/page.tsx - Patterns & charts
/components
  /Camera.tsx
  /MealCard.tsx
  /QuickEntry.tsx
/lib
  /openai.ts
  /storage.ts
  /analysis.ts
```

## The Prompt for GPT-4V
```
Analyze this meal photo and provide:
1. Estimated calories
2. Protein (g)
3. Carbs (g)
4. Fat (g)
5. Main ingredients list
6. Health score (1-10)
7. Notable observations

Format as JSON.
```

## Future Iterations

Once you've used it for a week:
1. Add Whoop integration (HRV correlation)
2. Blood work tracking (photo of results)
3. Export to CSV
4. Share specific insights

Then scale to others:
1. Add authentication
2. Real database
3. Premium features
4. Community experiments

## Why This Works

- **Low friction** - Open app, take photo, done
- **Immediate value** - See what you're actually eating
- **Builds habit** - Daily use creates data flywheel
- **Personal insights** - Patterns you didn't know existed

## Success Metrics (Personal Use)

- Using it daily without friction
- Discovering 3+ insights about your diet
- Feeling more informed about food choices
- Actually wanting to add more data

This is your personal health command center. Start simple, use it daily, iterate based on what you actually need.