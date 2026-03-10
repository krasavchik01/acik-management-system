import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser, hasRole, ADMIN_ROLES } from '@/lib/auth'

interface OfficeSetting {
  name: string
  latitude: number
  longitude: number
  radius: number
  address: string
  updatedAt: string
}

const BUCKET = 'settings'
const FILE = 'office.json'

async function getOfficeSettings(): Promise<OfficeSetting | null> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .storage
      .from(BUCKET)
      .download(FILE)

    if (error || !data) return null

    const text = await data.text()
    return JSON.parse(text) as OfficeSetting
  } catch {
    return null
  }
}

async function saveOfficeSettings(settings: OfficeSetting): Promise<boolean> {
  const blob = new Blob([JSON.stringify(settings)], { type: 'application/json' })

  const { error } = await getSupabaseAdmin()
    .storage
    .from(BUCKET)
    .upload(FILE, blob, { upsert: true })

  return !error
}

// GET /api/admin/office
export async function GET() {
  try {
    const { user, error } = await getAuthUser()
    if (error || !user) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      )
    }

    const settings = await getOfficeSettings()

    return NextResponse.json({
      success: true,
      data: settings
    })
  } catch (error) {
    console.error('Office settings fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch office settings' },
      { status: 500 }
    )
  }
}

// POST /api/admin/office
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getAuthUser()
    if (error || !user) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      )
    }

    if (!hasRole(user.role, ADMIN_ROLES)) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, latitude, longitude, radius, address } = body

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { success: false, message: 'Latitude and longitude are required' },
        { status: 400 }
      )
    }

    const settings: OfficeSetting = {
      name: name || 'Office',
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      radius: parseFloat(radius) || 100,
      address: address || '',
      updatedAt: new Date().toISOString(),
    }

    const saved = await saveOfficeSettings(settings)

    if (!saved) {
      return NextResponse.json(
        { success: false, message: 'Failed to save office settings' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Office settings saved',
      data: settings
    })
  } catch (error) {
    console.error('Office settings save error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to save office settings' },
      { status: 500 }
    )
  }
}
