import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/tasks/hub — data for the task mind map
export async function GET() {
  try {
    const { user, error } = await getAuthUser()
    if (error || !user) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      )
    }

    // Fetch all tasks with creator → assignee relationships
    const tasks = await prisma.task.findMany({
      where: { parentId: null },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        dueDate: true,
        createdAt: true,
        project: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true, avatar: true, role: true, department: true } },
        assignedTo: { select: { id: true, name: true, avatar: true, role: true, department: true } },
        reviewer: { select: { id: true, name: true, avatar: true } },
        coExecutors: { include: { user: { select: { id: true, name: true, avatar: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Build relationship map: creator -> assignee -> tasks[]
    const relationships: Record<string, {
      creator: { id: string; name: string; avatar: string | null; role: string | null; department: string | null };
      assignees: Record<string, {
        user: { id: string; name: string; avatar: string | null; role: string | null; department: string | null };
        tasks: typeof tasks;
      }>;
    }> = {}

    for (const task of tasks) {
      if (!task.createdBy) continue

      const creatorId = task.createdBy.id
      if (!relationships[creatorId]) {
        relationships[creatorId] = {
          creator: task.createdBy as any,
          assignees: {},
        }
      }

      const assigneeId = task.assignedTo?.id || '_unassigned'
      const assigneeData = task.assignedTo || { id: '_unassigned', name: 'Unassigned', avatar: null, role: null, department: null }

      if (!relationships[creatorId].assignees[assigneeId]) {
        relationships[creatorId].assignees[assigneeId] = {
          user: assigneeData as any,
          tasks: [],
        }
      }

      relationships[creatorId].assignees[assigneeId].tasks.push(task)
    }

    // Convert to array format
    const nodes = Object.values(relationships).map(rel => ({
      creator: rel.creator,
      assignees: Object.values(rel.assignees).map(a => ({
        user: a.user,
        tasks: a.tasks,
        statusCounts: {
          TODO: a.tasks.filter(t => t.status === 'TODO').length,
          InProgress: a.tasks.filter(t => t.status === 'InProgress').length,
          Review: a.tasks.filter(t => t.status === 'Review').length,
          Done: a.tasks.filter(t => t.status === 'Done').length,
          Blocked: a.tasks.filter(t => t.status === 'Blocked').length,
        },
        total: a.tasks.length,
      })),
      totalAssigned: Object.values(rel.assignees).reduce((sum, a) => sum + a.tasks.length, 0),
    }))

    return NextResponse.json({
      success: true,
      data: nodes,
      totalTasks: tasks.length,
    })
  } catch (error) {
    console.error('Task hub fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch task hub data' },
      { status: 500 }
    )
  }
}
