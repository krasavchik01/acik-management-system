import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns'

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

    // 1. Project Status Distribution
    const projectStats = await prisma.project.groupBy({
      by: ['status'],
      _count: { id: true },
    })

    // 2. Budget Overview
    const budgetStats = await prisma.project.aggregate({
      _sum: {
        budgetAllocated: true,
        budgetSpent: true,
      }
    })

    // 3. Task Status Distribution
    const taskStats = await prisma.task.groupBy({
      by: ['status'],
      _count: { id: true },
    })

    // 4. Monthly Trends (Last 6 Months)
    const trends = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i))
      const monthEnd = endOfMonth(subMonths(new Date(), i))
      const monthLabel = format(monthStart, 'MMM yyyy')

      const [projectsCount, tasksCompletedCount] = await Promise.all([
        prisma.project.count({
          where: {
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            }
          }
        }),
        prisma.task.count({
          where: {
            status: 'Done',
            updatedAt: {
              gte: monthStart,
              lte: monthEnd,
            }
          }
        })
      ])

      trends.push({
        month: monthLabel,
        projects: projectsCount,
        tasksCompleted: tasksCompletedCount,
      })
    }

    // 5. Category Breakdown
    const categoryStats = await prisma.project.groupBy({
      by: ['category'],
      _count: { id: true },
    })

    return NextResponse.json({
      success: true,
      data: {
        projects: {
          distribution: projectStats,
          categories: categoryStats,
        },
        budget: {
          allocated: budgetStats._sum.budgetAllocated || 0,
          spent: budgetStats._sum.budgetSpent || 0,
          remaining: (budgetStats._sum.budgetAllocated || 0) - (budgetStats._sum.budgetSpent || 0),
        },
        tasks: {
          distribution: taskStats,
        },
        trends
      }
    })
  } catch (error) {
    console.error('Reports stats error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch report statistics: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
