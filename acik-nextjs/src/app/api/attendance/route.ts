import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser } from '@/lib/auth'

// GET /api/attendance
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
    const date = searchParams.get('date')
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const today = searchParams.get('today') === 'true'
    const myToday = searchParams.get('myToday') === 'true'

    let query = supabaseAdmin
      .from('Attendance')
      .select('*')
      .order('date', { ascending: false })

    if (myToday) {
      // Get current user's today record
      const todayDate = new Date().toISOString().split('T')[0]
      query = query
        .eq('userId', user.id)
        .gte('date', todayDate + 'T00:00:00')
        .lte('date', todayDate + 'T23:59:59')
    } else if (today) {
      const todayDate = new Date().toISOString().split('T')[0]
      query = query.gte('date', todayDate + 'T00:00:00').lte('date', todayDate + 'T23:59:59')
    } else if (date) {
      query = query.gte('date', date + 'T00:00:00').lte('date', date + 'T23:59:59')
    }

    if (userId) query = query.eq('userId', userId)
    if (status) query = query.eq('status', status)

    const { data: attendance, error: fetchError } = await query

    if (fetchError) {
      console.error('Attendance fetch error:', fetchError)
      return NextResponse.json(
        { success: false, message: 'Failed to fetch attendance' },
        { status: 500 }
      )
    }

    // Get user details
    const attendanceWithUsers = await Promise.all(
      (attendance || []).map(async (record) => {
        let userInfo = null
        if (record.userId) {
          const { data } = await supabaseAdmin
            .from('User')
            .select('id, name, email, avatar, role, department')
            .eq('id', record.userId)
            .single()
          userInfo = data
        }
        return { ...record, user: userInfo }
      })
    )

    return NextResponse.json({
      success: true,
      count: attendanceWithUsers.length,
      data: attendanceWithUsers
    })
  } catch (error) {
    console.error('Attendance fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch attendance' },
      { status: 500 }
    )
  }
}

// POST /api/attendance - Check in
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
    const now = new Date()
    const todayDate = now.toISOString().split('T')[0]

    // Check if already checked in today
    const { data: existing } = await supabaseAdmin
      .from('Attendance')
      .select('id, checkOutTime')
      .eq('userId', user.id)
      .gte('date', todayDate + 'T00:00:00')
      .lte('date', todayDate + 'T23:59:59')
      .single()

    if (existing && !existing.checkOutTime) {
      return NextResponse.json(
        { success: false, message: 'Already checked in today. Please check out first.' },
        { status: 400 }
      )
    }

    if (existing && existing.checkOutTime) {
      return NextResponse.json(
        { success: false, message: 'Already completed attendance for today.' },
        { status: 400 }
      )
    }

    const attendanceData = {
      id: crypto.randomUUID(),
      userId: user.id,
      date: now.toISOString(),
      checkInTime: now.toISOString(),
      checkInMethod: body.method || 'Manual',
      checkInAddress: body.address || null,
      checkInLat: body.lat || null,
      checkInLng: body.lng || null,
      status: 'Present',
      workType: body.workType || 'Office',
      notes: body.notes || null,
      projectId: body.projectId || null,
      hoursWorked: 0,
      overtimeHours: 0,
      overtimeApproved: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    }

    const { data: attendance, error: createError } = await supabaseAdmin
      .from('Attendance')
      .insert(attendanceData)
      .select()
      .single()

    if (createError) {
      console.error('Attendance create error:', createError)
      return NextResponse.json(
        { success: false, message: 'Failed to check in: ' + createError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Checked in successfully', data: attendance },
      { status: 201 }
    )
  } catch (error) {
    console.error('Attendance create error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to check in' },
      { status: 500 }
    )
  }
}

// PATCH /api/attendance - Check out
export async function PATCH(request: NextRequest) {
  try {
    const { user, error } = await getAuthUser()
    if (error || !user) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const now = new Date()
    const todayDate = now.toISOString().split('T')[0]

    // Find today's attendance record
    const { data: existing, error: findError } = await supabaseAdmin
      .from('Attendance')
      .select('*')
      .eq('userId', user.id)
      .gte('date', todayDate + 'T00:00:00')
      .lte('date', todayDate + 'T23:59:59')
      .is('checkOutTime', null)
      .single()

    if (findError || !existing) {
      return NextResponse.json(
        { success: false, message: 'No active check-in found for today' },
        { status: 400 }
      )
    }

    // Calculate hours worked
    const checkInTime = new Date(existing.checkInTime)
    const hoursWorked = (now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)

    const { data: attendance, error: updateError } = await supabaseAdmin
      .from('Attendance')
      .update({
        checkOutTime: now.toISOString(),
        checkOutMethod: body.method || 'Manual',
        checkOutAddress: body.address || null,
        checkOutLat: body.lat || null,
        checkOutLng: body.lng || null,
        hoursWorked: Math.round(hoursWorked * 100) / 100,
        notes: body.notes || existing.notes,
        mood: body.mood || null,
        productivity: body.productivity || null,
        updatedAt: now.toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single()

    if (updateError) {
      console.error('Attendance update error:', updateError)
      return NextResponse.json(
        { success: false, message: 'Failed to check out: ' + updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Checked out successfully. Worked ${hoursWorked.toFixed(2)} hours.`,
      data: attendance
    })
  } catch (error) {
    console.error('Attendance update error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to check out' },
      { status: 500 }
    )
  }
}
