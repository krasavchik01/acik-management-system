import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, hasRole, ADMIN_ROLES } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { user: authUser, error } = await getAuthUser()
    if (error || !authUser) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      )
    }

    if (!hasRole(authUser.role, ADMIN_ROLES)) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get today's start and end for attendance
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get all stats in parallel using Prisma
    const [
      userStats,
      projectStats,
      taskStats,
      memberStats,
      eventStats,
      financeStats,
      todayAttendance,
      recentUsers,
      recentProjects,
      financeTotal,
      sponsorsTotal,
      membersTotal
    ] = await Promise.all([
      prisma.user.aggregate({ _count: { id: true, isActive: true } }),
      prisma.project.aggregate({ _count: { id: true } }),
      prisma.task.aggregate({ _count: { id: true } }),
      prisma.member.aggregate({ _count: { id: true } }),
      prisma.event.count(),
      prisma.finance.findMany({ select: { amount: true, type: true } }),
      prisma.attendance.findMany({
        where: {
          date: { gte: today, lt: tomorrow }
        },
        select: {
          id: true,
          userId: true,
          status: true,
          workType: true,
          checkInTime: true,
          checkInAddress: true
        }
      }),
      prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.project.findMany({
        select: { id: true, name: true, status: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),
      prisma.finance.count(),
      prisma.sponsor.count(),
      prisma.member.count()
    ])

    // Get specific status counts
    const activeProjectsCount = await prisma.project.count({ where: { status: 'Active' } })
    const completedTasksCount = await prisma.task.count({ where: { status: 'Done' } })
    const activeMembersCount = await prisma.member.count({ where: { status: 'Active' } })
    const activeUsersCount = await prisma.user.count({ where: { isActive: true } })

    const totalIncome = financeStats
      .filter((f: { type: string; amount: number | null }) => f.type === 'Income')
      .reduce((sum: number, f: { amount: number | null }) => sum + (f.amount || 0), 0)

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          users: { total: userStats._count.id, active: activeUsersCount },
          projects: { total: projectStats._count.id, active: activeProjectsCount },
          tasks: { total: taskStats._count.id, completed: completedTasksCount },
          members: { total: memberStats._count.id, active: activeMembersCount },
          events: { total: eventStats },
          finance: { totalIncome },
          system: {
            financeRecords: financeTotal,
            sponsors: sponsorsTotal,
            members: membersTotal,
          }
        },
        recent: {
          users: recentUsers,
          projects: recentProjects,
        },
        presence: todayAttendance,
      }
    })
  } catch (error) {
    console.error('Admin dashboard error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch dashboard data: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
