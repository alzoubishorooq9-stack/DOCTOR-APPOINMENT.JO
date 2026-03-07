import { createClient, createAdminClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Optional date filter
    const url = new URL(request.url)
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')

    const admin = await createAdminClient()
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role?.toUpperCase() !== 'DOCTOR') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    let query = admin
        .from('availability')
        .select('*')
        .eq('doctor_id', user.id)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })

    if (startDate) query = query.gte('date', startDate)
    if (endDate) query = query.lte('date', endDate)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json(data || [])
}

export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = await createAdminClient()
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role?.toUpperCase() !== 'DOCTOR') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    // Support bulk insert
    const slots = Array.isArray(body) ? body : [body]

    const insertData = slots.map(slot => ({
        doctor_id: user.id,
        date: slot.date,
        start_time: slot.start_time,
        end_time: slot.end_time || null, // End time is optional in some setups but we usually compute it based on service duration
        is_booked: false
    }))

    const { data, error } = await admin.from('availability').insert(insertData).select()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json(data)
}
