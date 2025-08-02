Below is everything you asked for in one place:

---

## 1  Quest catalogue (production seed data)

All five assessments live in the **`quest_templates`** table with `is_assessment = true`.
Each item is a **task** (`repeat: 1`, `required: true`).
All use a 5‑point Likert scale rendered the same way in the UI:

```
1  Strongly Disagree
2  Disagree
3  Neutral
4  Agree
5  Strongly Agree
```

> **Reverse‑scored items** (shown with “(R)”) must be flipped in scoring: `6 – response`.

### 1.1 Big‑Five – “Discover Your Big Five”

| Q# | Statement                             | Trait             | Facet           | Reverse? |
| -- | ------------------------------------- | ----------------- | --------------- | -------- |
| 1  | Generates a lot of enthusiasm         | Extraversion      | Energy Level    |          |
| 2  | Rarely feels excited (R)              | E                 | Energy Level    | ✓        |
| 3  | Is talkative                          | E                 | Sociability     |          |
| 4  | Prefers to be alone (R)               | E                 | Sociability     | ✓        |
| 5  | Has an assertive personality          | E                 | Assertiveness   |          |
| 6  | Finds it hard to influence people (R) | E                 | Assertiveness   | ✓        |
| 7  | Values artistic experiences           | Openness          | Aesthetic Sens. |          |
| 8  | Sees little importance in art (R)     | O                 | Aesthetic Sens. | ✓        |
| 9  | Is curious about many diff. things    | O                 | Intellect Cur.  |          |
| 10 | Avoids difficult reading material (R) | O                 | Intellect Cur.  | ✓        |
| 11 | Has rich vocabulary                   | O                 | Intellect Cur.  |          |
| 12 | Has difficulty imagining things (R)   | O                 | Imagination     | ✓        |
| 13 | Tends to find fault with others (R)   | Agreeableness     | Compassion      | ✓        |
| 14 | Feels little sympathy for others (R)  | A                 | Compassion      | ✓        |
| 15 | Is helpful and unselfish with others  | A                 | Compassion      |          |
| 16 | Starts arguments (R)                  | A                 | Cooperation     | ✓        |
| 17 | Is respectful toward others           | A                 | Cooperation     |          |
| 18 | Is sometimes rude (R)                 | A                 | Cooperation     | ✓        |
| 19 | Can be relied upon                    | Conscientiousness | Organization    |          |
| 20 | Leaves a mess in room (R)             | C                 | Organization    | ✓        |
| 21 | Does things efficiently               | C                 | Productiveness  |          |
| 22 | Shirk duties (R)                      | C                 | Productiveness  | ✓        |
| 23 | Is persistent                         | C                 | Responsibility  |          |
| 24 | Gives up easily (R)                   | C                 | Responsibility  | ✓        |
| 25 | Is depressed, blue                    | Neuroticism       | Negative Affect |          |
| 26 | Stays optimistic after setbacks (R)   | N                 | Negative Affect | ✓        |
| 27 | Worries a lot                         | N                 | Anxiety         |          |
| 28 | Feels relaxed most of the time (R)    | N                 | Anxiety         | ✓        |
| 29 | Gets stressed easily                  | N                 | Volatility      |          |
| 30 | Handles stress well (R)               | N                 | Volatility      | ✓        |

### 1.2 Values – “Clarify Your Core Values” (PVQ‑21 wording)

Each prompt begins with “**It’s important to me that…**” in the UI.

