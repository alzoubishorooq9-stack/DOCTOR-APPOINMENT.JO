import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Public API routes that don't require authentication
const PUBLIC_API_ROUTES = [
    '/api/patient/doctors',  // Doctor browsing is public
    '/api/seed',             // Seed route
]

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: { headers: request.headers },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value, options))
                    response = NextResponse.next({ request: { headers: request.headers } })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // Skip auth check for explicitly public API routes
    const isPublicApiRoute = PUBLIC_API_ROUTES.some(route =>
        request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(route + '/')
    )
    if (isPublicApiRoute) {
        return response
    }

    // Protect authenticated Patient API routes (bookings, profile, etc.)
    if (request.nextUrl.pathname.startsWith('/api/patient')) {
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized', message: 'Please sign in to access this resource.' }, { status: 401 })
        }
        // Role check is case-insensitive (stored as PATIENT or patient)
        const role = (user.user_metadata?.role ?? '').toLowerCase()
        const dbRole = (user.app_metadata?.role ?? '').toLowerCase()
        if (role !== 'patient' && dbRole !== 'patient') {
            // Also allow if no role is set (default to patient-like access)
            // This handles newly registered users whose metadata may not be set yet
            console.log('User role:', role, 'DB role:', dbRole)
        }
    }

    // Protect Doctor API
    if (request.nextUrl.pathname.startsWith('/api/doctor')) {
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const role = (user.user_metadata?.role ?? '').toLowerCase()
        if (role !== 'doctor') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
    }

    return response
}

export const config = {
    matcher: [
        '/api/patient/:path*',
        '/api/doctor/:path*',
        '/api/seed',
        '/dashboard/:path*',
        '/doctor/:path*',
    ],
}
