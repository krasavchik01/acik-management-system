import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, hasRole, ADMIN_ROLES } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// PUT /api/admin/users/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user: authUser, error } = await getAuthUser()
    if (error || !authUser) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      )
    }

    if (!hasRole(authUser.role, ADMIN_ROLES)) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()

    // Get current user data using Prisma
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { supabaseId: true, email: true, isDemo: true }
    })

    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (body.name !== undefined && body.name.trim()) updateData.name = body.name.trim()
    if (body.role !== undefined) updateData.role = body.role
    if (body.department !== undefined) updateData.department = body.department
    if (body.phone !== undefined) updateData.phone = body.phone
    if (body.isActive !== undefined) updateData.isActive = body.isActive
    if (body.isDemo !== undefined) updateData.isDemo = body.isDemo
    if (body.permissions !== undefined) updateData.permissions = body.permissions

    // Handle password change in Supabase Auth
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

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        supabaseId: true,
        email: true,
        name: true,
        role: true,
        department: true,
        avatar: true,
        phone: true,
        isActive: true,
        isDemo: true,
        permissions: true
      }
    })

    return NextResponse.json({ success: true, data: updatedUser })
  } catch (error) {
    console.error('Admin user update error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update user: ' + (error as Error).message },
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
    const { user: authUser, error } = await getAuthUser()
    if (error || !authUser) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      )
    }

    if (!hasRole(authUser.role, ['Admin'])) {
      return NextResponse.json(
        { success: false, message: 'Only Admin can delete users' },
        { status: 403 }
      )
    }

    const { id } = await params

    // Get user data
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { supabaseId: true, isDemo: true, email: true }
    })

    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent self-deletion
    if (id === authUser.id) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete yourself' },
        { status: 403 }
      )
    }

    // Check for blocking records using Prisma
    const managedProjects = await prisma.project.count({ where: { managerId: id } })
    const createdTasks = await prisma.task.count({ where: { createdById: id } })
    const organizedEvents = await prisma.event.count({ where: { organizerId: id } })
    const attendanceRecords = await prisma.attendance.count({ where: { userId: id } })
    const recordedFinance = await prisma.finance.count({ where: { recordedById: id } })
    const createdReports = await prisma.report.count({ where: { createdById: id } })

    const hasBlockingRecords = managedProjects > 0 || createdTasks > 0 || organizedEvents > 0 || 
                               attendanceRecords > 0 || recordedFinance > 0 || createdReports > 0

    if (hasBlockingRecords) {
      const blockingItems = []
      if (managedProjects > 0) blockingItems.push('projects (as manager)')
      if (createdTasks > 0) blockingItems.push('tasks (as creator)')
      if (organizedEvents > 0) blockingItems.push('events (as organizer)')
      if (attendanceRecords > 0) blockingItems.push('attendance records')
      if (recordedFinance > 0) blockingItems.push('finance records')
      if (createdReports > 0) blockingItems.push('reports')

      return NextResponse.json(
        {
          success: false,
          message: `Cannot delete user. User has associated: ${blockingItems.join(', ')}. Please reassign or delete these records first.`
        },
        { status: 400 }
      )
    }

    // Clear nullable references using Prisma
    await Promise.all([
      prisma.task.updateMany({ where: { assignedToId: id }, data: { assignedToId: null } }),
      prisma.attendance.updateMany({ where: { verifiedById: id }, data: { verifiedById: null } }),
      prisma.attendance.updateMany({ where: { overtimeApprovedById: id }, data: { overtimeApprovedById: null } }),
      prisma.finance.updateMany({ where: { approvedById: id }, data: { approvedById: null } }),
      prisma.sponsor.updateMany({ where: { managedById: id }, data: { managedById: null } }),
      prisma.report.updateMany({ where: { approvedById: id }, data: { approvedById: null } }),
    ])

    // Delete from our database
    await prisma.user.delete({ where: { id } })

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
      { success: false, message: 'Failed to delete user: ' + (error as Error).message },
      { status: 500 }
    )
  }
}
