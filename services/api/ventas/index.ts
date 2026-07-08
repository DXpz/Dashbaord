/**
 * Cliente HTTP para el backend de Ventas.
 *
 * Todas las llamadas van directo a prospektia.red.com.sv (no pasan por Vercel
 * proxy), usando getBase() que lee NEXT_PUBLIC_API_UPSTREAM del env.
 *
 * Vercel Edge Function tiene timeout fijo de 10s al hacer fetch() a destinos
 * externos. Para evitar eso, el browser del usuario habla directo con el
 * backend, que está en la misma red (El Salvador).
 *
 * Cookies con SameSite=None+Secure permiten enviar cookies cross-site.
 * CORS esta configurado en nginx para reflejar $http_origin + Allow-Credentials.
 *
 * NOTA: A partir de la version con sincronizacion SAP, el identificador externo
 * de un cliente es `sap_card_code` (string tipo "CL000004"), NO `id` (numero).
 * El backend hace UPSERT por sap_card_code.
 */

import { fetchJson, getBase } from '../core/client';

export interface VtCliente {
  sap_card_code: string;
  nombre: string;
  direccion: string | null;
  telefonos: string | null;
  ciudad: string | null;
  municipio?: string | null;
  correo: string | null;
  categoria: string | null;
  vendedor_email: string;
  vendedor_nombre?: string;
  pais: string;
  satisfaccion: 'muy_satisfecho' | 'satisfecho' | 'neutral' | 'insatisfecho';
  dias_sin_contacto: number;
  ultima_gestion: string | null;
  estado: 'sin_gestion' | 'contactado' | 'seguimiento' | 'renovacion';
}

export interface VtFeedback {
  id: number;
  cliente_id: number;
  sap_card_code: string;
  vendedor_id: number;
  fecha: string;
  comentario: string;
  satisfaccion: VtCliente['satisfaccion'];
  clasificacion_ia: 'valida' | 'no_valida' | 'revision_manual' | null;
  motivo_ia: string | null;
  requiere_revision: boolean;
  estado: VtCliente['estado'];
  dias_sin_contacto: number;
}

export interface VtDashboardKpis {
  mis_clientes: number;
  gestionados: number;
  en_riesgo: number;
  desatendidos: number;
}

export interface VtReporteDiario {
  vendedor: { id: number; email: string; full_name: string | null };
  fecha: string;
  kpis: {
    asignados: number;
    gestionados: number;
    pendientes: number;
    insatisfechos: number;
    neutrales: number;
    desatendidos: number;
    cumplimiento_pct: number;
  };
  pendientes: VtCliente[];
  recientes: Array<{
    cliente_id: number;
    cliente_nombre: string;
    sap_card_code: string;
    hora: string;
    comentario: string;
    satisfaccion: VtCliente['satisfaccion'];
    estado: VtCliente['estado'];
    clasificacion_ia: string | null;
  }>;
}

const DIRECT_API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

function ventUrl(path: string, params: Record<string, unknown> = {}): string {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  });
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return `${getBase()}${path}${suffix}`;
}

function ventFetch<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  return fetchJson(`${getBase()}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...(DIRECT_API_KEY ? { 'X-API-Key': DIRECT_API_KEY } : {}),
      ...((init.headers as Record<string, string>) || {}),
    },
  }) as Promise<T>;
}

export const VentasAPI = {
  health: async () => {
    try {
      return await ventFetch<{ ok: boolean; ecosystem: string; version: string; db: string }>(
        '/api/ventas/health'
      );
    } catch {
      return { ok: false, ecosystem: 'ventas', version: '0.0.0', db: 'down' };
    }
  },

  me: () =>
    ventFetch<{
      id: number;
      email: string;
      role: string;
      full_name: string;
      pais: string;
      country_code: string;
      is_super_admin: boolean;
      ecosystem: string;
    }>('/api/ventas/auth/me'),

  dashboard: () => ventFetch<VtDashboardKpis>('/api/ventas/dashboard'),

  listClientes: (params: { estado?: string; satisfaccion?: string; search?: string } = {}) =>
    ventFetch<VtCliente[]>(ventUrl('/api/ventas/clientes', params)),

  getCliente: (sapCardCode: string) =>
    ventFetch<VtCliente>(`/api/ventas/clientes/${encodeURIComponent(sapCardCode)}`),

  updateCliente: (sapCardCode: string, data: Partial<VtCliente>) =>
    ventFetch<{ ok: boolean; updated_fields: string[] }>(
      `/api/ventas/clientes/${encodeURIComponent(sapCardCode)}`,
      { method: 'PATCH', body: JSON.stringify(data) }
    ),

  createFeedback: (
    sapCardCode: string,
    data: {
      comentario: string;
      satisfaccion: VtCliente['satisfaccion'];
      estado?: VtCliente['estado'];
      dias_sin_contacto?: number;
    }
  ) =>
    ventFetch<VtFeedback>(
      `/api/ventas/clientes/${encodeURIComponent(sapCardCode)}/feedback`,
      { method: 'POST', body: JSON.stringify(data) }
    ),

  listFeedback: (sapCardCode: string, limit = 20) =>
    ventFetch<VtFeedback[]>(
      `/api/ventas/clientes/${encodeURIComponent(sapCardCode)}/feedback?limit=${limit}`
    ),

  reporteDiario: (fecha?: string) =>
    ventFetch<VtReporteDiario>(
      `/api/ventas/reportes/diario${fecha ? `?fecha=${fecha}` : ''}`
    ),
};

// Re-exports para uso externo
export { ventUrl, ventFetch };
