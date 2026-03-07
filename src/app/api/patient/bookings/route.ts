import { createClient, createAdminClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
    // Authenticate with user client
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Use admin client to bypass RLS for reads
    const admin = await createAdminClient()
    const { data, error } = await admin
        .from('bookings')
        .select(`
      *,
      doctors_details (
        specialty,
        location,
        profiles (
          full_name
        )
      ),
      services (
        name,
        price
      )
    `)
        .eq('patient_id', user.id)
        .order('appointment_date', { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function POST(request: Request) {
    // 1. Authenticate user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { doctor_id, service_id, appointment_date, appointment_time, reason, total_price } = body

    // 2. Basic Validation
    if (!doctor_id || !appointment_date || !appointment_time || !total_price) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 3. Use admin client to bypass RLS for insert
    const admin = await createAdminClient()

    // 4. Check if slot is already taken
    const { data: existing } = await admin
        .from('bookings')
        .select('id')
        .eq('doctor_id', doctor_id)
        .eq('appointment_date', appointment_date)
        .eq('appointment_time', appointment_time)
        .not('status', 'eq', 'cancelled')
        .maybeSingle()

    if (existing) {
        return NextResponse.json({ error: 'This time slot is already booked' }, { status: 409 })
    }

    // 5. Create Booking with status 'pending' — doctor must approve
    const { data, error } = await admin
        .from('bookings')
        .insert({
            patient_id: user.id,
            doctor_id,
            service_id: service_id || null,
            appointment_date,
            appointment_time,
            reason: reason || 'Consultation',
            total_price,
            status: 'pending'
        })
        .select()
        .single()

    if (error) {
        console.error('[Booking POST error]', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}
