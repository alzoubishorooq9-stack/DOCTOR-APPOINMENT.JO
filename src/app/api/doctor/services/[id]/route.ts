import { createClient, createAdminClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function PUT(
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
    const { name, price, duration_mins } = body

    if (!name || typeof price !== 'number' || typeof duration_mins !== 'number') {
        return NextResponse.json({ error: 'Bad Request: name, price, duration_mins are required' }, { status: 400 })
    }

    const { data: service } = await admin.from('services').select('doctor_id').eq('id', id).maybeSingle()
    if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    if (service.doctor_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { data, error } = await admin.from('services').update({
        name,
        price,
        duration_mins,
        updated_at: new Date().toISOString()
    }).eq('id', id).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
}

export async function DELETE(
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

    const { data: service } = await admin.from('services').select('doctor_id').eq('id', id).maybeSingle()
    if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    if (service.doctor_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { error } = await admin.from('services').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
}
