import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { booking_id, doctor_id, rating, title, content } = body

    if (!booking_id || !doctor_id || !rating) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Ensure booking is completed (or at least exists and confirmed) 
    // For now, we trust the flow but should verify status in real production
    const { data: booking } = await supabase
        .from('bookings')
        .select('status')
        .eq('id', booking_id)
        .single()

    if (!booking) {
        return NextResponse.json({ error: 'Invalid booking' }, { status: 400 })
    }

    const { data, error } = await supabase
        .from('reviews')
        .insert({
            booking_id,
            patient_id: user.id,
            doctor_id,
            rating,
            title,
            content
        })
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}
