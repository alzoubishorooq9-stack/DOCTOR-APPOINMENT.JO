import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = await createClient()
    const { id } = await params

    const { data, error } = await supabase
        .from('doctors_details')
        .select(`
      *,
      profiles (
        full_name,
        email
      ),
      services (*),
      reviews (
        *,
        profiles:patient_id (full_name)
      )
    `)
        .eq('id', id)
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json(data)
}
