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

    // Delete from our database first
    const { error: deleteError } = await getSupabaseAdmin()
      .from('User')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return NextResponse.json(
        { success: false, message: 'Failed to delete user' },
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
