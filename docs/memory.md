Below is the **context-handling expansion plan** that fits on top of the lean scaffold we just finalised.
You will see two phases:

* **Phase A – “Working-memory only”** (small patch, no extra infra).
* **Phase B – “MEM0-backed long-term memory”** (opt-in when you decide).

Each phase is broken into the actionable items you asked for: file paths, code sections, new helpers, data-model tweaks, and architectural notes.

---

## Phase A (ships today) Sliding-window context + ad-hoc “New chat”

### 1 Data-structure change

| Table      | Column       | Type              | Reason                                                       |
| ---------- | ------------ | ----------------- | ------------------------------------------------------------ |
| `messages` | `episode_id` | `uuid` (nullable) | Allows multiple *episodes* per user while keeping one table. |

```sql
alter table messages add column episode_id uuid;
create index on messages (episode_id);
```

### 2 Edge-route modifications `app/api/chat/route.ts`

| Section              | Change                                                                                      | Explanation                           |
| -------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------- |
| **Request body**     | Accept optional `episodeId` and `reset` flag.                                               | `reset=true` ⇒ start new episode.     |
| **Episode handling** | `ts\nconst episodeId = body.reset ? crypto.randomUUID() : (body.episodeId ?? 'default');\n` | New ID whenever user taps “New chat”. |
| **History fetch**    | `eq('episode_id', episodeId)` instead of `uid` only.                                        | Slides window per episode.            |
| **Insert**           | Include `episode_id: episodeId` in both rows.                                               | Keeps data grouped.                   |
| **Response**         | Return `{ reply, episodeId }`.                                                              | Front-end can store current episode.  |

### 3 Front-end change `components/Chat.tsx`

| Part              | Modification                                                                                         |                |
| ----------------- | ---------------------------------------------------------------------------------------------------- | -------------- |
| Local state       | \`const \[episodeId, setEpisodeId] = useState\<string                                                | null>(null);\` |
| Send logic        | Pass `episodeId` in body.  If `episodeId === null` first call will be assigned by server’s response. |                |
| “New chat” button | `setMessages([]); setEpisodeId(null);` to trigger fresh episode.                                     |                |

### 4 Reasoning

* 100 % backwards-compatible—old rows have `episode_id IS NULL` (treated as default thread).
* No summarisation yet—Edge route still clips to last *N* turns (e.g. 20).
* Users decide when to “reset” context; Claude stays focused.

---

## Phase B (later) Incremental summarisation + MEM0

> **Requirement**: Keep context under \~8 k tokens, but preserve life-time insights.

### 1 Additional data structures

| Table               | New              | Definition                                                                                                                                                                                                       |
| ------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `episode_summaries` | **new**          | `sql\ncreate table episode_summaries (\n  id uuid primary key,\n  uid uuid references users(uid),\n  episode_id uuid unique,\n  summary text,\n  created_at timestamptz default now(),\n  token_count int\n);\n` |
| `users`             | `mem0_vector_id` | `text` (optional) – the object ID returned by MEM0 for the user.                                                                                                                                                 |

### 2 Services / helpers

| File          | New function                                                                | Signature                                                          |
| ------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `lib/llm.ts`  | `summariseTurns(turns: Message[]): Promise<{text: string, tokens: number}>` | Uses Claude or GPT-4o; returns 3-5 sentence summary + token count. |
| `lib/mem0.ts` | `addMemory(uid: string, summary: string): Promise<void>`                    | Wraps MEM0 REST call.                                              |

### 3 Edge route flow change (pseudo-diff)

```ts
// after inserting assistant reply …
const turns = await sbService.from('messages')
  .select('role,content')
  .eq('episode_id', episodeId)
  .order('turn_index')
  .maybeArray();           // util that returns [] if null

const tokens = estimateTokens(turns);           // your helper

if (tokens > 8_000) {
  const { text: summary, tokens: sumTokens } = await summariseTurns(turns);
  // a) store summary locally
  await sbService.from('episode_summaries')
        .insert({ uid: callerUid, episode_id: episodeId, summary, token_count: sumTokens });
  // b) push to MEM0 (non-blocking)
  addMemory(callerUid, summary).catch(console.error);
  // c) prune oldest half of turns
  await pruneTurns(episodeId);
}
```

### 4 Prompt assembly when calling Claude

```ts
const summaries = await sbService
  .from('episode_summaries')
  .select('summary')
  .eq('uid', callerUid)
  .order('created_at', { ascending: false })
  .limit(10);                         // cheap retrieval

const promptMessages = [
  { role: 'system', content: buildSystemContext(summaries) },
  ...recentTurns
];
```

**`buildSystemContext()`** can simply join summaries or apply a heuristic (“Top 3 behavioural insights …”).

### 5 MEM0 integration details

* Store MEM0 object ID in `users.mem0_vector_id` to avoid dups.
* For retrieval (future “self-reflection” feature) call MEM0 search endpoint with last user message.

### 6 Side-effects / impacts

| Area                         | Impact                                         | Mitigation                                   |
| ---------------------------- | ---------------------------------------------- | -------------------------------------------- |
| **Cold-start tokens**        | Summaries add \~300 tokens to every request    | Limit to last \~5 summaries.                 |
| **Race conditions on prune** | Parallel sends may delete each other’s turns   | Wrap prune + insert in Postgres transaction. |
| **MEM0 downtime**            | Chat still works; summary saved in local table | Call `addMemory` in `.catch()`.              |

### 7 Critical architectural notes

1. Summaries are **append-only**; you never rewrite entire history.
2. The `episode_id` boundary means you can alternate between **context reset** (user clicks “New chat”) and **roll-up summarisation** (auto when token budget overloaded).
3. MEM0 is purely additive—if you drop it later, nothing breaks; your own `episode_summaries` table still provides retrieval context.

---

## Deliverables checklist

| Phase | File(s)                                                                            | Key items                    |
| ----- | ---------------------------------------------------------------------------------- | ---------------------------- |
| **A** | SQL migration, `chat/route.ts`, `Chat.tsx`                                         | episode\_id logic + UI reset |
| **B** | `episode_summaries` table, `lib/llm.ts`, `lib/mem0.ts`, changes in `chat/route.ts` | summarise + push + prune     |

This plan keeps your prototype snappy today and lets you **grow into robust memory** (with or without MEM0) without refactoring existing tables or routes.
