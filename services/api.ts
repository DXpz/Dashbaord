/**
 * API Service - Migrated from vanilla JS api.js
 * Preserves all original logic with TypeScript types
 * Uses /api proxy in production (HTTPS), direct call in development (HTTP)
 */

const STORAGE_KEY = 'dashboard_api_base';
const DEFAULT_UPSTREAM = 'http://200.35.189.139';

const FETCH_TIMEOUT_MS = 25000;
const HEALTH_TIMEOUT_MS = 90000;

let _cache: any = null;
let _cacheKey = '';

function isProduction(): boolean {
  if (typeof window === 'undefined') return true;
  return window.location.protocol === 'https:';
}

function getBase(): string {
  const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  if (stored && stored.trim()) return stored.trim().replace(/\/+$/, '');
  return DEFAULT_UPSTREAM;
}

function getApiKey(): string {
  return 'RedApi_2026_SuperSegura_9XK2';
}

export function setBase(url: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, url.replace(/\/+$/, ''));
  }
  _cache = null;
  _cacheKey = '';
}

export function isConfigured(): boolean {
  return !!getBase();
}

function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const h: Record<string, string> = { 'ngrok-skip-browser-warning': 'true', ...extra };
  const key = getApiKey();
  if (key) h['X-API-Key'] = key;
  return h;
}

function buildQuery(params: Record<string, any> = {}): string {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.append(k, String(v));
  });
  const str = qs.toString();
  return str ? `?${str}` : '';
}

function normPaisQuery(p: string | null | undefined): string {
  if (p == null || String(p).trim() === '') return '';
  return String(p).trim().toUpperCase();
}

function paisParam(p: string | undefined) {
  if (!p) return {};
  const code = normPaisQuery(p);
  return code ? { pais: code } : {};
}

function nombreParam(nombre: string | undefined) {
  if (!nombre || !String(nombre).trim()) return {};
  return { nombre: String(nombre).trim() };
}

function timeoutError(ms: number): Error {
  return new Error(`Tiempo de espera agotado (${Math.round(ms / 1000)} s). Compruebe la conexión.`);
}

