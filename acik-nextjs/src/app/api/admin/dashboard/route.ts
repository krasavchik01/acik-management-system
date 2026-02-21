import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser, hasRole, ADMIN_ROLES } from '@/lib/auth'

export async function GET() {
  try {
    const { user, error } = await getAuthUser()
    if (error || !user) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      )
    }

    if (!hasRole(user.role, ADMIN_ROLES)) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get all stats in parallel
    const [
      usersRes,
      projectsRes,
      tasksRes,
      membersRes,
      eventsRes,
      financeRes,
    ] = await Promise.all([
      supabaseAdmin.from('User').select('id, isActive'),
      supabaseAdmin.from('Project').select('id, status'),
      supabaseAdmin.from('Task').select('id, status'),
      supabaseAdmin.from('Member').select('id, status'),
      supabaseAdmin.from('Event').select('id'),
      supabaseAdmin.from('Finance').select('amount, type'),
    ])

    const users = usersRes.data || []
    const projects = projectsRes.data || []
    const tasks = tasksRes.data || []
    const members = membersRes.data || []
    const events = eventsRes.data || []
    const finances = financeRes.data || []

    // Calculate stats
    const totalUsers = users.length
    const activeUsers = users.filter(u => u.isActive).length
    const totalProjects = projects.length
    const activeProjects = projects.filter(p => p.status === 'Active').length
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.status === 'Done').length
    const totalMembers = members.length
    const activeMembers = members.filter(m => m.status === 'Active').length
    const totalEvents = events.length
    const totalIncome = finances.filter(f => f.type === 'Income').reduce((sum, f) => sum + (f.amount || 0), 0)

    // Get recent users
    const { data: recentUsers } = await supabaseAdmin
      .from('User')
      .select('id, name, email, role, createdAt')
      .order('createdAt', { ascending: false })
      .limit(5)

    // Get recent projects
    const { data: recentProjects } = await supabaseAdmin
      .from('Project')
      .select('id, name, status, createdAt')
      .order('createdAt', { ascending: false })
      .limit(5)

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          users: { total: totalUsers, active: activeUsers },
          projects: { total: totalProjects, active: activeProjects },
          tasks: { total: totalTasks, completed: completedTasks },
          members: { total: totalMembers, active: activeMembers },
          events: { total: totalEvents },
          finance: { totalIncome },
        },
        recent: {
          users: recentUsers || [],
          projects: recentProjects || [],
        }
      }
    })
  } catch (error) {
    console.error('Admin dashboard error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
