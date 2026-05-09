/**
 * API Service
 * Browser calls backend directly in development (HTTP)
 * Uses /api/proxy in production (HTTPS/Vercel) to avoid CORS
 */

const DEFAULT_UPSTREAM = 'http://200.35.189.139';
const API_KEY = process.env.API_KEY || '';

const FETCH_TIMEOUT_MS = 25000;

let _cache: any = null;
let _cacheKey = '';

function isProduction(): boolean {
  if (typeof window === 'undefined') return true;
  return window.location.protocol === 'https:';
}

function getBase(): string {
  return DEFAULT_UPSTREAM;
}

function getProxyEndpoint(path: string, params: Record<string, any>): string {
  const qs = buildQuery(params);
  return `/api/proxy?endpoint=${encodeURIComponent(path)}${qs}`;
}

function timeoutError(ms: number): Error {
  return new Error(`Tiempo de espera agotado (${Math.round(ms / 1000)} s). Compruebe la conexión.`);
}

function buildQuery(params: Record<string, any> = {}): string {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.append(k, String(v));
  });
  const str = qs.toString();
  return str ? `&${str}` : '';
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

function asesorParam(asesor: string | undefined) {
  if (!asesor || !String(asesor).trim()) return {};
  return { asesor: String(asesor).trim() };
}

