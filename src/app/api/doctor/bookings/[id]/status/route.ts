import { createClient, createAdminClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = await createAdminClient()
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role?.toUpperCase() !== 'DOCTOR') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const status = body.status?.toLowerCase()

    const validStatuses = ['confirmed', 'cancelled', 'completed']
    if (!status || !validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const { data: booking } = await admin.from('bookings').select('doctor_id, appointment_date, appointment_time').eq('id', id).maybeSingle()
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    if (booking.doctor_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data, error } = await admin
        .from('bookings')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    if (status === 'cancelled') {
        await admin
            .from('availability')
            .update({ is_booked: false })
            .eq('doctor_id', booking.doctor_id)
            .eq('date', booking.appointment_date)
            .eq('start_time', booking.appointment_time)
    }

    return NextResponse.json(data)
}
