import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const supabase = await createClient()

        // Get current user
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 1. Total Bookings
        const { count: totalBookings, error: bookingsError } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .eq('patient_id', user.id)

        // 2. Completed Bookings (Past)
        const now = new Date().toISOString()
        const { count: completedBookings, error: completedError } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .eq('patient_id', user.id)
            .eq('status', 'completed')

        // 3. Upcoming Bookings
        const { count: upcomingBookings, error: upcomingError } = await supabase
            .from('bookings')
            .select('*', { count: 'exact', head: true })
            .eq('patient_id', user.id)
            .eq('status', 'confirmed')
            .gte('appointment_date', now.split('T')[0])

        // 4. Total Spent (optional, but good for "Total Sessions" or similar)
        // For now let's just return counts since there's no health stats table

        return NextResponse.json({
            total_appointments: totalBookings || 0,
            completed_appointments: completedBookings || 0,
            upcoming_appointments: upcomingBookings || 0,
            // Placeholder health stats since they aren't in DB yet
            health_stats: {
                heart_rate: 72,
                hydration: 80,
                activity: 85
            }
        })

    } catch (error: any) {
        console.error('Stats API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