async function fetchJson(url: string, init: RequestInit = {}, ms: number = FETCH_TIMEOUT_MS): Promise<any> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    const headers = authHeaders(init.headers && typeof init.headers === 'object' ? init.headers as Record<string, string> : {});
    const res = await fetch(url, { ...init, signal: ctrl.signal, headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (e: any) {
    if (e?.name === 'AbortError') throw timeoutError(ms);
    throw e;
  } finally {
    clearTimeout(id);
  }
}

async function get(path: string, params: Record<string, any>) {
  const base = getBase();
  const qs = buildQuery(params);

  if (isProduction()) {
    const url = `${path}${qs}`;
    return fetchJson(url);
  }
  const url = `${base}${path}${qs}`;
  return fetchJson(url);
}

async function getHealth() {
  return get('/api/health', {});
}

async function apiRoot(method: string, path: string, body?: any) {
  const base = getBase();
  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const opts: RequestInit = { method, headers: authHeaders() };
  if (body !== undefined && body !== null) {
    opts.headers = { ...opts.headers as Record<string, string>, 'Content-Type': 'application/json' };
    opts.body = JSON.stringify(body);
  }
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...opts, signal: ctrl.signal });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status}: ${t || res.statusText}`);
    }
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) return await res.json();
    return {};
  } catch (e: any) {
    if (e?.name === 'AbortError') throw timeoutError(FETCH_TIMEOUT_MS);
    throw e;
  } finally {
    clearTimeout(id);
  }
}

async function getJsonPath(pathWithQuery: string) {
  const base = getBase();
  const path = pathWithQuery.startsWith('/') ? pathWithQuery : `/${pathWithQuery}`;
  if (isProduction()) {
    return fetchJson(path);
  }
  const url = `${base}${path}`;
  return fetchJson(url);
}

export const API = {
  getBase,
  setBase,
  get apiKey() { return getApiKey(); },
  isConfigured,
  invalidateCache() { _cache = null; _cacheKey = ''; },

  async dashboard(
    desde: string,
    hasta: string,
    limite_motivos = 30,
    limite_reuniones_muestra = 40,
    opts: Record<string, any> = {}
  ) {
    const group_by_asesores = opts.group_by_asesores ?? 'asesor';
    const group_by_propuestas = opts.group_by_propuestas ?? 'rubro';
    const nombre = opts.nombre && String(opts.nombre).trim() ? String(opts.nombre).trim() : '';
    const paisCode = normPaisQuery(opts.pais);
    const base = getBase();
    const key = `${base}|${getApiKey()}|${desde || ''}|${hasta || ''}|${limite_motivos}|${limite_reuniones_muestra}|${group_by_asesores}|${group_by_propuestas}|${nombre}|${paisCode}`;
    if (_cache && _cacheKey === key) return _cache;
    const data = await get('/api/metrics/dashboard', {
      desde, hasta, limite_motivos, limite_reuniones_muestra,
      group_by_asesores, group_by_propuestas,
      ...nombreParam(nombre),
      ...paisParam(paisCode)
    });
    _cache = data;
    _cacheKey = key;
    return data;
  },

  resumen(desde: string, hasta: string, nombre?: string, pais?: string) {
    return get('/api/metrics/resumen', { desde, hasta, ...nombreParam(nombre), ...paisParam(pais) });
  },

  asesores(desde: string, hasta: string, group_by = 'asesor', nombre?: string, pais?: string) {
    return get('/api/metrics/asesores', { desde, hasta, group_by, ...nombreParam(nombre), ...paisParam(pais) });
  },

  asesor(nombre: string, desde: string, hasta: string, pais?: string) {
    return get('/api/metrics/asesor', { nombre, desde, hasta, ...paisParam(pais) });
  },

  propuestasPorRubro(desde: string, hasta: string, group_by = 'rubro', nombre?: string, pais?: string) {
    return get('/api/metrics/propuestas-por-rubro', { desde, hasta, group_by, ...nombreParam(nombre), ...paisParam(pais) });
  },

  negociacion(desde: string, hasta: string, nombre?: string, pais?: string) {
    return get('/api/metrics/negociacion', { desde, hasta, ...nombreParam(nombre), ...paisParam(pais) });
  },

  motivosPerdida(desde: string, hasta: string, limite = 50, nombre?: string, pais?: string) {
    return get('/api/metrics/motivos-perdida', { desde, hasta, limite, ...nombreParam(nombre), ...paisParam(pais) });
  },

  motivosPerdidaAgrupados(desde: string, hasta: string, nombre?: string, pais?: string) {
    return get('/api/metrics/motivos-perdida/agrupados', { desde, hasta, ...nombreParam(nombre), ...paisParam(pais) });
  },

  reuniones(desde: string, hasta: string, limite = 200, offset = 0, extra: Record<string, any> = {}) {
    return get('/api/metrics/reuniones', { desde, hasta, limite, offset, ...extra });
  },

  listaAsesores(desde: string, hasta: string, nombre?: string, pais?: string) {
    return get('/api/metrics/lista-asesores', { desde, hasta, ...nombreParam(nombre), ...paisParam(pais) });
  },

  fuentes(desde: string, hasta: string, extra: Record<string, any> = {}) {
    return get('/api/metrics/fuentes', { desde, hasta, ...extra });
  },

  tiempoRespuesta(desde: string, hasta: string, groupBy = 'asesor', extra: Record<string, any> = {}) {
    return get('/api/metrics/tiempo-respuesta', { desde, hasta, group_by: groupBy, ...extra });
  },

  nivelesEscalacion(desde: string, hasta: string, extra: Record<string, any> = {}) {
    return get('/api/metrics/niveles-escalacion', { desde, hasta, ...extra });
  },

  decisiones(desde: string, hasta: string, extra: Record<string, any> = {}) {
    return get('/api/metrics/decisiones', { desde, hasta, ...extra });
  },

  advisorsList(opts: boolean | { activo?: boolean; pais?: string } = true) {
    const params: Record<string, any> = {};
    let o = opts;
    if (typeof opts === 'boolean') o = { activo: opts };
    if (o && typeof o === 'object') {
      if (o.activo === true || o.activo === false) params.activo = o.activo;
      if (o.pais != null && String(o.pais).trim() !== '') params.pais = normPaisQuery(o.pais);
    }
    return getJsonPath(`/api/advisors${buildQuery(params)}`);
  },

  advisorsCreate(body: any) {
    return apiRoot('POST', '/api/advisors', body);
  },

  advisorsPatch(id: string, body: any) {
    return apiRoot('PATCH', `/api/advisors/${encodeURIComponent(String(id))}`, body);
  },

  advisorsDelete(id: string) {
    return apiRoot('DELETE', `/api/advisors/${encodeURIComponent(String(id))}`);
  },

  health: () => getHealth(),

  opportunityStages() {
    return getJsonPath('/api/opportunity-stages');
  },

  async leadHistory(opportunityNumber: string, mergeAudit = true) {
    const id = opportunityNumber?.trim();
    if (!id) throw new Error('opportunityNumber requerido');
    return get('/api/history', { opportunityNumber: id, mergeAudit: mergeAudit ? 1 : 0 });
  },

  async propuestaHistory(auditId: string) {
    const id = auditId?.trim();
    if (!id) throw new Error('audit_id requerido');
    return get(`/api/audit/${encodeURIComponent(id)}/propuesta/history`, {});
  },

  async propuestaHistoryByClient(clientId: string) {
    const id = clientId?.trim();
    if (!id) throw new Error('client_id requerido');
    return get(`/api/audit/client/${encodeURIComponent(id)}/propuesta/history`, {});
  },

  async auditByClient(clientId: string) {
    const id = clientId?.trim();
    if (!id) throw new Error('client_id requerido');
    return get(`/api/audit/by-client/${encodeURIComponent(id)}`, {});
  },

  async ping() {
    try { await getHealth(); return true; }
    catch { return false; }
  }
};