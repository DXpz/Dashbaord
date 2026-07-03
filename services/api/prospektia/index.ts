/**
 * ProspektIA API Client
 *
 * Mantiene el contrato exacto del antiguo services/api.ts para compatibilidad.
 * Migrar gradualmente cada página a este namespace.
 */

import {
  get,
  post,
  patch,
  del,
  getBase,
  invalidateCache,
  paisParam,
  tipoLeadParam,
  origenParam,
  tipoLlamadaParam,
  nombreParam,
  asesorParam,
  normPaisQuery,
  readCache,
  writeCache,
} from '../core/client';

const DASHBOARD_CACHE_TTL_MS = 30000;

export const API = {
  getBase,
  invalidateCache,

  async dashboard(
    desde: string,
    hasta: string,
    opts: Record<string, any> = {}
  ) {
    const paisCode = normPaisQuery(opts.pais);
    const key = `dashboard|${desde}|${hasta}|${opts.asesor || opts.nombre || ''}|${paisCode}|${opts.tipoLead || ''}|${opts.origen || ''}|${opts.tipoLlamada || ''}`;
    const cached = readCache(key);
    if (cached) return cached;
    const params = {
      desde, hasta,
      ...(opts.asesor ? asesorParam(opts.asesor) : nombreParam(opts.nombre)),
      ...paisParam(paisCode),
      ...tipoLeadParam(opts.tipoLead),
      ...origenParam(opts.origen),
      ...tipoLlamadaParam(opts.tipoLlamada)
    };
    const data = await get('/metrics/admin/dashboard', params);
    writeCache(key, data, DASHBOARD_CACHE_TTL_MS);
    return data;
  },

  async dashboardMetrics(
    desde: string,
    hasta: string,
    opts: Record<string, any> = {}
  ) {
    const paisCode = normPaisQuery(opts.pais);
    const key = `dm|${desde}|${hasta}|${paisCode}|${opts.tipoLead || ''}|${opts.origen || ''}`;
    const cached = readCache(key);
    if (cached) return cached;
    const params: Record<string, any> = { desde, hasta };
    if (paisCode) params.pais = paisCode;
    if (opts.tipoLead) params.tipoLead = opts.tipoLead;
    if (opts.origen) params.origen = opts.origen;
    const data = await get('/metrics/dashboard', params);
    writeCache(key, data, DASHBOARD_CACHE_TTL_MS);
    return data;
  },

  resumen(desde: string, hasta: string, nombre?: string, pais?: string, tipoLead?: string, origen?: string) {
    return get('/metrics/resumen', { desde, hasta, ...nombreParam(nombre), ...paisParam(pais), ...tipoLeadParam(tipoLead), ...origenParam(origen) });
  },

  asesores(desde: string, hasta: string, group_by = 'asesor', nombre?: string, pais?: string, tipoLead?: string, origen?: string) {
    return get('/metrics/asesores', { desde, hasta, group_by, ...nombreParam(nombre), ...paisParam(pais), ...tipoLeadParam(tipoLead), ...origenParam(origen) });
  },

  asesor(asesor: string, desde: string, hasta: string, pais?: string, tipoLead?: string, origen?: string, tipoLlamada?: string) {
    return get('/metrics/asesor', { asesor, desde, hasta, ...paisParam(pais), ...tipoLeadParam(tipoLead), ...origenParam(origen), ...tipoLlamadaParam(tipoLlamada) });
  },

  propuestasPorRubro(desde: string, hasta: string, group_by = 'rubro', nombre?: string, pais?: string, tipoLead?: string, origen?: string) {
    return get('/metrics/propuestas-por-rubro', { desde, hasta, group_by, ...nombreParam(nombre), ...paisParam(pais), ...tipoLeadParam(tipoLead), ...origenParam(origen) });
  },

  negociacion(desde: string, hasta: string, nombre?: string, pais?: string, tipoLead?: string, origen?: string) {
    return get('/metrics/negociacion', { desde, hasta, ...nombreParam(nombre), ...paisParam(pais), ...tipoLeadParam(tipoLead), ...origenParam(origen) });
  },

  motivosPerdida(desde: string, hasta: string, limite = 50, nombre?: string, pais?: string, tipoLead?: string, origen?: string) {
    return get('/metrics/motivos-perdida', { desde, hasta, limite, ...nombreParam(nombre), ...paisParam(pais), ...tipoLeadParam(tipoLead), ...origenParam(origen) });
  },

  motivosPerdidaAgrupados(desde: string, hasta: string, nombre?: string, pais?: string, tipoLead?: string, origen?: string) {
    return get('/metrics/motivos-perdida/agrupados', { desde, hasta, ...nombreParam(nombre), ...paisParam(pais), ...tipoLeadParam(tipoLead), ...origenParam(origen) });
  },

  reuniones(desde: string, hasta: string, limite = 200, offset = 0, extra: Record<string, any> = {}) {
    const params: Record<string, any> = { desde, hasta, limite, offset };
    if (extra.asesor) params.asesor = extra.asesor;
    else if (extra.nombre) params.asesor = extra.nombre;
    if (extra.pais) params.pais = extra.pais;
    if (extra.tipoLead) params.tipo_lead = extra.tipoLead;
    if (extra.origen) params.origen = extra.origen;
    if (extra.tipoLlamada) params.tipo_llamada = extra.tipoLlamada;
    return get('/metrics/reuniones', params);
  },

  listaAsesores(desde: string, hasta: string, nombre?: string, pais?: string, tipoLead?: string, origen?: string) {
    return get('/metrics/lista-asesores', { desde, hasta, ...nombreParam(nombre), ...paisParam(pais), ...tipoLeadParam(tipoLead), ...origenParam(origen) });
  },

  fuentes(desde: string, hasta: string, extra: Record<string, any> = {}) {
    const { tipoLead, origen, ...rest } = extra;
    return get('/metrics/fuentes', { desde, hasta, ...rest, ...tipoLeadParam(tipoLead), ...origenParam(origen) });
  },

  tiempoRespuesta(desde: string, hasta: string, groupBy = 'asesor', extra: Record<string, any> = {}) {
    const { tipoLead, origen, ...rest } = extra;
    return get('/metrics/tiempo-respuesta', { desde, hasta, group_by: groupBy, ...rest, ...tipoLeadParam(tipoLead), ...origenParam(origen) });
  },

  nivelesEscalacion(desde: string, hasta: string, extra: Record<string, any> = {}) {
    const { tipoLead, origen, ...rest } = extra;
    return get('/metrics/niveles-escalacion', { desde, hasta, ...rest, ...tipoLeadParam(tipoLead), ...origenParam(origen) });
  },

  decisiones(desde: string, hasta: string, extra: Record<string, any> = {}) {
    const { tipoLead, origen, ...rest } = extra;
    return get('/metrics/decisiones', { desde, hasta, ...rest, ...tipoLeadParam(tipoLead), ...origenParam(origen) });
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
  },

  advisorOverdueList(params: { asesor?: string; desde?: string; hasta?: string; pais?: string; tipoLead?: string; origen?: string; tipoLlamada?: string } = {}) {
    return get('/metrics/advisor-overdue', {
      asesor: params.asesor,
      desde: params.desde,
      hasta: params.hasta,
      pais: params.pais,
      tipo_lead: params.tipoLead,
      origen: params.origen,
      tipo_llamada: params.tipoLlamada,
    });
  },

  advisorOverdueDetail(advisorId: string, params: { desde?: string; hasta?: string; pais?: string } = {}) {
    return get(`/metrics/advisor-overdue/${encodeURIComponent(advisorId)}`, params);
  },

  stageOverdueSummary(params: { asesor?: string; desde?: string; hasta?: string; pais?: string; tipoLead?: string; origen?: string; tipoLlamada?: string } = {}) {
    return get('/metrics/stage-overdue-summary', {
      asesor: params.asesor,
      desde: params.desde,
      hasta: params.hasta,
      pais: params.pais,
      tipo_lead: params.tipoLead,
      origen: params.origen,
      tipo_llamada: params.tipoLlamada,
    });
  },

  advisorOverdueAcknowledge(eventId: number) {
    return patch(`/metrics/advisor-overdue/${encodeURIComponent(String(eventId))}/acknowledge`, {});
  },
};