import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const COOKIE_NAME = 'access_token';
const UPSTREAM = process.env.API_UPSTREAM || 'http://200.35.189.139';

export interface ApiUser {
  id: number;
  email: string;
  full_name: string;
  role: string;
  country_code: string;
  is_active: boolean;
  is_super_admin?: boolean;
}

function parseJwtPayload(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = Buffer.from(parts[1], 'base64').toString('utf-8');
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const cookieToken = req.cookies.get(COOKIE_NAME)?.value;
  if (cookieToken) return cookieToken;
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return null;
}

export async function getSessionFromCookie(): Promise<ApiUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = parseJwtPayload(token);
  if (!payload) return null;
  if (Date.now() / 1000 > payload.exp) return null;
  return {
    id: payload.sub,
    email: payload.email,
    full_name: payload.full_name || '',
    role: payload.role,
    country_code: payload.country_code || '',
    is_active: true,
    is_super_admin: payload.is_super_admin || false,
  };
}

export async function callAuthApi(
  path: string,
  method: string,
  body?: Record<string, any>,
  req?: Request
) {
  const upstreamPath = `/api/auth${path}`;
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const url = isHttps
    ? `/api/proxy?_path=${encodeURIComponent(upstreamPath.slice(1))}`
    : `${UPSTREAM}${upstreamPath}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-API-KEY': process.env.API_KEY || '',
    ...(isHttps ? {} : { 'ngrok-skip-browser-warning': 'true' }),
  };

  const token = req ? getTokenFromRequest(new NextRequest(req.url)) : null;
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });

  return res;
}

export function isApiError(data: any): data is { detail: string } {
  return data && typeof data === 'object' && 'detail' in data;
}