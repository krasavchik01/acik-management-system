import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET /api/members
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
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    let query = getSupabaseAdmin()
      .from('Member')
      .select('*')
      .order('lastName', { ascending: true })

    if (status) query = query.eq('status', status)
    if (category) query = query.eq('category', category)
    if (search) query = query.or(`firstName.ilike.%${search}%,lastName.ilike.%${search}%,email.ilike.%${search}%`)

    const { data: members, error: fetchError } = await query

    if (fetchError) {
      console.error('Members fetch error:', fetchError)
      return NextResponse.json(
        { success: false, message: 'Failed to fetch members' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      count: (members || []).length,
      data: members || []
    })
  } catch (error) {
    console.error('Members fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch members' },
      { status: 500 }
    )
  }
}

// POST /api/members
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

    if (!body.firstName || !body.lastName || !body.email) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const memberData = {
      id: crypto.randomUUID(),
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone || null,
      category: body.category || 'Bronze',
      status: body.status || 'Active',
      joinDate: body.joinDate || new Date().toISOString().split('T')[0],
      dateOfBirth: body.dateOfBirth || null,
      notes: body.notes || null,
      interests: body.interests || [],
      skills: body.skills || [],
      addressStreet: body.address?.street || null,
      addressCity: body.address?.city || null,
      addressState: body.address?.state || null,
      addressZipCode: body.address?.zipCode || null,
      addressCountry: body.address?.country || 'Kazakhstan',
      companyName: body.company?.name || body.companyName || null,
      companyPosition: body.company?.position || body.companyPosition || null,
      updatedAt: new Date().toISOString(),
    }

    const { data: member, error: createError } = await getSupabaseAdmin()
      .from('Member')
      .insert(memberData)
      .select()
      .single()

    if (createError) {
      console.error('Member create error:', createError)
      return NextResponse.json(
        { success: false, message: 'Failed to create member' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, data: member },
      { status: 201 }
    )
  } catch (error) {
    console.error('Member create error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create member' },
      { status: 500 }
    )
  }
}
