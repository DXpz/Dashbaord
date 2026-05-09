import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('api_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  try {
    const upstream = await fetch('http://200.35.189.139/api/auth/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': process.env.API_KEY || '',
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