const BASE_URL = '/api';

async function fetchAPI(endpoint: string, options: RequestInit = {}): Promise<any> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Error en la petición' }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

export const API = {
  me: () => fetchAPI('/auth/me'),

  login: (email: string, password: string) =>
    fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    fetchAPI('/auth/logout', { method: 'POST' }),

  dashboard: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/proxy?endpoint=/api/metrics/dashboard${query ? '&' + query : ''}`);
  },

  resumen: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/proxy?endpoint=/api/metrics/resumen${query ? '&' + query : ''}`);
  },

  reuniones: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/proxy?endpoint=/api/metrics/reuniones${query ? '&' + query : ''}`);
  },

  negociacion: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/proxy?endpoint=/api/metrics/negociacion${query ? '&' + query : ''}`);
  },

  propuestasPorRubro: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/proxy?endpoint=/api/metrics/propuestas-por-rubro${query ? '&' + query : ''}`);
  },

  motivosPerdida: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/proxy?endpoint=/api/metrics/motivos-perdida${query ? '&' + query : ''}`);
  },

  asesores: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/proxy?endpoint=/api/metrics/asesores${query ? '&' + query : ''}`);
  },

  listaAsesores: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/proxy?endpoint=/api/metrics/lista-asesores${query ? '&' + query : ''}`);
  },

  fuentes: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/proxy?endpoint=/api/metrics/fuentes${query ? '&' + query : ''}`);
  },

  tiempoRespuesta: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/proxy?endpoint=/api/metrics/tiempo-respuesta${query ? '&' + query : ''}`);
  },

  nivelesEscalacion: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/proxy?endpoint=/api/metrics/niveles-escalacion${query ? '&' + query : ''}`);
  },

  decisiones: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchAPI(`/proxy?endpoint=/api/metrics/decisiones${query ? '&' + query : ''}`);
  },

  roundRobin: (pais?: string, incluirInactivos = false) => {
    const params = new URLSearchParams();
    if (pais) params.set('pais', pais);
    if (incluirInactivos) params.set('incluir_inactivos', 'true');
    const query = params.toString();
    return fetchAPI(`/proxy?endpoint=/api/advisors/round-robin${query ? '&' + query : ''}`);
  },

  advisors: () => fetchAPI('/proxy?endpoint=/api/advisors'),

  opportunityStages: () => fetchAPI('/proxy?endpoint=/api/opportunity-stages'),

  leadHistory: (opportunityNumber: string, mergeAudit = true) => {
    const params = new URLSearchParams({ opportunityNumber, mergeAudit: mergeAudit ? '1' : '0' });
    return fetchAPI(`/proxy?endpoint=/api/history&${params.toString()}`);
  },

  propuestaHistory: (auditId: string) =>
    fetchAPI(`/proxy?endpoint=/api/audit/${encodeURIComponent(auditId)}/propuesta/history`),

  propuestaHistoryByClient: (clientId: string) =>
    fetchAPI(`/proxy?endpoint=/api/audit/client/${encodeURIComponent(clientId)}/propuesta/history`),

  auditByClient: (clientId: string) =>
    fetchAPI(`/proxy?endpoint=/api/audit/by-client/${encodeURIComponent(clientId)}`),

  ping: () => fetchAPI('/proxy?endpoint=/api/health'),
};