import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define admission status
const ADMISSION_STATUS = "Closed";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Block access to application routes if admissions are closed
  if (ADMISSION_STATUS === "Closed" && (
    req.nextUrl.pathname.startsWith('/apply') ||
    req.nextUrl.pathname.startsWith('/api/applications')
  )) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value;
        },
        set(name, value, options) {
          req.cookies.set({
            name,
            value,
            ...options,
          });
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name, options) {
          // Set expired cookies to properly remove them
          const cookieOptions = {
            ...(options || {}),
            expires: new Date(0),
            maxAge: 0
          };
          
          req.cookies.set({
            name,
            value: "",
            ...cookieOptions,
          });
          
          res.cookies.set({
            name,
            value: "",
            ...cookieOptions,
          });
        },
      },
    },
  );

  // Refresh session if expired - required for Server Components
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
  } catch (error) {
    console.error("Auth session error:", error);
  }

  return res;
}

// Ensure the middleware is only called for relevant paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api).*)",
  ],
};
