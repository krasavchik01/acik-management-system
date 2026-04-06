import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/tickets?eventId=xxx — list registrations for an event
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthUser()
    if (error || !user) {
      return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    if (!eventId) {
      return NextResponse.json({ success: false, message: 'eventId is required' }, { status: 400 })
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, title: true, startDate: true, endDate: true, locationVenue: true, locationCity: true },
    })

    if (!event) {
      return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 })
    }

    const registrations = await prisma.eventRegistration.findMany({
      where: { eventId },
      include: {
        member: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, companyName: true, companyPosition: true, category: true } },
      },
      orderBy: { registeredAt: 'desc' },
    })

    return NextResponse.json({ success: true, event, data: registrations })
  } catch (err) {
    console.error('Tickets list error:', err)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
