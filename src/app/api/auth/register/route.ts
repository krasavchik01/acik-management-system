import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { supabaseId, email, name, role, department, phone } = body

    if (!supabaseId || !email || !name) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const { data: existingUser } = await getSupabaseAdmin()
      .from('User')
      .select('id')
      .or(`supabaseId.eq.${supabaseId},email.eq.${email}`)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User already exists' },
        { status: 409 }
      )
    }

    const userData = {
      id: crypto.randomUUID(),
      supabaseId,
      email,
      name,
      role: role || 'Member',
      department: department || 'Operations',
      phone: phone || null,
      isActive: true,
      isDemo: false,
      permissions: [],
      updatedAt: new Date().toISOString(),
    }

    const { data: user, error: createError } = await getSupabaseAdmin()
      .from('User')
      .insert(userData)
      .select('id, supabaseId, email, name, role, department, avatar, phone, isActive, isDemo')
      .single()

    if (createError) {
      console.error('Registration error:', createError)
      return NextResponse.json(
        { success: false, message: 'Failed to create user profile' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, profile: user },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create user profile' },
      { status: 500 }
    )
  }
}
