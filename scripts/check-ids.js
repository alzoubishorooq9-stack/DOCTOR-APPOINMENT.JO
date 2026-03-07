const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const fs = require('fs');
    const { data: doctors } = await supabase.from('doctors_details').select('id, specialty');
    const { data: profiles } = await supabase.from('profiles').select('id, full_name, role').eq('role', 'doctor');
    const { data: bookings } = await supabase.from('bookings').select('id, doctor_id, status');

    const output = { doctors, profiles, bookings };
    fs.writeFileSync('scripts/ids-output.json', JSON.stringify(output, null, 2));
    console.log('Done, check ids-output.json');
}
check();
