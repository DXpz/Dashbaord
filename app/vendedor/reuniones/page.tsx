'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useVendedorFilters } from '@/lib/vendedor-filters';
import { API } from '@/services/api';
import { Formulario } from '@/components/formulario/Formulario';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

const PAGE_SIZE = 20;

function StatusBadge({ reunion }: { reunion: any }) {
  const status = reunion.status || reunion.reunion_status || '';
  const resultado = reunion.resultado_venta || '';
  const categoriaCierre = reunion.categoria_cierre || '';
  const s = status.toLowerCase();

  if (resultado === 'cerrada') return <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded">Venta concretada</span>;
  if (resultado === 'perdida') return <span className="text-xs font-medium text-red-700 bg-red-50 px-2 py-1 rounded">Lead perdido</span>;
  if (resultado === 'en_seguimiento') return <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded">En Seguimiento</span>;
  if (categoriaCierre && categoriaCierre.includes('sin_contacto')) return <span className="text-xs font-medium text-red-700 bg-red-50 px-2 py-1 rounded">Lead perdido</span>;
  if (s === 'pending') return <span className="text-xs font-medium text-yellow-700 bg-yellow-50 px-2 py-1 rounded">Pendiente</span>;
  if (s === 'en_proceso') return <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded">En Proceso</span>;
  if (s === 'no_calificado') return <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded">No calificado</span>;
  if (s === 'cerrado') return <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded">Cerrado</span>;
  if (s === 'alerted') return <span className="text-xs font-medium text-red-700 bg-red-50 px-2 py-1 rounded">Alertado</span>;
  return <span className="text-xs text-gray-500">{status || '—'}</span>;
}

function StageBadge({ stageLabel, stageNum }: { stageLabel?: string; stageNum?: number }) {
  if (stageLabel) return <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{stageLabel}</span>;
  if (stageNum == null) return <span className="text-gray-400">—</span>;
  return <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Etapa {stageNum}</span>;
}

function getInitialStageFromStageNumber(stageNum?: number): 'REUNION' | 'DEMO' | 'PROPUESTA' | 'SEGUIMIENTO' | 'CIERRE' {
  if (stageNum === 3) return 'DEMO';
  if (stageNum === 4) return 'PROPUESTA';
  if (stageNum === 5) return 'SEGUIMIENTO';
  if (stageNum === 6) return 'CIERRE';
  return 'REUNION';
}

