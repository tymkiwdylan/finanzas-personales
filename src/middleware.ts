import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;

  // Allow all static assets to bypass authentication checking
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
  
  // Create Supabase client
  const supabase = createMiddlewareClient({ req, res });
  
  // Get session with minimal calls to prevent rate limiting
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Only fetch subscription data if user is logged in and accessing protected routes
  let subscription = null;
  if (session?.user?.id) {
    // Optimize subscription check - only perform for protected routes
    const isPublicPath = isPublicRoute(pathname);
    
    if (!isPublicPath) {
      const { data } = await supabase
        .from('subscriptions')
        .select('subscription_status')
        .eq('user_id', session.user.id)
        .single();
      subscription = data;
    }
  }


  
  // Function to check if a route is public
  function isPublicRoute(path: string): boolean {
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
    
    return publicPaths.some(publicPath => 
      path === publicPath || 
      path.startsWith(`${publicPath}/`)
    );
  }
  
  // Special handling for Stripe webhook to ensure it's always public
  if (req.nextUrl.pathname.startsWith('/api/stripe-webhook')) {
    return res;
  }

  const isPublicPath = isPublicRoute(pathname);

  

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
    // Check if this is the root path or an auth path
    const isRootPath = req.nextUrl.pathname === '/';
    const isAuthPath = req.nextUrl.pathname.startsWith('/auth/');
    
    if (isRootPath || isAuthPath) {
      // Redirect to dashboard if accessing root or auth page with active session
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/dashboard';
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
