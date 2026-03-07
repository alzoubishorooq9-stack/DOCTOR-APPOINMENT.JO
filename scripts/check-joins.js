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
    const { data, error } = await supabase.rpc('get_table_info', { table_name: 'bookings' });
    if (error) {
        // Fallback: check columns and common join patterns
        console.log('Error fetching table info, trying direct column check');
        const { data: cols } = await supabase.from('bookings').select('*').limit(1);
        console.log('Columns:', Object.keys(cols[0] || {}));
    } else {
        console.log(data);
    }

    // Check if we can join profiles through patient_id
    const { data: joinTest, error: joinError } = await supabase
        .from('bookings')
        .select('id, patient:profiles!patient_id(full_name)')
        .limit(1);

    if (joinError) {
        console.log('Join Error (!patient_id):', joinError.message);
        // Try without the bang
        const { data: joinTest2, error: joinError2 } = await supabase
            .from('bookings')
            .select('id, profiles(full_name)')
            .limit(1);
        if (joinError2) {
            console.log('Join Error (profiles):', joinError2.message);
        } else {
            console.log('Join Success (profiles)');
        }
    } else {
        console.log('Join Success (!patient_id)');
    }
}

check();
