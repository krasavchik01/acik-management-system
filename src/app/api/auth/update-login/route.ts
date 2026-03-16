import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { supabaseId } = body

    if (!supabaseId) {
      return NextResponse.json(
        { success: false, message: 'Missing supabaseId' },
        { status: 400 }
      )
    }

    await getSupabaseAdmin()
      .from('User')
      .update({ lastLogin: new Date().toISOString() })
      .eq('supabaseId', supabaseId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update login error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update login time' },
      { status: 500 }
    )
  }
}
