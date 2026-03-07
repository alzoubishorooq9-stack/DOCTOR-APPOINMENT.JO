import { createClient, createAdminClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

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

    const { data: slot } = await admin.from('availability').select('doctor_id').eq('id', id).maybeSingle()
    if (!slot) return NextResponse.json({ error: 'Slot not found' }, { status: 404 })
    if (slot.doctor_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { error } = await admin.from('availability').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
}
