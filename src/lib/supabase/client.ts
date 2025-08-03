import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Returns a Supabase client for use **in the browser**.
 * No service-role key is ever bundled.
 */
export function supabaseClient() {
  return createBrowserClient(supabaseUrl, supabaseAnon)
}