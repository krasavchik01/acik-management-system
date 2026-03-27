import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Helper function to create notification
async function createNotification(userId: string, type: string, title: string, message: string, link?: string) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type: type as any,
        title,
        message,
        link: link || null,
      }
    })
  } catch (error) {
    console.error('Failed to create notification:', error)
  }
}

// GET /api/tasks/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthUser()
    if (error || !user) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true, avatar: true, email: true } },
        createdBy: { select: { id: true, name: true } },
        reviewer: { select: { id: true, name: true, avatar: true } },
        coExecutors: { include: { user: { select: { id: true, name: true, avatar: true } } } },
        stages: { orderBy: { order: 'asc' } },
        subtasks: {
          include: {
            assignedTo: { select: { name: true, avatar: true } }
          }
        },
        parent: { select: { id: true, title: true } }
      }
    })

    if (!task) {
      return NextResponse.json(
        { success: false, message: 'Task not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: task
    })
  } catch (error) {
    console.error('Task fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch task' },
      { status: 500 }
    )
  }
}

// PUT /api/tasks/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error: authError } = await getAuthUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()

    // Get current task to check permissions and logic
    const currentTask = await prisma.task.findUnique({
      where: { id },
      include: { coExecutors: true }
    })

    if (!currentTask) {
      return NextResponse.json(
        { success: false, message: 'Task not found' },
        { status: 404 }
      )
    }

    // Permission Check
    const isAdmin = ['Admin', 'President', 'CEO', 'ProjectManager'].includes(user.role)
    const isCreator = currentTask.createdById === user.id
    const isAssignee = currentTask.assignedToId === user.id
    const isCoExecutor = currentTask.coExecutors.some((ce: any) => ce.userId === user.id)
    const isReviewer = currentTask.reviewerId === user.id

    // Non-admin, non-creator users: restrict what they can change
    if (!isAdmin && !isCreator) {
      if (isAssignee || isCoExecutor || isReviewer) {
        // Participants can ONLY change status, actualHours, and stages
        const allowedKeys = ['status', 'actualHours', 'stages']
        const bodyKeys = Object.keys(body)
        const forbiddenKeys = bodyKeys.filter((k: string) => !allowedKeys.includes(k))

        if (forbiddenKeys.length > 0) {
          return NextResponse.json(
            { success: false, message: 'You only have permission to update status and actual hours' },
            { status: 403 }
          )
        }
      } else {
        // Not a participant at all — no access
        return NextResponse.json(
          { success: false, message: 'Not authorized to edit this task' },
          { status: 403 }
        )
      }
    }

    const updateData: any = { updatedAt: new Date() }

    // Logic: Approval Flow
    if (body.status === 'Done' && currentTask.status !== 'Done') {
      if (currentTask.isApprovalRequired && !isReviewer && !isAdmin) {
        // Force to Review if approval is required and user is not reviewer/admin
        body.status = 'Review'

        if (currentTask.reviewerId) {
          await createNotification(
            currentTask.reviewerId,
            'TaskUpdated',
            'Task needs your approval',
            `${user.name} finished task "${currentTask.title}" and it needs your review`,
            `/tasks?id=${id}`
          )
        }
      } else {
        updateData.completedAt = new Date()
        if (isReviewer || isAdmin) {
          updateData.approvedAt = new Date()
        }
      }
    }

    // Field updates
    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.status !== undefined) updateData.status = body.status
    if (body.priority !== undefined) updateData.priority = body.priority
    if (body.dueDate !== undefined) updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null
    if (body.estimatedHours !== undefined) updateData.estimatedHours = body.estimatedHours
    if (body.actualHours !== undefined) updateData.actualHours = body.actualHours
    if (body.assignedToId !== undefined) updateData.assignedToId = body.assignedToId
    if (body.reviewerId !== undefined) updateData.reviewerId = body.reviewerId
    if (body.isApprovalRequired !== undefined) updateData.isApprovalRequired = body.isApprovalRequired
    if (body.tags !== undefined) updateData.tags = body.tags

    // Nested updates: coExecutors
    if (body.coExecutors !== undefined && (isAdmin || isCreator)) {
      updateData.coExecutors = {
        deleteMany: {},
        create: body.coExecutors.map((userId: string) => ({ userId }))
      }
    }

    // Nested updates: stages
    if (body.stages !== undefined) {
      updateData.stages = {
        deleteMany: {},
        create: body.stages.map((stage: any, index: number) => ({
          title: stage.title,
          isCompleted: stage.isCompleted || false,
          order: index
        }))
      }
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignedTo: { select: { name: true } },
        reviewer: { select: { name: true } }
      }
    })

    // Notify for assignment changes
    if (body.assignedToId && body.assignedToId !== currentTask.assignedToId && body.assignedToId !== user.id) {
        await createNotification(
            body.assignedToId,
            'TaskAssigned',
            'Task Assigned to You',
            `${user.name} assigned you task: "${currentTask.title}"`,
            '/tasks'
        )
    }

    return NextResponse.json({ success: true, data: task })
  } catch (error) {
    console.error('Task update error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update task: ' + (error as Error).message },
      { status: 500 }
    )
  }
}

// DELETE /api/tasks/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error: authError } = await getAuthUser()
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const task = await prisma.task.findUnique({
      where: { id },
      select: { createdById: true }
    })

    if (!task) {
      return NextResponse.json(
        { success: false, message: 'Task not found' },
        { status: 404 }
      )
    }

    const isAdmin = ['Admin', 'President', 'CEO', 'ProjectManager'].includes(user.role)
    if (task.createdById !== user.id && !isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to delete this task' },
        { status: 403 }
      )
    }

    await prisma.task.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully'
    })
  } catch (error) {
    console.error('Task delete error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete task' },
      { status: 500 }
    )
  }
}
