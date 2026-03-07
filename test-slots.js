const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const dateStr = '2026-03-07'; // Saturday
    const { data: profile } = await supabase.from('profiles').select('id').eq('full_name', 'Dr. Amy Khoury').single();

    if (!profile) {
        console.log('Doctor not found');
        return;
    }

    const id = profile.id;
    console.log('Testing for Doctor ID:', id);

    // 1. Get Doctor's Availability Rules
    const dateObj = new Date(dateStr);
    const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    console.log('Date String:', dateStr);
    console.log('Computed Day of Week:', dayOfWeek);

    const { data: rules, error: rErr } = await supabase
        .from('availability')
        .select('*')
        .eq('doctor_id', id)
        .eq('day_of_week', dayOfWeek)
        .eq('is_active', true);

    if (rErr) {
        console.error('Rules Error:', rErr);
    }

    console.log('Found Rules:', rules);

    if (!rules || rules.length === 0) {
        console.log('No availability for this day');
        return;
    }

    // 2. Get Existing Bookings
    const { data: bookings } = await supabase
        .from('bookings')
        .select('appointment_time')
        .eq('doctor_id', id)
        .eq('appointment_date', dateStr)
        .not('status', 'eq', 'cancelled');

    console.log('Found Bookings:', bookings);
}

test();
