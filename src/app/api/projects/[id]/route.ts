import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser, hasPermission } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/projects/[id]
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

    const { data: project, error: fetchError } = await getSupabaseAdmin()
      .from('Project')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !project) {
      return NextResponse.json(
        { success: false, message: 'Project not found' },
        { status: 404 }
      )
    }

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

    // Get tasks
    const { data: tasks } = await getSupabaseAdmin()
      .from('Task')
      .select('*')
      .eq('projectId', id)
      .order('createdAt', { ascending: false })

    return NextResponse.json({
      success: true,
      data: { ...project, manager, tasks: tasks || [] }
    })
  } catch (error) {
    console.error('Project fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

// PUT /api/projects/[id]
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

    if (!hasPermission(user, 'projects.edit')) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to update projects' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()

    const updateData: Record<string, unknown> = { updatedAt: new Date().toISOString() }

    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.category !== undefined) updateData.category = body.category
    if (body.status !== undefined) updateData.status = body.status
    if (body.priority !== undefined) updateData.priority = body.priority
    if (body.startDate !== undefined) updateData.startDate = body.startDate
    if (body.endDate !== undefined) updateData.endDate = body.endDate
    if (body.progress !== undefined) updateData.progress = body.progress
    if (body.budgetAllocated !== undefined) updateData.budgetAllocated = body.budgetAllocated
    if (body.budgetSpent !== undefined) updateData.budgetSpent = body.budgetSpent
    if (body.budget?.allocated !== undefined) updateData.budgetAllocated = body.budget.allocated
    if (body.budget?.spent !== undefined) updateData.budgetSpent = body.budget.spent
    if (body.tags !== undefined) updateData.tags = body.tags

    const { data: project, error: updateError } = await getSupabaseAdmin()
      .from('Project')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { success: false, message: 'Failed to update project' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: project })
  } catch (error) {
    console.error('Project update error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update project' },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/[id]
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

    if (!hasPermission(user, 'projects.edit')) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to delete projects' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Delete related tasks first
    await getSupabaseAdmin().from('Task').delete().eq('projectId', id)

    const { error: deleteError } = await getSupabaseAdmin()
      .from('Project')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return NextResponse.json(
        { success: false, message: 'Failed to delete project' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    })
  } catch (error) {
    console.error('Project delete error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete project' },
      { status: 500 }
    )
  }
}
