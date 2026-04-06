import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, hasPermission } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import QRCode from 'qrcode'
import { jsPDF } from 'jspdf'

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

// POST /api/tickets — generate PDF tickets
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getAuthUser()
    if (error || !user) {
      return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 })
    }

    const body = await request.json()
    const { eventId, memberIds } = body

    if (!eventId) {
      return NextResponse.json({ success: false, message: 'eventId is required' }, { status: 400 })
    }

    // Fetch event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true, title: true, description: true, type: true,
        startDate: true, endDate: true,
        locationVenue: true, locationCity: true, locationAddress: true,
        locationIsVirtual: true,
      },
    })

    if (!event) {
      return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 })
    }

    // Fetch registrations (all or selected)
    const where: any = { eventId }
    if (memberIds && memberIds.length > 0) {
      where.memberId = { in: memberIds }
    }

    const registrations = await prisma.eventRegistration.findMany({
      where,
      include: {
        member: { select: { id: true, firstName: true, lastName: true, email: true, companyName: true, companyPosition: true, category: true } },
      },
    })

    if (registrations.length === 0) {
      return NextResponse.json({ success: false, message: 'No registrations found' }, { status: 404 })
    }

    // Build the base URL for QR verification
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://acik.kz'

    // Generate PDF
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    for (let i = 0; i < registrations.length; i++) {
      const reg = registrations[i]
      const member = reg.member

      if (i > 0) doc.addPage()

      // QR payload: verification URL with registrationId
      const qrPayload = `${baseUrl}/api/tickets/verify?id=${reg.id}`
      const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 300, margin: 1, errorCorrectionLevel: 'M' })

      const pageW = 210
      const ticketW = 170
      const ticketH = 240
      const startX = (pageW - ticketW) / 2
      const startY = 28

      // --- Ticket background ---
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(startX, startY, ticketW, ticketH, 6, 6, 'F')

      // Top accent bar
      doc.setFillColor(79, 70, 229) // indigo-600
      doc.roundedRect(startX, startY, ticketW, 40, 6, 6, 'F')
      doc.setFillColor(79, 70, 229)
      doc.rect(startX, startY + 34, ticketW, 6, 'F') // fill bottom corners of accent

      // Border
      doc.setDrawColor(200, 200, 220)
      doc.setLineWidth(0.5)
      doc.roundedRect(startX, startY, ticketW, ticketH, 6, 6, 'S')

      // --- Header text ---
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(199, 210, 254) // indigo-200
      doc.text('ACIK MANAGEMENT SYSTEM', pageW / 2, startY + 12, { align: 'center' })

      doc.setFontSize(7)
      doc.text('EVENT TICKET', pageW / 2, startY + 18, { align: 'center' })

      // Event title
      doc.setFontSize(16)
      doc.setTextColor(255, 255, 255)
      const titleLines = doc.splitTextToSize(event.title.toUpperCase(), ticketW - 20)
      doc.text(titleLines, pageW / 2, startY + 30, { align: 'center' })

      // --- Event details ---
      let yPos = startY + 55

      doc.setFontSize(8)
      doc.setTextColor(120, 120, 140)
      doc.setFont('helvetica', 'normal')

      // Date
      const startDateStr = new Date(event.startDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
      const endDateStr = event.endDate ? new Date(event.endDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : null

      doc.text('DATE', startX + 12, yPos)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 30, 50)
      doc.setFontSize(10)
      doc.text(endDateStr ? `${startDateStr} — ${endDateStr}` : startDateStr, startX + 12, yPos + 5)
      yPos += 14

      // Location
      if (event.locationVenue || event.locationCity) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(120, 120, 140)
        doc.text('LOCATION', startX + 12, yPos)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(30, 30, 50)
        doc.setFontSize(10)
        const loc = [event.locationVenue, event.locationCity].filter(Boolean).join(', ')
        doc.text(loc, startX + 12, yPos + 5)
        yPos += 14
      }

      // Type
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(120, 120, 140)
      doc.text('TYPE', startX + 12, yPos)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 30, 50)
      doc.setFontSize(10)
      doc.text(event.type, startX + 12, yPos + 5)
      yPos += 18

      // --- Dashed divider ---
      doc.setDrawColor(200, 200, 220)
      doc.setLineDashPattern([2, 2], 0)
      doc.line(startX + 10, yPos, startX + ticketW - 10, yPos)
      doc.setLineDashPattern([], 0)
      yPos += 8

      // --- Attendee info ---
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(120, 120, 140)
      doc.text('ATTENDEE', startX + 12, yPos)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 30, 50)
      doc.setFontSize(13)
      doc.text(`${member.firstName} ${member.lastName}`, startX + 12, yPos + 7)
      yPos += 12

      if (member.companyName || member.companyPosition) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(100, 100, 120)
        const companyLine = [member.companyPosition, member.companyName].filter(Boolean).join(' @ ')
        doc.text(companyLine, startX + 12, yPos)
        yPos += 6
      }

      // Category badge
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(79, 70, 229)
      doc.text(member.category.toUpperCase(), startX + 12, yPos + 2)
      yPos += 12

      // --- QR Code ---
      const qrSize = 50
      const qrX = pageW / 2 - qrSize / 2
      doc.addImage(qrDataUrl, 'PNG', qrX, yPos, qrSize, qrSize)

      // Scan instruction
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(150, 150, 170)
      doc.text('Scan QR code to verify attendance', pageW / 2, yPos + qrSize + 5, { align: 'center' })

      // Registration ID
      doc.setFontSize(6)
      doc.setTextColor(180, 180, 200)
      doc.text(`ID: ${reg.id}`, pageW / 2, yPos + qrSize + 10, { align: 'center' })
    }

    // Return PDF as base64
    const pdfBase64 = doc.output('datauristring')

    return NextResponse.json({
      success: true,
      pdf: pdfBase64,
      count: registrations.length,
    })
  } catch (err) {
    console.error('Ticket generation error:', err)
    return NextResponse.json({ success: false, message: 'Failed to generate tickets' }, { status: 500 })
  }
}
