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
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
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
    } else if (startDate && endDate) {
      // Date range query
      query = query.gte('date', startDate + 'T00:00:00').lte('date', endDate + 'T23:59:59')
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

        // Map database fields to expected frontend fields
        return {
          id: record.id,
          userId: record.userId,
          date: record.date?.split('T')[0] || record.date,
          checkIn: record.checkInTime,
          checkOut: record.checkOutTime,
          hoursWorked: record.hoursWorked,
          status: record.status,
          location: record.checkInLat && record.checkInLng
            ? `${record.checkInLat},${record.checkInLng}`
            : record.checkInAddress,
          notes: record.notes,
          user: userInfo
        }
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

    // Parse location if provided
    let lat = null
    let lng = null
    if (body.location) {
      const parts = body.location.split(',')
      if (parts.length === 2) {
        lat = parseFloat(parts[0])
        lng = parseFloat(parts[1])
      }
    }

    const attendanceData = {
      id: crypto.randomUUID(),
      userId: user.id,
      date: now.toISOString(),
      checkInTime: now.toISOString(),
      checkInMethod: body.method || 'Manual',
      checkInAddress: body.locationAddress || null,
      checkInLat: lat,
      checkInLng: lng,
      status: 'Working',
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

    // Return in expected format
    return NextResponse.json(
      {
        success: true,
        message: 'Checked in successfully',
        data: {
          id: attendance.id,
          userId: attendance.userId,
          date: attendance.date?.split('T')[0],
          checkIn: attendance.checkInTime,
          checkOut: attendance.checkOutTime,
          hoursWorked: attendance.hoursWorked,
          status: attendance.status,
          location: lat && lng ? `${lat},${lng}` : attendance.checkInAddress,
          notes: attendance.notes
        }
      },
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

    // Find today's attendance record or specific record by id
    let existing = null

    if (body.id) {
      const { data, error: findError } = await supabaseAdmin
        .from('Attendance')
        .select('*')
        .eq('id', body.id)
        .eq('userId', user.id)
        .single()

      if (!findError && data) {
        existing = data
      }
    } else {
      const { data, error: findError } = await supabaseAdmin
        .from('Attendance')
        .select('*')
        .eq('userId', user.id)
        .gte('date', todayDate + 'T00:00:00')
        .lte('date', todayDate + 'T23:59:59')
        .is('checkOutTime', null)
        .single()

      if (!findError && data) {
        existing = data
      }
    }

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'No active check-in found' },
        { status: 400 }
      )
    }

    if (existing.checkOutTime) {
      return NextResponse.json(
        { success: false, message: 'Already checked out' },
        { status: 400 }
      )
    }

    // Calculate hours worked
    const checkInTime = new Date(existing.checkInTime)
    const hoursWorked = (now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60)

    // Parse checkout location if provided
    let lat = null
    let lng = null
    if (body.checkOutLocation) {
      const parts = body.checkOutLocation.split(',')
      if (parts.length === 2) {
        lat = parseFloat(parts[0])
        lng = parseFloat(parts[1])
      }
    }

    const { data: attendance, error: updateError } = await supabaseAdmin
      .from('Attendance')
      .update({
        checkOutTime: now.toISOString(),
        checkOutMethod: body.method || 'Manual',
        checkOutAddress: body.checkOutAddress || null,
        checkOutLat: lat,
        checkOutLng: lng,
        hoursWorked: Math.round(hoursWorked * 100) / 100,
        status: 'Present',
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
      data: {
        id: attendance.id,
        userId: attendance.userId,
        date: attendance.date?.split('T')[0],
        checkIn: attendance.checkInTime,
        checkOut: attendance.checkOutTime,
        hoursWorked: attendance.hoursWorked,
        status: attendance.status,
        location: existing.checkInLat && existing.checkInLng
          ? `${existing.checkInLat},${existing.checkInLng}`
          : existing.checkInAddress,
        notes: attendance.notes
      }
    })
  } catch (error) {
    console.error('Attendance update error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to check out' },
      { status: 500 }
    )
  }
}
