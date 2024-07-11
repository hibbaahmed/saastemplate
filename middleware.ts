import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { protectedPaths } from './lib/constant/index';  // Import the protected paths

export async function middleware(req) {
  const res = NextResponse.next();
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    }

  )

  const { data: { user } } = await supabase.auth.getUser();
  const url = new URL(req.url);

  if (user) {
    if (url.pathname === "/") {
      return NextResponse.redirect(new URL("/voiceover", req.url));
    }
    return res;
  } else {
    if (protectedPaths.includes(url.pathname)) {
      return NextResponse.redirect(new URL("/auth", req.url));
    }
    return res;
  }
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // Feel free to modify this pattern to include more paths.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};