import { type NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from './constants';
import { getUserData } from './lib/services/user-service';

const protectedRoutes = ["/dashboard", "/prediksi", "/produk-saya", "/notifikasi", "/asisten"];
const adminRoutes = ["/admin"];

export async function middleware(request: NextRequest) {
  const session = request.cookies.get(SESSION_COOKIE_NAME)?.value || '';
  const { pathname, origin } = request.nextUrl;

  // Allow public routes (auth pages)
  if (pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  // Protect routes
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
  if (!session && isProtected) {
    const loginURL = new URL("/auth/login", origin);
    loginURL.searchParams.set("next", pathname);
    return NextResponse.redirect(loginURL);
  }

  // Check for admin routes
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  // if (isAdminRoute) {
  //   // Check if not logged in
  //   if (!session) {
  //     const loginURL = new URL("/auth/login", origin);
  //     loginURL.searchParams.set("next", pathname);
  //     return NextResponse.redirect(loginURL);
  //   }
    
  //   try {
  //     // Verify if user has admin role
  //     const userData = await getUserData(session);
      
  //     if (!userData || userData.role !== 'admin') {
  //       // Redirect to homepage if not admin
  //       return NextResponse.redirect(new URL('/', origin));
  //     }
  //   } catch (error) {
  //     console.error('Error checking admin access:', error);
  //     return NextResponse.redirect(new URL('/', origin));
  //   }
  // }

  // Prevent logged-in users from accessing root
  // if (session && pathname === ROOT_ROUTE) {
  //   const homeURL = new URL(HOME_ROUTE, origin);
  //   return NextResponse.redirect(homeURL);
  // }

  return NextResponse.next();
}


export const config = {
  matcher: [
    "/dashboard/:path*",
    "/prediksi/:path*",
    "/produk-saya/:path*",
    "/notifikasi/:path*",
    "/asisten/:path*",
    "/admin/:path*",
  ],
};
