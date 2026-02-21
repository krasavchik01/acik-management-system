import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma/client'
import type { UserProfile } from '@/types'

export async function getAuthUser(): Promise<{ user: UserProfile | null; error?: string }> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { user: null, error: 'Not authenticated' }
    }

    const profile = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      select: {
        id: true,
        supabaseId: true,
        email: true,
        name: true,
        role: true,
        department: true,
        avatar: true,
        phone: true,
        isActive: true,
        isDemo: true,
      }
    })

    if (!profile) {
      return { user: null, error: 'User profile not found' }
    }

    return { user: profile as UserProfile }
  } catch {
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
