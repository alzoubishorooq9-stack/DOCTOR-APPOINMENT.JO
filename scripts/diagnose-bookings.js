const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function diagnose() {
    console.log('--- Columns in doctors_details ---');
    const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'doctors_details' });

    // If RPC doesn't exist, use traditional way
    const { data: records, error: err } = await supabase.from('doctors_details').select('*').limit(1);
    if (records && records.length > 0) {
        console.log(JSON.stringify(Object.keys(records[0]), null, 2));
        console.log('Sample record:', JSON.stringify(records[0], null, 2));
    }

    console.log('\n--- Columns in bookings ---');
    const { data: bRecords, error: bErr } = await supabase.from('bookings').select('*').limit(1);
    if (bRecords && bRecords.length > 0) {
        console.log(JSON.stringify(Object.keys(bRecords[0]), null, 2));
        console.log('Sample record:', JSON.stringify(bRecords[0], null, 2));
    }
}

diagnose();
