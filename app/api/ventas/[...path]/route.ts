/**
 * Proxy dedicado para el backend de Ventas.
 *
 * Recibe requests del browser (same-origin /api/ventas/*) y los reenvia
 * a https://prospektia.red.com.sv/api/ventas/* agregando el header
 * Authorization: Bearer <token> desde la cookie api_token (que es httponly
 * y por eso el cliente del browser no puede leerla).
 *
 * Esto evita problemas de CORS (es same-origin desde el browser) y de
 * SameSite cookies (el browser envia cookies a same-origin por default).
 */

import { NextRequest, NextResponse } from 'next/server';

const UPSTREAM = 'https://prospektia.red.com.sv';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-API-Key, Authorization, ngrok-skip-browser-warning',
  'Access-Control-Max-Age': '86400',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

async function handle(req: NextRequest): Promise<NextResponse> {
  const token = req.cookies.get('api_token')?.value;
  if (!token) {
    return NextResponse.json({ detail: 'No autenticado' }, { status: 401 });
  }

  // Path: /api/ventas/{...rest} -> https://prospektia.red.com.sv/api/ventas/{...rest}
  const pathAfterVentas = req.nextUrl.pathname.replace(/^\/api\/ventas\/?/, '');
  const search = req.nextUrl.search;
  const target = `${UPSTREAM}/api/ventas/${pathAfterVentas}${search}`;

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
    'X-API-Key': process.env.API_KEY || '',
    'ngrok-skip-browser-warning': 'true',
  };
  const contentType = req.headers.get('content-type');
  if (contentType) headers['content-type'] = contentType;

  let body: string | undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    try {
      body = await req.text();
    } catch {
      body = undefined;
    }
  }

  try {
    const upstream = await fetch(target, {
      method: req.method,
      headers,
      body,
      cache: 'no-store',
    });
    const buffer = Buffer.from(await upstream.arrayBuffer());
    const out = new NextResponse(buffer, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('content-type') || 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
    return out;
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Error conectando al upstream', detail: String(err), target },
      { status: 502 }
    );
  }
}

export async function GET(req: NextRequest) { return handle(req); }
export async function POST(req: NextRequest) { return handle(req); }
export async function PUT(req: NextRequest) { return handle(req); }
export async function PATCH(req: NextRequest) { return handle(req); }
export async function DELETE(req: NextRequest) { return handle(req); }
