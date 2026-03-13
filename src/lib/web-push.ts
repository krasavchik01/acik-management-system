import webpush from 'web-push'
import { getSupabaseAdmin } from './supabase/admin'

export async function sendWebPushNotification(userId: string, payload: { title: string, body: string, url?: string }) {
  try {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    const privateKey = process.env.VAPID_PRIVATE_KEY

    if (!publicKey || !privateKey) {
      console.warn('VAPID keys not configured. Skipping push notification.')
      return { success: false, reason: 'Keys not configured' }
    }

    webpush.setVapidDetails(
      'mailto:m.beretta@ccik.kz',
      publicKey,
      privateKey
    )

    const { data: subscriptions, error } = await getSupabaseAdmin()
      .from('PushSubscription')
      .select('*')
      .eq('userId', userId)

    if (error || !subscriptions || subscriptions.length === 0) {
      return { success: false, reason: 'No subscriptions found' }
    }

    const payloadString = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url || '/',
      icon: '/icon-192x192.png'
    })

    const notifications = subscriptions.map((sub: any) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      }

      return webpush.sendNotification(pushSubscription, payloadString).catch(async (err) => {
        if (err.statusCode === 404 || err.statusCode === 410) {
          console.log('Subscription has expired or is no longer valid: ', err)
          // Delete invalid subscription
          await getSupabaseAdmin().from('PushSubscription').delete().eq('id', sub.id)
        } else {
          console.error('Error sending push notification:', err)
        }
      })
    })

    await Promise.all(notifications)
    return { success: true }
  } catch (error) {
    console.error('Failed to send web push:', error)
    return { success: false, error }
  }
}
