/**
 * Cliente HTTP para el backend de Ventas.
 *
 * Las rutas pasan por /api/proxy/ventas/* (proxy de Next.js),
 * que redirige a http://127.0.0.1:3002 (o NEXT_PUBLIC_VENTAS_BACKEND_URL).
 *
 * Si el backend no responde, las paginas deben usar data hardcoded
 * como fallback (ver el patron de los hooks en hooks/ventas/).
 */

const VENTAS_PROXY_PREFIX = '/api/proxy/ventas/api/ventas';
const FETCH_TIMEOUT_MS = 25000;

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

function buildUrl(path: string, params: Record<string, any> = {}): string {
  const url = new URL(
    VENTAS_PROXY_PREFIX + path,
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
  );
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      url.searchParams.set(k, String(v));
    }
  });
  return url.toString();
}

async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      ...init,
      signal: ctrl.signal,
      headers: {
        'Content-Type': 'application/json',
        ...((init.headers as Record<string, string>) || {}),
      },
      credentials: 'include',
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(id);
  }
}

export const VentasAPI = {
  health: async () => {
    try {
      return await request<{ ok: boolean; ecosystem: string; version: string; db: string }>(
        buildUrl('/health')
      );
    } catch {
      return { ok: false, ecosystem: 'ventas', version: '0.0.0', db: 'down' };
    }
  },

  me: () =>
    request<{ id: number; email: string; role: string; full_name: string; is_super_admin: boolean; ecosystem: string }>(
      buildUrl('/auth/me')
    ),

  dashboard: () => request<VtDashboardKpis>(buildUrl('/dashboard')),

  listClientes: (params: { estado?: string; satisfaccion?: string; search?: string } = {}) =>
    request<VtCliente[]>(buildUrl('/clientes', params)),

  getCliente: (id: number) => request<VtCliente>(buildUrl(`/clientes/${id}`)),

  updateCliente: (id: number, data: Partial<VtCliente>) =>
    request<{ ok: boolean; updated_fields: string[] }>(buildUrl(`/clientes/${id}`), {
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
    request<VtFeedback>(buildUrl(`/clientes/${clienteId}/feedback`), {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  listFeedback: (clienteId: number, limit = 20) =>
    request<VtFeedback[]>(buildUrl(`/clientes/${clienteId}/feedback`, { limit })),

  reporteDiario: (fecha?: string) =>
    request<VtReporteDiario>(buildUrl('/reportes/diario', fecha ? { fecha } : {})),
};
