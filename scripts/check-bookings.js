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
    console.log('--- Doctors ---');
    const { data: doctors } = await supabase.from('profiles').select('id, full_name').eq('role', 'doctor').limit(5);
    console.log(doctors);

    console.log('\n--- Recent Bookings ---');
    const { data: bookings } = await supabase.from('bookings').select('*, profiles!patient_id(full_name)').order('created_at', { ascending: false }).limit(5);
    console.log(bookings);
}

check();
