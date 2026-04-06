import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST /api/register — public guest registration for an event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, firstName, lastName, email, phone, companyName, companyPosition } = body

    if (!eventId || !firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        { success: false, message: 'All required fields must be filled' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check event exists and is active
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, title: true, status: true, capacity: true, _count: { select: { registrations: true } } },
    })

    if (!event) {
      return NextResponse.json(
        { success: false, message: 'Event not found' },
        { status: 404 }
      )
    }

    if (event.status === 'Cancelled') {
      return NextResponse.json(
        { success: false, message: 'This event has been cancelled' },
        { status: 400 }
      )
    }

    // Check capacity
    if (event.capacity > 0 && event._count.registrations >= event.capacity) {
      return NextResponse.json(
        { success: false, message: 'Event is at full capacity' },
        { status: 400 }
      )
    }

    // Find or create member by email
    let member = await prisma.member.findUnique({ where: { email: email.toLowerCase().trim() } })

    if (!member) {
      member = await prisma.member.create({
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.toLowerCase().trim(),
          phone: phone.trim(),
          companyName: companyName?.trim() || null,
          companyPosition: companyPosition?.trim() || null,
          category: 'Bronze',
          status: 'Active',
        },
      })
    } else {
      // Update member info if changed
      await prisma.member.update({
        where: { id: member.id },
        data: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          ...(companyName && { companyName: companyName.trim() }),
          ...(companyPosition && { companyPosition: companyPosition.trim() }),
        },
      })
    }

    // Check if already registered
    const existing = await prisma.eventRegistration.findUnique({
      where: { eventId_memberId: { eventId, memberId: member.id } },
    })

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'You are already registered for this event' },
        { status: 409 }
      )
    }

    // Create registration with Pending status
    const registration = await prisma.eventRegistration.create({
      data: {
        eventId,
        memberId: member.id,
        paymentStatus: 'Pending',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Registration submitted successfully. You will receive your ticket after approval.',
      registrationId: registration.id,
    })
  } catch (err) {
    console.error('Registration error:', err)
    return NextResponse.json(
      { success: false, message: 'Failed to submit registration' },
      { status: 500 }
    )
  }
}
