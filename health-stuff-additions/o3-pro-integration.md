Below is a **technical implementation blueprint** for adding the **“Multimodal Health‑Tracking MVP”** to the existing *Ultimate AI Coach* code‑base without disturbing the current coaching flows.
I describe it as an *attachable micro‑service* that **lives next to** (not inside) the existing chat/quests logic but still re‑uses Supabase auth, storage, and edge‑runtime patterns already in place.

---

## 0 · Macro‑level Architectural Choice

| Option                            | What it Looks Like                                                                                           | Pros                                                                                                                                         | Cons                                                                                        | Recommended?                                                                           |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **A · Internal “feature island”** | Route group **`/health/*`** inside the same Next app; isolated front‑end & API folders; own DB schema.       | • Zero infra duplication<br>• Leverages existing Supabase client (`sbService` / `sbBrowser`) and anon‐UID logic<br>• Single deploy pipeline. | • Coupling via `tsconfig`, shared env, global error boundary.<br>• Bundle‑size growth.      | **Yes** – fastest path; keeps everything in one Vercel project but cleanly namespaced. |
| B · Standalone micro‑service      | Second Next.js (or Bun) project in the monorepo at `/health-service`; runs under `/health-api.*` sub‑domain. | • Perfect isolation; can even use different stack later.<br>• Can scale independently if Vision traffic explodes.                            | • Duplicate Supabase clients & env; cross‑origin auth cookies harder.<br>• Extra CI/CD job. | No for MVP; revisit when traffic warrants.                                             |

**→ Proceed with Option A**: create **`src/app/health/(app)`** + **`src/app/api/health/*`** groups.

---

## 1 · Data‑layer Additions (Supabase SQL)

Create a new migration file (e.g., `migrations/20250802_health.sql`).

```sql
-- --- H E A L T H  S C H E M A ----------------------------------------------

create table meals (
  id uuid primary key default gen_random_uuid(),
  uid uuid references users(id),
  anon_uid text,
  photo_url text not null,           -- Supabase Storage URL
  img_hash text not null,            -- 448‑px MD5 (prevents re‑analysis)
  portion_size text check (portion_size in ('small','medium','large','custom')),
  custom_grams integer,
  analysis jsonb,                    -- raw GPT‑4V response
  confidence numeric,                -- 0‑1
  calories integer,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  mood int2 check (mood between 1 and 5),
  energy int2 check (energy between 1 and 5),
  notes text,
  created_at timestamptz default now()
);

create unique index meals_img_hash_uid
  on meals (uid, img_hash);

create table health_metrics (
  id uuid primary key default gen_random_uuid(),
  uid uuid,
  anon_uid text,
  source text,                 -- 'whoop' | 'oura' | 'terra' | 'manual'
  metric_type text,            -- 'hrv' | 'sleep_hours' | ...
  value numeric,
  unit text,
  raw_data jsonb,
  recorded_at timestamptz,
  created_at timestamptz default now()
);

-- RLS: same pattern as existing tables
alter table meals enable row level security;
alter table health_metrics enable row level security;

create policy "meal owner" on meals
  for all using (uid = auth.uid() or anon_uid = current_setting('request.jwt.claims', true)::json->>'anonUid');

create policy "metric owner" on health_metrics
  for all using (uid = auth.uid() or anon_uid = current_setting('request.jwt.claims', true)::json->>'anonUid');
```

> **Side‑effect**: The anonymous‑UID string now appears in more tables – keep `ensureAnonUid()` **unchanged**, but update its JSDoc to mention health tables.

---

## 2 · Storage Bucket

```bash
supabase storage create-bucket meals --public
```

Used by the `/api/health/analyze` endpoint to store 448‑px JPEGs.
Add public CDN policy *read‑only* (images are non‑sensitive).

---

## 3 · Shared Libraries

### `src/lib/vision.ts`

```ts
import { OpenAI } from 'openai'
import sharp from 'sharp'
import crypto from 'crypto'
import { sbService } from './supabase'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })
const MAX_DIM = 448

export async function getImageHash(buf: Buffer) {
  return crypto.createHash('md5').update(buf).digest('hex')
}

/** Resize + JPEG encode → Buffer */
export async function normalizeImage(file: File) { /* sharp resize ... */ }

/** Calls GPT‑4V, enforces JSON, returns {analysis, macros} */
export async function analyzeMeal(imageB64: string, portion: string) { /* ... */ }
```

### `src/lib/terra.ts`  *(initial stub)*

Contains helper to verify Terra webhook HMAC and convert provider‑specific payloads into `health_metrics` rows.

---

## 4 · API Route Group  (`src/app/api/health`)

| Endpoint                         | File                     | Purpose                                                                     | Key Logic                                                                                                                 |
| -------------------------------- | ------------------------ | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `POST /api/health/analyze`       | `analyze/route.ts`       | Upload meal image → run `vision.ts` → store to `meals`, cache by `img_hash` | – Accept `multipart/form-data`<br>– `uid/anon_uid` resolution identical to chat route.<br>– Save original + macro fields. |
| `GET /api/health/meals`          | `meals/route.ts`         | Paginated fetch (limit/offset)                                              | Query by owner; join storage URL.                                                                                         |
| `PATCH /api/health/meals/[id]`   | `[id]/route.ts`          | Update mood/energy/notes                                                    | RLS ensures ownership.                                                                                                    |
| `POST /api/health/terra-webhook` | `terra-webhook/route.ts` | Receive Terra push, map to `health_metrics`                                 | Verify signature; upsert per metric.                                                                                      |

All routes use `export const runtime = 'edge'` like existing API.

---

