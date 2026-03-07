import { createClient, createAdminClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const admin = await createAdminClient()

        // Ensure user is a doctor
        const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single()
        if (profile?.role?.toUpperCase() !== 'DOCTOR') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const formData = await request.formData()
        const file = formData.get('avatar') as File

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
        }

        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${fileName}`

        // Upload to avatars bucket
        const { error: uploadError } = await admin.storage
            .from('avatars')
            .upload(filePath, file, {
                contentType: file.type,
                upsert: true
            })

        if (uploadError) {
            console.error('Upload Error:', uploadError)
            // If the bucket doesn't exist, we might get an error. Attempt to create the bucket (Note: createBucket usually requires higher privileges, but admin client should have it)
            if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('does not exist')) {
                await admin.storage.createBucket('avatars', { public: true })
                // Retry upload
                const { error: retryError } = await admin.storage
                    .from('avatars')
                    .upload(filePath, file, {
                        contentType: file.type,
                        upsert: true
                    })
                if (retryError) {
                    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
                }
            } else {
                return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
            }
        }

        // Get public URL
        const { data: { publicUrl } } = admin.storage
            .from('avatars')
            .getPublicUrl(filePath)

        // Update profile in database
        const { error: updateError } = await admin.from('profiles')
            .update({ avatar_url: publicUrl })
            .eq('id', user.id)

        if (updateError) {
            console.error('Update Error:', updateError)
            return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
        }

        try {
            revalidatePath('/doctors', 'layout');
            revalidatePath(`/doctors/${user.id}`, 'page');
            revalidatePath('/', 'layout');
        } catch (e) {
            console.error('Failed to revalidate path', e);
        }

        return NextResponse.json({ avatar_url: publicUrl })
    } catch (error) {
        console.error('Server error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
