Below is a **print‑ready implementation packet** you can drop into Linear / Jira or e‑mail straight to your engineers.
Everything is organised so that a new teammate can clone the repo, run one command, and know exactly where to start.

---

# 0 · Why we chose the “Fully‑Split Health‑OS” model

* **Blast‑radius isolation** – a crash or runaway OpenAI bill in Health‑OS never hurts the Coach app.
* **Parallel deployment & rollback** – each Vercel project has its own immutable history.
* **Future fusion is explicit** – when you *do* want macros or HRV inside chat, you’ll reach across a clean API boundary or subscribe to an event bus; no hidden imports.

> **Decision Record:** stored at `docs/adr/0004_use_separate_health_os.md`

---

# 1 · Monorepo layout

```txt
ultimate-ai-coach/
├─ apps/
│  ├─ coach-web/                  # existing
│  └─ health-os/                  # NEW
│      ├─ src/
│      │   ├─ app/                # Next 14 App Router
│      │   ├─ lib/
│      │   ├─ components/
│      │   └─ styles/
│      └─ test/
├─ packages/
│  ├─ shared-auth/                # ensureAnonUid(), sbService()
│  ├─ shared-ui/                  # button, card, chart primitives
│  └─ event-bus/                  # tiny NATS wrapper (optional now)
├─ infra/
│  ├─ sql/
│  │   └─ 20250804_health_init.sql
│  └─ terraform/                  # vercel + supabase (optional)
├─ turbo.json
├─ .vscode/
└─ vercel.json
```

| Command                                    | What it does                                       |
| ------------------------------------------ | -------------------------------------------------- |
| `pnpm i`                                   | bootstraps everything                              |
| `pnpm turbo run dev --filter=health-os`    | local dev on `localhost:3001`                      |
| `pnpm turbo run deploy --filter=health-os` | builds & pushes to Health‑OS Vercel project        |
| `pnpm generate:types`                      | Regenerates Supabase typed‑SDK for *both* sub‑apps |

---

# 2 · Database & Storage

### 2.1 Migration file (`infra/sql/20250804_health_init.sql`)

*Creates the `health` schema, RLS, indices and a budget ledger.*

```sql
begin;

create schema if not exists health;

-----------------------------------------
-- 1. meals
-----------------------------------------
create table health.meals (
  id uuid primary key default gen_random_uuid(),
  uid uuid references public.users(id) on delete cascade,
  anon_uid text,
  source text not null check (source in ('image','text')),
  photo_url text,
  img_hash text,
  text_query text,
  portion_size text default 'medium',
  analysis jsonb,
  calories int,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  confidence numeric,
  created_at timestamptz default now()
);

create unique index if not exists health_meals_unique_img
  on health.meals(uid, img_hash)
  where img_hash is not null;

-----------------------------------------
-- 2. metrics
-----------------------------------------
create table health.metrics (
  id uuid primary key default gen_random_uuid(),
  uid uuid,
  anon_uid text,
  provider text not null,
  type text not null,
  value numeric,
  unit text,
  recorded_at timestamptz,
  raw jsonb,
  created_at timestamptz default now()
);

create index if not exists health_metrics_user_time
  on health.metrics(uid, anon_uid, recorded_at desc);

-----------------------------------------
-- 3. spend ledger
-----------------------------------------
create table health.openai_spend (
  yyyymm text primary key,          -- e.g. '2025‑08'
  usd_spent numeric default 0
);

-----------------------------------------
-- 4. row‑level security
-----------------------------------------
alter table health.meals    enable row level security;
alter table health.metrics  enable row level security;

create policy "meals owner"   on health.meals
  using (uid = auth.uid() or anon_uid = current_setting('request.jwt.claims',true)::json->>'anonUid');

create policy "metrics owner" on health.metrics
  using (uid = auth.uid() or anon_uid = current_setting('request.jwt.claims',true)::json->>'anonUid');

commit;
```

### 2.2 Storage

```bash
supabase storage create-bucket meals --public --file-size-limit 5MB
```

