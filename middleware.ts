import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/signup", "/pending-approval"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) =>
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          ),
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Allow API routes through — they handle their own auth
  if (pathname.startsWith("/api/")) return response;

  // Redirect authenticated users away from auth pages
  if (user && PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Unauthenticated users can only access public paths
  if (!user && !PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_approved, is_admin")
      .eq("id", user.id)
      .single();

    // Approved users don't need the pending page
    if (pathname === "/pending-approval" && profile?.is_approved) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Unapproved users can only see pending-approval
    if (!profile?.is_approved && pathname !== "/pending-approval") {
      return NextResponse.redirect(new URL("/pending-approval", request.url));
    }

    // Admin-only routes
    if (pathname.startsWith("/admin") && !profile?.is_admin) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
