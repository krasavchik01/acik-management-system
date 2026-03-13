import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
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
      getSupabaseAdmin().from('User').select('id, isActive'),
      getSupabaseAdmin().from('Project').select('id, status'),
      getSupabaseAdmin().from('Task').select('id, status'),
      getSupabaseAdmin().from('Member').select('id, status'),
      getSupabaseAdmin().from('Event').select('id'),
      getSupabaseAdmin().from('Finance').select('amount, type'),
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

    // Get today's attendance
    const todayDate = new Date().toISOString().split('T')[0]
    const { data: todayAttendance } = await getSupabaseAdmin()
      .from('Attendance')
      .select('id, userId, status, workType, checkInTime, checkInAddress')
      .gte('date', todayDate + 'T00:00:00')
      .lte('date', todayDate + 'T23:59:59')

    // Get recent users
    const { data: recentUsers } = await getSupabaseAdmin()
      .from('User')
      .select('id, name, email, role, createdAt')
      .order('createdAt', { ascending: false })
      .limit(5)

    // Get recent projects
    const { data: recentProjects } = await getSupabaseAdmin()
      .from('Project')
      .select('id, name, status, createdAt')
      .order('createdAt', { ascending: false })
      .limit(5)

    // Get counts for system health
    const [
      financeTotal,
      sponsorsTotal,
      membersTotal,
    ] = await Promise.all([
      getSupabaseAdmin().from('Finance').select('id', { count: 'exact', head: true }),
      getSupabaseAdmin().from('Sponsor').select('id', { count: 'exact', head: true }),
      getSupabaseAdmin().from('Member').select('id', { count: 'exact', head: true }),
    ])

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
          system: {
            financeRecords: financeTotal.count || 0,
            sponsors: sponsorsTotal.count || 0,
            members: membersTotal.count || 0,
          }
        },
        recent: {
          users: recentUsers || [],
          projects: recentProjects || [],
        },
        presence: todayAttendance || [],
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
