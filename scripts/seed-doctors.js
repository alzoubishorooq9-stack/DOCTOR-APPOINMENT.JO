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

const s = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || envVars.SUPABASE_SERVICE_ROLE_KEY);

const doctors = [
    { name: "Dr. Amy Khoury", specialty: "General Medicine", location: "Shmeisani, Amman", phone: "+96265938006", fee: 25, rating: 4.6, experience: "18 years", age: 45 },
    { name: "Dr. Kais Al-Balbissi", specialty: "Cardiology", location: "Abdali, Amman", phone: "+962775506070", fee: 40, rating: 4.8, experience: "22 years", age: 50 },
    { name: "Dr. Kareem Salhiyyah", specialty: "Cardiology & Surgery", location: "Khalda, Amman", phone: "+96265001234", fee: 35, rating: 4.7, experience: "20 years", age: 47 },
    { name: "Dr. Marwan Nimri", specialty: "Cardiology", location: "Jabal Amman", phone: "+96265001235", fee: 30, rating: 4.6, experience: "15 years", age: 40 },
    { name: "Dr. Mohammad Al-Arnaout", specialty: "Cardiology", location: "Gardens St", phone: "+96265001236", fee: 30, rating: 4.7, experience: "16 years", age: 42 },
    { name: "Dr. AbdelQader Qanna", specialty: "Cardiology", location: "Khalidi St", phone: "+96265001237", fee: 35, rating: 4.8, experience: "19 years", age: 48 },
    { name: "Dr. Amro Rashid", specialty: "Cardiology", location: "Sweifieh", phone: "+96265001238", fee: 35, rating: 4.5, experience: "14 years", age: 39 },
    { name: "Dr. Zyad Al-Habahbeh", specialty: "Pediatrics", location: "Tla Al-Ali", phone: "+96265001239", fee: 25, rating: 4.9, experience: "24 years", age: 52 },
    { name: "Dr. Hani Ababneh", specialty: "Internal Medicine", location: "Jabal Hussein", phone: "+96265001240", fee: 30, rating: 4.4, experience: "12 years", age: 38 },
    { name: "Dr. Faisal Tubileh", specialty: "Gastroenterology", location: "Razi Complex", phone: "+96265001241", fee: 35, rating: 4.7, experience: "20 years", age: 46 },
    { name: "Dr. Yousef Samara", specialty: "Cardiology", location: "3rd Circle", phone: "+96265001242", fee: 40, rating: 4.8, experience: "21 years", age: 49 },
    { name: "Dr. Hadi Abu Hantash", specialty: "Cardiology", location: "3rd Circle", phone: "+96265001243", fee: 35, rating: 4.6, experience: "18 years", age: 44 },
    { name: "Dr. Ahmad Al-Harasees", specialty: "Dermatology", location: "5th Circle", phone: "+96265001244", fee: 30, rating: 4.7, experience: "15 years", age: 41 },
    { name: "Dr. Ashraf Abu Alsamen", specialty: "Cardiology", location: "5th Circle", phone: "+96265001245", fee: 40, rating: 4.8, experience: "22 years", age: 51 },
    { name: "Dr. Hatem Al-Tarawneh", specialty: "Cardiology", location: "Khaldi Street", phone: "+96265924343", fee: 40, rating: 4.6, experience: "25 years", age: 53 },
    { name: "Dr. Mona Suleiman", specialty: "Internal Medicine", location: "5th Circle", phone: "+962770418500", fee: 25, rating: 4.4, experience: "13 years", age: 41 },
    { name: "Dr. Malek Aljemzaawi", specialty: "Internal Medicine", location: "Gardens Street", phone: "+962770418501", fee: 25, rating: 4.3, experience: "12 years", age: 39 },
    { name: "Dr. Firas Tarawneh", specialty: "Cardiology", location: "Abdoun", phone: "+962777775289", fee: 35, rating: 4.5, experience: "16 years", age: 44 },
    { name: "Dr. Manal Al-Zoubi", specialty: "Cardiology", location: "Khalda", phone: "+962798383682", fee: 35, rating: 4.6, experience: "17 years", age: 43 },
    { name: "Dr. Eyas Al-Mousa", specialty: "Cardiology", location: "Amman Medical Center", phone: "+962777123456", fee: 30, rating: 4.5, experience: "14 years", age: 40 }
];

async function seed() {
    console.log('Starting fixed seed process (merged bio)...');

    const { data: { users }, error: listError } = await s.auth.admin.listUsers({ perPage: 1000 });
    if (listError) {
        console.error('Failed to list users:', listError.message);
        return;
    }

    for (const doc of doctors) {
        process.stdout.write(`Seeding ${doc.name}... `);

        const email = doc.name.toLowerCase().replace(/ /g, '.').replace(/\./g, '') + '@example.com';
        const password = 'JordanianDoctors2026!';

        let userId;
        const existingUser = users.find(u => u.email === email);

        if (existingUser) {
            userId = existingUser.id;
        } else {
            const { data: newUser, error: createError } = await s.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: { role: 'doctor', full_name: doc.name }
            });
            if (createError) {
                console.log(`Error creating user ${email}:`, createError.message);
                continue;
            }
            userId = newUser.user.id;
        }

        // Upsert Profile
        const { error: pErr } = await s.from('profiles').upsert({
            id: userId,
            email,
            full_name: doc.name,
            role: 'doctor'
        });
        if (pErr) { console.log('Profile Error:', pErr.message); continue; }

        // Upsert Details - Merged all missing info into bio
        const { error: dErr } = await s.from('doctors_details').upsert({
            id: userId,
            specialty: doc.specialty,
            location: doc.location,
            fee: parseFloat(doc.fee),
            rating: parseFloat(doc.rating),
            bio: `${doc.name} (Age: ${doc.age}) is a ${doc.specialty} specialist with ${doc.experience} of experience. Contact: ${doc.phone}. Located in ${doc.location}.`
        });
        if (dErr) { console.log('Details Error:', dErr.message); continue; }

        // Services
        await s.from('services').delete().eq('doctor_id', userId);
        const { error: sErr } = await s.from('services').insert([
            { doctor_id: userId, name: 'Consultation', price: doc.fee, duration_mins: 30, status: 'active' },
            { doctor_id: userId, name: 'Follow-up', price: Math.floor(doc.fee * 0.5), duration_mins: 20, status: 'active' }
        ]);
        if (sErr) { console.log('Service Error:', sErr.message); }

        // Availability
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const timeSlots = days.map(d => ({
            doctor_id: userId,
            day_of_week: d,
            start_time: '09:00:00',
            end_time: '17:00:00',
            is_active: true,
            slot_duration_mins: 30
        }));

        await s.from('availability').delete().eq('doctor_id', userId);
        const { error: aErr } = await s.from('availability').insert(timeSlots);
        if (aErr) { console.log('Availability Error:', aErr.message); }

        console.log('Done.');
    }

    console.log('Seeding finished.');
}

seed();
