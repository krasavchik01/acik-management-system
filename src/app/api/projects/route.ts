import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser, hasRole, MANAGER_ROLES } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/projects - Get all projects with filters
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
    const category = searchParams.get('category')
    const priority = searchParams.get('priority')
    const search = searchParams.get('search')

    let query = getSupabaseAdmin()
      .from('Project')
      .select('*')
      .order('createdAt', { ascending: false })

    if (status) query = query.eq('status', status)
    if (category) query = query.eq('category', category)
    if (priority) query = query.eq('priority', priority)
    if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)

    const { data: projects, error: fetchError } = await query

    if (fetchError) {
      console.error('Projects fetch error:', fetchError)
      return NextResponse.json(
        { success: false, message: 'Failed to fetch projects' },
        { status: 500 }
      )
    }

    // Batch fetch related data instead of N+1 queries
    const projectList = projects || []
    const managerIds = [...new Set(projectList.map(p => p.managerId).filter(Boolean))]
    const projectIds = projectList.map(p => p.id)

    const [managersResult, tasksResult] = await Promise.all([
      managerIds.length > 0
        ? getSupabaseAdmin().from('User').select('id, name, email, role, avatar').in('id', managerIds)
        : { data: [] },
      projectIds.length > 0
        ? getSupabaseAdmin().from('Task').select('id, projectId, status').in('projectId', projectIds)
        : { data: [] },
    ])

    const managerMap = new Map((managersResult.data || []).map(m => [m.id, m]))
    const tasksByProject = new Map<string, { total: number; completed: number }>()
    for (const task of (tasksResult.data || [])) {
      const entry = tasksByProject.get(task.projectId) || { total: 0, completed: 0 }
      entry.total++
      if (task.status === 'Done') entry.completed++
      tasksByProject.set(task.projectId, entry)
    }

    const projectsWithDetails = projectList.map(project => {
      const counts = tasksByProject.get(project.id) || { total: 0, completed: 0 }
      return {
        ...project,
        manager: project.managerId ? managerMap.get(project.managerId) || null : null,
        taskCount: counts.total,
        completedTasks: counts.completed,
      }
    })

    return NextResponse.json({
      success: true,
      count: projectsWithDetails.length,
      data: projectsWithDetails
    })
  } catch (error) {
    console.error('Projects fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

// POST /api/projects - Create new project
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getAuthUser()
    if (error || !user) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      )
    }

    if (!hasRole(user.role, MANAGER_ROLES)) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to create projects' },
        { status: 403 }
      )
    }

    const body = await request.json()

    const projectData = {
      id: crypto.randomUUID(),
      name: body.name,
      description: body.description || null,
      category: body.category || 'Other',
      status: body.status || 'Planning',
      priority: body.priority || 'Medium',
      startDate: body.startDate || new Date().toISOString(),
      endDate: body.endDate || null,
      budgetAllocated: body.budget?.allocated || body.budgetAllocated || 0,
      budgetSpent: body.budget?.spent || body.budgetSpent || 0,
      budgetRemaining: (body.budget?.allocated || body.budgetAllocated || 0) - (body.budget?.spent || body.budgetSpent || 0),
      tags: body.tags || [],
      managerId: user.id,
      updatedAt: new Date().toISOString(),
    }

    const { data: project, error: createError } = await getSupabaseAdmin()
      .from('Project')
      .insert(projectData)
      .select()
      .single()

    if (createError) {
      console.error('Project create error:', createError)
      return NextResponse.json(
        { success: false, message: 'Failed to create project', error: createError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, data: project },
      { status: 201 }
    )
  } catch (error) {
    console.error('Project create error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create project' },
      { status: 500 }
    )
  }
}
