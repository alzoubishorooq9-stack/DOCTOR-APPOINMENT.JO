require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDoctorQuery() {
    const doctorId = '0e8a54d9-db81-4619-b122-f74d7a683f8b';
    console.log(`Querying bookings for doctor: ${doctorId}`);

    const { data, error } = await supabase
        .from('bookings')
        .select(`
        *,
        patient:profiles!patient_id(full_name, avatar_url, phone_number),
        services(name, price, duration_mins)
    `)
        .eq('doctor_id', doctorId)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

    if (error) {
        console.error('ERROR ENCOUNTERED:', error);
    } else {
        console.log(`Found ${data.length} bookings.`);
        if (data.length > 0) {
            console.log('Sample booking:', JSON.stringify(data[0], null, 2));
        }
    }
}

checkDoctorQuery();
