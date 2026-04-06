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
    const { action } = body

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

    // Approve
    await prisma.eventRegistration.update({
      where: { id },
      data: { paymentStatus: 'Completed' },
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://acik.kz'
    const qrPayload = `${baseUrl}/api/tickets/verify?id=${registration.id}`
    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      width: 400,
      margin: 0,
      errorCorrectionLevel: 'M',
      color: { dark: '#1e1b4b', light: '#ffffff' },
    })

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

// ─── Helpers ───

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function fmtDate(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

function drawRoundedRect(doc: jsPDF, x: number, y: number, w: number, h: number, r: number, style: 'F' | 'S' | 'FD') {
  doc.roundedRect(x, y, w, h, r, r, style)
}

// ─── PDF Generator ───

function generateTicketPDF(
  event: { title: string; type: string; startDate: Date; endDate: Date | null; locationVenue: string | null; locationCity: string | null; locationAddress: string | null },
  member: { firstName: string; lastName: string; email: string; companyName: string | null; companyPosition: string | null; category: string },
  qrDataUrl: string,
  registrationId: string,
): string {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [100, 250] })

  const W = 100 // page width
  const H = 250 // page height
  const pad = 8

  // ━━━ Background ━━━
  doc.setFillColor(248, 250, 252) // slate-50
  doc.rect(0, 0, W, H, 'F')

  // Main card
  drawRoundedRect(doc, 4, 4, W - 8, H - 8, 5, 'F')
  doc.setFillColor(255, 255, 255)
  drawRoundedRect(doc, 4, 4, W - 8, H - 8, 5, 'F')
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.3)
  drawRoundedRect(doc, 4, 4, W - 8, H - 8, 5, 'S')

  // ━━━ Top gradient header ━━━
  // Indigo gradient (simulate with overlapping rects)
  doc.setFillColor(79, 70, 229) // indigo-600
  drawRoundedRect(doc, 4, 4, W - 8, 58, 5, 'F')
  doc.rect(4, 40, W - 8, 22, 'F') // fill bottom corners

  // Subtle lighter overlay on top
  doc.setFillColor(99, 102, 241) // indigo-500
  drawRoundedRect(doc, 4, 4, W - 8, 25, 5, 'F')
  doc.rect(4, 15, W - 8, 14, 'F')

  // ━━━ Logo + Brand ━━━
  // Logo box
  doc.setFillColor(255, 255, 255)
  drawRoundedRect(doc, pad + 2, 10, 14, 14, 3, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(79, 70, 229)
  doc.text('A', pad + 9, 20, { align: 'center' })

  doc.setFontSize(11)
  doc.setTextColor(255, 255, 255)
  doc.text('ACIK', pad + 20, 17)
  doc.setFontSize(5)
  doc.setTextColor(199, 210, 254)
  doc.text('MANAGEMENT SYSTEM', pad + 20, 22)

  // Ticket type badge
  doc.setFillColor(67, 56, 202) // indigo-700
  const badgeText = 'EVENT TICKET'
  const badgeW = doc.getTextWidth(badgeText) + 6
  drawRoundedRect(doc, W - pad - badgeW - 2, 12, badgeW, 6, 2, 'F')
  doc.setFontSize(5)
  doc.setTextColor(199, 210, 254)
  doc.text(badgeText, W - pad - badgeW / 2 - 2, 16.2, { align: 'center' })

  // ━━━ Event Title ━━━
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(255, 255, 255)
  const titleLines = doc.splitTextToSize(event.title, W - pad * 2 - 12)
  const titleY = titleLines.length > 1 ? 36 : 40
  doc.text(titleLines, W / 2, titleY, { align: 'center' })

  // Event type
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(199, 210, 254)
  doc.text(event.type.toUpperCase(), W / 2, titleY + titleLines.length * 6 + 2, { align: 'center' })

  // ━━━ Event Details Section ━━━
  let y = 70

  // Date row
  doc.setFillColor(248, 250, 252) // slate-50
  drawRoundedRect(doc, pad, y, W - pad * 2, 18, 3, 'F')

  // Calendar icon (simple square)
  doc.setFillColor(238, 242, 255) // indigo-50
  drawRoundedRect(doc, pad + 3, y + 3, 12, 12, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(79, 70, 229)
  const dayNum = new Date(event.startDate).getDate().toString()
  doc.text(dayNum, pad + 9, y + 10.5, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6)
  doc.setTextColor(148, 163, 184)
  doc.text('DATE', pad + 18, y + 6)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(30, 41, 59)
  const dateStr = event.endDate
    ? `${fmtDate(new Date(event.startDate))} - ${fmtDate(new Date(event.endDate))}`
    : fmtDate(new Date(event.startDate))
  doc.text(dateStr, pad + 18, y + 12.5)

  y += 22

  // Location row
  if (event.locationVenue || event.locationCity) {
    doc.setFillColor(248, 250, 252)
    drawRoundedRect(doc, pad, y, W - pad * 2, 18, 3, 'F')

    doc.setFillColor(238, 242, 255)
    drawRoundedRect(doc, pad + 3, y + 3, 12, 12, 2, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(79, 70, 229)
    doc.text('>', pad + 9, y + 10.5, { align: 'center' }) // location pin placeholder

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6)
    doc.setTextColor(148, 163, 184)
    doc.text('VENUE', pad + 18, y + 6)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(30, 41, 59)
    const locParts = [event.locationVenue, event.locationCity].filter(Boolean)
    doc.text(locParts.join(', '), pad + 18, y + 12.5)

    y += 22
  }

  // ━━━ Tear line ━━━
  y += 2
  doc.setDrawColor(203, 213, 225) // slate-300
  doc.setLineDashPattern([1.5, 1.5], 0)
  doc.setLineWidth(0.3)
  doc.line(pad + 4, y, W - pad - 4, y)
  doc.setLineDashPattern([], 0)

  // Semicircle cuts
  doc.setFillColor(248, 250, 252)
  doc.circle(4, y, 4, 'F')
  doc.circle(W - 4, y, 4, 'F')

  y += 8

  // ━━━ Attendee Section ━━━
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6)
  doc.setTextColor(148, 163, 184)
  doc.text('ATTENDEE', pad + 2, y)
  y += 5

  // Name
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.setTextColor(15, 23, 42) // slate-900
  doc.text(`${member.firstName} ${member.lastName}`, pad + 2, y + 1)
  y += 7

  // Company
  if (member.companyPosition || member.companyName) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(100, 116, 139) // slate-500
    const companyLine = [member.companyPosition, member.companyName].filter(Boolean).join(' @ ')
    doc.text(companyLine, pad + 2, y + 1)
    y += 5
  }

  // Email
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(148, 163, 184)
  doc.text(member.email, pad + 2, y + 1)
  y += 7

  // Category badge
  const catColors: Record<string, [number, number, number]> = {
    Bronze: [180, 83, 9],
    Silver: [100, 116, 139],
    Gold: [202, 138, 4],
    Platinum: [79, 70, 229],
    Diamond: [139, 92, 246],
  }
  const catBgColors: Record<string, [number, number, number]> = {
    Bronze: [254, 243, 199],
    Silver: [241, 245, 249],
    Gold: [254, 249, 195],
    Platinum: [238, 242, 255],
    Diamond: [245, 243, 255],
  }
  const catColor = catColors[member.category] || [79, 70, 229]
  const catBg = catBgColors[member.category] || [238, 242, 255]

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6)
  const catText = member.category.toUpperCase()
  const catW = doc.getTextWidth(catText) + 8
  doc.setFillColor(catBg[0], catBg[1], catBg[2])
  drawRoundedRect(doc, pad + 2, y - 1.5, catW, 7, 2, 'F')
  doc.setTextColor(catColor[0], catColor[1], catColor[2])
  doc.text(catText, pad + 6, y + 3)
  y += 14

  // ━━━ QR Code ━━━
  const qrSize = 52
  const qrX = W / 2 - qrSize / 2

  // QR background box
  doc.setFillColor(248, 250, 252)
  drawRoundedRect(doc, qrX - 6, y - 4, qrSize + 12, qrSize + 22, 4, 'F')
  doc.setDrawColor(226, 232, 240)
  doc.setLineWidth(0.2)
  drawRoundedRect(doc, qrX - 6, y - 4, qrSize + 12, qrSize + 22, 4, 'S')

  // QR image
  doc.addImage(qrDataUrl, 'PNG', qrX, y, qrSize, qrSize)

  // Scan text
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6)
  doc.setTextColor(148, 163, 184)
  doc.text('Scan to check in', W / 2, y + qrSize + 5, { align: 'center' })

  // Ticket ID
  doc.setFontSize(4.5)
  doc.setTextColor(203, 213, 225)
  doc.text(`${registrationId.slice(0, 8)}...${registrationId.slice(-4)}`, W / 2, y + qrSize + 10, { align: 'center' })

  // ━━━ Bottom footer ━━━
  doc.setFontSize(4)
  doc.setTextColor(203, 213, 225)
  doc.text('ACIK Management System', W / 2, H - 8, { align: 'center' })

  // Bottom accent line
  doc.setFillColor(79, 70, 229)
  doc.rect(4, H - 5.5, W - 8, 1.5, 'F')

  return doc.output('datauristring')
}
