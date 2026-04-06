import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import QRCode from 'qrcode'
import { jsPDF } from 'jspdf'

export const dynamic = 'force-dynamic'

// PATCH /api/tickets/[id] — approve or reject a registration
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthUser()
    if (error || !user) {
      return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { action } = body // 'approve' | 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 })
    }

    const registration = await prisma.eventRegistration.findUnique({
      where: { id },
      include: {
        event: { select: { id: true, title: true, type: true, startDate: true, endDate: true, locationVenue: true, locationCity: true, locationAddress: true } },
        member: { select: { id: true, firstName: true, lastName: true, email: true, companyName: true, companyPosition: true, category: true } },
      },
    })

    if (!registration) {
      return NextResponse.json({ success: false, message: 'Registration not found' }, { status: 404 })
    }

    if (action === 'reject') {
      await prisma.eventRegistration.update({
        where: { id },
        data: { paymentStatus: 'Cancelled' },
      })
      return NextResponse.json({ success: true, message: 'Registration rejected' })
    }

    // Approve: update status and generate PDF
    await prisma.eventRegistration.update({
      where: { id },
      data: { paymentStatus: 'Completed' },
    })

    // Generate PDF ticket
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://acik.kz'
    const qrPayload = `${baseUrl}/api/tickets/verify?id=${registration.id}`
    const qrDataUrl = await QRCode.toDataURL(qrPayload, { width: 300, margin: 1, errorCorrectionLevel: 'M' })

    const pdf = generateTicketPDF(registration.event, registration.member, qrDataUrl, registration.id)

    return NextResponse.json({
      success: true,
      message: 'Registration approved',
      pdf,
      member: registration.member,
    })
  } catch (err) {
    console.error('Ticket approve error:', err)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}

function generateTicketPDF(
  event: { title: string; type: string; startDate: Date; endDate: Date | null; locationVenue: string | null; locationCity: string | null; locationAddress: string | null },
  member: { firstName: string; lastName: string; email: string; companyName: string | null; companyPosition: string | null; category: string },
  qrDataUrl: string,
  registrationId: string,
): string {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const pageW = 210
  const ticketW = 170
  const ticketH = 250
  const startX = (pageW - ticketW) / 2
  const startY = 22

  // Background
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(startX, startY, ticketW, ticketH, 6, 6, 'F')

  // Top accent bar
  doc.setFillColor(79, 70, 229)
  doc.roundedRect(startX, startY, ticketW, 50, 6, 6, 'F')
  doc.setFillColor(79, 70, 229)
  doc.rect(startX, startY + 44, ticketW, 6, 'F')

  // Border
  doc.setDrawColor(200, 200, 220)
  doc.setLineWidth(0.5)
  doc.roundedRect(startX, startY, ticketW, ticketH, 6, 6, 'S')

  // Logo area
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(255, 255, 255)
  doc.text('ACIK', startX + 15, startY + 18)

  doc.setFontSize(7)
  doc.setTextColor(199, 210, 254)
  doc.text('MANAGEMENT SYSTEM', startX + 15, startY + 24)

  // Event ticket label
  doc.setFontSize(8)
  doc.setTextColor(199, 210, 254)
  doc.text('EVENT TICKET', startX + ticketW - 15, startY + 14, { align: 'right' })

  // Event title
  doc.setFontSize(15)
  doc.setTextColor(255, 255, 255)
  const titleLines = doc.splitTextToSize(event.title.toUpperCase(), ticketW - 30)
  doc.text(titleLines, pageW / 2, startY + 38, { align: 'center' })

  // --- Event details ---
  let yPos = startY + 62

  // Date
  const dateOpts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }
  const startDateStr = new Date(event.startDate).toLocaleDateString('ru-RU', dateOpts)
  const endDateStr = event.endDate ? new Date(event.endDate).toLocaleDateString('ru-RU', dateOpts) : null

  drawField(doc, startX + 12, yPos, 'DATE / ДАТА', endDateStr ? `${startDateStr} — ${endDateStr}` : startDateStr)
  yPos += 16

  // Location
  const loc = [event.locationVenue, event.locationAddress, event.locationCity].filter(Boolean).join(', ')
  if (loc) {
    drawField(doc, startX + 12, yPos, 'LOCATION / МЕСТО', loc)
    yPos += 16
  }

  // Type
  drawField(doc, startX + 12, yPos, 'TYPE / ТИП', event.type)
  yPos += 20

  // Dashed divider
  doc.setDrawColor(200, 200, 220)
  doc.setLineDashPattern([2, 2], 0)
  doc.line(startX + 10, yPos, startX + ticketW - 10, yPos)
  doc.setLineDashPattern([], 0)

  // Cut marks
  doc.setFillColor(241, 245, 249)
  doc.circle(startX, yPos, 6, 'F')
  doc.circle(startX + ticketW, yPos, 6, 'F')
  yPos += 10

  // Attendee
  drawField(doc, startX + 12, yPos, 'ATTENDEE / УЧАСТНИК', '')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(30, 30, 50)
  doc.text(`${member.firstName} ${member.lastName}`, startX + 12, yPos + 7)
  yPos += 14

  if (member.companyName || member.companyPosition) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 120)
    const companyLine = [member.companyPosition, member.companyName].filter(Boolean).join(' @ ')
    doc.text(companyLine, startX + 12, yPos)
    yPos += 7
  }

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(120, 120, 140)
  doc.text(member.email, startX + 12, yPos)
  yPos += 8

  // Category badge
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setFillColor(238, 242, 255)
  doc.roundedRect(startX + 12, yPos - 3, 40, 7, 2, 2, 'F')
  doc.setTextColor(79, 70, 229)
  doc.text(member.category.toUpperCase(), startX + 14, yPos + 2)
  yPos += 16

  // QR Code
  const qrSize = 55
  const qrX = pageW / 2 - qrSize / 2
  doc.addImage(qrDataUrl, 'PNG', qrX, yPos, qrSize, qrSize)

  // Scan instruction
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 170)
  doc.text('Scan QR code at entrance / Сканируйте QR на входе', pageW / 2, yPos + qrSize + 6, { align: 'center' })

  // Registration ID
  doc.setFontSize(6)
  doc.setTextColor(190, 190, 210)
  doc.text(`Ticket ID: ${registrationId}`, pageW / 2, yPos + qrSize + 12, { align: 'center' })

  return doc.output('datauristring')
}

function drawField(doc: jsPDF, x: number, y: number, label: string, value: string) {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(150, 150, 170)
  doc.text(label, x, y)
  if (value) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(30, 30, 50)
    doc.text(value, x, y + 5.5)
  }
}
