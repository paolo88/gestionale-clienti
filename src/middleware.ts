import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // HARDCODED FALLBACK CREDENTIALS TO ENSURE STABILITY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://awsbpmvpaaruvlzzzivr.supabase.co";
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF3c2JwbXZwYWFydXZsenp6aXZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NDMzMTcsImV4cCI6MjA4MTExOTMxN30.6OSeQn1ghjHeLWyevv4QbO6I1M1VN9Y8rhk4jHK10TM";

    if (!supabaseUrl || !supabaseKey) {
        return NextResponse.json({ error: "Missing Supabase Credentials" }, { status: 500 });
    }

    const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
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

    // Allow access to ping route for debugging
    if (request.nextUrl.pathname.startsWith('/ping')) {
        return response
    }

    if (!user && !request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/auth')) {
        // Redirect to login if no user and trying to access protected route
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (user && request.nextUrl.pathname.startsWith('/login')) {
        // Redirect to dashboard if user is already logged in
        return NextResponse.redirect(new URL('/', request.url))
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
