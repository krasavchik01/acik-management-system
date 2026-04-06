import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/register/[eventId] — public event info for registration page (no auth)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        status: true,
        startDate: true,
        endDate: true,
        locationVenue: true,
        locationCity: true,
        locationIsVirtual: true,
        capacity: true,
        _count: { select: { registrations: true } },
      },
    })

    if (!event) {
      return NextResponse.json(
        { success: false, message: 'Event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: event })
  } catch (err) {
    console.error('Public event fetch error:', err)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch event' },
      { status: 500 }
    )
  }
}
