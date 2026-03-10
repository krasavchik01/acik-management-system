import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const supabaseId = searchParams.get('supabaseId')

    if (!supabaseId) {
      return NextResponse.json(
        { success: false, message: 'Missing supabaseId' },
        { status: 400 }
      )
    }

    const { data: user, error } = await getSupabaseAdmin()
      .from('User')
      .select('id, supabaseId, email, name, role, department, avatar, phone, isActive, isDemo, permissions')
      .eq('supabaseId', supabaseId)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, profile: user })
  } catch (error) {
    const err = error as Error
    console.error('Profile fetch error:', err.message)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch profile', error: err.message },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { supabaseId, name, phone, avatar, department } = body

    if (!supabaseId) {
      return NextResponse.json(
        { success: false, message: 'Missing supabaseId' },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date().toISOString() }
    if (name) updateData.name = name
    if (phone !== undefined) updateData.phone = phone
    if (avatar !== undefined) updateData.avatar = avatar
    if (department) updateData.department = department

    const { data: user, error } = await getSupabaseAdmin()
      .from('User')
      .update(updateData)
      .eq('supabaseId', supabaseId)
      .select('id, supabaseId, email, name, role, department, avatar, phone, isActive, isDemo, permissions')
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, message: 'Failed to update profile', error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, profile: user })
  } catch (error) {
    const err = error as Error
    console.error('Profile update error:', err.message)
    return NextResponse.json(
      { success: false, message: 'Failed to update profile', error: err.message },
      { status: 500 }
    )
  }
}
