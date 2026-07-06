/**
 * Cliente HTTP para el backend de Ventas.
 *
 * Usa el mismo patron que ProspektIA: llamada directa a getBase() (configurable
 * via NEXT_PUBLIC_API_UPSTREAM, default https://prospektia.red.com.sv) y el
 * backend vive en /api/ventas/* gracias al routing de nginx que envia ese path
 * al container ventas-api en :3002.
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
        `${getBase()}/api/ventas/health`
      );
    } catch {
      return { ok: false, ecosystem: 'ventas', version: '0.0.0', db: 'down' };
    }
  },

  me: () =>
    fetchJson<{ id: number; email: string; role: string; full_name: string; is_super_admin: boolean; ecosystem: string }>(
      `${getBase()}/api/ventas/auth/me`
    ),

  dashboard: () =>
    fetchJson<VtDashboardKpis>(`${getBase()}/api/ventas/dashboard`),

  listClientes: (params: { estado?: string; satisfaccion?: string; search?: string } = {}) =>
    get<VtCliente[]>('/ventas/clientes', params),

  getCliente: (id: number) =>
    fetchJson<VtCliente>(`${getBase()}/api/ventas/clientes/${id}`),

  updateCliente: (id: number, data: Partial<VtCliente>) =>
    patch<{ ok: boolean; updated_fields: string[] }>(`/ventas/clientes/${id}`, data),

  createFeedback: (
    clienteId: number,
    data: {
      comentario: string;
      satisfaccion: VtCliente['satisfaccion'];
      estado?: VtCliente['estado'];
      dias_sin_contacto?: number;
    }
  ) =>
    post<VtFeedback>(`/ventas/clientes/${clienteId}/feedback`, data),

  listFeedback: (clienteId: number, limit = 20) =>
    get<VtFeedback[]>('/ventas/clientes/' + clienteId + '/feedback', { limit }),

  reporteDiario: (fecha?: string) =>
    get<VtReporteDiario>('/ventas/reportes/diario', fecha ? { fecha } : {}),
};
