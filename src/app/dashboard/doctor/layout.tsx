import Sidebar from '@/doctor-frontend/components/Sidebar'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'

export default async function DoctorDashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    // 1. Verify Authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // 2. Verify DOCTOR role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role?.toUpperCase() !== 'DOCTOR') {
        // Patients shouldn't see this
        redirect('/dashboard/patient')
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row">
            <Sidebar />
            <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
                {children}
            </div>
        </div>
    )
}
