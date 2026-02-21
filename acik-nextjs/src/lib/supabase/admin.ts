import { createClient } from '@supabase/supabase-js'

// Admin client with service role - use only on server side
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