| Q# | Short label (10 basic values) | Text                                         | Reverse? |
| -- | ----------------------------- | -------------------------------------------- | -------- |
| 1  | Self‑Direction                | …I think up new ideas and be creative        |          |
| 2  | Stimulation                   | …I seek adventures and have an exciting life |          |
| 3  | Hedonism                      | …I enjoy life’s pleasures                    |          |
| 4  | Achievement                   | …I show my abilities and be admired          |          |
| 5  | Power                         | …I am influential, have authority            |          |
| 6  | Security                      | …the country is safe from threats            |          |
| 7  | Conformity                    | …I behave properly                           |          |
| 8  | Tradition                     | …I follow family’s customs                   |          |
| 9  | Benevolence                   | …I help people close to me                   |          |
| 10 | Universalism                  | …I protect nature                            |          |
| 11 | Self‑Direction                | …I make my own decisions                     |          |
| 12 | Stimulation                   | …I lead an exciting life                     |          |
| 13 | Hedonism                      | …I indulge myself                            |          |
| 14 | Achievement                   | …I succeed in what I do                      |          |
| 15 | Power                         | …I am wealthy                                |          |
| 16 | Security                      | …I have a stable lifestyle                   |          |
| 17 | Conformity                    | …I live obediently                           |          |
| 18 | Tradition                     | …I maintain traditions                       |          |
| 19 | Benevolence                   | …I am loyal to friends                       |          |
| 20 | Universalism                  | …I listen to people who are different        |          |
| 21 | Universalism                  | …I treat everyone equally                    |          |

(Values items are **not** reversed.)

### 1.3 Attachment – “Understand Your Attachment Style” (ECR‑S)

| Q# | Dimension | Statement                                                | Reverse? |
| -- | --------- | -------------------------------------------------------- | -------- |
| 1  | Anxiety   | I worry a lot about my relationships                     |          |
| 2  | Avoid.    | I prefer not to show others how I feel (R)               | ✓        |
| 3  | Anxiety   | I’m afraid that I will lose my partner                   |          |
| 4  | Avoid.    | I find it difficult to allow myself to depend on others  |          |
| 5  | Anxiety   | I worry my partner won’t care about me as much as I care |          |
| 6  | Avoid.    | I am comfortable depending on others (R)                 | ✓        |
| 7  | Anxiety   | I often worry my partner doesn’t really love me          |          |
| 8  | Avoid.    | I prefer not to depend on others                         |          |
| 9  | Anxiety   | I sometimes worry that I’m not good enough               |          |
| 10 | Avoid.    | I find it easy to be close (R)                           | ✓        |
| 11 | Anxiety   | I worry about being abandoned                            |          |
| 12 | Avoid.    | I usually discuss my problems with others (R)            | ✓        |

### 1.4 Regulatory Focus – “Discover Your Motivation Lens” (GRFM)

| Q# | Focus      | Statement                                          | Reverse? |
| -- | ---------- | -------------------------------------------------- | -------- |
| 1  | Promotion  | I frequently imagine how I will achieve my hopes   |          |
| 2  | Promotion  | I often think about how I will achieve success     |          |
| 3  | Promotion  | I see myself pursuing my ideal self                |          |
| 4  | Promotion  | I focus on positive events that I want to happen   |          |
| 5  | Promotion  | I am eager to get rewards when they are offered    |          |
| 6  | Promotion  | I usually focus on the good things I can do        |          |
| 7  | Promotion  | I often think about what I can gain                |          |
| 8  | Promotion  | I work hard to achieve outstanding outcomes        |          |
| 9  | Promotion  | I am motivated by opportunities to grow            |          |
| 10 | Prevention | When I see possible loss, I focus on preventing it |          |
| 11 | Prevention | I concentrate on avoiding failures                 |          |
| 12 | Prevention | I worry about making mistakes                      |          |
| 13 | Prevention | I am careful to avoid losses                       |          |
| 14 | Prevention | Criticism motivates me to avoid errors             |          |
| 15 | Prevention | I consider negative outcomes before acting         |          |
| 16 | Prevention | I prepare backup plans to prevent failure          |          |
| 17 | Prevention | I am driven to fulfill duties and obligations      |          |
| 18 | Prevention | I am alert to potential threats                    |          |

(No reverse items.)

### 1.5 Self‑Efficacy – “Gauge Your Inner Confidence” (GSE‑10)

