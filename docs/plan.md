Below is the **final cut of the implementation plan**—exactly what you’d hand a teammate before starting the sprint.
It assumes a *fresh* `create-next-app --app --ts --tailwind` repo named **`purpose-demo`**.

---

## 1 Dependencies / configuration

| Change                | File                                          | Detail                                                                                                                                                                        |
| --------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Add packages**      | `package.json`                                | `bash\nnpm i @supabase/ssr @supabase/supabase-js next-pwa lucide-react\n`                                                                                                     |
| **Next-PWA plugin**   | `next.config.js`                              | `js\nconst withPWA = require('next-pwa')({ dest: 'public', register: true, skipWaiting: true, clientsClaim: true });\nmodule.exports = withPWA({ reactStrictMode: true });\n` |
| **Manifest & icons**  | `/public/manifest.json`, `/public/icon-*.png` | Standard PWA entries (name, short\_name, theme\_color, etc.).                                                                                                                 |
| **ENV vars (Vercel)** | Settings › Env Vars                           | `SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY, NEXT_PUBLIC_SITE_URL`                                                                         |

---

## 2 Database (run once in Supabase SQL editor)

```sql
-- 2.1 users (anon → optional email)
create table if not exists users (
  uid           uuid primary key,
  referrer_uid  uuid,
  email         text unique,
  upgraded_at   timestamptz,
  metadata      jsonb,
  created_at    timestamptz default now()
);

-- 2.2 raw messages
create table if not exists messages (
  id           bigint generated always as identity primary key,
  uid          uuid references users(uid),
  turn_index   int,
  role         text check (role in ('user','assistant')),
  content      text,
  char_count   int,
  created_at   timestamptz default now()
);

-- 2.3 daily-turns view for simple rate-limit
create or replace view daily_turns as
select uid, count(*) as today
from messages
where created_at >= date_trunc('day', now())
group by uid;

-- RLS (optional: enable later)
alter table messages enable row level security;
create policy user_select on messages
  for select using ( auth.uid() = uid );
```

---

## 3 Shared helpers  `src/lib/`

| File              | Purpose                         | Key exports                      |
| ----------------- | ------------------------------- | -------------------------------- |
| **`supabase.ts`** | Centralised client factory      | `sbBrowser`, `sbService`         |
| **`identity.ts`** | Anonymous UID, referral capture | `ensureAnonUid()`, `shareLink()` |
| **`auth.ts`**     | Email upgrade helper            | `upgradeToEmail(email, anonUid)` |

```ts
// identity.ts (excerpts)
export function ensureAnonUid(): string {
  let uid = localStorage.getItem('purpose_uid');
  if (!uid) {
    uid = crypto.randomUUID();
    localStorage.setItem('purpose_uid', uid);
    fetch('/api/referral', { method: 'POST', body: JSON.stringify({ uid, ref: new URLSearchParams(location.search).get('ref') }) });
  }
  return uid;
}
```

---

## 4 API routes  `src/app/api/`

### 4.1 `referral/route.ts`

```ts
export const runtime = 'edge';
export async function POST(req: Request) {
  const { uid, ref } = await req.json();
  await sbService.from('users').upsert({ uid, referrer_uid: ref ?? null }, { onConflict: 'uid' });
  return new Response(null, { status: 204 });
}
```

### 4.2 `upgrade/route.ts`

```ts
export const runtime = 'edge';
export async function POST(req: Request) {
  const { email, anonUid } = await req.json();
  // caller already authenticated via supabase-js (magic link)
  const { data: sess } = await sbService.auth.getUser();
  if (!sess?.user?.id) return new Response('401', { status: 401 });

  // merge rows + migrate old messages
  const realUid = sess.user.id;
  await sbService.from('users').upsert({ uid: realUid, email, upgraded_at: new Date() });
  await sbService.from('messages').update({ uid: realUid }).eq('uid', anonUid);
  return new Response(null, { status: 204 });
}
```

### 4.3 `chat/route.ts`

* **Modify existing skeleton** with:\*

