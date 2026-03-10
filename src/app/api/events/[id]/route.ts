import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser, hasRole, MANAGER_ROLES, ADMIN_ROLES } from '@/lib/auth'

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

    if (!hasRole(user.role, MANAGER_ROLES)) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to update events' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()

    const updateData: Record<string, unknown> = { updatedAt: new Date().toISOString() }

    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.type !== undefined) updateData.type = body.type
    if (body.status !== undefined) updateData.status = body.status
    if (body.startDate !== undefined) updateData.startDate = body.startDate
    if (body.endDate !== undefined) updateData.endDate = body.endDate
    if (body.capacity !== undefined) updateData.capacity = body.capacity
    if (body.maxAttendees !== undefined) updateData.capacity = body.maxAttendees
    if (body.banner !== undefined) updateData.banner = body.banner
    if (body.tags !== undefined) updateData.tags = body.tags
    if (body.isPublished !== undefined) updateData.isPublished = body.isPublished
    // Location fields
    if (body.location !== undefined) updateData.locationVenue = body.location
    if (body.locationVenue !== undefined) updateData.locationVenue = body.locationVenue
    if (body.locationAddress !== undefined) updateData.locationAddress = body.locationAddress
    if (body.locationCity !== undefined) updateData.locationCity = body.locationCity
    if (body.locationState !== undefined) updateData.locationState = body.locationState
    if (body.locationZipCode !== undefined) updateData.locationZipCode = body.locationZipCode
    if (body.locationCountry !== undefined) updateData.locationCountry = body.locationCountry
    if (body.isVirtual !== undefined) updateData.locationIsVirtual = body.isVirtual
    if (body.locationIsVirtual !== undefined) updateData.locationIsVirtual = body.locationIsVirtual
    if (body.virtualLink !== undefined) updateData.locationVirtualLink = body.virtualLink
    if (body.locationVirtualLink !== undefined) updateData.locationVirtualLink = body.locationVirtualLink
    // Pricing fields
    if (body.pricingIsFree !== undefined) updateData.pricingIsFree = body.pricingIsFree
    if (body.pricingMemberPrice !== undefined) updateData.pricingMemberPrice = body.pricingMemberPrice
    if (body.pricingNonMemberPrice !== undefined) updateData.pricingNonMemberPrice = body.pricingNonMemberPrice
    if (body.pricingEarlyBirdPrice !== undefined) updateData.pricingEarlyBirdPrice = body.pricingEarlyBirdPrice
    if (body.pricingEarlyBirdDeadline !== undefined) updateData.pricingEarlyBirdDeadline = body.pricingEarlyBirdDeadline
    // Budget fields
    if (body.budget !== undefined) updateData.budgetEstimated = body.budget
    if (body.budgetEstimated !== undefined) updateData.budgetEstimated = body.budgetEstimated
    if (body.budgetActual !== undefined) updateData.budgetActual = body.budgetActual

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

    if (!hasRole(user.role, ADMIN_ROLES)) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to delete events' },
        { status: 403 }
      )
    }

    const { id } = await params

    const { error: deleteError } = await getSupabaseAdmin()
      .from('Event')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Event delete error:', deleteError)
      return NextResponse.json(
        { success: false, message: 'Failed to delete event' },
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
