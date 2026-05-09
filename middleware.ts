import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

const PUBLIC_PATHS = ['/login', '/api/auth'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const cookieStore = req.cookies;
  const token = cookieStore.get('session')?.value;
  let user = null;
  if (token) {
    const payload = Buffer.from(token, 'base64').toString('utf-8');
    try {
      user = JSON.parse(payload);
    } catch { /* invalid */ }
  }

  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (pathname.startsWith('/vendedor') && user.role !== 'vendedor') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  if ((pathname === '/' || pathname.startsWith('/asesores') || pathname.startsWith('/propuestas') || pathname.startsWith('/negociacion') || pathname.startsWith('/reuniones') || pathname.startsWith('/origen-leads') || pathname.startsWith('/gestion-asesores') || pathname.startsWith('/round-robin')) && user.role === 'vendedor') {
    return NextResponse.redirect(new URL('/vendedor', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
};