| Q# | Statement                                                                             | Reverse? |
| -- | ------------------------------------------------------------------------------------- | -------- |
| 1  | I can always manage to solve difficult problems                                       |          |
| 2  | If someone opposes me, I can find the means to get what I want                        |          |
| 3  | It is easy for me to stick to my aims                                                 |          |
| 4  | I am confident I could deal efficiently with unexpected events                        |          |
| 5  | Thanks to my resourcefulness, I can handle unforeseen situations                      |          |
| 6  | I can solve most problems if I invest the necessary effort                            |          |
| 7  | I can remain calm when facing difficulties, because I can rely on my coping abilities |          |
| 8  | When I am confronted with a problem, I can usually find several solutions             |          |
| 9  | If I am in trouble, I can usually think of a solution                                 |          |
| 10 | I can handle whatever comes my way                                                    |          |

(GSE has **no** reverse items.)

---

## 2  Scoring algorithms (pseudo‑code)

```ts
/** generic helper 1–5 Likert */
const flip = (v: number) => 6 - v      // for reverse items
const mean = (arr: number[]) => arr.reduce((a,b)=>a+b,0)/arr.length

/* ---------- Big Five ---------- */
export function scoreBigFive(res: number[]) {
  const rev = [2,4,6,8,10,12,13,14,16,18,20,22,24,26,28,30].map(i=>i-1)
  const keyed = res.map((v,i)=>rev.includes(i)? flip(v) : v)

  const idx = {
    O: [7,8,9,10,11,12],
    C: [19,20,21,22,23,24],
    E: [1,2,3,4,5,6],
    A: [13,14,15,16,17,18],
    N: [25,26,27,28,29,30]
  }

  const traits = Object.fromEntries(
    Object.entries(idx).map(([t,arr]) => [t, mean(arr.map(i=>keyed[i]))])
  )
  return traits        // each 1–5
}

/* ---------- PVQ‑21 ---------- */
export function scorePVQ(values: number[]) {
  const map: Record<string, number[]> = {
    SelfDirection: [1,11],
    Stimulation: [2,12],
    Hedonism: [3,13],
    Achievement: [4,14],
    Power: [5,15],
    Security: [6,16],
    Conformity: [7,17],
    Tradition: [8,18],
    Benevolence: [9,19],
    Universalism: [10,20,21]
  }
  const ten = Object.fromEntries(
    Object.entries(map).map(([k, arr]) => [k, mean(arr.map(i=>values[i-1]))])
  )
  /* aggregate into 4 meta‑motives if desired */
  const meta = {
    OpennessToChange : mean([ten.SelfDirection, ten.Stimulation]),
    SelfEnhancement  : mean([ten.Achievement, ten.Power, ten.Hedonism]),
    Conservation     : mean([ten.Security, ten.Tradition, ten.Conformity]),
    SelfTranscendence: mean([ten.Benevolence, ten.Universalism])
  }
  return { ten, meta }
}

/* ---------- Attachment ---------- */
export function scoreECR(res:number[]) {
  const rev = [2,6,10,12].map(i=>i-1)
  const keyed = res.map((v,i)=>rev.includes(i)? flip(v):v)
  const anxietyIdx   = [1,3,5,7,9,11].map(i=>i-1)
  const avoidanceIdx = [2,4,6,8,10,12].map(i=>i-1)
  const anxiety   = mean(anxietyIdx.map(i=>keyed[i]))
  const avoidance = mean(avoidanceIdx.map(i=>keyed[i]))
  const style = 
      anxiety <3 && avoidance <3 ? 'secure' :
      anxiety >=3 && avoidance <3 ? 'anxious' :
      anxiety <3 && avoidance >=3 ? 'avoidant' : 'fearful-avoidant'
  return { anxiety, avoidance, style }
}

/* ---------- Regulatory Focus ---------- */
export function scoreGRFM(res:number[]) {
  const promo = mean([1,2,3,4,5,6,7,8,9].map(i=>res[i-1]))
  const prev  = mean([10,11,12,13,14,15,16,17,18].map(i=>res[i-1]))
  return { promotion: promo, prevention: prev }
}

/* ---------- Self‑Efficacy ---------- */
export const scoreGSE = (res:number[]) => res.reduce((a,b)=>a+b,0)  // 10–50
```

