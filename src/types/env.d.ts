declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_ADMIN_EMAIL: string
    NEXT_PUBLIC_SUPABASE_URL: string
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string
    SUPABASE_SERVICE_ROLE_KEY: string
    ANTHROPIC_API_KEY: string
    ENABLE_CHAT: 'true' | 'false'
    MAX_INPUT_CHARS: string
    MONTHLY_SPEND_LIMIT: string
    DAILY_SPEND_LIMIT: string
    // …add the rest
  }
}