import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_COOKIE, verifyToken } from '@/lib/auth';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle CORS for API routes (authorisation is enforced inside each route handler)
  if (pathname.startsWith('/api')) {
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: { ...CORS_HEADERS, 'Access-Control-Max-Age': '86400' } });
    }
    const response = NextResponse.next();
    for (const [k, v] of Object.entries(CORS_HEADERS)) response.headers.set(k, v);
    return response;
  }

  // Protect the administration dashboard: only a valid ADMIN session may open /admin or /dashboard pages.
  const isProtected = (pathname.startsWith('/admin') && pathname !== '/admin/login') || pathname.startsWith('/dashboard');
  if (isProtected) {
    const session = verifyToken(request.cookies.get(ADMIN_COOKIE)?.value);
    if (!session || session.role !== 'ADMIN') {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }
  if (pathname === '/admin/login' && verifyToken(request.cookies.get(ADMIN_COOKIE)?.value)?.role === 'ADMIN') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/admin/:path*', '/dashboard/:path*'],
};
