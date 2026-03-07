import { createClient, createAdminClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    // Auth via user client
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Use admin client to bypass RLS
    const admin = await createAdminClient()

    // Verify ownership
    const { data: booking, error: fetchError } = await admin
        .from('bookings')
        .select('patient_id, status')
        .eq('id', id)
        .maybeSingle()

    if (fetchError || !booking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    if (booking.patient_id !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (booking.status === 'cancelled') {
        return NextResponse.json({ error: 'Already cancelled' }, { status: 400 })
    }

    const { error } = await admin
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Booking cancelled successfully' })
}