function FeedbackModal({ reunion, onClose }: { reunion: any; onClose: () => void }) {
  const segRaw = reunion.seguimiento_json;
  let seg: any = {};
  if (typeof segRaw === 'string' && segRaw.trim()) {
    try { seg = JSON.parse(segRaw); } catch { seg = {}; }
  } else if (typeof segRaw === 'object' && segRaw !== null) {
    seg = segRaw;
  }
  const stageFeedbackRaw = reunion.stage_feedback_json;
  let stageFeedback: any = {};
  if (typeof stageFeedbackRaw === 'string' && stageFeedbackRaw.trim()) {
    try { stageFeedback = JSON.parse(stageFeedbackRaw); } catch { stageFeedback = {}; }
  } else if (typeof stageFeedbackRaw === 'object' && stageFeedbackRaw !== null) {
    stageFeedback = stageFeedbackRaw;
  }
  const stage2 = stageFeedback['2'] || {};
  const modeloEquipo = stageFeedback.modelo_equipo_propuesto || stage2.modelo_equipo_propuesto || '';
  const cantidadEquipo = stageFeedback.cantidad_equipos || stage2.cantidad_equipos || '';

  const rawFeedback = reunion.advisor_feedback || '';
  const firstPipeIndex = rawFeedback.indexOf('|');
  const plainFeedback = firstPipeIndex > -1
    ? rawFeedback.substring(0, firstPipeIndex).trim()
    : rawFeedback.trim();

  const resultado = reunion.resultado_venta || seg.resultado_propuesta || seg.resultado_cierre || '';
  const isGanada = resultado.toLowerCase().includes('ganada') || resultado.toLowerCase().includes('cerrada');
  const isPerdida = resultado.toLowerCase().includes('perdida');

  const detailFields: Record<string, { label: string; order: number }> = {
    fecha_reunion: { label: 'Fecha', order: 1 },
    tipo_reunion: { label: 'Tipo Reunión', order: 2 },
    industria_sector: { label: 'Industria', order: 3 },
    modelo_equipo: { label: 'Modelos Ofrecidos', order: 4 },
    cantidad_equipo: { label: 'Cantidad', order: 5 },
    interes_producto: { label: 'Interés', order: 6 },
    requiere_demo: { label: 'Requiere Demo', order: 7 },
  };
  const detailKeys = Object.keys(detailFields).sort((a, b) => detailFields[a].order - detailFields[b].order);

  const structuredFields: Record<string, string> = {};
  let advisorFeedbackText = '';
  let hasStructuredData = false;

  const advisorFields = ['industria_sector', 'tipo_reunion', 'interes_producto', 'requiere_demo', 'fecha_reunion', 'retroalimentacion'];

  if (advisorFields.some(k => rawFeedback.includes(k))) {
    hasStructuredData = true;
    advisorFields.forEach(fk => {
      const match = rawFeedback.match(new RegExp(`${fk}:\\s*([^;]+?)(?:;\\s*(?:${advisorFields.join('|')})|$)`));
      if (match) structuredFields[fk] = match[1].trim();
    });
    const retroMatch = rawFeedback.match(/retroalimentacion:\s*([^;]+?)(?:;|$)/);
    if (retroMatch) advisorFeedbackText = retroMatch[1].trim();
  }

  if (modeloEquipo) structuredFields.modelo_equipo = modeloEquipo;
  if (cantidadEquipo) structuredFields.cantidad_equipo = cantidadEquipo;
  if (Object.keys(structuredFields).length > 0) hasStructuredData = true;

  const statusColor = isGanada ? 'bg-green-50 text-green-700 border-green-200' : isPerdida ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200';
  const statusLabel = isGanada ? 'Venta concretada' : isPerdida ? 'Lead perdido' : reunion.opportunity_stage_label || 'En proceso';

  const formatValue = (key: string, value: string) => {
    if (key === 'interes_producto') {
      const map: Record<string, string> = { si: 'Sí', no: 'No', evaluando: 'Evaluando' };
      const label = map[value.toLowerCase()] || value;
      const isPos = value.toLowerCase() === 'si';
      return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${isPos ? 'bg-green-100 text-green-700' : value.toLowerCase() === 'no' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{label}</span>;
    }
    if (key === 'requiere_demo') {
      const isSi = value.toLowerCase() === 'si';
      return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${isSi ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{isSi ? 'Sí' : 'No'}</span>;
    }
    if (key === 'fecha_reunion') {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        const day = d.getDate().toString().padStart(2, '0');
        const month = d.toLocaleDateString('es-ES', { month: 'long' }).toUpperCase();
        const year = d.getFullYear();
        return `${day} ${month} ${year}`;
      }
    }
    if (key === 'industria_sector') return value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    if (key === 'tipo_reunion') return value.charAt(0).toUpperCase() + value.slice(1);
    return value;
  };

  const renderStructuredFields = () => {
    return (
      <div className="space-y-2">
        {detailKeys.map(fk => {
          const val = structuredFields[fk];
          if (!val) return null;
          return (
            <div key={fk} className="flex justify-between text-sm items-center">
              <span className="text-[#B5B5AE]">{detailFields[fk].label}</span>
              <span className="font-medium text-[#1F1D3D]">{formatValue(fk, val)}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#EEEEEC] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1F1D3D] flex items-center justify-center text-white font-semibold text-sm">
              {reunion.client_id?.replace('LD', '') || '?'}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#1F1D3D]">{reunion.client_name || reunion.cliente || '—'}</h3>
              <p className="text-xs text-[#B5B5AE]">{reunion.client_id} · {reunion.advisor_name || '—'}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-[#B5B5AE] hover:text-[#35325B] hover:bg-[#F5F5ED] rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 py-5 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${statusColor}`}>
              {statusLabel}
            </span>
            <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#F5F5ED] text-[#35325B] border border-[#EEEEEC]">
              {reunion.opportunity_stage_label || '—'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#F5F5ED] rounded-xl p-4 space-y-2">
              <h4 className="text-[10px] font-semibold text-[#B5B5AE] uppercase tracking-wider">Información</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#B5B5AE]">País</span>
                  <span className="font-medium text-[#1F1D3D]">{reunion.country || reunion.pais || '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#B5B5AE]">Teléfono</span>
                  <span className="font-medium text-[#1F1D3D]">{reunion.client_phone || '—'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#B5B5AE]">Fecha</span>
                  <span className="font-medium text-[#1F1D3D]">
                    {(() => {
                      const d = new Date(reunion.created_at);
                      if (!isNaN(d.getTime())) {
                        const day = d.getDate().toString().padStart(2, '0');
                        const month = d.toLocaleDateString('es-ES', { month: 'long' }).toUpperCase();
                        const year = d.getFullYear();
                        return `${day} ${month} ${year}`;
                      }
                      return '—';
                    })()}
                  </span>
                </div>
                {reunion.minutos_hasta_retro != null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#B5B5AE]">Próxima retro</span>
                    <span className="font-medium text-[#1F1D3D]">{reunion.minutos_hasta_retro} min</span>
                  </div>
                )}
              </div>
            </div>

            {hasStructuredData && (
              <div className="border border-[#EEEEEC] rounded-xl p-4 space-y-2">
                <h4 className="text-[10px] font-semibold text-[#B5B5AE] uppercase tracking-wider">Datos de la Reunión</h4>
                {renderStructuredFields()}
              </div>
            )}

            {!hasStructuredData && plainFeedback && (
              <div className="bg-[#F5F5ED] rounded-xl p-4">
                <h4 className="text-[10px] font-semibold text-[#B5B5AE] uppercase tracking-wider mb-2">Feedback</h4>
                <p className="text-sm text-[#35325B] leading-relaxed">{plainFeedback}</p>
              </div>
            )}
          </div>

          {isPerdida && (
            <div className="rounded-xl p-4 border bg-red-50 border-red-100">
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-1 text-red-700">Motivo de Pérdida</h4>
              <p className="text-sm leading-relaxed text-red-600">{seg.motivo_perdida || reunion.categoria_cierre || 'Lead perdido'}</p>
            </div>
          )}

          {isGanada && reunion.categoria_cierre && reunion.categoria_cierre.toLowerCase() !== 'sin categoria' && (
            <div className="rounded-xl p-4 border bg-green-50 border-green-100">
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-1 text-green-700">Cierre Exitoso</h4>
              <p className="text-sm leading-relaxed text-green-600">{reunion.categoria_cierre}</p>
            </div>
          )}

          {hasStructuredData && advisorFeedbackText && (
            <div className="bg-[#1F1D3D] rounded-xl p-4">
              <h4 className="text-[10px] font-semibold text-[#B5B5AE] uppercase tracking-wider mb-2">Retroalimentación del Asesor</h4>
              <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{advisorFeedbackText}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VendedorReunionesPage() {
  const { user } = useAuth();
  const { desde, hasta } = useVendedorFilters();
  const [reuniones, setReuniones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewLead, setViewLead] = useState<{ clientId: string; initialStage: 'REUNION' | 'DEMO' | 'PROPUESTA' | 'SEGUIMIENTO' | 'CIERRE' } | null>(null);
  const [sortAsc, setSortAsc] = useState(false);

  const fetchReuniones = useCallback(async () => {
    if (!user?.full_name) return;
    setLoading(true);
    try {
      const result = await API.reuniones(desde, hasta, 200, 0, { nombre: user.full_name });
      const list = result?.items || result?.reuniones || (Array.isArray(result) ? result : []);
      setReuniones(list);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.full_name, desde, hasta]);

  useEffect(() => {
    fetchReuniones();
  }, [fetchReuniones]);

  const filteredReuniones = useMemo(() => {
    let result = reuniones;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter((r: any) =>
        (r.client_name || r.cliente || '').toLowerCase().includes(q) ||
        (r.client_id || r.opportunity_number || '').toString().toLowerCase().includes(q) ||
        (r.client_phone || '').toLowerCase().includes(q)
      );
    }
    return [...result].sort((a: any, b: any) => {
      const aId = a.client_id || a.opportunity_number || a.opportunityNumber || '';
      const bId = b.client_id || b.opportunity_number || b.opportunityNumber || '';
      const aNum = parseInt(aId.replace(/\D/g, '') || '0', 10);
      const bNum = parseInt(bId.replace(/\D/g, '') || '0', 10);
      if (aNum !== bNum) return sortAsc ? aNum - bNum : bNum - aNum;
      return sortAsc ? aId.localeCompare(bId) : bId.localeCompare(aId);
    });
  }, [reuniones, searchTerm, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filteredReuniones.length / PAGE_SIZE));
  const paginatedReuniones = filteredReuniones.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="space-y-4">
      {viewLead && (
        <Formulario
          clientId={viewLead.clientId}
          initialStage={viewLead.initialStage}
          readOnly={user?.country_code === 'GT'}
          vendorReadOnlyBanner={user?.country_code === 'GT'}
          onClose={() => setViewLead(null)}
        />
      )}
      <div className="bg-white border border-[#EEEEEC] overflow-x-auto">
        <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EEEEEC]">
          <div>
            <h3 className="text-sm font-medium text-[#1F1D3D]">Mis Reuniones</h3>
            <p className="text-xs text-[#B5B5AE] mt-0.5">{filteredReuniones.length} reuniones</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B5B5AE]" />
              <Input
                placeholder="Buscar..."
                className="pl-8 w-36 sm:w-48"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <div className="flex items-center gap-1 bg-[#F5F5ED] p-1 rounded">
              <Button variant="ghost" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 px-2">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-[#35325B] px-1.5 min-w-[50px] text-center">
                {currentPage}/{totalPages}
              </span>
              <Button variant="ghost" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="h-8 px-2">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        {loading ? (
          <Skeleton className="h-96 w-full" />
        ) : (
          <div className="min-w-[700px] sm:min-w-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Lead #</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden sm:table-cell">Fecha</TableHead>
                  <TableHead className="hidden md:table-cell">Teléfono</TableHead>
                  <TableHead className="hidden lg:table-cell">País</TableHead>
                  <TableHead>Etapa</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedReuniones.length > 0 ? (
                  paginatedReuniones.map((reunion: any) => (
                    <TableRow key={reunion.id || reunion.client_id || Math.random()}>
                      <TableCell>
                        <span className="font-medium text-[#1F1D3D]">{reunion.client_id || '—'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-[#1F1D3D]">{reunion.client_name || reunion.cliente || '—'}</span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-[#B5B5AE] text-xs">
                        {reunion.created_at ? new Date(reunion.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span>{reunion.client_phone || reunion.telefono || '—'}</span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-xs bg-[#F5F5ED] text-[#35325B] px-2 py-1 rounded">{reunion.country || reunion.pais || '—'}</span>
                      </TableCell>
                      <TableCell>
                        <StageBadge stageLabel={reunion.opportunity_stage_label} stageNum={reunion.opportunity_stage} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge reunion={reunion} />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewLead({
                            clientId: reunion.client_id || reunion.opportunity_number || '',
                            initialStage: getInitialStageFromStageNumber(reunion.opportunity_stage),
                          })}
                          className="text-[#35325B] hover:bg-[#F5F5ED] p-1"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-[#B5B5AE]">
                      Sin reuniones
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
