'use client';

import { useState, useEffect } from 'react';
import { Shell } from '@/components/layout/Shell';
import { useAdvisorOverdue, OverdueFilters } from '@/hooks';
import { useAuth } from '@/lib/auth-context';
import { AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useAsesores } from '@/hooks';
import { API } from '@/services/api';

const STAGE_LABELS: Record<number, string> = {
  1: 'Asignación',
  2: 'Reunión',
  3: 'Demo',
  4: 'Propuesta',
  5: 'Seguimiento',
  6: 'Cierre',
};

// SLA configurado por etapa (en dias habiles)
const STAGE_SLA_DAYS: Record<number, number> = {
  1: 0.04,  // 1 hora
  2: 1,      // 1 dia habil
  3: 5,      // 5 dias habiles
  4: 1,      // 1 dia habil
  5: 10,     // 10 dias habiles
  6: 0,      // Cierre: sin SLA
};

// Suma de SLAs desde una etapa hasta Cierre (suma de las etapas restantes)
function slaRestanteDesde(stage: number): number {
  let total = 0;
  for (let s = stage; s <= 6; s++) {
    total += STAGE_SLA_DAYS[s] || 0;
  }
  return total;
}

const STAGE_BADGE_COLOR: Record<number, string> = {
  1: 'bg-[#F5F5ED] text-[#35325B]',
  2: 'bg-[#EEF2FF] text-[#4338CA]',
  3: 'bg-[#FEF3C7] text-[#92400E]',
  4: 'bg-[#DBEAFE] text-[#1E40AF]',
  5: 'bg-[#FCE7F3] text-[#9D174D]',
};

