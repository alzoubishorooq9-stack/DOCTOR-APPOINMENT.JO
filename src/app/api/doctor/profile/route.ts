import { createClient, createAdminClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = await createAdminClient()

    // Get basic profile
    const { data: profile } = await admin
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (profile?.role?.toUpperCase() !== 'DOCTOR') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get doctor specific details
    const { data: details } = await admin
        .from('doctors_details')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

    return NextResponse.json({ ...profile, details: details || {} })
}

export async function PUT(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = await createAdminClient()
    const { data: profile } = await admin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role?.toUpperCase() !== 'DOCTOR') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { full_name, avatar_url, specialty, experience_years, location, bio } = body

    // Update basic profile
    const { error: profileError } = await admin.from('profiles').update({
        full_name,
        avatar_url,
        updated_at: new Date().toISOString()
    }).eq('id', user.id)

    if (profileError) {
        console.error('[Profile Update Error]', profileError)
        return NextResponse.json({ error: 'Failed to update basic profile' }, { status: 500 })
    }

    // Update or insert doctor details
    const { data: existingDetails } = await admin.from('doctors_details').select('id').eq('id', user.id).maybeSingle()

    let detailsError;
    if (existingDetails) {
        const { error } = await admin.from('doctors_details').update({
            specialty,
            experience_years: experience_years || 0,
            location,
            bio,
            updated_at: new Date().toISOString()
        }).eq('id', user.id)
        detailsError = error
    } else {
        const { error } = await admin.from('doctors_details').insert({
            id: user.id,
            specialty,
            experience_years: experience_years || 0,
            location,
            bio
        })
        detailsError = error
    }

    if (detailsError) {
        console.error('[Doctor Details Update Error]', detailsError)
        return NextResponse.json({ error: 'Failed to update doctor details' }, { status: 500 })
    }

    try {
        revalidatePath('/doctors', 'layout');
        revalidatePath(`/doctors/${user.id}`, 'page');
        revalidatePath('/', 'layout');
    } catch (e) {
        console.error('Failed to revalidate path', e);
    }

    return NextResponse.json({ success: true })
}
