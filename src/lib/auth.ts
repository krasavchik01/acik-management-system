import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import type { UserProfile } from '@/types'

export async function getAuthUser(): Promise<{ user: UserProfile | null; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log('Auth check: No user session found')
      return { user: null, error: 'Not authenticated' }
    }

    console.log('Auth check: Found user session for', user.email)

    // Use Supabase admin client instead of Prisma (more reliable connection)
    const admin = getSupabaseAdmin()
    const { data: profile, error: profileError } = await admin
      .from('User')
      .select('id, supabaseId, email, name, role, department, avatar, phone, isActive, isDemo')
      .eq('supabaseId', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError?.message, 'for supabaseId:', user.id)
      return { user: null, error: 'User profile not found' }
    }

    console.log('Auth check: Found profile for', profile.name)
    return { user: profile as UserProfile }
  } catch (err) {
    console.error('Auth error:', err)
    return { user: null, error: 'Authentication error' }
  }
}

export function hasRole(userRole: string, allowedRoles: string[]): boolean {
  return allowedRoles.includes(userRole)
}

export const ADMIN_ROLES = ['Admin', 'President', 'CEO']
export const MANAGER_ROLES = ['Admin', 'President', 'VicePresident', 'CEO', 'ProjectManager']
export const FINANCE_ROLES = ['Admin', 'President', 'CEO', 'CFO']
export const MARKETING_ROLES = ['Admin', 'President', 'CEO', 'MarketingManager']
