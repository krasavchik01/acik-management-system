import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser } from '@/lib/auth'
import { sendWebPushNotification } from '@/lib/web-push'

// Helper function to create notification
async function createNotification(userId: string, type: string, title: string, message: string, link?: string) {
  try {
    await getSupabaseAdmin()
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

    // Also send Mobile Web Push
    await sendWebPushNotification(userId, { title, body: message, url: link })
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
    const search = searchParams.get('search')
    const myTasks = searchParams.get('my') === 'true'

    let query = getSupabaseAdmin()
      .from('Task')
      .select('*')
      .order('createdAt', { ascending: false })

    if (myTasks) query = query.eq('assignedToId', user.id)
    if (status) query = query.eq('status', status)
    if (priority) query = query.eq('priority', priority)
    if (projectId) query = query.eq('projectId', projectId)
    if (assignedToId) query = query.eq('assignedToId', assignedToId)
    if (createdById) query = query.eq('createdById', createdById)
    if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)

    const { data: tasks, error: fetchError } = await query

    if (fetchError) {
      console.error('Tasks fetch error:', fetchError)
      return NextResponse.json(
        { success: false, message: 'Failed to fetch tasks' },
        { status: 500 }
      )
    }

    // Batch fetch related data instead of N+1 queries
    const taskList = tasks || []
    const projectIds = [...new Set(taskList.map(t => t.projectId).filter(Boolean))]
    const userIds = [...new Set([
      ...taskList.map(t => t.assignedToId).filter(Boolean),
      ...taskList.map(t => t.createdById).filter(Boolean),
    ])]

    const [projectsResult, usersResult] = await Promise.all([
      projectIds.length > 0
        ? getSupabaseAdmin().from('Project').select('id, name').in('id', projectIds)
        : { data: [] },
      userIds.length > 0
        ? getSupabaseAdmin().from('User').select('id, name, avatar, email').in('id', userIds)
        : { data: [] },
    ])

    const projectMap = new Map((projectsResult.data || []).map(p => [p.id, p]))
    const userMap = new Map((usersResult.data || []).map(u => [u.id, u]))

    const tasksWithDetails = taskList.map(task => ({
      ...task,
      project: task.projectId ? projectMap.get(task.projectId) || null : null,
      assignedTo: task.assignedToId ? userMap.get(task.assignedToId) || null : null,
      createdBy: task.createdById ? userMap.get(task.createdById) || null : null,
    }))

    return NextResponse.json({
      success: true,
      count: tasksWithDetails.length,
      data: tasksWithDetails
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

    const taskData = {
      id: crypto.randomUUID(),
      title: body.title,
      description: body.description || null,
      status: body.status || 'TODO',
      priority: body.priority || 'Medium',
      dueDate: body.dueDate || null,
      estimatedHours: body.estimatedHours || 0,
      actualHours: 0,
      tags: body.tags || [],
      projectId: body.projectId,
      assignedToId: body.assignedToId || null,
      createdById: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const { data: task, error: createError } = await getSupabaseAdmin()
      .from('Task')
      .insert(taskData)
      .select()
      .single()

    if (createError) {
      console.error('Task create error:', createError)
      return NextResponse.json(
        { success: false, message: 'Failed to create task: ' + createError.message },
        { status: 500 }
      )
    }

    // Get project name for notification
    let projectName = 'Unknown Project'
    if (body.projectId) {
      const { data: project } = await getSupabaseAdmin()
        .from('Project')
        .select('name')
        .eq('id', body.projectId)
        .single()
      if (project) projectName = project.name
    }

    // Send notification to assigned user
    if (body.assignedToId && body.assignedToId !== user.id) {
      await createNotification(
        body.assignedToId,
        'TaskAssigned',
        'New Task Assigned',
        `${user.name} assigned you a new task: "${body.title}" in project "${projectName}"`,
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
      { success: false, message: 'Failed to create task' },
      { status: 500 }
    )
  }
}
