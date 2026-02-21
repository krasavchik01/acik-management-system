import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getAuthUser, hasRole, MANAGER_ROLES } from '@/lib/auth'

// GET /api/finance
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthUser()
    if (error || !user) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let query = supabaseAdmin
      .from('Finance')
      .select('*')
      .order('date', { ascending: false })

    if (type) query = query.eq('type', type)
    if (category) query = query.eq('category', category)
    if (status) query = query.eq('status', status)
    if (startDate) query = query.gte('date', startDate)
    if (endDate) query = query.lte('date', endDate)

    const { data: transactions, error: fetchError } = await query

    if (fetchError) {
      console.error('Finance fetch error:', fetchError)
      return NextResponse.json(
        { success: false, message: 'Failed to fetch transactions' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      count: (transactions || []).length,
      data: transactions || []
    })
  } catch (error) {
    console.error('Finance fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

// POST /api/finance
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getAuthUser()
    if (error || !user) {
      return NextResponse.json(
        { success: false, message: 'Not authorized' },
        { status: 401 }
      )
    }

    if (!hasRole(user.role, MANAGER_ROLES)) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to create transactions' },
        { status: 403 }
      )
    }

    const body = await request.json()

    if (!body.description || !body.amount || !body.type) {
      return NextResponse.json(
        { success: false, message: 'Description, amount, and type are required' },
        { status: 400 }
      )
    }

    const financeData = {
      id: crypto.randomUUID(),
      description: body.description,
      amount: body.amount,
      type: body.type,
      category: body.category || 'Other',
      status: body.status || 'Pending',
      date: body.date || new Date().toISOString().split('T')[0],
      reference: body.reference || null,
      notes: body.notes || null,
      projectId: body.projectId || null,
      eventId: body.eventId || null,
      sponsorId: body.sponsorId || null,
      createdById: user.id,
      updatedAt: new Date().toISOString(),
    }

    const { data: transaction, error: createError } = await supabaseAdmin
      .from('Finance')
      .insert(financeData)
      .select()
      .single()

    if (createError) {
      console.error('Finance create error:', createError)
      return NextResponse.json(
        { success: false, message: 'Failed to create transaction' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, data: transaction },
      { status: 201 }
    )
  } catch (error) {
    console.error('Finance create error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}
