import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy initialization to avoid build-time errors
let _supabaseAdmin: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
      throw new Error('Missing Supabase environment variables')
    }

    _supabaseAdmin = createClient(url, key)
  }
  return _supabaseAdmin
}

// For backward compatibility - getter that lazily initializes
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return getSupabaseAdmin()[prop as keyof SupabaseClient]
  }
})
