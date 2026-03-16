import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, hasRole, ADMIN_ROLES } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// GET /api/admin/users
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const role = searchParams.get('role')
    const department = searchParams.get('department')
    const demoOnly = searchParams.get('demoOnly')

    // Get today's start and end for attendance
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const where: any = {}
    if (role && role !== 'all') where.role = role
    if (department && department !== 'all') where.department = department
    if (demoOnly === 'true') where.isDemo = true
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        supabaseId: true,
        email: true,
        name: true,
        role: true,
        department: true,
        avatar: true,
        isActive: true,
        isDemo: true,
        permissions: true,
        lastLogin: true,
        createdAt: true,
        _count: {
          select: {
            assignedTasks: {
              where: {
                status: { notIn: ['Done', 'Review'] }
              }
            },
            managedProjects: {
              where: {
                status: 'Active'
              }
            }
          }
        },
        attendance: {
          where: {
            date: {
              gte: today,
              lt: tomorrow
            }
          },
          select: {
            workType: true,
            status: true,
          },
          orderBy: { date: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const formattedUsers = users.map(user => ({
      ...user,
      activeTasks: user._count.assignedTasks,
      activeProjects: user._count.managedProjects,
      location: user.attendance.length > 0 ? user.attendance[0].workType : 'Unknown',
      attendanceStatus: user.attendance.length > 0 ? user.attendance[0].status : 'Absent'
    }))

    return NextResponse.json({
      success: true,
      count: formattedUsers.length,
      data: formattedUsers
    })
  } catch (error) {
    console.error('Admin users fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users: ' + (error as Error).message },
      { status: 500 }
    )
  }
}

// POST /api/admin/users - Create new user
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
        { success: false, message: `Ошибка аутентификации: ${authError.message}` },
        { status: 400 }
      )
    }

    // Create user in our database using Prisma for consistency with GET
    try {
      const newUser = await prisma.user.create({
        data: {
          supabaseId: authData.user.id,
          email,
          name,
          role: (role || 'Member') as any,
          department: (department || 'Operations') as any,
          isDemo: isDemo || false,
          isActive: true,
          permissions: permissions || []
        }
      })

      return NextResponse.json({
        success: true,
        message: 'User created successfully',
        data: newUser
      })
    } catch (dbError) {
      // Rollback: delete auth user if db creation fails
      await supabaseAuthAdmin.auth.admin.deleteUser(authData.user.id)
      console.error('DB user creation error:', dbError)
      return NextResponse.json(
        { success: false, message: `Failed to create user in database: ${(dbError as Error).message}` },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Admin user create error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create user' },
      { status: 500 }
    )
  }
}
