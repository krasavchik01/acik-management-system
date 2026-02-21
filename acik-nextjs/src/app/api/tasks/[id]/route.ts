import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser } from '@/lib/auth'

// Helper function to create notification
async function createNotification(userId: string, type: string, title: string, message: string, link?: string) {
  try {
    await supabaseAdmin
      .from('Notification')
      .insert({
        id: crypto.randomUUID(),
        userId,
        type,
        title,
        message,
        link: link || null,
        isRead: false,
        createdAt: new Date().toISOString(),
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

    const { data: task, error: fetchError } = await supabaseAdmin
      .from('Task')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !task) {
      return NextResponse.json(
        { success: false, message: 'Task not found' },
        { status: 404 }
      )
    }

    // Get related data
    let project = null
    let assignedTo = null
    let createdBy = null

    if (task.projectId) {
      const { data } = await supabaseAdmin
        .from('Project')
        .select('id, name')
        .eq('id', task.projectId)
        .single()
      project = data
    }

    if (task.assignedToId) {
      const { data } = await supabaseAdmin
        .from('User')
        .select('id, name, avatar, email')
        .eq('id', task.assignedToId)
        .single()
      assignedTo = data
    }

    if (task.createdById) {
      const { data } = await supabaseAdmin
        .from('User')
        .select('id, name')
        .eq('id', task.createdById)
        .single()
      createdBy = data
    }

    return NextResponse.json({
      success: true,
      data: { ...task, project, assignedTo, createdBy }
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
    const { user, error } = await getAuthUser()
    if (error || !user) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()

    // Get current task to compare changes
    const { data: currentTask } = await supabaseAdmin
      .from('Task')
      .select('*')
      .eq('id', id)
      .single()

    if (!currentTask) {
      return NextResponse.json(
        { success: false, message: 'Task not found' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date().toISOString() }

    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.status !== undefined) {
      updateData.status = body.status
      if (body.status === 'Done') {
        updateData.completedAt = new Date().toISOString()
      }
    }
    if (body.priority !== undefined) updateData.priority = body.priority
    if (body.dueDate !== undefined) updateData.dueDate = body.dueDate
    if (body.estimatedHours !== undefined) updateData.estimatedHours = body.estimatedHours
    if (body.actualHours !== undefined) updateData.actualHours = body.actualHours
    if (body.assignedToId !== undefined) updateData.assignedToId = body.assignedToId
    if (body.tags !== undefined) updateData.tags = body.tags

    const { data: task, error: updateError } = await supabaseAdmin
      .from('Task')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { success: false, message: 'Failed to update task' },
        { status: 500 }
      )
    }

    // Send notifications for important changes
    // 1. Task assigned to new user
    if (body.assignedToId && body.assignedToId !== currentTask.assignedToId && body.assignedToId !== user.id) {
      await createNotification(
        body.assignedToId,
        'TaskAssigned',
        'Task Assigned to You',
        `${user.name} assigned you task: "${currentTask.title}"`,
        '/tasks'
      )
    }

    // 2. Task completed - notify creator
    if (body.status === 'Done' && currentTask.status !== 'Done' && currentTask.createdById !== user.id) {
      await createNotification(
        currentTask.createdById,
        'TaskCompleted',
        'Task Completed',
        `${user.name} completed task: "${currentTask.title}"`,
        '/tasks'
      )
    }

    // 3. Task status changed - notify assignee
    if (body.status && body.status !== currentTask.status && currentTask.assignedToId && currentTask.assignedToId !== user.id) {
      await createNotification(
        currentTask.assignedToId,
        'TaskUpdated',
        'Task Status Updated',
        `${user.name} changed status of "${currentTask.title}" to ${body.status}`,
        '/tasks'
      )
    }

    return NextResponse.json({ success: true, data: task })
  } catch (error) {
    console.error('Task update error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update task' },
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
    const { user, error } = await getAuthUser()
    if (error || !user) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if task exists and user has permission
    const { data: task } = await supabaseAdmin
      .from('Task')
      .select('createdById')
      .eq('id', id)
      .single()

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

    const { error: deleteError } = await supabaseAdmin
      .from('Task')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return NextResponse.json(
        { success: false, message: 'Failed to delete task' },
        { status: 500 }
      )
    }

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
