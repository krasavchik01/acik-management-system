import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser, hasRole, ADMIN_ROLES } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

// PUT /api/admin/users/[id]
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

    if (!hasRole(user.role, ADMIN_ROLES)) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()

    // Get current user data
    const { data: targetUser } = await getSupabaseAdmin()
      .from('User')
      .select('supabaseId, email, isDemo')
      .eq('id', id)
      .single()

    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date().toISOString() }

    if (body.name !== undefined) updateData.name = body.name
    if (body.role !== undefined) updateData.role = body.role
    if (body.department !== undefined) updateData.department = body.department
    if (body.phone !== undefined) updateData.phone = body.phone
    if (body.isActive !== undefined) updateData.isActive = body.isActive
    if (body.isDemo !== undefined) updateData.isDemo = body.isDemo
    if (body.permissions !== undefined) updateData.permissions = body.permissions

    // Handle password change
    if (body.password) {
      const supabaseAuthAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )

      const { error: passwordError } = await supabaseAuthAdmin.auth.admin.updateUserById(
        targetUser.supabaseId,
        { password: body.password }
      )

      if (passwordError) {
        console.error('Password update error:', passwordError)
        return NextResponse.json(
          { success: false, message: 'Failed to update password' },
          { status: 500 }
        )
      }
    }

    const { data: updatedUser, error: updateError } = await getSupabaseAdmin()
      .from('User')
      .update(updateData)
      .eq('id', id)
      .select('id, supabaseId, email, name, role, department, avatar, phone, isActive, isDemo, permissions')
      .single()

    if (updateError) {
      return NextResponse.json(
        { success: false, message: 'Failed to update user' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: updatedUser })
  } catch (error) {
    console.error('Admin user update error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/users/[id]
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

    if (!hasRole(user.role, ['Admin'])) {
      return NextResponse.json(
        { success: false, message: 'Only Admin can delete users' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Get user data
    const { data: targetUser } = await getSupabaseAdmin()
      .from('User')
      .select('supabaseId, isDemo, email')
      .eq('id', id)
      .single()

    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent self-deletion
    if (id === user.id) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete yourself' },
        { status: 403 }
      )
    }

    const supabase = getSupabaseAdmin()

    // Clear related records before deleting user
    // Set nullable foreign keys to null
    await Promise.all([
      supabase.from('Task').update({ assignedToId: null }).eq('assignedToId', id),
      supabase.from('Attendance').update({ verifiedById: null }).eq('verifiedById', id),
      supabase.from('Attendance').update({ overtimeApprovedById: null }).eq('overtimeApprovedById', id),
      supabase.from('Finance').update({ approvedById: null }).eq('approvedById', id),
      supabase.from('Sponsor').update({ managedById: null }).eq('managedById', id),
      supabase.from('Report').update({ approvedById: null }).eq('approvedById', id),
    ])

    // Delete records where the user is required (non-nullable)
    await Promise.all([
      supabase.from('ProjectNote').delete().eq('authorId', id),
      supabase.from('TaskComment').delete().eq('authorId', id),
      supabase.from('ReportReviewer').delete().eq('userId', id),
      supabase.from('Notification').delete().eq('userId', id),
      supabase.from('ProjectTeamMember').delete().eq('userId', id),
    ])

    // Check if user has records that would block deletion
    const [
      { data: managedProjects },
      { data: createdTasks },
      { data: organizedEvents },
      { data: attendance },
      { data: recordedFinance },
      { data: createdReports },
    ] = await Promise.all([
      supabase.from('Project').select('id').eq('managerId', id).limit(1),
      supabase.from('Task').select('id').eq('createdById', id).limit(1),
      supabase.from('Event').select('id').eq('organizerId', id).limit(1),
      supabase.from('Attendance').select('id').eq('userId', id).limit(1),
      supabase.from('Finance').select('id').eq('recordedById', id).limit(1),
      supabase.from('Report').select('id').eq('createdById', id).limit(1),
    ])

    const hasBlockingRecords =
      (managedProjects && managedProjects.length > 0) ||
      (createdTasks && createdTasks.length > 0) ||
      (organizedEvents && organizedEvents.length > 0) ||
      (attendance && attendance.length > 0) ||
      (recordedFinance && recordedFinance.length > 0) ||
      (createdReports && createdReports.length > 0)

    if (hasBlockingRecords) {
      // Build a message indicating what records exist
      const blockingItems = []
      if (managedProjects?.length) blockingItems.push('projects (as manager)')
      if (createdTasks?.length) blockingItems.push('tasks (as creator)')
      if (organizedEvents?.length) blockingItems.push('events (as organizer)')
      if (attendance?.length) blockingItems.push('attendance records')
      if (recordedFinance?.length) blockingItems.push('finance records')
      if (createdReports?.length) blockingItems.push('reports')

      return NextResponse.json(
        {
          success: false,
          message: `Cannot delete user. User has associated: ${blockingItems.join(', ')}. Please reassign or delete these records first.`
        },
        { status: 400 }
      )
    }

    // Delete from our database
    const { error: deleteError } = await supabase
      .from('User')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Delete user error:', deleteError)
      return NextResponse.json(
        { success: false, message: 'Failed to delete user: ' + deleteError.message },
        { status: 500 }
      )
    }

    // Delete from Supabase Auth
    const supabaseAuthAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    await supabaseAuthAdmin.auth.admin.deleteUser(targetUser.supabaseId)

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Admin user delete error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
