import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser } from '@/lib/auth'

// DELETE /api/events/[id]
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

    const { id } = await params
    const supabase = getSupabaseAdmin()

    // Delete related records first (cascade delete)
    await Promise.all([
      supabase.from('EventSpeaker').delete().eq('eventId', id),
      supabase.from('EventRegistration').delete().eq('eventId', id),
      supabase.from('EventAgendaItem').delete().eq('eventId', id),
      supabase.from('EventAttachment').delete().eq('eventId', id),
      supabase.from('EventFeedback').delete().eq('eventId', id),
      supabase.from('MemberEventAttendance').delete().eq('eventId', id),
      supabase.from('SponsorEvent').delete().eq('eventId', id),
      supabase.from('ReportEvent').delete().eq('eventId', id),
    ])

    // Set nullable foreign keys to null
    await supabase.from('Finance').update({ eventId: null }).eq('eventId', id)

    // Delete the event
    const { error: deleteError } = await supabase
      .from('Event')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Event delete error:', deleteError)
      return NextResponse.json(
        { success: false, message: 'Failed to delete event: ' + deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully'
    })
  } catch (error) {
    console.error('Event delete error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete event' },
      { status: 500 }
    )
  }
}

// GET /api/events/[id]
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

    const { data: event, error: fetchError } = await getSupabaseAdmin()
      .from('Event')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !event) {
      return NextResponse.json(
        { success: false, message: 'Event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: event })
  } catch (error) {
    console.error('Event fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch event' },
      { status: 500 }
    )
  }
}

// PUT /api/events/[id]
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

    const { id } = await params
    const body = await request.json()

    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString()
    }

    // Copy allowed fields
    const allowedFields = [
      'title', 'description', 'type', 'status', 'startDate', 'endDate',
      'capacity', 'banner', 'tags', 'isPublished',
      'locationVenue', 'locationAddress', 'locationCity', 'locationState',
      'locationZipCode', 'locationCountry', 'locationIsVirtual', 'locationVirtualLink',
      'pricingIsFree', 'pricingMemberPrice', 'pricingNonMemberPrice',
      'pricingEarlyBirdPrice', 'pricingEarlyBirdDeadline',
      'budgetEstimated', 'budgetActual', 'organizerId'
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    const { data: event, error: updateError } = await getSupabaseAdmin()
      .from('Event')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Event update error:', updateError)
      return NextResponse.json(
        { success: false, message: 'Failed to update event' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: event })
  } catch (error) {
    console.error('Event update error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update event' },
      { status: 500 }
    )
  }
}