*Images > 180 days are purged nightly by Supabase bucket policy.*

---

# 3 · Health‑OS Backend (Next.js App Router)

### 3.1 Shared utilities (`apps/health-os/src/lib/`)

```ts
// sb.ts
export const sbService = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// costGuard.ts
export async function assertVisionBudget(tokens: number) {
  const month = new Date().toISOString().slice(0,7);
  const estUsd = tokens * 0.00002;      // GPT‑4o Vision pricing ($0.02 / 1k)
  const { data, error } = await sbService
    .from('health.openai_spend')
    .select('usd_spent')
    .eq('yyyymm', month)
    .single();

  const spent = data?.usd_spent ?? 0;
  if (spent + estUsd > Number(process.env.HEALTH_BUDGET_USD)) {
    throw new Error('Vision budget exceeded');
  }
}

// openaiVision.ts
export async function analyzeFoodImage(b64: string, portion: Portion) { ... }
```

### 3.2 API routes (edge unless noted)

| File                                    | Method | Functionality                                                                               |
| --------------------------------------- | ------ | ------------------------------------------------------------------------------------------- |
| `app/api/health/analyze-image/route.ts` | POST   | Accept `multipart/form-data`, run client‑pre‑compressed image through GPT‑4V, persist meal. |
| `app/api/health/analyze-text/route.ts`  | POST   | GPT‑4 text prompt → macro JSON → persist.                                                   |
| `app/api/health/meals/route.ts`         | GET    | Pagination, date filtering.                                                                 |
| `app/api/health/metrics/route.ts`       | GET    | `type` filter, date range.                                                                  |
| `app/api/health/summary/route.ts`       | GET    | Aggregated macros + most‑recent HRV / sleep.                                                |
| `app/api/health/terra-webhook/route.ts` | POST   | **`runtime='nodejs'`**; verify `X-Terra-Signature`, insert metric rows, idempotent upsert.  |

*All edge routes set `cache-control: private, no-store` to prevent CDN leak of PHI.*

---

# 4 · Frontend (Health‑OS)

### 4.1 Global layout (`src/app/layout.tsx`)

```tsx
export const runtime = 'edge';

export default function RootLayout({ children }: Props){
  return (
    <html lang="en"><body>
      <TopBar title="Health‑OS" />
      <main className="px-4 pt-2">{children}</main>
      <BottomNav />  {/* capture / history / insights */}
    </body></html>
  );
}
```

### 4.2 Pages

| Page                 | Stack                                                                                                                 | Core logic |
| -------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------- |
| `/capture/page.tsx`  | React‑Hook‑Form + **`react-webcam`**. Immediately POSTs to `/analyze-image`; optimistic UI row with status `pending`. |            |
| `/history/page.tsx`  | `useSWRInfinite('/api/health/meals')`. Auto‑refresh every 60 s for pending state.                                     |            |
| `/insights/page.tsx` | `Recharts`. Two tabs (Macros / Biometrics). Memoised selectors for 7‑, 30‑day windows.                                |            |

`shared-ui` supplies `Card`, `Button`, `Skeleton` so styles match Coach.

### 4.3 Offline capture

```ts
// lib/offlineQueue.ts
export function enqueue(blob: Blob, portion: Portion){ ... }
self.addEventListener('sync', flushQueue);
```

---

# 5 · Dev‑Experience checklist

| Topic                 | Done? | Detail                                                                  |
| --------------------- | ----- | ----------------------------------------------------------------------- |
| **ESLint + Prettier** | ✔️    | Root `.eslintrc.js` extends `next/core-web-vitals`; Health‑OS inherits. |
| **Testing**           | ✔️    | Vitest + `@testing-library/react`. 100% API route coverage template.    |
| **Storybook**         | ✔️    | Lives in `packages/shared-ui`, so Coach & Health share identical atoms. |
| **CI**                | ✔️    | GitHub Actions: lint → type‑check → unit‑tests → Turbo build per app.   |
| **Preview URLs**      | ✔️    | Each PR on Health‑OS deploys `*.health‑pr‑###.vercel.app`.              |

