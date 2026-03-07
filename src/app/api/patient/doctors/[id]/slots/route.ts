import { createAdminClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createAdminClient()
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get('date') // Format: YYYY-MM-DD

    if (!dateStr) {
        return NextResponse.json({ error: 'Date is required' }, { status: 400 })
    }

    // 1. Get Doctor's Availability rules/slots for this date
    let { data: slots } = await supabase
        .from('availability')
        .select('*')
        .eq('doctor_id', id)
        .eq('date', dateStr)

    // Fallback to Day of Week rules if no specific slots for this date
    if (!slots || slots.length === 0) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        const dayName = days[new Date(dateStr).getUTCDay()]

        const { data: rules } = await supabase
            .from('availability')
            .select('*')
            .eq('doctor_id', id)
            .eq('day_of_week', dayName)
            .eq('is_active', true)

        if (rules && rules.length > 0) {
            // Generate slots from rules (usually one rule per day)
            const generatedSlots: any[] = []
            rules.forEach(rule => {
                let current = rule.start_time
                const end = rule.end_time || '17:00:00'
                const duration = rule.slot_duration_mins || 30

                while (current < end) {
                    generatedSlots.push({
                        start_time: current,
                        is_booked: false
                    })

                    // Add duration
                    const [h, m] = current.split(':').map(Number)
                    const totalMins = h * 60 + m + duration
                    const nextH = Math.floor(totalMins / 60)
                    const nextM = totalMins % 60
                    current = `${String(nextH).padStart(2, '0')}:${String(nextM).padStart(2, '0')}:00`
                }
            })
            slots = generatedSlots
        }
    }

    if (!slots || slots.length === 0) {
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

    // 3. Filter available slots
    const availableSlots: string[] = []

    slots.forEach(slot => {
        const timeStr = slot.start_time.slice(0, 5) // HH:MM
        if (!bookedTimes.includes(timeStr) && !slot.is_booked) {
            availableSlots.push(timeStr)
        }
    })

    // Sort the available slots
    availableSlots.sort((a, b) => a.localeCompare(b))

    return NextResponse.json(availableSlots)
}
