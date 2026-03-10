import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

// GET /api/demo-accounts - получение демо аккаунтов для страницы входа
export async function GET() {
  try {
    const { data: demoUsers, error } = await getSupabaseAdmin()
      .from('User')
      .select('id, name, email, role')
      .eq('isDemo', true)
      .eq('isActive', true)
      .order('role', { ascending: true })

    if (error) {
      console.error('Error fetching demo accounts:', error)
      return NextResponse.json({ success: true, data: [] })
    }

    // Возвращаем демо аккаунты с паролем Demo123!
    const accounts = (demoUsers || []).map(user => ({
      label: user.role === 'ProjectManager' ? 'PM' : user.role,
      email: user.email,
      password: 'Demo123!',
      name: user.name
    }))

    return NextResponse.json({ success: true, data: accounts })
  } catch (error) {
    console.error('Error fetching demo accounts:', error)
    return NextResponse.json({ success: true, data: [] })
  }
}
