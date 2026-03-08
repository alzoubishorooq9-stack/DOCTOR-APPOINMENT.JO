require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectUsers() {
    const { data: bookings } = await supabase
        .from('bookings')
        .select('doctor_id')
        .order('created_at', { ascending: false })
        .limit(5);

    const doctorIds = [...new Set(bookings.map(b => b.doctor_id))];

    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .in('id', doctorIds);

    console.log('--- DOCTORS FROM RECENT BOOKINGS ---');
    console.log(profiles);
}

inspectUsers();