function getLastDayOfMonth(year: number, month: string) {
  const d = new Date(Number(year), Number(month), 0);
  return `${year}-${month}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// Lee el filtro global persistido (mismo storage que FilterBar / useFilters)
// y devuelve { month, year } segun el campo `desde`.
function readGlobalMonthYear(): { month: string; year: string } {
  if (typeof window === 'undefined') return { month: '', year: '' };
  try {
    const raw = localStorage.getItem('dashboard_filters');
    if (raw) {
      const parsed = JSON.parse(raw);
      const desde = parsed?.desde as string | undefined;
      if (desde && /^\d{4}-\d{2}-\d{2}$/.test(desde)) {
        const [y, m] = desde.split('-');
        return { month: m, year: y };
      }
    }
  } catch {}
  return { month: '', year: '' };
}

// Persiste { month, year } en el filtro global, recalculando desde/hasta.
// Mantiene sincronizado el mes entre metricas-etapas y el resto de vistas.
function writeGlobalMonthYear(month: string, year: string) {
  if (typeof window === 'undefined') return;
  if (!month || !year) return;
  try {
    const raw = localStorage.getItem('dashboard_filters');
    const current = raw ? JSON.parse(raw) : {};
    const lastDay = new Date(Number(year), Number(month), 0).getDate();
    const desde = `${year}-${month}-01`;
    const hasta = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
    localStorage.setItem(
      'dashboard_filters',
      JSON.stringify({ ...current, desde, hasta })
    );
  } catch {}
}

function diasVencido(deadline: string, acknowledged_at?: string | null): number {
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return 0;
  // Si el evento ya fue acknowledged (el asesor dio retroalimentacion),
  // contar los dias hasta ese momento (NO hasta hoy).
  // Asi "3 dias vencido" significa que el SLA vencio por 3 dias antes de resolverse,
  // sin importar cuanto tiempo paso desde entonces.
  const endDate = acknowledged_at ? new Date(acknowledged_at) : new Date();
  const diff = endDate.getTime() - d.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function formatVencido(deadline: string, acknowledged_at?: string | null): string {
  const d = new Date(deadline);
  if (isNaN(d.getTime())) return '0d';
  const endDate = acknowledged_at ? new Date(acknowledged_at) : new Date();
  const diffMs = endDate.getTime() - d.getTime();
  if (diffMs < 0) return '0d';
  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (totalHours < 24) return `${totalHours}h`;
  const dias = Math.floor(totalHours / 24);
  const horas = totalHours % 24;
  return horas > 0 ? `${dias}d ${horas}h` : `${dias}d`;
}

export default function MetricasEtapasPage() {
  const { user } = useAuth();
  const [asesorFilter, setAsesorFilter] = useState('');
  const [paisFilter, setPaisFilter] = useState<string>(''); // solo super_admin usa esto (independiente del filtro global)
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  const isSuperAdmin = user?.is_super_admin ?? false;
  // Super admin: usa dropdown (ALL/SV/GT). Resto: auto-filtrado por su pais.
  const paisValue = isSuperAdmin
    ? (paisFilter || 'ALL')
    : (user?.country_code || undefined);

  const filters: OverdueFilters = {
    asesor: asesorFilter || undefined,
    desde: month && year ? `${year}-${month}-01` : undefined,
    hasta: month && year ? getLastDayOfMonth(Number(year), month) : undefined,
    pais: paisValue || undefined,
  };

  const { advisors, loading, error, totalEvents, refetch } = useAdvisorOverdue(filters);

  const allAsesoresRaw = useAsesores({
    desde: month && year ? `${year}-${month}-01` : '',
    hasta: month && year ? getLastDayOfMonth(Number(year), month) : '',
    // Super admin: usar el pais seleccionado (SV/GT/ALL). Resto: auto por su pais.
    // Asi el dropdown "Todos los asesores" se actualiza segun el pais del filtro.
    pais: isSuperAdmin ? (paisFilter || 'ALL') : (user?.country_code || ''),
    asesor: '',
    tipoLead: '',
    origen: '',
    tipoLlamada: '',
  });
  const allAsesores = (Array.isArray(allAsesoresRaw) ? allAsesoresRaw : []).map((a: string) => ({ value: a, label: a }));

  // Mes/Año sincronizados con el filtro global persistido en localStorage.
  // Si en otra vista (resumen, leads, etc.) el usuario eligio "Junio 2026",
  // aqui se muestra "Junio 2026". Si cambia aqui, persiste para las demas vistas.
  useEffect(() => {
    const global = readGlobalMonthYear();
    if (global.month && global.year) {
      setMonth(global.month);
      setYear(global.year);
      return;
    }
    // Sin global guardado: usar mes/año actual como default
    const now = new Date();
    setMonth(String(now.getMonth() + 1).padStart(2, '0'));
    setYear(String(now.getFullYear()));
  }, []);

  const handleMonthChange = (newMonth: string) => {
    setMonth(newMonth);
    const newYear = year || String(new Date().getFullYear());
    writeGlobalMonthYear(newMonth, newYear);
  };

  const handleYearChange = (newYear: string) => {
    setYear(newYear);
    const newMonth = month || String(new Date().getMonth() + 1).padStart(2, '0');
    writeGlobalMonthYear(newMonth, newYear);
  };

  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    if (advisors.length === 0) {
      setAllEvents([]);
      return;
    }
    let cancelled = false;
    setLoadingEvents(true);
    (async () => {
      try {
        // Solo fetch detail para advisors con advisor_id valido (excluir null/undefined legacy)
        const advisorsConId = advisors.filter((a: any) => a.advisor_id != null);
        const promises = advisorsConId.map((a: any) =>
          API.advisorOverdueDetail(String(a.advisor_id), {
            desde: filters.desde,
            hasta: filters.hasta,
            pais: filters.pais,
          }).then(d => (d?.events || []).map((ev: any) => ({
            ...ev,
            advisor_name: a.advisor_name,
            advisor_country: a.country,
            dias_vencido: diasVencido(ev.deadline, ev.acknowledged_at),
          }))).catch(() => [])
        );
        const results = await Promise.all(promises);
        if (!cancelled) {
          // Agrupar por audit_id: un lead puede tener multiples eventos (uno por stage)
          const allEventsList = results.flat();
          const byLead: Record<string, any> = {};
          allEventsList.forEach((ev: any) => {
            if (!byLead[ev.audit_id]) {
              byLead[ev.audit_id] = {
                audit_id: ev.audit_id,
                client_id: ev.client_id,
                advisor_name: ev.advisor_name,
                advisor_country: ev.advisor_country,
                events: [],
                max_dias_vencido: 0,
                current_stage: ev.stage,
              };
            }
            byLead[ev.audit_id].events.push(ev);
            byLead[ev.audit_id].max_dias_vencido = Math.max(
              byLead[ev.audit_id].max_dias_vencido,
              ev.dias_vencido
            );
            // El current_stage es el stage MAS ALTO visto (donde esta el lead ahora)
            if (ev.stage > byLead[ev.audit_id].current_stage) {
              byLead[ev.audit_id].current_stage = ev.stage;
            }
          });
          const leads = Object.values(byLead);
          // Ordenar por dias vencido del current stage
          leads.sort((a: any, b: any) => {
            const aCur = a.events.find((e: any) => e.stage === a.current_stage);
            const bCur = b.events.find((e: any) => e.stage === b.current_stage);
            return (bCur?.dias_vencido || 0) - (aCur?.dias_vencido || 0);
          });
          setAllEvents(leads as any);
        }
      } finally {
        if (!cancelled) setLoadingEvents(false);
      }
    })();
    return () => { cancelled = true; };
  }, [advisors, filters.desde, filters.hasta, filters.pais]);

  return (
    <Shell
      pageTitle="Métricas por Etapas"
      filters={{} as any}
      onFilterChange={() => {}}
      onFiltrar={() => {}}
      onLimpiar={() => {}}
      connectionStatus={{ isConnected: true } as any}
      asesores={[]}
      showFilterBar={false}
    >
      <div className="space-y-4">
        <div className="bg-white border border-[#EEEEEC] rounded-xl p-4 flex flex-wrap items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-[#1F1D3D]">Eventos vencidos en total</p>
            <p className="text-xs text-[#B5B5AE]">Leads que superaron el deadline sin retroalimentación</p>
          </div>
          <div className="ml-auto text-2xl font-bold text-[#1F1D3D]">{totalEvents}</div>
        </div>

        <div className="bg-white border border-[#EEEEEC] rounded-xl p-4 flex flex-wrap items-center gap-3">
          <select
            value={asesorFilter}
            onChange={e => setAsesorFilter(e.target.value)}
            className="text-sm px-3 py-2 border border-[#EEEEEC] rounded text-[#35325B] bg-[#F5F5ED] outline-none"
          >
            <option value="">Todos los asesores</option>
            {allAsesores.map((a: any) => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>

          {isSuperAdmin && (
            <select
              value={paisFilter}
              onChange={e => {
                setPaisFilter(e.target.value);
                // Resetear el asesor seleccionado: un asesor de SV no debe
                // quedar activo al cambiar a GT (o viceversa).
                setAsesorFilter('');
              }}
              className="text-sm px-3 py-2 border border-[#EEEEEC] rounded text-[#35325B] bg-[#F5F5ED] outline-none"
              title="Filtro de país (solo super admin)"
            >
              <option value="ALL">Todos los países</option>
              <option value="SV">El Salvador</option>
              <option value="GT">Guatemala</option>
            </select>
          )}

          <select
            value={month}
            onChange={e => handleMonthChange(e.target.value)}
            title="Mes (sincronizado con el filtro global)"
            className="text-sm px-3 py-2 border border-[#EEEEEC] rounded text-[#35325B] bg-[#F5F5ED] outline-none"
          >
            <option value="">Mes</option>
            {[
              { v: '01', l: 'Enero' }, { v: '02', l: 'Febrero' }, { v: '03', l: 'Marzo' },
              { v: '04', l: 'Abril' }, { v: '05', l: 'Mayo' }, { v: '06', l: 'Junio' },
              { v: '07', l: 'Julio' }, { v: '08', l: 'Agosto' }, { v: '09', l: 'Septiembre' },
              { v: '10', l: 'Octubre' }, { v: '11', l: 'Noviembre' }, { v: '12', l: 'Diciembre' },
            ].map(m => (
              <option key={m.v} value={m.v}>{m.l}</option>
            ))}
          </select>

          <select
            value={year}
            onChange={e => handleYearChange(e.target.value)}
            title="Año (sincronizado con el filtro global)"
            className="text-sm px-3 py-2 border border-[#EEEEEC] rounded text-[#35325B] bg-[#F5F5ED] outline-none"
          >
            <option value="">Año</option>
            {[2025, 2026, 2027].map(y => (
              <option key={y} value={String(y)}>{y}</option>
            ))}
          </select>
        </div>

        {loading || loadingEvents ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}
          </div>
        ) : error ? (
          <div className="text-sm text-red-500 p-4">{error}</div>
        ) : (
          <div className="bg-white border border-[#EEEEEC] rounded-xl overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F5F5ED]">
                  <TableHead rowSpan={2} className="whitespace-nowrap align-bottom">Cliente</TableHead>
                  <TableHead rowSpan={2} className="whitespace-nowrap align-bottom">Asesor</TableHead>
                  <TableHead rowSpan={2} className="whitespace-nowrap align-bottom">País</TableHead>
                  <TableHead colSpan={6} className="text-center text-[#1F1D3D] border-l border-[#EEEEEC] py-2">Etapa donde venció</TableHead>
                  <TableHead rowSpan={2} className="text-center whitespace-nowrap align-bottom border-l border-[#EEEEEC]">Días vencido</TableHead>
                  <TableHead colSpan={2} className="text-center text-[#1F1D3D] border-l border-[#EEEEEC] py-2">SLA</TableHead>
                </TableRow>
                <TableRow className="bg-[#F5F5ED]">
                  {[1, 2, 3, 4, 5, 6].map(s => (
                    <TableHead key={s} className="text-center whitespace-nowrap border-l border-[#EEEEEC] py-2" style={{ minWidth: 70 }}>
                      <div className="text-[10px] text-[#B5B5AE] font-normal">
                        SLA {!STAGE_SLA_DAYS[s] ? 'N/A' : STAGE_SLA_DAYS[s] < 1 ? `${Math.round(STAGE_SLA_DAYS[s] * 24)}h` : `${STAGE_SLA_DAYS[s]}d`}
                      </div>
                      <div className="text-xs font-semibold text-[#1F1D3D]">{STAGE_LABELS[s]}</div>
                    </TableHead>
                  ))}
                  <TableHead className="text-center whitespace-nowrap border-l border-[#EEEEEC] py-2">
                    <div className="text-[10px] text-[#B5B5AE] font-normal">SLA</div>
                    <div className="text-xs font-semibold text-[#1F1D3D]">Total</div>
                  </TableHead>
                  <TableHead className="text-center whitespace-nowrap py-2">
                    <div className="text-[10px] text-[#B5B5AE] font-normal">SLA</div>
                    <div className="text-xs font-semibold text-[#1F1D3D]">Restante</div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center text-sm text-[#B5B5AE] py-8">
                      No hay eventos vencidos
                    </TableCell>
                  </TableRow>
                ) : (
                  allEvents.map((lead: any) => {
                    // Encontrar el evento del current_stage
                    const currentEvent = lead.events.find((e: any) => e.stage === lead.current_stage);
                    const totalDiasVencido = lead.events.reduce((sum: number, e: any) => sum + e.dias_vencido, 0);
                    const maxDiasVencido = lead.max_dias_vencido;
                    const currentSlaConf = slaRestanteDesde(lead.current_stage);
                    const currentDiasVencido = currentEvent?.dias_vencido || 0;
                    const restante = currentSlaConf - currentDiasVencido;
                    return (
                      <TableRow key={lead.audit_id} className="hover:bg-[#F8F9FA]">
                        <TableCell>
                          <div className="text-sm font-medium text-[#1F1D3D]">{lead.client_id}</div>
                          {lead.events.length > 1 && (
                            <div className="text-[10px] text-[#B5B5AE] mt-0.5">{lead.events.length} etapas vencidas</div>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-[#35325B] whitespace-nowrap">{lead.advisor_name}</TableCell>
                        <TableCell>
                          <span className="text-xs bg-[#F5F5ED] text-[#35325B] px-2 py-0.5 rounded">{lead.advisor_country}</span>
                        </TableCell>
                        {[1, 2, 3, 4, 5, 6].map(s => {
                          const eventInStage = lead.events.find((e: any) => e.stage === s);
                          return (
                            <TableCell key={s} className="text-center">
                              {eventInStage ? (
                                <span className="inline-flex flex-col items-center gap-0.5 text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-1.5 py-1 rounded">
                                  <span>VENCIDO</span>
                                  <span className="text-sm">{formatVencido(eventInStage.deadline, eventInStage.acknowledged_at)}</span>
                                </span>
                              ) : (
                                <span className="text-[#EEEEEC]">—</span>
                              )}
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-center">
                          <div className="text-sm font-bold text-red-700">
                            {(() => {
                              // Buscar el evento con el mayor dias_vencido real (no el truncado)
                              const topEv = lead.events.reduce((a: any, b: any) => (a.dias_vencido >= b.dias_vencido ? a : b));
                              return formatVencido(topEv.deadline, topEv.acknowledged_at);
                            })()}
                          </div>
                          {lead.events.length > 1 && (
                            <div className="text-[10px] text-[#B5B5AE] mt-0.5">
                              Σ {lead.events.reduce((sum: number, e: any) => sum + e.dias_vencido, 0)}d
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="text-xs text-[#B5B5AE]">SLA total</div>
                          <div className="text-sm font-semibold text-[#1F1D3D]">{currentSlaConf}d</div>
                        </TableCell>
                        <TableCell className="text-center">
                          {(() => {
                            const esPositivo = restante > 0;
                            return (
                              <div className={`text-sm font-bold ${esPositivo ? 'text-amber-600' : 'text-red-700'}`}>
                                {restante > 0 ? `+${restante}d` : `${restante}d`}
                              </div>
                            );
                          })()}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </Shell>
  );
}
