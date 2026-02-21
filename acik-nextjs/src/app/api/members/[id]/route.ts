import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser, hasRole, ADMIN_ROLES } from '@/lib/auth'

// GET /api/members/[id]
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

    const { data: member, error: fetchError } = await supabaseAdmin
      .from('Member')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !member) {
      return NextResponse.json(
        { success: false, message: 'Member not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: member })
  } catch (error) {
    console.error('Member fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch member' },
      { status: 500 }
    )
  }
}

// PUT /api/members/[id]
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

    const updateData: Record<string, unknown> = { updatedAt: new Date().toISOString() }

    if (body.firstName !== undefined) updateData.firstName = body.firstName
    if (body.lastName !== undefined) updateData.lastName = body.lastName
    if (body.email !== undefined) updateData.email = body.email
    if (body.phone !== undefined) updateData.phone = body.phone
    if (body.category !== undefined) updateData.category = body.category
    if (body.status !== undefined) updateData.status = body.status
    if (body.dateOfBirth !== undefined) updateData.dateOfBirth = body.dateOfBirth
    if (body.notes !== undefined) updateData.notes = body.notes
    if (body.interests !== undefined) updateData.interests = body.interests
    if (body.skills !== undefined) updateData.skills = body.skills
    if (body.companyName !== undefined) updateData.companyName = body.companyName
    if (body.companyPosition !== undefined) updateData.companyPosition = body.companyPosition

    if (body.address) {
      if (body.address.street !== undefined) updateData.addressStreet = body.address.street
      if (body.address.city !== undefined) updateData.addressCity = body.address.city
      if (body.address.state !== undefined) updateData.addressState = body.address.state
      if (body.address.zipCode !== undefined) updateData.addressZipCode = body.address.zipCode
      if (body.address.country !== undefined) updateData.addressCountry = body.address.country
    }

    if (body.company) {
      if (body.company.name !== undefined) updateData.companyName = body.company.name
      if (body.company.position !== undefined) updateData.companyPosition = body.company.position
    }

    const { data: member, error: updateError } = await supabaseAdmin
      .from('Member')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json(
        { success: false, message: 'Failed to update member' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: member })
  } catch (error) {
    console.error('Member update error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update member' },
      { status: 500 }
    )
  }
}

// DELETE /api/members/[id]
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
        { success: false, message: 'Not authorized to delete members' },
        { status: 403 }
      )
    }

    const { id } = await params

    const { error: deleteError } = await supabaseAdmin
      .from('Member')
      .delete()
      .eq('id', id)

    if (deleteError) {
      return NextResponse.json(
        { success: false, message: 'Failed to delete member' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Member deleted successfully'
    })
  } catch (error) {
    console.error('Member delete error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete member' },
      { status: 500 }
    )
  }
}
