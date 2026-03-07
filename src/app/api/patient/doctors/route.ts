import { createClient } from '@/lib/supabase-server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)

    const specialty = searchParams.get('specialty')
    const location = searchParams.get('location')
    const name = searchParams.get('name')

    // Try authenticated client first; fall back to service-role for dev guest access
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    // Use admin client (bypasses RLS) when there is no session, so guests can browse doctors
    const client = session
        ? supabase
        : createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

    let query = client
        .from('doctors_details')
        .select(`
      *,
      profiles (
        full_name,
        email,
        avatar_url
      )
    `)

    if (specialty && specialty !== 'All') {
        query = query.ilike('specialty', `%${specialty}%`)
    }

    if (location) {
        query = query.ilike('location', `%${location}%`)
    }

    if (name) {
        query = query.filter('profiles.full_name', 'ilike', `%${name}%`)
    }

    const { data, error } = await query

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data ?? [])
}
