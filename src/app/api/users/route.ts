import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser } from '@/lib/auth'

// GET /api/users - Get all users (for dropdowns/assignments)
export async function GET() {
  try {
    const { user, error } = await getAuthUser()
    if (error || !user) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      )
    }

    const { data: users, error: fetchError } = await getSupabaseAdmin()
      .from('User')
      .select('id, name, email, role, avatar')
      .eq('isActive', true)
      .order('name', { ascending: true })

    if (fetchError) {
      console.error('Users fetch error:', fetchError)
      return NextResponse.json(
        { success: false, message: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: users || []
    })
  } catch (error) {
    console.error('Users fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
