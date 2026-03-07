import { createAdminClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = await createAdminClient()
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get('date') // Format: YYYY-MM-DD

    if (!dateStr) {
        return NextResponse.json({ error: 'Date is required' }, { status: 400 })
    }

    // 1. Get Doctor's Availability Rules
    const dayOfWeek = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })
    const { data: rules } = await supabase
        .from('availability')
        .select('*')
        .eq('doctor_id', id)
        .eq('day_of_week', dayOfWeek)
        .eq('is_active', true)

    if (!rules || rules.length === 0) {
        return NextResponse.json([]) // No availability for this day
    }

    // 2. Get Existing Bookings for this Doctor on this Date
    const { data: bookings } = await supabase
        .from('bookings')
        .select('appointment_time')
        .eq('doctor_id', id)
        .eq('appointment_date', dateStr)
        .not('status', 'eq', 'cancelled')

    const bookedTimes = bookings?.map(b => b.appointment_time.slice(0, 5)) || []

    // 3. Generate Slots
    const availableSlots: string[] = []

    rules.forEach(rule => {
        let current = rule.start_time
        const end = rule.end_time
        const duration = rule.slot_duration_mins || 30

        while (current < end) {
            const timeStr = current.slice(0, 5) // HH:MM
            if (!bookedTimes.includes(timeStr)) {
                availableSlots.push(timeStr)
            }

            // Increment by duration (very basic string parsing for brevity in POC)
            const [h, m] = current.split(':').map(Number)
            const totalMins = h * 60 + m + duration
            const nextH = Math.floor(totalMins / 60)
            const nextM = totalMins % 60
            current = `${String(nextH).padStart(2, '0')}:${String(nextM).padStart(2, '0')}:00`
        }
    })

    return NextResponse.json(availableSlots)
}
