const TOKEN_NAME = 'api_token';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7,
};

function serialize(name: string, value: string, options: typeof COOKIE_OPTIONS): string {
  let str = `${name}=${value}`;
  str += `; Path=${options.path}`;
  str += `; Max-Age=${options.maxAge}`;
  if (options.secure) str += '; Secure';
  str += `; SameSite=${options.sameSite}`;
  return str;
}

function parseCookies(cookieString: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!cookieString) return result;
  cookieString.split(';').forEach(pair => {
    const [key, ...valParts] = pair.trim().split('=');
    if (key) result[key] = valParts.join('=');
  });
  return result;
}

export function setTokenCookie(token: string): void {
  if (typeof window === 'undefined') return;
  document.cookie = serialize(TOKEN_NAME, token, COOKIE_OPTIONS);
}

export function getTokenFromCookies(): string | null {
  if (typeof window === 'undefined') return null;
  const cookies = parseCookies(document.cookie);
  return cookies[TOKEN_NAME] || null;
}

export function removeTokenCookie(): void {
  if (typeof window === 'undefined') return;
  document.cookie = serialize(TOKEN_NAME, '', {
    ...COOKIE_OPTIONS,
    maxAge: -1,
  });
}

export const COOKIE_CONFIG = COOKIE_OPTIONS;