## 5 · Front‑end Route Group `src/app/health/(app)`

```
/health/page.tsx          – camera + portion selector (MealCapture)
/health/history/page.tsx  – list of MealCards
/health/insights/page.tsx – Recharts‑based dashboards
```

### New React components (all under `src/components/health/*`)

| Component             | Responsibilities                                                                                                  |
| --------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **`MealCapture.tsx`** | `<input type="file" accept="image/*" capture="environment">` + portion size buttons; calls `/api/health/analyze`. |
| `MealCard.tsx`        | Render thumbnail, macros, mood/energy badges.                                                                     |
| `QuickEntry.tsx`      | Mood (1‑5), Energy (1‑5), Notes textarea.                                                                         |
| `InsightsCharts.tsx`  | Recharts bar/line combos fed by `/api/health/meals` + `/metrics`.                                                 |

> **UI coupling strategy**
> Use a **route group layout**: `src/app/health/layout.tsx` that imports its own Tailwind container and does **not** reuse the chat header/footer. This avoids global style conflicts.

---

## 6 · Global Types & Constants

### `src/types/health.ts`

```ts
export interface Meal {
  id: string
  uid?: string
  anon_uid?: string
  photoUrl: string
  portionSize: 'small' | 'medium' | 'large' | 'custom'
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
  mood?: number
  energy?: number
  notes?: string
  createdAt: string
}

export type HealthMetricType =
  | 'hrv' | 'sleep_hours' | 'glucose' | 'temperature' | 'steps'

export interface HealthMetric {
  id: string
  metricType: HealthMetricType
  value: number
  unit: string
  recordedAt: string
}
```

### `src/lib/constants.ts`

Add:

```ts
export const HEALTH_API = {
  ANALYZE: '/api/health/analyze',
  MEALS: '/api/health/meals',
  METRICS: '/api/health/metrics',
}

export const HEALTH_PAGES = {
  ROOT: '/health',
  HISTORY: '/health/history',
  INSIGHTS: '/health/insights',
}
```

---

## 7 · Env Variables (`.env.example`)

```
# Health micro‑service
OPENAI_API_KEY=
TERRA_API_KEY=
TERRA_DEV_ID=
TERRA_WEBHOOK_SECRET=
```

Also document `NEXT_PUBLIC_HEALTH_BUCKET_URL` if you expose the CDN prefix.

---

## 8 · Navigation Integration (Optional)

If you want the Health MVP visible in the main mobile nav:

*Modify* `components/navigation/BottomNav.tsx`

```tsx
{
  href: '/health',
  label: 'Health',
  icon: HeartPulse,
  active: pathname?.startsWith('/health')
}
```

**Impact**: increases nav to 4 items → adjust `grid-cols-4`.

If you prefer strict separation, skip this step; users can bookmark the `/health` URL.

---

## 9 · Edge‑Runtime Cost Guard

Follow existing pattern in `checkSpendingCap()` but **introduce a separate env limit**:

```ts
if (process.env.ENABLE_HEALTH === 'false') return 503
```

Vision calls are more expensive; you may add `checkVisionSpend()` inside `analyze/route.ts`.

---

## 10 · Potential Side‑effects & Mitigations

| Area               | Impact                                                                           | Mitigation                                                                                            |
| ------------------ | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Auth tokens**    | Health API re‑uses `/Authorization` header; Terra webhooks are server‑side only. | No change.                                                                                            |
| **DB size**        | Meal images stored in bucket; analysis JSON adds rows quickly.                   | Nightly cron to purge images older than N days or compress further.                                   |
| **Bundle size**    | Sharp (if used client‑side) bloats; keep it *server‑only* inside API route.      | Mark `sharp` as **`"react-native": false`** in `package.json` browser field to avoid client bundling. |
| **OpenAI spend**   | Each 448‑px image ≈ 150 tokens → \$0.003.                                        | Cached by `img_hash`; prompt includes `portion_size` not image alone.                                 |
| **RLS complexity** | New policies must match `anon_uid` pattern.                                      | Re‑use existing Supabase row‑level helpers.                                                           |

---

## 11 · Critical Architectural Decisions

1. **Image Normalization in Edge Function**
   Do not read big files in `edge`; 448‑px preprocessing **must run in the client** (canvas) *or* in a **`Node` route (runtime='nodejs')**. Choose the Node route variant if you prefer full‑server control.

2. **Metric Ingestion Fan‑out**
   Terra sends large JSON payloads. Store raw JSON in `health_metrics.raw_data`, then run a nightly job to **materialize views** for performance.

3. **Future Scaling Path**
   Keep Option B in mind: if Vision usage dwarfs chat traffic, move `/api/health/*` into its own Vercel project and point `NEXT_PUBLIC_HEALTH_API_BASE` to that hostname. All front‑end fetches already go through constants.

---

## 12 · Work‑plan Checklist (chronological)

1. **SQL migration** – create tables, RLS, bucket.
2. **Libs** – `vision.ts`, `terra.ts`, global types, constants.
3. **API routes** – analyze, meals CRUD, Terra webhook.
4. **Front‑end route group** – `/health` UI, capture, history, insights.
5. **Nav (optional)** – add “Health” tab.
6. **Env & docs** – update `.env.example`, README section “Health MVP”.
7. **Cron job** – `/api/health/cleanup` to purge stale images (later).

Deliverables map one‑to‑one to the bullet list above; each can be shipped incrementally behind `ENABLE_HEALTH` flag.

---

### You now have a strictly bounded “health micro‑service” living inside the same monorepo, sharing auth & storage, but entirely namespaced under **`/health`**—so core coaching features remain untouched yet the product surface expands.
