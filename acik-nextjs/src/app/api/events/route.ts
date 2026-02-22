import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser } from '@/lib/auth'

// GET /api/events
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
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const search = searchParams.get('search')

    let query = getSupabaseAdmin()
      .from('Event')
      .select('*')
      .order('startDate', { ascending: false })

    if (status) query = query.eq('status', status)
    if (type) query = query.eq('type', type)
    if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)

    const { data: events, error: fetchError } = await query

    if (fetchError) {
      console.error('Events fetch error:', fetchError)
      return NextResponse.json(
        { success: false, message: 'Failed to fetch events' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      count: (events || []).length,
      data: events || []
    })
  } catch (error) {
    console.error('Events fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

// POST /api/events
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

    if (!body.title || !body.startDate) {
      return NextResponse.json(
        { success: false, message: 'Title and start date are required' },
        { status: 400 }
      )
    }

    const eventData = {
      id: crypto.randomUUID(),
      title: body.title,
      description: body.description || '',
      type: body.type || 'Meeting',
      status: body.status || 'Planned',
      startDate: body.startDate,
      endDate: body.endDate || body.startDate,
      capacity: body.capacity || body.maxAttendees || 0,
      banner: body.banner || null,
      tags: body.tags || [],
      isPublished: body.isPublished || false,
      // Location fields
      locationVenue: body.locationVenue || body.location || 'TBD',
      locationAddress: body.locationAddress || null,
      locationCity: body.locationCity || null,
      locationState: body.locationState || null,
      locationZipCode: body.locationZipCode || null,
      locationCountry: body.locationCountry || null,
      locationIsVirtual: body.isVirtual || body.locationIsVirtual || false,
      locationVirtualLink: body.virtualLink || body.locationVirtualLink || null,
      // Pricing fields
      pricingIsFree: body.pricingIsFree !== false,
      pricingMemberPrice: body.pricingMemberPrice || null,
      pricingNonMemberPrice: body.pricingNonMemberPrice || null,
      pricingEarlyBirdPrice: body.pricingEarlyBirdPrice || null,
      pricingEarlyBirdDeadline: body.pricingEarlyBirdDeadline || null,
      // Budget fields
      budgetEstimated: body.budget || body.budgetEstimated || 0,
      budgetActual: body.budgetActual || 0,
      // Relations
      organizerId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const { data: event, error: createError } = await getSupabaseAdmin()
      .from('Event')
      .insert(eventData)
      .select()
      .single()

    if (createError) {
      console.error('Event create error:', createError)
      return NextResponse.json(
        { success: false, message: 'Failed to create event' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, data: event },
      { status: 201 }
    )
  } catch (error) {
    console.error('Event create error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create event' },
      { status: 500 }
    )
  }
}
