import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const cookieToken = req.cookies.get('access_token')?.value;
  const token = authHeader?.replace('Bearer ', '') || cookieToken;

  if (!token) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  try {
    const upstream = await fetch(`http://200.35.189.139/api/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': 'RedApi_2026_SuperSegura_9XK2',
        'ngrok-skip-browser-warning': 'true',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return NextResponse.json(data, { status: 401 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Error al verificar sesión' }, { status: 502 });
  }
}