import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const upstream = await fetch('https://prospektia.red.com.sv/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': process.env.API_KEY || '' },
      body: JSON.stringify(body),
    });
    const data = await upstream.json();
    if (!upstream.ok) return NextResponse.json(data, { status: upstream.status });
    return NextResponse.json(data);
  } catch (err) {
    console.error('[forgot-password route] error:', err);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}