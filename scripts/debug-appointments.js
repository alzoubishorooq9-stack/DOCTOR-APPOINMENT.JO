require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectBookings() {
    console.log('Fetching recent bookings...');

    const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error fetching bookings:', error);
        return;
    }

    console.log('--- RECENT BOOKINGS ---');
    data.forEach(b => {
        console.log(`ID: ${b.id}`);
        console.log(`Patient ID: ${b.patient_id}`);
        console.log(`Doctor ID: ${b.doctor_id}`);
        console.log(`Status: ${b.status}`);
        console.log(`Date: ${b.appointment_date}`);
        console.log('---------------------');
    });
}

inspectBookings();
