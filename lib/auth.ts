import { cookies } from 'next/headers';

const COOKIE_NAME = 'session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'dashboard-secret-key-2026';

export type UserRole = 'admin' | 'vendedor';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  advisorName?: string;
  pais?: string;
}

const DEMO_USERS: Array<User & { password: string }> = [
  { id: '1', email: 'admin@dashboard.com', password: 'admin123', name: 'Administrador', role: 'admin' },
  { id: '2', email: 'esau@vendedor.com', password: 'vendedor123', name: 'Esau Vides', role: 'vendedor', advisorName: 'Esau Vides', pais: 'SV' },
  { id: '3', email: 'erick@vendedor.com', password: 'vendedor123', name: 'Erick Revelo', role: 'vendedor', advisorName: 'Erick Revelo', pais: 'SV' },
  { id: '4', email: 'mario@vendedor.com', password: 'vendedor123', name: 'Mario Ceron', role: 'vendedor', advisorName: 'Mario Ceron', pais: 'SV' },
];

function encodeSession(user: User): string {
  const payload = { ...user, exp: Date.now() + 1000 * 60 * 60 * 24 };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

function decodeSession(token: string): User | null {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    if (Date.now() > payload.exp) return null;
    return { id: payload.id, email: payload.email, name: payload.name, role: payload.role, advisorName: payload.advisorName, pais: payload.pais };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return decodeSession(token);
}

export async function createSession(user: User): Promise<string> {
  return encodeSession(user);
}

export function validateCredentials(email: string, password: string): User | null {
  const found = DEMO_USERS.find(u => u.email === email && u.password === password);
  if (!found) return null;
  const { password: _, ...user } = found;
  return user;
}

export const DEMO_CREDENTIALS = DEMO_USERS.map(u => ({ email: u.email, role: u.role, name: u.name }));