async function fetchJson(url: string, init: RequestInit = {}, ms: number = FETCH_TIMEOUT_MS): Promise<any> {
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

function makeUrl(path: string, params: Record<string, any>): string {
  if (isProduction()) {
    return getProxyEndpoint(path, params);
  }
  const base = getBase();
  const qs = buildQuery(params).replace(/^&/, '?');
  return `${base}/api${path}${qs}`;
}

async function get(path: string, params: Record<string, any>) {
  const url = makeUrl(path, params);
  return fetchJson(url);
}

async function post(path: string, body?: any) {
  let url: string;
  if (isProduction()) {
    url = `/api/proxy?endpoint=${encodeURIComponent(path)}`;
  } else {
    url = `${getBase()}/api${path}`;
  }
  return fetchJson(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function patch(path: string, body?: any) {
  let url: string;
  if (isProduction()) {
    url = `/api/proxy?endpoint=${encodeURIComponent(path)}`;
  } else {
    url = `${getBase()}/api${path}`;
  }
  return fetchJson(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
}

async function del(path: string) {
  let url: string;
  if (isProduction()) {
    url = `/api/proxy?endpoint=${encodeURIComponent(path)}`;
  } else {
    url = `${getBase()}/api${path}`;
  }
  return fetchJson(url, { method: 'DELETE' });
}

export const API = {
  getBase,
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
    const paisCode = normPaisQuery(opts.pais);
    const key = `dashboard|${desde}|${hasta}|${limite_motivos}|${limite_reuniones_muestra}|${group_by_asesores}|${group_by_propuestas}|${opts.asesor || opts.nombre || ''}|${paisCode}`;
    if (_cache && _cacheKey === key) return _cache;
    const params = {
      desde, hasta, limite_motivos, limite_reuniones_muestra,
      group_by_asesores, group_by_propuestas,
      ...(opts.asesor ? asesorParam(opts.asesor) : nombreParam(opts.nombre)),
      ...paisParam(paisCode)
    };
    const data = await get('/metrics/dashboard', params);
    _cache = data;
    _cacheKey = key;
    return data;
  },

  resumen(desde: string, hasta: string, nombre?: string, pais?: string) {
    return get('/metrics/resumen', { desde, hasta, ...nombreParam(nombre), ...paisParam(pais) });
  },

  asesores(desde: string, hasta: string, group_by = 'asesor', nombre?: string, pais?: string) {
    return get('/metrics/asesores', { desde, hasta, group_by, ...nombreParam(nombre), ...paisParam(pais) });
  },

  asesor(nombre: string, desde: string, hasta: string, pais?: string) {
    return get('/metrics/asesor', { nombre, desde, hasta, ...paisParam(pais) });
  },

  propuestasPorRubro(desde: string, hasta: string, group_by = 'rubro', nombre?: string, pais?: string) {
    return get('/metrics/propuestas-por-rubro', { desde, hasta, group_by, ...nombreParam(nombre), ...paisParam(pais) });
  },

  negociacion(desde: string, hasta: string, nombre?: string, pais?: string) {
    return get('/metrics/negociacion', { desde, hasta, ...nombreParam(nombre), ...paisParam(pais) });
  },

  motivosPerdida(desde: string, hasta: string, limite = 50, nombre?: string, pais?: string) {
    return get('/metrics/motivos-perdida', { desde, hasta, limite, ...nombreParam(nombre), ...paisParam(pais) });
  },

  motivosPerdidaAgrupados(desde: string, hasta: string, nombre?: string, pais?: string) {
    return get('/metrics/motivos-perdida/agrupados', { desde, hasta, ...nombreParam(nombre), ...paisParam(pais) });
  },

  reuniones(desde: string, hasta: string, limite = 200, offset = 0, extra: Record<string, any> = {}) {
    return get('/metrics/reuniones', { desde, hasta, limite, offset, ...extra });
  },

  listaAsesores(desde: string, hasta: string, nombre?: string, pais?: string) {
    return get('/metrics/lista-asesores', { desde, hasta, ...nombreParam(nombre), ...paisParam(pais) });
  },

  fuentes(desde: string, hasta: string, extra: Record<string, any> = {}) {
    return get('/metrics/fuentes', { desde, hasta, ...extra });
  },

  tiempoRespuesta(desde: string, hasta: string, groupBy = 'asesor', extra: Record<string, any> = {}) {
    return get('/metrics/tiempo-respuesta', { desde, hasta, group_by: groupBy, ...extra });
  },

  nivelesEscalacion(desde: string, hasta: string, extra: Record<string, any> = {}) {
    return get('/metrics/niveles-escalacion', { desde, hasta, ...extra });
  },

  decisiones(desde: string, hasta: string, extra: Record<string, any> = {}) {
    return get('/metrics/decisiones', { desde, hasta, ...extra });
  },

  roundRobin(pais?: string, incluirInactivos = false) {
    return get('/advisors/round-robin', {
      ...(pais ? { pais: normPaisQuery(pais) } : {}),
      ...(incluirInactivos ? { incluir_inactivos: true } : {}),
    });
  },

  advisorsList(opts: boolean | { activo?: boolean; pais?: string } = true) {
    const params: Record<string, any> = {};
    let o = opts;
    if (typeof opts === 'boolean') o = { activo: opts };
    if (o && typeof o === 'object') {
      if (o.activo === true || o.activo === false) params.activo = o.activo;
      if (o.pais != null && String(o.pais).trim() !== '') params.pais = normPaisQuery(o.pais);
    }
    return get('/advisors', params);
  },

  advisorsCreate(body: any) {
    return post('/advisors', body);
  },

  advisorsPatch(id: string, body: any) {
    return patch(`/advisors/${encodeURIComponent(String(id))}`, body);
  },

  auditPatch(clientId: string, body: any) {
    return patch(`/audit/client/${encodeURIComponent(clientId)}`, body);
  },

  advisorsDelete(id: string) {
    return del(`/advisors/${encodeURIComponent(String(id))}`);
  },

  opportunityStages() {
    return get('/opportunity-stages', {});
  },

  async leadHistory(opportunityNumber: string, mergeAudit = true) {
    const id = opportunityNumber?.trim();
    if (!id) throw new Error('opportunityNumber requerido');
    return get('/history', { opportunityNumber: id, mergeAudit: mergeAudit ? 1 : 0 });
  },

  async propuestaHistory(auditId: string) {
    const id = auditId?.trim();
    if (!id) throw new Error('audit_id requerido');
    return get(`/audit/${encodeURIComponent(id)}/propuesta/history`, {});
  },

  async propuestaHistoryByClient(clientId: string) {
    const id = clientId?.trim();
    if (!id) throw new Error('client_id requerido');
    return get(`/audit/client/${encodeURIComponent(clientId)}/propuesta/history`, {});
  },

  async auditByClient(clientId: string) {
    const id = clientId?.trim();
    if (!id) throw new Error('client_id requerido');
    return get(`/audit/by-client/${encodeURIComponent(id)}`, {});
  },

  health() {
    return get('/health', {});
  },

  async ping() {
    try { await get('/health', {}); return true; }
    catch { return false; }
  }
};