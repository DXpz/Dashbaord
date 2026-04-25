import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}

export async function PATCH(request: NextRequest) {
  return handleRequest(request);
}

export async function DELETE(request: NextRequest) {
  return handleRequest(request);
}

async function handleRequest(req: NextRequest) {
  const base = (process.env.API_UPSTREAM ?? '').trim().replace(/\/+$/, '');
  if (!base) {
    return NextResponse.json({ error: 'API_UPSTREAM no definida en Vercel.' }, { status: 500 });
  }

  const { searchParams } = req.nextUrl;
  const pathParam = searchParams.get('_path') || '';
  const suffix = pathParam;

  const qs = new URLSearchParams();
  searchParams.forEach((value, key) => {
    if (key !== '_path') qs.set(key, value);
  });
  const queryString = qs.toString();
  const target = `${base}/api/${suffix}${queryString ? `?${queryString}` : ''}`;

  const upstreamHeaders: Record<string, string> = {};
  const serverKey = (process.env.API_KEY ?? '').trim();
  const clientKey = req.headers.get('x-api-key');
  const key = serverKey || clientKey || '';
  if (key) upstreamHeaders['X-API-Key'] = key;

  const forwarded = ['content-type', 'accept', 'authorization'];
  forwarded.forEach(h => {
    const val = req.headers.get(h);
    if (val) upstreamHeaders[h] = val;
  });
  upstreamHeaders['ngrok-skip-browser-warning'] = 'true';

  const method = req.method;
  let body: undefined | ArrayBuffer;
  if (method !== 'GET' && method !== 'HEAD') {
    body = await req.arrayBuffer();
    if (body.byteLength === 0) body = undefined;
  }

  try {
    const upstream = await fetch(target, { method, headers: upstreamHeaders, body });
    const outType = upstream.headers.get('content-type');
    const buffer = Buffer.from(await upstream.arrayBuffer());

    const response = new NextResponse(buffer, {
      status: upstream.status,
      headers: outType ? { 'Content-Type': outType } : {},
    });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    return response;
  } catch (err: any) {
    console.error('[proxy] Error conectando a', target, err);
    return NextResponse.json({ error: 'Error conectando al upstream.', detail: String(err) }, { status: 502 });
  }
}