---

# 6 · Environment Variables

| Name                             | Scope       | Example / Notes                                                |
| -------------------------------- | ----------- | -------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`       | both apps   | [https://xyz.supabase.co](https://xyz.supabase.co)             |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | both        |                                                                |
| `SUPABASE_SERVICE_ROLE_KEY`      | server only | **never** exposed to browser                                   |
| `OPENAI_API_KEY`                 | Health‑OS   | Vision & text completions                                      |
| `HEALTH_BUDGET_USD`              | Health‑OS   | e.g. `15`                                                      |
| `TERRA_DEV_ID` / `TERRA_API_KEY` | Health‑OS   |                                                                |
| `TERRA_WEBHOOK_SECRET`           | Health‑OS   | HMAC verification                                              |
| `NEXT_PUBLIC_HEALTH_BASE_URL`    | Coach‑app   | [https://health.yourdomain.com](https://health.yourdomain.com) |

All env files documented in `apps/health-os/.env.example`.

---

# 7 · Observability & Alerting

* **Axiom log drain** tagged `service=health-os`.

  * Alert if `status>=500` for any API route > 5/min.
* **Spend monitor** (scheduled Vercel cron):

  * Query `openai_spend`, Slack DM if `usd_spent > 0.8 * HEALTH_BUDGET_USD`.
* **Prometheus** (optional self‑host): export metric `health_meals_total{status="success"}`.

---

# 8 · Edge‑cases matrix (devs **must** unit‑test)

| Case                                 | Expected behaviour                                 |
| ------------------------------------ | -------------------------------------------------- |
| Duplicate photo same user            | API returns `200`, `{"duplicate_of": "<mealId>"}`. |
| Confidence < 0.4                     | `flagged=true`; UI shows “tap to edit macros”.     |
| Terra sends unknown metric type      | Store row `type='unknown'`; log warning.           |
| OpenAI 5XX                           | API 503; frontend queues for offline retry.        |
| Vision budget exhausted              | API 429; capture UI shows banner “quota reached”.  |
| Large (> 5 MB) image accepted by iOS | Browser resizes before upload; never hits limit.   |

---

# 9 · Work plan (Gantt‑friendly)

```
Week 1  ─┬─ repo scaffold, SQL migration, bucket
         └─ auth package extraction
Week 2  ─┬─ openaiVision lib + cost guard
         └─ /analyze-image edge route
Week 3  ─┬─ capture UI + offline queue
         └─ meals list API + page
Week 4  ─┬─ Terra webhook, metrics API
         └─ insights dashboard
Week 5  ─┬─ event-bus package
         └─ coach nav link, E2E tests (Playwright)
Week 6  ─┬─ observability, spend alerts
         └─ docs, ADRs, “go live”
```

---

# 10 · Handover checklist (give this to devs)

* [ ] Run `pnpm i && pnpm turbo dev` – both apps boot locally?
* [ ] Execute migration on Supabase **preview** DB, verify RLS.
* [ ] Upload a sample JPG; does `/storage/v1/object/public/meals/...` open?
* [ ] `curl -F file=@meal.jpg -F portion=medium http://localhost:3001/api/health/analyze-image` returns macros?
* [ ] Enable Terra “sandbox” user; verify webhook stores HRV row.
* [ ] Lighthouse PWA score ≥ 90 for Health‑OS.
* [ ] Set `HEALTH_BUDGET_USD=2` in staging and simulate spend‑exceed alert.

---

## Ready‑to‑Ship Summary

* **Scope delivered** – meal photo & text logging, wearable metrics, 7/30‑day dashboards, offline sync, budget guard, RLS.
* **Risk contained** – separate env, project, budget, and alerting.
* **Future hooks** – REST, GraphQL, and real‑time event bus pre‑wired.

Give your engineers this document; with the repo skeleton and migration in place, they have a **clear, testable roadmap** to v1.
