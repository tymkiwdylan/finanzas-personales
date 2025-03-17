import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {


  const res = NextResponse.next();

  const pathname = req.nextUrl.pathname;
  // Allow all PWA-related static assets to bypass the middleware
  if (
    pathname.includes('/sw.js') ||
    pathname.includes('/workbox') ||
    pathname.includes('/manifest') ||
    pathname.includes('/icons-png') ||
    pathname.includes('/offline') ||
    pathname.endsWith('.json') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.svg')
  ) {
    return res; // Serve the file directly without further processing
  }
  
  const supabase = createMiddlewareClient({ req, res });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data: subscription } = await supabase
  .from('subscriptions')
  .select('subscription_status')
  .eq('user_id', session?.user?.id)
  .single()


  
  // Paths that don't require authentication
  const publicPaths = [
    '/', // Root path (landing page) should be accessible without authentication
    '/auth/login', 
    '/auth/register', 
    '/auth/reset-password', 
    '/auth/update-password',
    '/auth/callback',
    '/pricing',
    '/api/checkout',
    '/api/stripe-webhook'
  ];
  
  // Special handling for Stripe webhook to ensure it's always public
  if (req.nextUrl.pathname.startsWith('/api/stripe-webhook')) {
    return res;
  }

  const isPublicPath = publicPaths.some(path => 
    req.nextUrl.pathname === path || 
    req.nextUrl.pathname.startsWith(`${path}/`)
  );

  

  if ((subscription?.subscription_status !== 'active' && subscription?.subscription_status !== 'trialing') && !isPublicPath) {
    return NextResponse.redirect(new URL('/pricing', req.url))
  }
  
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
    // Only redirect from auth pages if the user is already logged in
    // Don't redirect from the landing page (/) or other public non-auth pages
    const isAuthPath = req.nextUrl.pathname.startsWith('/auth/');
    
    if (isAuthPath) {
      // Redirect to dashboard if accessing auth page with active session
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/';
      return NextResponse.redirect(redirectUrl);
    }
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
     * - PWA assets (manifest.json, sw.js, workbox files)
     * - Icon files
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-|icons-png|offline).*)',
  ],
};
