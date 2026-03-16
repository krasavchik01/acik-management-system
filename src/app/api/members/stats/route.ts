import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { user, error } = await getAuthUser()
    if (error || !user) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      )
    }

    // Get all members
    const { data: members } = await getSupabaseAdmin()
      .from('Member')
      .select('status, category, joinDate')

    const memberList = members || []

    // Calculate stats
    const total = memberList.length
    const active = memberList.filter(m => m.status === 'Active').length
    const inactive = memberList.filter(m => m.status === 'Inactive').length
    const suspended = memberList.filter(m => m.status === 'Suspended').length
    const alumni = memberList.filter(m => m.status === 'Alumni').length

    // By category
    const byCategory: Record<string, number> = {}
    memberList.forEach(m => {
      byCategory[m.category] = (byCategory[m.category] || 0) + 1
    })

    // New members this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    const startOfMonthStr = startOfMonth.toISOString().split('T')[0]

    const newThisMonth = memberList.filter(m => m.joinDate >= startOfMonthStr).length

    return NextResponse.json({
      success: true,
      data: {
        total,
        byStatus: { active, inactive, suspended, alumni },
        byCategory,
        newThisMonth
      }
    })
  } catch (error) {
    console.error('Member stats error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch member stats' },
      { status: 500 }
    )
  }
}
