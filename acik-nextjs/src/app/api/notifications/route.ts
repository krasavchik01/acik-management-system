import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser } from '@/lib/auth'

// GET /api/notifications - Get user notifications
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
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = supabaseAdmin
      .from('Notification')
      .select('*')
      .eq('userId', user.id)
      .order('createdAt', { ascending: false })
      .limit(limit)

    if (unreadOnly) {
      query = query.eq('isRead', false)
    }

    const { data: notifications, error: fetchError } = await query

    if (fetchError) {
      console.error('Notifications fetch error:', fetchError)
      return NextResponse.json(
        { success: false, message: 'Failed to fetch notifications' },
        { status: 500 }
      )
    }

    // Get unread count
    const { count } = await supabaseAdmin
      .from('Notification')
      .select('*', { count: 'exact', head: true })
      .eq('userId', user.id)
      .eq('isRead', false)

    return NextResponse.json({
      success: true,
      unreadCount: count || 0,
      data: notifications || []
    })
  } catch (error) {
    console.error('Notifications fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

// POST /api/notifications - Create notification (internal use)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, type, title, message, link, metadata } = body

    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { success: false, message: 'userId, type, title and message are required' },
        { status: 400 }
      )
    }

    const notificationData = {
      id: crypto.randomUUID(),
      userId,
      type,
      title,
      message,
      link: link || null,
      metadata: metadata || null,
      isRead: false,
      createdAt: new Date().toISOString(),
    }

    const { data: notification, error: createError } = await supabaseAdmin
      .from('Notification')
      .insert(notificationData)
      .select()
      .single()

    if (createError) {
      console.error('Notification create error:', createError)
      return NextResponse.json(
        { success: false, message: 'Failed to create notification' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, data: notification },
      { status: 201 }
    )
  } catch (error) {
    console.error('Notification create error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create notification' },
      { status: 500 }
    )
  }
}

// PATCH /api/notifications - Mark notifications as read
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
    const { notificationIds, markAllRead } = body

    if (markAllRead) {
      // Mark all user notifications as read
      const { error: updateError } = await supabaseAdmin
        .from('Notification')
        .update({ isRead: true })
        .eq('userId', user.id)
        .eq('isRead', false)

      if (updateError) {
        console.error('Notifications update error:', updateError)
        return NextResponse.json(
          { success: false, message: 'Failed to update notifications' },
          { status: 500 }
        )
      }
    } else if (notificationIds && notificationIds.length > 0) {
      // Mark specific notifications as read
      const { error: updateError } = await supabaseAdmin
        .from('Notification')
        .update({ isRead: true })
        .eq('userId', user.id)
        .in('id', notificationIds)

      if (updateError) {
        console.error('Notifications update error:', updateError)
        return NextResponse.json(
          { success: false, message: 'Failed to update notifications' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Notifications marked as read'
    })
  } catch (error) {
    console.error('Notifications update error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update notifications' },
      { status: 500 }
    )
  }
}