```ts
const supaJwt = req.headers.get('Authorization')?.replace('Bearer ', '');
const callerUid = supaJwt ? (await sbService.auth.getUser(supaJwt)).data?.user?.id : body.anonUid;
```

*All subsequent `select`/`insert` use `callerUid`.*

---

## 5 React pages / components

| Path                                | New / mod | Purpose                                                |
| ----------------------------------- | --------- | ------------------------------------------------------ |
| `app/layout.tsx`                    | **MOD**   | Wrap in `<SWToast />` to announce new version.         |
| `app/page.tsx`                      | **NEW**   | Landing → FTUE; on completion `redirect('/chat')`.     |
| `app/chat/page.tsx`                 | **NEW**   | Main chat UI (uses `ChatContext`).                     |
| `components/Chat.tsx`               | **NEW**   | Message list + InputBar; maintains localStorage cache. |
| `components/SaveProgressButton.tsx` | **NEW**   | Dialog that calls `upgradeToEmail`.                    |
| `components/SWToast.tsx`            | **NEW**   | Prompt user to reload when service-worker updates.     |
| `hooks/useSession.ts`               | **NEW**   | Thin wrapper around `sbBrowser.auth` events.           |

Important props / signatures:

```ts
interface Message { id: number; role: 'user' | 'assistant'; content: string; }

type ChatContextShape = {
  messages: Message[];
  send: (text: string) => Promise<void>;
  loading: boolean;
};
```

---

## 6 Edge-case logic

| Concern                | Location           | Snippet / logic                                                                                                                                                                   |
| ---------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Turn index race**    | `chat/route.ts`    | Use Postgres function: `nextval('turn_seq')` per insert or `turn_index = (select coalesce(max(turn_index),0)+1 from messages where uid=:uid)` inside a single SQL `insert` block. |
| **Daily quota**        | `chat/route.ts`    | `ts\nconst { data } = await sbService.from('daily_turns').select('today').eq('uid', callerUid).single();\nif (data?.today >= 500) return new Response('Quota', {status:429});\n`  |
| **LocalStorage bloat** | `ChatContext.send` | After append: `if (msg.length > 100) msg.splice(0, msg.length - 100);`                                                                                                            |

---

## 7 Critical architectural decisions

1. **Single “source of identity”** is the `users.uid` PK.
   *Anonymous* and *e-mail* users differ only by presence of `email`.
   Messages can be migrated simply by updating `uid`.

2. **No ORM yet** to keep iteration speed; SQL strings are < 15 lines total.
   If complexity grows, graft Prisma later—this schema is Prisma-friendly.

3. **One Edge function per concern** keeps cold-start low and code searchable.
   We stay under Vercel’s free tier limits.

4. **Feature flags** by file-level imports (quest/day-diary not in repo yet).
   New slices drop in `app/quest` or `app/journey` without touching chat code.

---

## 8 Side-effects / cross-component impacts

| Change                     | Potential impact                              | Mitigation                                                          |
| -------------------------- | --------------------------------------------- | ------------------------------------------------------------------- |
| Merging anon → email       | Open PWA tab might still hold old `uid` cache | On successful upgrade, clear `localStorage.purpose_uid` and reload. |
| Adding new message columns | Chat page TypeScript types                    | Keep a central `Message` interface and extend gradually.            |

---

## 9 Future bolt-ons (one-line notes)

1. **Quests table** – `alter table users add column personality jsonb;` + `/api/quest`.
2. **Diary route** – new Edge function + new table `diary_entries`, no impact on chat.
3. **Push notifications** – Expo token table, separate route, no schema change to messages.
4. **Admin view** – Use Supabase “SQL editor” or create `app/admin/page.tsx` gated by `process.env.NEXT_PUBLIC_FOUNDER_EMAILS.includes(session.user.email)`.

---

### You’re ready — just implement the file edits above in this order:

1. **DB schema** → 2 minutes.
2. **`supabase.ts` + helpers** → 5 minutes.
3. **API routes** → 15 minutes.
4. **Chat component & Save-progress dialog** → 30-45 minutes.

Push to Vercel, install as PWA, send the link to yourself and three teammates—cross-device history works after “Save my progress”, and you can iterate on new features without touching this backbone.
