import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  try {
    const { user, error } = await getAuthUser()
    if (error || !user) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      )
    }

    // Get all projects
    const { data: projects } = await getSupabaseAdmin()
      .from('Project')
      .select('status, category, priority, budgetAllocated, budgetSpent, budgetRemaining')

    const projectList = projects || []

    // Calculate stats
    const total = projectList.length
    const planning = projectList.filter(p => p.status === 'Planning').length
    const active = projectList.filter(p => p.status === 'Active').length
    const onHold = projectList.filter(p => p.status === 'OnHold').length
    const completed = projectList.filter(p => p.status === 'Completed').length
    const cancelled = projectList.filter(p => p.status === 'Cancelled').length

    // Budget stats
    const totalAllocated = projectList.reduce((sum, p) => sum + (p.budgetAllocated || 0), 0)
    const totalSpent = projectList.reduce((sum, p) => sum + (p.budgetSpent || 0), 0)
    const totalRemaining = projectList.reduce((sum, p) => sum + (p.budgetRemaining || 0), 0)

    // By category
    const byCategory: Record<string, number> = {}
    projectList.forEach(p => {
      byCategory[p.category] = (byCategory[p.category] || 0) + 1
    })

    // By priority
    const byPriority: Record<string, number> = {}
    projectList.forEach(p => {
      byPriority[p.priority] = (byPriority[p.priority] || 0) + 1
    })

    return NextResponse.json({
      success: true,
      data: {
        total,
        byStatus: { planning, active, onHold, completed, cancelled },
        byCategory,
        byPriority,
        budget: {
          totalAllocated,
          totalSpent,
          totalRemaining,
        }
      }
    })
  } catch (error) {
    console.error('Project stats error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch project stats' },
      { status: 500 }
    )
  }
}
