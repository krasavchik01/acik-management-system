import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  try {
    const { user, error } = await getAuthUser()
    if (error || !user) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      )
    }

    // Get tasks assigned to or created by user
    const { data: tasks, error: fetchError } = await getSupabaseAdmin()
      .from('Task')
      .select('*')
      .or(`assignedToId.eq.${user.id},createdById.eq.${user.id}`)
      .order('createdAt', { ascending: false })

    if (fetchError) {
      console.error('My tasks fetch error:', fetchError)
      return NextResponse.json(
        { success: false, message: 'Failed to fetch tasks' },
        { status: 500 }
      )
    }

    // Get related data
    const tasksWithDetails = await Promise.all(
      (tasks || []).map(async (task) => {
        let project = null
        let assignedTo = null
        let createdBy = null

        if (task.projectId) {
          const { data } = await getSupabaseAdmin()
            .from('Project')
            .select('id, name')
            .eq('id', task.projectId)
            .single()
          project = data
        }

        if (task.assignedToId) {
          const { data } = await getSupabaseAdmin()
            .from('User')
            .select('id, name, avatar')
            .eq('id', task.assignedToId)
            .single()
          assignedTo = data
        }

        if (task.createdById) {
          const { data } = await getSupabaseAdmin()
            .from('User')
            .select('id, name')
            .eq('id', task.createdById)
            .single()
          createdBy = data
        }

        return { ...task, project, assignedTo, createdBy }
      })
    )

    return NextResponse.json({
      success: true,
      count: tasksWithDetails.length,
      data: tasksWithDetails
    })
  } catch (error) {
    console.error('My tasks fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}
