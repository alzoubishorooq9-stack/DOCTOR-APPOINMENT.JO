// @ts-nocheck
import { createAdminClient } from '@/lib/supabase-server';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    // Fetch unique specialties from the database dynamically
    let specialtiesList = 'General Practice, Cardiology, Dermatology, Pediatrics, Neurology, Orthopedics';
    try {
        const admin = await createAdminClient();
        const { data: doctorsDetails, error } = await admin
            .from('doctors_details')
            .select('specialty')
            .not('specialty', 'is', null);

        if (!error && doctorsDetails) {
            const uniqueSpecialties = Array.from(
                new Set(doctorsDetails.map(d => d.specialty?.trim()).filter(Boolean))
            );
            if (uniqueSpecialties.length > 0) {
                specialtiesList = uniqueSpecialties.join(', ');
            }
        }
    } catch (e) {
        console.error('DB fetch error (using fallback):', e);
    }

    const systemPrompt = `
You are the "HealthBook Triage Navigator," an empathetic, professional, and concise virtual assistant for the DOCTOR-APPOINMENT.JO medical booking platform.

CORE OBJECTIVE:
Help patients identify the most appropriate medical specialty based on their described symptoms and answer basic questions about how to use the platform to book an appointment.

STRICT SAFETY RULES:
1. You are NOT a doctor. You cannot diagnose conditions or prescribe medications.
2. For medical emergencies (chest pain, stroke, severe bleeding), immediately instruct the patient to call emergency services (911) or go to the nearest ER.
3. Always clarify that specialty suggestions are for navigation only, not a medical diagnosis.

BEHAVIOR & TONE:
- Keep responses short, readable, and friendly.
- Map symptoms to available specialties on the platform: ${specialtiesList}.
- For booking questions: go to 'Find Doctors', select a specialist, choose a time slot, click 'Request Appointment'.

Only answer questions related to medical triage, specialty matching, and the booking platform.
  `;

    try {
        const { text } = await generateText({
            model: google('gemini-2.0-flash'),
            system: systemPrompt,
            messages,
            maxRetries: 0,
        });

        if (!text || text.trim().length === 0) {
            return new Response("I am currently experiencing high traffic. Please try again in a moment, or feel free to book an appointment directly through the Find Doctors page.", {
                status: 200,
                headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            });
        }

        return new Response(text, {
            status: 200,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
    } catch (error: any) {
        console.error('Gemini API error:', error?.statusCode, error?.message);
        return new Response("I am currently experiencing high traffic. Please try again in a moment, or feel free to book an appointment directly through the Find Doctors page.", {
            status: 200,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
    }
}
