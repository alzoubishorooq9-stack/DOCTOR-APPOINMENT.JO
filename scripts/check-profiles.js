const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables manually from .env.local
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

async function check() {
    const tables = ['profiles', 'profile', 'doctors', 'users'];
    for (const t of tables) {
        try {
            const { error, data } = await s.from(t).select('id').limit(1);
            if (error) {
                console.log(`${t}: ERROR (${error.message})`);
            } else {
                console.log(`${t}: OK`);
            }
        } catch (e) {
            console.log(`${t}: EXCEPTION (${e.message})`);
        }
    }
}

check();
