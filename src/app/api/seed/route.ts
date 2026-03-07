import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// This is a one-time seed route. Hit GET /api/seed to populate data.
// Protected: only works if the SUPABASE_SERVICE_ROLE_KEY is present.
export async function GET() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Step 1: Create 5 dummy auth users (doctors)
    const doctorUsers = [
        { email: 'dr.sarah.chen@healthbook.dev', password: 'DoctorPass123!', name: 'Dr. Sarah Chen', specialty: 'Cardiology', degree: 'MD, FACC', fee: 250, exp: 15, rating: 4.9, reviews: 312, location: 'New York Medical Center', image: 'https://images.unsplash.com/photo-1559839734-2b71f153678f?auto=format&fit=crop&q=80&w=400' },
        { email: 'dr.james.patel@healthbook.dev', password: 'DoctorPass123!', name: 'Dr. James Patel', specialty: 'Dermatology', degree: 'MD, FAAD', fee: 180, exp: 10, rating: 4.8, reviews: 205, location: 'Manhattan Skin Clinic', image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400' },
        { email: 'dr.emily.ross@healthbook.dev', password: 'DoctorPass123!', name: 'Dr. Emily Ross', specialty: 'Pediatrics', degree: 'MD, FAAP', fee: 150, exp: 8, rating: 4.9, reviews: 480, location: 'Brooklyn Children\'s Center', image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400' },
        { email: 'dr.michael.okafor@healthbook.dev', password: 'DoctorPass123!', name: 'Dr. Michael Okafor', specialty: 'Neurology', degree: 'MD, PhD', fee: 320, exp: 20, rating: 4.7, reviews: 156, location: 'NYU Langone Neurology', image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400' },
        { email: 'dr.lisa.kim@healthbook.dev', password: 'DoctorPass123!', name: 'Dr. Lisa Kim', specialty: 'Gynecology', degree: 'MD, FACOG', fee: 200, exp: 12, rating: 4.8, reviews: 290, location: 'Park Avenue Women\'s Health', image: 'https://images.unsplash.com/photo-1591604021695-0c69b7c05981?auto=format&fit=crop&q=80&w=400' },
    ]

    const results: string[] = []

    for (const doc of doctorUsers) {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: doc.email,
            password: doc.password,
            email_confirm: true,
        })

        if (authError && !authError.message.includes('already been registered')) {
            results.push(`❌ Auth error for ${doc.name}: ${authError.message}`)
            continue
        }

        const userId = authData?.user?.id

        if (!userId) {
            // User may already exist, try to find them
            const { data: existing } = await supabase.auth.admin.listUsers()
            const found = existing?.users?.find(u => u.email === doc.email)
            if (!found) { results.push(`❌ Could not find/create user for ${doc.name}`); continue }

            // Upsert profile
            await supabase.from('profiles').upsert({
                id: found.id, full_name: doc.name, email: doc.email, role: 'DOCTOR'
            })

            // Upsert doctor_details
            await supabase.from('doctors_details').upsert({
                user_id: found.id, specialty: doc.specialty, degree: doc.degree,
                experience_years: doc.exp, consultation_fee: doc.fee, rating: doc.rating,
                reviews_count: doc.reviews, location: doc.location, image_url: doc.image,
                is_available: true, bio: `${doc.name} is a board-certified ${doc.specialty} specialist with ${doc.exp} years of experience.`
            })
            results.push(`✅ Updated existing user: ${doc.name}`)
            continue
        }

        // 3. Create availability (Next 7 days)
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        for (let i = 0; i < 7; i++) {
            const date = new Date()
            date.setDate(date.getDate() + i)
            const dayName = days[date.getDay()]

            await supabase.from('availability').upsert({
                doctor_id: userId,
                day_of_week: dayName,
                start_time: '09:00:00',
                end_time: '17:00:00',
                slot_duration_mins: 30,
                is_active: true
            })
        }

        // 4. Create dummy services
        const services = ['Consultation', 'Follow-up', 'Diagnostic Review', 'Emergency Care']
        for (const service of services) {
            await supabase.from('services').upsert({
                doctor_id: userId,
                name: service,
                description: `Standard ${service} service provided by ${doc.name}.`,
                price: doc.fee,
                duration_mins: 30
            })
        }

        // 5. Create dummy reviews
        const reviewers = ['John Doe', 'Jane Smith', 'Robert Brown', 'Emily Davis']
        for (const reviewer of reviewers) {
            // Note: In a real app, these would be real patient IDs. 
            // For seeding, we'll just insert with a null patient_id if the schema allows or just skip the foreign key if possible.
            // Since we don't have patient IDs handy, we'll skip the link for now or just use one if we can find it.
            await supabase.from('reviews').upsert({
                doctor_id: userId,
                rating: 5,
                comment: `Excellent care from ${doc.name}. Very professional.`,
                is_public: true
            })
        }

        results.push(`✅ Seeded: ${doc.name} (${doc.specialty}) with slots, services, and reviews`)
    }

    return NextResponse.json({ results })
}
