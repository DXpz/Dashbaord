import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login', '/api/auth'];

function parseJwtPayload(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const res = await fetch(`${req.url.origin}/api/auth/me`, {
    headers: { cookie: req.headers.get('cookie') || '' }
  });

  if (!res.ok) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const data = await res.json();
  const userRole = data?.user?.role;

  if (pathname.startsWith('/vendedor')) {
    if (userRole !== 'advisor') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  if ((pathname === '/' || pathname.startsWith('/asesores') || pathname.startsWith('/propuestas') || pathname.startsWith('/negociacion') || pathname.startsWith('/reuniones') || pathname.startsWith('/origen-leads') || pathname.startsWith('/gestion-asesores') || pathname.startsWith('/round-robin')) && userRole === 'advisor') {
    return NextResponse.redirect(new URL('/vendedor', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
};