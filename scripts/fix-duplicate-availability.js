/**
 * fix-duplicate-availability.js
 * Removes duplicate availability rows for the same (doctor_id, day_of_week) pair.
 * Keeps the latest row (highest id) and deletes all duplicates.
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envLocalPath = path.join(process.cwd(), '.env.local');
const envLocal = fs.readFileSync(envLocalPath, 'utf8');
const envVars = {};
envLocal.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) {
        envVars[key.trim()] = value.join('=').trim().replace(/^"(.*)"$/, '$1');
    }
});

const s = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

async function fixDuplicates() {
    console.log('Fetching all availability rows...');
    const { data: rows, error } = await s.from('availability').select('id, doctor_id, day_of_week').order('id');

    if (error) {
        console.error('Error fetching rows:', error.message);
        return;
    }

    console.log(`Total rows: ${rows.length}`);

    // Find duplicates: group by (doctor_id, day_of_week), keep one, collect rest for deletion
    const seen = new Map();
    const toDelete = [];

    for (const row of rows) {
        const key = `${row.doctor_id}__${row.day_of_week}`;
        if (seen.has(key)) {
            toDelete.push(row.id); // mark as duplicate
        } else {
            seen.set(key, row.id); // keep first occurrence
        }
    }

    if (toDelete.length === 0) {
        console.log('✅ No duplicate rows found. Database is clean!');
        return;
    }

    console.log(`Found ${toDelete.length} duplicate rows. Deleting...`);

    // Delete in batches of 50
    const batchSize = 50;
    for (let i = 0; i < toDelete.length; i += batchSize) {
        const batch = toDelete.slice(i, i + batchSize);
        const { error: delErr } = await s.from('availability').delete().in('id', batch);
        if (delErr) {
            console.error('Delete error:', delErr.message);
        } else {
            console.log(`Deleted batch ${Math.floor(i / batchSize) + 1}: ${batch.length} rows`);
        }
    }

    // Verify final count
    const { count } = await s.from('availability').select('*', { count: 'exact', head: true });
    console.log(`✅ Done! Remaining rows: ${count} (expected ${rows.length - toDelete.length})`);
}

fixDuplicates();
