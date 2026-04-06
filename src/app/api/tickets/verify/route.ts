import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/tickets/verify?id=xxx — verify ticket by QR scan and mark attendance
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const registrationId = searchParams.get('id')

    if (!registrationId) {
      return buildHtmlResponse({
        status: 'error',
        title: 'Invalid Ticket',
        message: 'No ticket ID provided.',
        color: '#ef4444',
      })
    }

    const registration = await prisma.eventRegistration.findUnique({
      where: { id: registrationId },
      include: {
        event: { select: { id: true, title: true, startDate: true, endDate: true, status: true, locationVenue: true } },
        member: { select: { id: true, firstName: true, lastName: true, email: true, companyName: true, category: true } },
      },
    })

    if (!registration) {
      return buildHtmlResponse({
        status: 'error',
        title: 'Ticket Not Found',
        message: 'This ticket does not exist in the system.',
        color: '#ef4444',
      })
    }

    const alreadyAttended = registration.attended

    // Mark as attended
    if (!alreadyAttended) {
      await prisma.eventRegistration.update({
        where: { id: registrationId },
        data: { attended: true },
      })

      // Also create MemberEventAttendance record
      try {
        await prisma.memberEventAttendance.create({
          data: {
            memberId: registration.memberId,
            eventId: registration.eventId,
          },
        })
      } catch {
        // unique constraint — already exists, skip
      }
    }

    const member = registration.member
    const event = registration.event

    return buildHtmlResponse({
      status: alreadyAttended ? 'already' : 'success',
      title: alreadyAttended ? 'Already Checked In' : 'Check-In Successful!',
      message: alreadyAttended
        ? `${member.firstName} ${member.lastName} was already checked in.`
        : `${member.firstName} ${member.lastName} has been checked in.`,
      color: alreadyAttended ? '#f59e0b' : '#10b981',
      member: `${member.firstName} ${member.lastName}`,
      company: member.companyName || '',
      category: member.category,
      event: event.title,
      eventDate: new Date(event.startDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),
      location: event.locationVenue || '',
    })
  } catch (err) {
    console.error('Ticket verify error:', err)
    return buildHtmlResponse({
      status: 'error',
      title: 'Verification Error',
      message: 'An error occurred while verifying this ticket.',
      color: '#ef4444',
    })
  }
}

// Returns a styled HTML page for QR scan results (mobile-friendly)
function buildHtmlResponse(data: {
  status: string
  title: string
  message: string
  color: string
  member?: string
  company?: string
  category?: string
  event?: string
  eventDate?: string
  location?: string
}) {
  const icon = data.status === 'success'
    ? `<svg width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="${data.color}" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
    : data.status === 'already'
    ? `<svg width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="${data.color}" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>`
    : `<svg width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="${data.color}" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`

  const details = data.member ? `
    <div style="margin-top:24px;background:#f8fafc;border-radius:16px;padding:20px;text-align:left;width:100%">
      <div style="font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Attendee</div>
      <div style="font-size:18px;font-weight:700;color:#1e293b">${data.member}</div>
      ${data.company ? `<div style="font-size:13px;color:#64748b;margin-top:2px">${data.company}</div>` : ''}
      ${data.category ? `<div style="display:inline-block;margin-top:8px;padding:4px 12px;border-radius:20px;background:${data.color}18;color:${data.color};font-size:11px;font-weight:700;text-transform:uppercase">${data.category}</div>` : ''}

      <div style="margin-top:16px;padding-top:16px;border-top:1px solid #e2e8f0">
        <div style="font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Event</div>
        <div style="font-size:15px;font-weight:600;color:#1e293b">${data.event || ''}</div>
        ${data.eventDate ? `<div style="font-size:13px;color:#64748b;margin-top:2px">${data.eventDate}</div>` : ''}
        ${data.location ? `<div style="font-size:13px;color:#64748b">${data.location}</div>` : ''}
      </div>
    </div>
  ` : ''

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${data.title} - ACIK</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; background:#f1f5f9; min-height:100vh; display:flex; align-items:center; justify-content:center; padding:20px; }
    .card { background:#fff; border-radius:24px; padding:40px 28px; max-width:400px; width:100%; text-align:center; box-shadow:0 20px 60px rgba(0,0,0,0.08); }
    .icon { margin-bottom:16px; }
    .title { font-size:22px; font-weight:800; color:#1e293b; margin-bottom:8px; }
    .msg { font-size:14px; color:#64748b; line-height:1.5; }
    .badge { display:inline-block; margin-top:16px; padding:6px 16px; border-radius:20px; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; }
    .footer { margin-top:24px; font-size:11px; color:#cbd5e1; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${icon}</div>
    <div class="title">${data.title}</div>
    <div class="msg">${data.message}</div>
    <div class="badge" style="background:${data.color}15;color:${data.color}">${data.status === 'success' ? 'VERIFIED' : data.status === 'already' ? 'DUPLICATE SCAN' : 'INVALID'}</div>
    ${details}
    <div class="footer">ACIK Management System</div>
  </div>
</body>
</html>`

  return new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
