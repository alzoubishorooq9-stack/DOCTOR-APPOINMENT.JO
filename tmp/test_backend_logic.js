const { createClient } = require('@supabase/supabase-js');

// Hardcoded for quick local verification of the "Empty Shell" DB connection
const supabaseUrl = 'https://sqkhyyhfsimmbxnamrcg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxa2h5eWhmc2ltbWJ4bmFtcmNnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIwODM3OCwiZXhwIjoyMDg3Nzg0Mzc4fQ.d6LdpAzAPbmXs9T1FqrARrNXYmj3TJUwpcA4Z48IUWo';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBackend() {
    console.log('--- Testing Doctor Filtering ---');
    const { data: doctors, error } = await supabase
        .from('doctors_details')
        .select('*, profiles(full_name)')
        .limit(5);

    if (error) {
        console.error('Error fetching doctors:', error);
    } else {
        console.log('Doctors found:', doctors.length);
        doctors.forEach(d => console.log(`- ${d.profiles?.full_name || 'Anonymous'} (${d.specialty})`));
    }

    console.log('\n--- Testing Booking Structure ---');
    const { data: bookings, error: bError } = await supabase
        .from('bookings')
        .select('id, status')
        .limit(1);

    if (bError) {
        console.error('Error fetching bookings:', bError);
    } else {
        console.log('Bookings table accessible. Found:', bookings.length);
    }
}

testBackend();
