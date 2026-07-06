/**
 * Cliente HTTP para el backend de Ventas.
 *
 * Las llamadas pasan por /api/ventas/* (proxy de Next.js, mismo origen) que
 * agrega Authorization: Bearer <token> desde la cookie api_token. Esto evita
 * problemas de CORS y SameSite.
 *
 * Si el backend no responde, las paginas deben usar data hardcoded como
 * fallback (ver el patron de los hooks en hooks/ventas/).
 */

import { get, post, patch, getBase, fetchJson, FETCH_TIMEOUT_MS } from '../core/client';

export interface VtCliente {
  id: number;
  sap_card_code: string;
  nombre: string;
  direccion: string | null;
  telefonos: string | null;
  ciudad: string | null;
  categoria: string | null;
  correo: string | null;
  vendedor_id: number;
  satisfaccion: 'muy_satisfecho' | 'satisfecho' | 'neutral' | 'insatisfecho';
  dias_sin_contacto: number;
  ultima_gestion: string | null;
  estado: 'sin_gestion' | 'contactado' | 'seguimiento' | 'renovacion';
}

export interface VtFeedback {
  id: number;
  cliente_id: number;
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

export const VentasAPI = {
  health: async () => {
    try {
      return await fetchJson<{ ok: boolean; ecosystem: string; version: string; db: string }>(
        '/api/ventas/health'
      );
    } catch {
      return { ok: false, ecosystem: 'ventas', version: '0.0.0', db: 'down' };
    }
  },

  me: () =>
    fetchJson<{ id: number; email: string; role: string; full_name: string; is_super_admin: boolean; ecosystem: string }>(
      '/api/ventas/auth/me'
    ),

  dashboard: () =>
    fetchJson<VtDashboardKpis>('/api/ventas/dashboard'),

  listClientes: (params: { estado?: string; satisfaccion?: string; search?: string } = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
    });
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return fetchJson<VtCliente[]>(`/api/ventas/clientes${suffix}`);
  },

  getCliente: (id: number) =>
    fetchJson<VtCliente>(`/api/ventas/clientes/${id}`),

  updateCliente: (id: number, data: Partial<VtCliente>) =>
    fetchJson<{ ok: boolean; updated_fields: string[] }>(`/api/ventas/clientes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  createFeedback: (
    clienteId: number,
    data: {
      comentario: string;
      satisfaccion: VtCliente['satisfaccion'];
      estado?: VtCliente['estado'];
      dias_sin_contacto?: number;
    }
  ) =>
    fetchJson<VtFeedback>(`/api/ventas/clientes/${clienteId}/feedback`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  listFeedback: (clienteId: number, limit = 20) =>
    fetchJson<VtFeedback[]>(`/api/ventas/clientes/${clienteId}/feedback?limit=${limit}`),

  reporteDiario: (fecha?: string) =>
    fetchJson<VtReporteDiario>(
      `/api/ventas/reportes/diario${fecha ? `?fecha=${fecha}` : ''}`
    ),
};
