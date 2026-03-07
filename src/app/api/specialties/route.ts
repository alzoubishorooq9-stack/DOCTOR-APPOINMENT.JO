import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()

    // Extract unique specialties from doctors_details
    const { data, error } = await supabase
        .from('doctors_details')
        .select('specialty')

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Deduplicate specialties
    const uniqueSpecialties = Array.from(new Set(data.map(d => d.specialty).filter(Boolean)))

    return NextResponse.json(['All', ...uniqueSpecialties.sort()])
}
