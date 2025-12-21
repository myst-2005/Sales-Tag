import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // We need to fetch profile data, so we need a supabase client with cookies
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Paths
    const isDashboard = request.nextUrl.pathname.startsWith('/dashboard')
    const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup')
    const isPending = request.nextUrl.pathname === '/pending'

    // If user is logged in, check approval
    if (user && (isDashboard || isAuthPage || request.nextUrl.pathname === '/')) {
        // Optimisation: Embed approval in metadata? Or fetch from DB?
        // Fetching from DB is safer but adds latency.
        // Profile could be null if trigger failed?

        const { data: profile } = await supabase
            .from('profiles')
            .select('is_approved')
            .eq('id', user.id)
            .single()

        const approved = profile?.is_approved

        if (!approved) {
            // If not approved, force to pending page (unless already there)
            if (!isPending) {
                return NextResponse.redirect(new URL('/pending', request.url))
            }
            return response
        } else {
            // If approved and trying to access auth/pending/root, go to dashboard
            if (isAuthPage || isPending || request.nextUrl.pathname === '/') {
                return NextResponse.redirect(new URL('/dashboard', request.url))
            }
        }
    }

    // Protected Routes Logic
    if (isDashboard && !user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Pending page shouldn't be accessed by guests? No, guests go to login.
    if (isPending && !user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
