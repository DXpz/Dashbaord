import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('api_token')?.value;

  if (token) {
    try {
      await fetch('http://200.35.189.139/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': process.env.API_KEY || '',
          'ngrok-skip-browser-warning': 'true',
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch { /* ignore */ }
  }

  const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : '';

  return NextResponse.json(
    { ok: true, message: 'Sesión cerrada' },
    {
      headers: {
        'Set-Cookie': `api_token=; Path=/; Max-Age=0; SameSite=Lax${secureFlag}`,
      },
    }
  );
}