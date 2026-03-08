import { createClient, createAdminClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = await createAdminClient()
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role?.toUpperCase() !== 'DOCTOR') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // Fetch all bookings for this doctor including patient user details and service details
    // using the correct foreign key traversal.
    const { data, error } = await admin
        .from('bookings')
        .select(`
            *,
            patient:profiles!patient_id(full_name, avatar_url),
            services(name, price, duration_mins)
        `)
        .eq('doctor_id', user.id)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json(data || [])
}
