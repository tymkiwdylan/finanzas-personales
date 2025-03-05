import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  // Paths that don't require authentication
  const publicPaths = [
    '/auth/login', 
    '/auth/register', 
    '/auth/reset-password', 
    '/auth/update-password',
    '/auth/callback',
    '/landing'
  ];
  
  const isPublicPath = publicPaths.some(path => 
    req.nextUrl.pathname.startsWith(path)
  );
  
  // Special case for auth callback route
  if (req.nextUrl.pathname === '/auth/callback') {
    return res;
  }
  
  // Check auth condition
  if (!session && !isPublicPath) {
    // Allow service worker and manifest access
    if (
      req.nextUrl.pathname.includes('/manifest') || 
      req.nextUrl.pathname.includes('/sw') ||
      req.nextUrl.pathname.includes('/workbox') ||
      req.nextUrl.pathname.includes('/offline')
    ) {
      return res;
    }
    
    // Redirect to login if accessing protected page without session
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/auth/login';
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  if (session && isPublicPath) {
    // Redirect to dashboard if accessing auth page with active session
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/';
    return NextResponse.redirect(redirectUrl);
  }
  
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public|icons).*)',
  ],
};
