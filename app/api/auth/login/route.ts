import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  try {
    const upstream = await fetch('http://200.35.189.139/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': process.env.API_KEY || '',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return NextResponse.json(data, { status: upstream.status });
    }

    const cookieOptions = `Path=/; HttpOnly; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    const secureFlag = process.env.NODE_ENV === 'production' ? '; Secure' : '';

    return NextResponse.json(
      { ok: true, user: data.user },
      {
        headers: {
          'Set-Cookie': `api_token=${data.token}; ${cookieOptions}${secureFlag}`,
        },
      }
    );
  } catch (err) {
    console.error('[login route] error:', err);
    return NextResponse.json({ error: 'No se pudo conectar al servidor de autenticación' }, { status: 502 });
  }
}