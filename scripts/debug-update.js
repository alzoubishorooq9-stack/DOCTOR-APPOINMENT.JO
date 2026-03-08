require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testUpdate() {
    const doctorId = '0e8a54d9-db81-4619-b122-f74d7a683f8b';
    // Let's get one pending booking
    const { data: booking } = await supabase
        .from('bookings')
        .select('id')
        .eq('doctor_id', doctorId)
        .limit(1)
        .single();

    if (!booking) {
        console.log('No booking found');
        return;
    }

    console.log(`Trying to update booking ${booking.id}...`);

    const { data, error } = await supabase
        .from('bookings')
        .update({ status: 'confirmed', updated_at: new Date().toISOString() })
        .eq('id', booking.id)
        .select()
        .single();

    if (error) {
        console.error('ERROR ENCOUNTERED:', error);
    } else {
        console.log('Successfully updated:', data);

        // revert
        await supabase.from('bookings').update({ status: 'pending' }).eq('id', booking.id);
    }
}

testUpdate();
