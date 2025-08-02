| Concern                  | Service                                   | What it stores for you                                                                | SDK / API used                   |
| ------------------------ | ----------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------- |
| **Auth + anonymous UID** | **Supabase Auth**                         | Session JWT, optional e-mail login                                                    | `@supabase/ssr`, magic-link flow |
| **Turn history**         | **Supabase Edge Function** *(serverless)* | You call a **single RPC** named `log_turn`—Supabase handles the table hidden from you | No schema code in repo           |
| **Long-term memory**     | **MEM0**                                  | Vectorised episode summaries                                                          | `@mem-labs/mem0-js`              |
| **Product analytics**    | **PostHog Cloud (free)**                  | Every “turn”, length, latency, metadata                                               | Browser snippet                  |
| **Real-time usage log**  | **Supabase Realtime channel**             | Stream of turns for observer console                                                  | `supabase.channel('turns')`      |
| **UI kit**               | **shadcn/ui + Radix**                     | Pre-built Button, Dialog, Toast, Sheet                                                | `npx shadcn-ui`                  |
| **Charts**               | **Recharts**                              | Client-side Big-Five graphs                                                           | `recharts`                       |
| **Voice** (optional)     | **OpenAI Whisper or use groq whisper turbo API**                    | WAV/MP3->text; nothing stored                                                         | `fetch` call only                |
