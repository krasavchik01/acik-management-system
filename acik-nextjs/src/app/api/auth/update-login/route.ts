import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { supabaseId } = body

    if (!supabaseId) {
      return NextResponse.json(
        { success: false, message: 'Missing supabaseId' },
        { status: 400 }
      )
    }

    await prisma.user.update({
      where: { supabaseId },
      data: { lastLogin: new Date() }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update login error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update login time' },
      { status: 500 }
    )
  }
}
