import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    // Get tasks assigned to, created by, reviewer for, or co-executor for user
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { assignedToId: user.id },
          { createdById: user.id },
          { reviewerId: user.id },
          { coExecutors: { some: { userId: user.id } } }
        ]
      },
      include: {
        project: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true, avatar: true } },
        createdBy: { select: { id: true, name: true } },
        reviewer: { select: { id: true, name: true, avatar: true } },
        coExecutors: { include: { user: { select: { id: true, name: true, avatar: true } } } },
        _count: { select: { subtasks: true, stages: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      count: tasks.length,
      data: tasks
    })
  } catch (error) {
    console.error('My tasks fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch tasks: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
