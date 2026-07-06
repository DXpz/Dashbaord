/**
 * Cliente HTTP compartido por todos los ecosistemas.
 * Lee la URL base desde variable de entorno (con default a ProspektIA por compatibilidad).
 */

const DEFAULT_UPSTREAM = process.env.NEXT_PUBLIC_API_UPSTREAM || 'https://prospektia.red.com.sv';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

export const FETCH_TIMEOUT_MS = 25000;

let _cache: any = null;
let _cacheKey = '';
let _cacheExpiry = 0;

export function getBase(): string {
  return DEFAULT_UPSTREAM;
}

export function timeoutError(ms: number): Error {
  return new Error(`Tiempo de espera agotado (${Math.round(ms / 1000)} s). Compruebe la conexión.`);
}

export function buildQuery(params: Record<string, any> = {}): string {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.append(k, String(v));
  });
  const str = qs.toString();
  return str ? `&${str}` : '';
}

export function normPaisQuery(p: string | null | undefined): string {
  if (p == null || String(p).trim() === '') return '';
  return String(p).trim().toUpperCase();
}

export function paisParam(p: string | undefined) {
  if (!p) return {};
  const code = normPaisQuery(p);
  if (!code) return {};
  return { pais: code };
}

export function tipoLeadParam(tipoLead: string | undefined) {
  if (!tipoLead || tipoLead === 'all') return {};
  return { tipo_lead: tipoLead };
}

export function origenParam(origen: string | undefined) {
  if (!origen) return {};
  return { origen };
}

export function tipoLlamadaParam(tipoLlamada: string | undefined) {
  if (!tipoLlamada) return {};
  return { tipo_llamada: tipoLlamada };
}

export function nombreParam(nombre: string | undefined) {
  if (!nombre || !String(nombre).trim()) return {};
  return { nombre: String(nombre).trim() };
}

export function asesorParam(asesor: string | undefined) {
  if (!asesor || !String(asesor).trim()) return {};
  return { asesor: String(asesor).trim() };
}

export async function fetchJson<T = any>(url: string, init: RequestInit = {}, ms: number = FETCH_TIMEOUT_MS): Promise<T> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    const headers: Record<string, string> = {
      'X-API-Key': API_KEY,
      'ngrok-skip-browser-warning': 'true',
      ...(init.headers as Record<string, string>),
    };
    const res = await fetch(url, { ...init, signal: ctrl.signal, headers, credentials: 'include' });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (e: any) {
    if (e?.name === 'AbortError') throw timeoutError(ms);
    throw e;
  } finally {
    clearTimeout(id);
  }
}

export function makeUrl(path: string, params: Record<string, any>): string {
  const base = getBase();
  const qs = buildQuery(params).replace(/^&/, '?');
  return `${base}/api${path}${qs}`;
}

export async function get<T = any>(path: string, params: Record<string, any>): Promise<T> {
  const url = makeUrl(path, params);
  return fetchJson(url) as Promise<T>;
}

export async function post<T = any>(path: string, body?: any): Promise<T> {
  return fetchJson(`${getBase()}/api${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  }) as Promise<T>;
}

export async function patch<T = any>(path: string, body?: any): Promise<T> {
  return fetchJson(`${getBase()}/api${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  }) as Promise<T>;
}

export async function del(path: string) {
  return fetchJson(`${getBase()}/api${path}`, { method: 'DELETE' });
}

export function invalidateCache() {
  _cache = null;
  _cacheKey = '';
  _cacheExpiry = 0;
}

export function readCache<T = any>(key: string): T | null {
  const now = Date.now();
  if (_cache && _cacheKey === key && now < _cacheExpiry) return _cache as T;
  return null;
}

export function writeCache(key: string, value: any, ttlMs: number) {
  _cache = value;
  _cacheKey = key;
  _cacheExpiry = Date.now() + ttlMs;
}