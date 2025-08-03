import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

/**
 * Returns a Supabase client that works in Server Components / Route Handlers.
 * Reads the user's session from cookies.
 */
export function sbServer() {
  return createServerComponentClient({ cookies })
}

const supabaseUrl          = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY!

export function sbService() {
  return createClient(
    supabaseUrl,
    supabaseServiceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}