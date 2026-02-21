import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser, hasRole, ADMIN_ROLES } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'

// GET /api/admin/users
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const role = searchParams.get('role')
    const department = searchParams.get('department')
    const demoOnly = searchParams.get('demoOnly')

    let query = supabaseAdmin
      .from('User')
      .select('id, supabaseId, email, name, role, department, avatar, phone, isActive, isDemo, permissions, lastLogin, createdAt')
      .order('createdAt', { ascending: false })

    if (role) query = query.eq('role', role)
    if (department) query = query.eq('department', department)
    if (demoOnly === 'true') query = query.eq('isDemo', true)
    if (search) query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)

    const { data: users, error: fetchError } = await query

    if (fetchError) {
      console.error('Admin users fetch error:', fetchError)
      return NextResponse.json(
        { success: false, message: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      count: (users || []).length,
      data: users || []
    })
  } catch (error) {
    console.error('Admin users fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// POST /api/admin/users - Create new user (including demo)
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { email, password, name, role, department, isDemo, permissions } = body

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, message: 'Email, password and name are required' },
        { status: 400 }
      )
    }

    // Create auth user in Supabase
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

    const { data: authData, error: authError } = await supabaseAuthAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name }
    })

    if (authError) {
      console.error('Auth user creation error:', authError)
      return NextResponse.json(
        { success: false, message: authError.message || 'Failed to create auth user' },
        { status: 400 }
      )
    }

    // Create user in our database
    const { data: newUser, error: dbError } = await supabaseAdmin
      .from('User')
      .insert({
        supabaseId: authData.user.id,
        email,
        name,
        role: role || 'Member',
        department: department || 'Operations',
        isDemo: isDemo || false,
        isActive: true,
        permissions: permissions || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .select()
      .single()

    if (dbError) {
      // Rollback: delete auth user if db creation fails
      await supabaseAuthAdmin.auth.admin.deleteUser(authData.user.id)
      console.error('DB user creation error:', dbError)
      return NextResponse.json(
        { success: false, message: 'Failed to create user in database' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      data: newUser
    })
  } catch (error) {
    console.error('Admin user create error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create user' },
      { status: 500 }
    )
  }
}