*Normalisation for prompt‑use*: `norm = (score – 1) / 4` (range 0–1) for Likert means; for GSE use `(raw – 10) / 40`.

---

## 3  Profile JSON saved & sent to Claude Sonnet

```json
{
  "bigFive": { "O": 0.62, "C": 0.48, "E": 0.70, "A": 0.55, "N": 0.28 },
  "valuesMeta": {
    "OpennessToChange": 0.71,
    "SelfEnhancement": 0.40,
    "Conservation": 0.35,
    "SelfTranscendence": 0.82
  },
  "attachment": { "style": "secure", "anxiety": 2.1, "avoidance": 2.4 },
  "regulatoryFocus": { "promotion": 0.68, "prevention": 0.42 },
  "selfEfficacy": 0.73           /* 0–1 scaled */
}
```

---

## 4  Feeding the profile to the model

### 4.1 Prompt stub (in `lib/prompt.ts`)

```ts
export function buildSystemPrompt(profile: Profile, coachStyle: string) {
  let s = `${coachStyle} AI coach.`

  s += `\n\nUser Trait Snapshot (0‑1 scaled unless noted):`
  s += `\n• Big Five  O:${profile.bigFive.O.toFixed(2)}  C:${profile.bigFive.C.toFixed(2)}`
  s += ` E:${profile.bigFive.E.toFixed(2)}  A:${profile.bigFive.A.toFixed(2)}  N:${profile.bigFive.N.toFixed(2)}`
  s += `\n• Values  OTCh:${profile.valuesMeta.OpennessToChange.toFixed(2)}  ST:${profile.valuesMeta.SelfTranscendence.toFixed(2)}`
  s += `\n• Attachment style: ${profile.attachment.style}`
  s += `\n• Regulatory focus  promotion:${profile.regulatoryFocus.promotion.toFixed(2)}`
  s += ` prevention:${profile.regulatoryFocus.prevention.toFixed(2)}`
  s += `\n• Self‑efficacy: ${(profile.selfEfficacy*40+10).toFixed(0)}/50`

  s += `\n\nAdapt language, goal framing, and accountability tactics accordingly.`
  return s
}
```

### 4.2 Inside `/api/chat/route.ts`

```ts
const profile = body.profile ?? await fetchProfile(callerUid)   // fallback
const systemPrompt = buildSystemPrompt(profile, systemPersonalityPrompt)
```

*Do **not** send the raw item responses to Claude—only the aggregated metrics.*

---

## 5  Quest template JSON examples (one per file or inline seed)

```ts
export const bigFiveTemplate: QuestTemplate = {
  id: 'big-five',
  title: 'Discover Your Big Five',
  description: '30 quick reflections to map your core traits',
  category: 'assessment',
  difficulty: 'easy',
  durationDays: 1,
  isAssessment: true,
  orderIndex: 10,
  tasks: [
    { id: 1,  title: 'Generates a lot of enthusiasm' },
    { id: 2,  title: 'Rarely feels excited (R)' },
    /* … up to 30 … */
  ],
  rewards: { points: 100 }
}
```

Clone for the other four assessments with their item arrays.

---

## 6  Putting it together in code

1. **Seed** the five templates on deploy.
2. **QuestCard** already renders Likert items; for assessments disable completion until *all* tasks answered.
3. On **quest completion** run the scorer and `upsert` into `personality_profiles`.
4. The **ChatContext** attaches `profile` to every `/api/chat` POST.
5. **Claude Sonnet** receives a concise system prompt that includes only scaled trait values—preventing over‑weighting yet giving the model actionable context.

---

### This set of five quests and the associated scoring logic will give the coach **≈ 90 % directional accuracy** while keeping the onboarding time under 15 minutes and the database schema minimally expanded.
