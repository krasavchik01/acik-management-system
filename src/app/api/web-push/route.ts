import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getAuthUser()
    if (error || !user) {
      return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 })
    }

    const body = await request.json()
    const { subscription } = body

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ success: false, message: 'Invalid subscription' }, { status: 400 })
    }

    // Upsert the subscription (endpoint is unique)
    // Using Supabase admin client directly to insert/update
    const { error: upsertError } = await getSupabaseAdmin()
      .from('PushSubscription')
      .upsert({
        userId: user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys?.p256dh,
        auth: subscription.keys?.auth,
      }, { onConflict: 'endpoint' })

    if (upsertError) {
      console.error('Subscription save error:', upsertError)
      return NextResponse.json({ success: false, message: 'Failed to save subscription' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Subscription saved' })
  } catch (error) {
    console.error('Subscription API error:', error)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
