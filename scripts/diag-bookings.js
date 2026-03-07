const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envLocalPath = path.join(process.cwd(), '.env.local');
const envLocal = fs.readFileSync(envLocalPath, 'utf8');
const envVars = Object.fromEntries(
    envLocal.split('\n').filter(line => line.includes('=')).map(line => line.split('=').map(s => s.trim()))
);

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    const { data: doctors } = await supabase.from('profiles').select('id, full_name, role').eq('role', 'doctor');
    console.log('Doctors (profiles):', doctors.length);

    const { data: details } = await supabase.from('doctors_details').select('id');
    console.log('Doctor Details:', details.length);

    const { data: bookings } = await supabase.from('bookings').select('id, doctor_id, patient_id, status, created_at').order('created_at', { ascending: false }).limit(10);
    console.log('Recent Bookings:');
    bookings.forEach(b => {
        const doc = doctors.find(d => d.id === b.doctor_id);
        console.log(`- ID: ${b.id}, DocID: ${b.doctor_id}, DocName: ${doc ? doc.full_name : 'NOT FOUND'}, Status: ${b.status}`);
    });
}

check();
