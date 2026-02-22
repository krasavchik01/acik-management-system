import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser, hasRole, MANAGER_ROLES } from '@/lib/auth'

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

    // Get manager info and task counts for each project
    const projectsWithDetails = await Promise.all(
      (projects || []).map(async (project) => {
        // Get manager info
        let manager = null
        if (project.managerId) {
          const { data: managerData } = await getSupabaseAdmin()
            .from('User')
            .select('id, name, email, role, avatar')
            .eq('id', project.managerId)
            .single()
          manager = managerData
        }

        // Get task counts
        const { count: taskCount } = await getSupabaseAdmin()
          .from('Task')
          .select('*', { count: 'exact', head: true })
          .eq('projectId', project.id)

        const { count: completedTasks } = await getSupabaseAdmin()
          .from('Task')
          .select('*', { count: 'exact', head: true })
          .eq('projectId', project.id)
          .eq('status', 'Done')

        return {
          ...project,
          manager,
          taskCount: taskCount || 0,
          completedTasks: completedTasks || 0,
        }
      })
    )

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
