import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// Helper function to create notification
async function createNotification(userId: string, type: string, title: string, message: string, link?: string) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type: type as "TaskAssigned" | "TaskUpdated" | "TaskCompleted" | "TaskOverdue" | "ProjectUpdate" | "MemberJoined" | "EventReminder" | "AttendanceReminder" | "SystemAlert" | "Message",
        title,
        message,
        link: link || null,
      }
    })
    // Push notification logic could be added here if needed, 
    // but we'll focus on the DB side for now as getSupabaseAdmin was used before
  } catch (error) {
    console.error('Failed to create notification:', error)
  }
}

// GET /api/tasks
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthUser()
    if (error || !user) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const projectId = searchParams.get('project')
    const assignedToId = searchParams.get('assignedTo')
    const createdById = searchParams.get('createdBy')
    const reviewerId = searchParams.get('reviewerId')
    const parentId = searchParams.get('parentId')
    const search = searchParams.get('search')
    const myTasks = searchParams.get('my') === 'true'
    const includeSubtasks = searchParams.get('includeSubtasks') === 'true'

    const where: Record<string, unknown> = {}

    if (myTasks) {
      where.OR = [
        { assignedToId: user.id },
        { coExecutors: { some: { userId: user.id } } },
        { reviewerId: user.id }
      ]
    }
    
    if (status) where.status = status
    if (priority) where.priority = priority
    if (projectId) where.projectId = projectId
    if (assignedToId) where.assignedToId = assignedToId
    if (createdById) where.createdById = createdById
    if (reviewerId) where.reviewerId = reviewerId
    
    if (parentId) {
      where.parentId = parentId
    } else if (!includeSubtasks) {
      // By default only show top-level tasks unless filtered by parent
      where.parentId = null
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true, avatar: true, email: true } },
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
    console.error('Tasks fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

// POST /api/tasks
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getAuthUser()
    if (error || !user) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    if (!body.title) {
      return NextResponse.json(
        { success: false, message: 'Title is required' },
        { status: 400 }
      )
    }

    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description || null,
        status: body.status || 'TODO',
        priority: body.priority || 'Medium',
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        estimatedHours: body.estimatedHours || 0,
        actualHours: 0,
        tags: body.tags || [],
        projectId: body.projectId,
        assignedToId: body.assignedToId || null,
        createdById: user.id,
        reviewerId: body.reviewerId || null,
        isApprovalRequired: body.isApprovalRequired || false,
        parentId: body.parentId || null,
        coExecutors: body.coExecutors ? {
          create: body.coExecutors.map((userId: string) => ({ userId }))
        } : undefined,
        stages: body.stages ? {
          create: body.stages.map((stage: { title: string, isCompleted?: boolean }, index: number) => ({
            title: stage.title,
            isCompleted: false,
            order: index
          }))
        } : undefined
      },
      include: {
        project: { select: { name: true } },
        assignedTo: { select: { name: true } },
        coExecutors: { include: { user: { select: { name: true } } } }
      }
    })

    // Send notifications
    if (task.assignedToId && task.assignedToId !== user.id) {
      await createNotification(
        task.assignedToId,
        'TaskAssigned',
        'New Task Assigned',
        `${user.name} assigned you a new task: "${task.title}"${task.project ? ` in project "${task.project.name}"` : ''}`,
        '/tasks'
      )
    }

    if (body.reviewerId && body.reviewerId !== user.id) {
      await createNotification(
        body.reviewerId,
        'TaskUpdated',
        'You are assigned as Reviewer',
        `${user.name} designated you as a reviewer for: "${task.title}"`,
        '/tasks'
      )
    }

    return NextResponse.json(
      { success: true, message: 'Task created successfully', data: task },
      { status: 201 }
    )
  } catch (error) {
    console.error('Task create error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create task: ' + (error as Error).message },
      { status: 500 }
    )
  }
}

