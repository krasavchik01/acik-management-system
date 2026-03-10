import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser, hasRole, MANAGER_ROLES } from '@/lib/auth'

// GET /api/sponsors
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
    const tier = searchParams.get('tier')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    let query = getSupabaseAdmin()
      .from('Sponsor')
      .select('*')
      .order('createdAt', { ascending: false })

    if (tier) query = query.eq('tier', tier)
    if (status) query = query.eq('status', status)
    if (search) query = query.or(`name.ilike.%${search}%,contactEmail.ilike.%${search}%`)

    const { data: sponsors, error: fetchError } = await query

    if (fetchError) {
      console.error('Sponsors fetch error:', fetchError)
      return NextResponse.json(
        { success: false, message: 'Failed to fetch sponsors' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      count: (sponsors || []).length,
      data: sponsors || []
    })
  } catch (error) {
    console.error('Sponsors fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch sponsors' },
      { status: 500 }
    )
  }
}

// POST /api/sponsors
export async function POST(request: NextRequest) {
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
        { success: false, message: 'Not authorized to create sponsors' },
        { status: 403 }
      )
    }

    const body = await request.json()

    if (!body.name) {
      return NextResponse.json(
        { success: false, message: 'Name is required' },
        { status: 400 }
      )
    }

    const sponsorData = {
      id: crypto.randomUUID(),
      name: body.name,
      logo: body.logo || null,
      website: body.website || null,
      description: body.description || null,
      tier: body.tier || 'Bronze',
      status: body.status || 'Active',
      contactName: body.contactName || null,
      contactEmail: body.contactEmail || null,
      contactPhone: body.contactPhone || null,
      contractStart: body.contractStart || null,
      contractEnd: body.contractEnd || null,
      totalCommitted: body.totalCommitted || 0,
      totalReceived: body.totalReceived || 0,
      notes: body.notes || null,
      updatedAt: new Date().toISOString(),
    }

    const { data: sponsor, error: createError } = await getSupabaseAdmin()
      .from('Sponsor')
      .insert(sponsorData)
      .select()
      .single()

    if (createError) {
      console.error('Sponsor create error:', createError)
      return NextResponse.json(
        { success: false, message: 'Failed to create sponsor' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, data: sponsor },
      { status: 201 }
    )
  } catch (error) {
    console.error('Sponsor create error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create sponsor' },
      { status: 500 }
    )
  }
}
