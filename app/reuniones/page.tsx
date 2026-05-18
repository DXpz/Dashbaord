'use client';

import { useState, useMemo } from 'react';
import { Shell } from '@/components/layout/Shell';
import { useReuniones, useConnectionStatus, useAsesores, useFilters, useAdvisorsForEdit, useStages } from '@/hooks';
import { API } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronLeft, ChevronRight, Search, FileText, X, Pencil, Check, Slash, ArrowUp, ArrowDown } from 'lucide-react';
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
  if (s === 'cerrado') return <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded">Cerrado</span>;
  if (s === 'alerted') return <span className="text-xs font-medium text-red-700 bg-red-50 px-2 py-1 rounded">Alertado</span>;
  return <span className="text-xs text-gray-500">{status || '—'}</span>;
}

function StageBadge({ stageLabel, stageNum, stages }: { stageLabel?: string; stageNum?: number; stages?: any[] }) {
  const labelFromNum = stageNum != null ? stages?.find(s => s.id === stageNum)?.label : undefined;
  const displayLabel = stageLabel || labelFromNum;
  if (displayLabel) return <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{displayLabel}</span>;
  if (stageNum == null) return <span className="text-gray-400">—</span>;
  return <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Etapa {stageNum}</span>;
}

function FeedbackModal({ reunion, onClose }: { reunion: any; onClose: () => void }) {
  const segRaw = reunion.seguimiento_json;
  const seg = typeof segRaw === 'string' && segRaw.trim()
    ? JSON.parse(segRaw)
    : {};
  const stageFeedbackRaw = reunion.stage_feedback_json;
  const stageFeedback = typeof stageFeedbackRaw === 'string' && stageFeedbackRaw.trim()
    ? JSON.parse(stageFeedbackRaw)
    : {};
  const stage2 = stageFeedback['2'] || {};

  const resultado = reunion.resultado_venta || seg.resultado_propuesta || seg.resultado_cierre || '';
  const isGanada = resultado.toLowerCase().includes('ganada') || resultado.toLowerCase().includes('cerrada');
  const isPerdida = resultado.toLowerCase().includes('perdida');

  const rawFeedback = reunion.advisor_feedback || '';
  const firstPipeIndex = rawFeedback.indexOf('|');
  const plainFeedback = firstPipeIndex > -1
    ? rawFeedback.substring(0, firstPipeIndex).trim()
    : rawFeedback.trim();

  const modeloEquipo = stage2.modelo_equipo || '';
  const cantidadEquipo = stage2.cantidad_equipo || '';

  const detailFields: Record<string, { label: string; wide?: boolean }> = {
    industria_sector: { label: 'Industria', wide: true },
    tipo_reunion: { label: 'Tipo Reunión' },
    interes_producto: { label: 'Interés' },
    modelo_equipo: { label: 'Modelo Equipo' },
    cantidad_equipo: { label: 'Cantidad' },
    requiere_demo: { label: 'Demo' },
    fecha_reunion: { label: 'Fecha' },
  };
  const detailKeys = Object.keys(detailFields);

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
      if (!isNaN(d.getTime())) return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    if (key === 'industria_sector') return value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    if (key === 'tipo_reunion') return value.charAt(0).toUpperCase() + value.slice(1);
    return value;
  };

  const renderStructuredFields = () => {
    const normalFields = detailKeys.filter(k => structuredFields[k] && !detailFields[k].wide);
    const wideFields = detailKeys.filter(k => structuredFields[k] && detailFields[k].wide);

    return (
      <div className="space-y-3">
        {wideFields.map(fk => (
          <div key={fk} className="flex justify-between text-sm items-start gap-4">
            <span className="text-[#B5B5AE] shrink-0">{detailFields[fk].label}</span>
            <span className="font-medium text-[#1F1D3D] text-right">{formatValue(fk, structuredFields[fk])}</span>
          </div>
        ))}
        {normalFields.length > 0 && (
          <div className="flex flex-wrap gap-4">
            {normalFields.map(fk => (
              <div key={fk} className="flex justify-between text-sm items-center gap-2 min-w-[140px]">
                <span className="text-[#B5B5AE] shrink-0">{detailFields[fk].label}</span>
                <span className="font-medium text-[#1F1D3D]">{formatValue(fk, structuredFields[fk])}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-[50rem] max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EEEEEC] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#1F1D3D] flex items-center justify-center text-white font-semibold text-base">
              {reunion.client_id?.replace('LD', '') || '?'}
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#1F1D3D]">{reunion.client_name || reunion.cliente || '—'}</h3>
              <p className="text-xs text-[#B5B5AE]">{reunion.client_id} · {reunion.advisor_name || '—'}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-[#B5B5AE] hover:text-[#35325B] hover:bg-[#F5F5ED] rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${statusColor}`}>
              {statusLabel}
            </span>
            <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#F5F5ED] text-[#35325B] border border-[#EEEEEC]">
              {reunion.opportunity_stage_label || '—'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#F5F5ED] rounded-xl p-4 space-y-3">
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
                    {reunion.created_at ? new Date(reunion.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
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
              <div className="border border-[#EEEEEC] rounded-xl p-4 space-y-3">
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
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-1 text-red-700">
                Motivo de Pérdida
              </h4>
              <p className="text-sm leading-relaxed text-red-600">
                {seg.motivo_perdida || reunion.categoria_cierre || 'Lead perdido'}
              </p>
            </div>
          )}

                    {isGanada && reunion.categoria_cierre && reunion.categoria_cierre.toLowerCase() !== 'sin categoria' && (
            <div className="rounded-xl p-4 border bg-green-50 border-green-100">
              <h4 className="text-xs font-semibold uppercase tracking-wider mb-1 text-green-700">
                Cierre Exitoso
              </h4>
              <p className="text-sm leading-relaxed text-green-600">
                {reunion.categoria_cierre}
              </p>
            </div>
          )}

          {hasStructuredData && advisorFeedbackText && (
            <div className="bg-[#1F1D3D] rounded-xl p-5">
              <h4 className="text-[10px] font-semibold text-[#B5B5AE] uppercase tracking-wider mb-3">Retroalimentación del Asesor</h4>
              <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{advisorFeedbackText}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReunionesPage() {
  const { filters, handleFilterChange, handleFiltrar, handleLimpiar } = useFilters();
  const { reuniones, loading } = useReuniones(filters);
  const connectionStatus = useConnectionStatus();
  const asesoresList = useAsesores(filters);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [feedbackReunion, setFeedbackReunion] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedRows, setEditedRows] = useState<Record<string, any>>({});
  const [sortAsc, setSortAsc] = useState(false);
  const editAdvisors = useAdvisorsForEdit(filters);
  const stages = useStages();

  const AsesoresOptions = useMemo(() => {
    const combined = Array.from(new Set([...asesoresList, ...editAdvisors]));
    return combined.map((a) => ({ value: a, label: a }));
  }, [asesoresList, editAdvisors]);

  const filteredReuniones = useMemo(() => {
    if (!Array.isArray(reuniones)) return [];
    let result = reuniones;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter((r: any) =>
        (r.client_name || r.cliente || '').toLowerCase().includes(q) ||
        (r.advisor_name || r.asesor || '').toLowerCase().includes(q) ||
        (r.subject || r.asunto || '').toLowerCase().includes(q) ||
        (r.country || r.pais || '').toLowerCase().includes(q) ||
        (r.client_id || r.opportunity_number || '').toString().toLowerCase().includes(q)
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const clientIds = Object.keys(editedRows);
      for (const clientId of clientIds) {
        const changes = editedRows[clientId];
        if (Object.keys(changes).length === 0) continue;
        const body: any = {};
        if (changes.client_name !== undefined) body.client_name = changes.client_name;
        if (changes.client_phone !== undefined) body.client_phone = changes.client_phone;
        if (changes.opportunity_stage !== undefined) body.opportunity_stage = parseInt(changes.opportunity_stage);
        if (changes.advisor_name !== undefined) body.advisor_name = changes.advisor_name;
        if (changes.country !== undefined) body.country = changes.country;
        if (changes.status !== undefined) body.status = changes.status;
        await API.auditPatch(clientId, body);
      }
      setEditedRows({});
      setEditMode(false);
    } catch (err) {
      console.error('Error saving edits:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (clientId: string, field: string, value: any) => {
    setEditedRows(prev => ({
      ...prev,
      [clientId]: { ...prev[clientId], [field]: value }
    }));
  };

  const getEditedValue = (clientId: string, field: string, original: any) => {
    if (editedRows[clientId] && editedRows[clientId][field] !== undefined) return editedRows[clientId][field];
    return original;
  };

  return (
    <Shell
      pageTitle="Reuniones"
      filters={filters}
      onFilterChange={handleFilterChange}
      onFiltrar={handleFiltrar}
      onLimpiar={handleLimpiar}
      asesores={AsesoresOptions}
      connectionStatus={connectionStatus}
    >
      {loading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <>
          {feedbackReunion && (
            <FeedbackModal reunion={feedbackReunion} onClose={() => setFeedbackReunion(null)} />
          )}
          <div className="bg-white border border-[#EEEEEC]">
            <div className="px-5 py-4 flex items-center justify-between gap-4 border-b border-[#EEEEEC]">
              <div>
                <h3 className="text-sm font-medium text-[#1F1D3D]">Listado</h3>
                <p className="text-xs text-[#B5B5AE] mt-0.5">{filteredReuniones.length} reuniones</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B5B5AE]" />
                  <Input
                    placeholder="Buscar..."
                    className="pl-9 w-48"
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  />
                </div>
                <Button variant="outline" size="sm" onClick={() => { if (editMode) handleSave(); else setEditMode(true); }} disabled={saving} className={`gap-1.5 text-xs h-8 border-[#EEEEEC] text-[#35325B] hover:bg-[#F5F5ED] ${editMode ? 'bg-[#1F1D3D] text-white border-[#1F1D3D]' : ''}`}>
                  <Pencil className="h-3.5 w-3.5" />
                  {saving ? 'Guardando...' : editMode ? 'Guardar' : 'Editar'}
                </Button>
                {editMode && (
                  <Button variant="ghost" size="sm" onClick={() => { setEditMode(false); setEditedRows({}); }} className="gap-1.5 text-xs h-8 text-[#B5B5AE] hover:text-[#35325B]">
                    Cancelar
                  </Button>
                )}
                
                <div className="flex items-center gap-1 bg-[#F5F5ED] p-1 rounded">
                  <Button variant="ghost" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 px-2">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-[#35325B] px-2 min-w-[60px] text-center">
                    {currentPage} / {totalPages}
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="h-8 px-2">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                        <div className="flex items-center gap-1.5">
                          <span>Lead #</span>
                          <button
                            onClick={() => setSortAsc(true)}
                            className={`p-0.5 rounded hover:bg-[#EEEEEC] transition-colors ${sortAsc ? 'text-[#1F1D3D]' : 'text-[#B5B5AE]'}`}
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setSortAsc(false)}
                            className={`p-0.5 rounded hover:bg-[#EEEEEC] transition-colors ${!sortAsc ? 'text-[#1F1D3D]' : 'text-[#B5B5AE]'}`}
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha Agendado</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Asesor</TableHead>
                  <TableHead>País</TableHead>
                  <TableHead>Etapa</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Prop</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedReuniones.length > 0 ? (
                  paginatedReuniones.map((reunion: any, i: number) => (
                    <TableRow
                      key={reunion.id || reunion.opportunityNumber || i}
                      className={`animate-slide-up delay-${Math.min(i + 1, 8)}`}
                    >
                      <TableCell>
                        <span className="font-medium text-[#1F1D3D]">{reunion.client_id || '—'}</span>
                      </TableCell>
                      <TableCell>
                        {editMode ? (
                          <input type="text" value={getEditedValue(reunion.client_id, 'client_name', reunion.client_name || '')} onChange={(e) => handleFieldChange(reunion.client_id, 'client_name', e.target.value)} className="w-full text-sm font-medium text-[#1F1D3D] bg-[#F5F5ED] rounded px-2 py-1 border border-[#EEEEEC] outline-none" />
                        ) : (
                          <span className="font-medium text-[#1F1D3D]">{reunion.client_name || reunion.cliente || '—'}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-[#B5B5AE] text-xs">
                        {reunion.created_at ? new Date(reunion.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}
                      </TableCell>
                      <TableCell>
                        {editMode ? (
                          <input type="text" value={getEditedValue(reunion.client_id, 'client_phone', reunion.client_phone || '')} onChange={(e) => handleFieldChange(reunion.client_id, 'client_phone', e.target.value)} className="w-full text-sm text-[#B5B5AE] bg-[#F5F5ED] rounded px-2 py-1 border border-[#EEEEEC] outline-none" />
                        ) : (
                          <span>{reunion.client_phone || reunion.telefono || '—'}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {editMode ? (
                          <select value={getEditedValue(reunion.client_id, 'advisor_name', reunion.advisor_name || '')} onChange={(e) => handleFieldChange(reunion.client_id, 'advisor_name', e.target.value)} className="w-full text-xs bg-[#F5F5ED] text-[#35325B] px-2 py-1 rounded border border-[#EEEEEC] outline-none">
                            <option value="">—</option>
                            {AsesoresOptions.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                          </select>
                        ) : (
                          <span className="text-[#35325B]">{reunion.advisor_name || reunion.asesor || '—'}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {editMode ? (
                          <select value={getEditedValue(reunion.client_id, 'country', reunion.country || reunion.pais || '')} onChange={(e) => handleFieldChange(reunion.client_id, 'country', e.target.value)} className="text-xs bg-[#F5F5ED] text-[#35325B] px-2 py-1 rounded border border-[#EEEEEC] outline-none">
                            <option value="SV">SV</option>
                            <option value="GT">GT</option>
                          </select>
                        ) : (
                          <span className="text-xs bg-[#F5F5ED] text-[#35325B] px-2 py-1 rounded">{reunion.country || reunion.pais || '—'}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {editMode ? (
                          <select value={getEditedValue(reunion.client_id, 'opportunity_stage', String(reunion.opportunity_stage || ''))} onChange={(e) => handleFieldChange(reunion.client_id, 'opportunity_stage', e.target.value)} className="text-xs bg-[#F5F5ED] text-[#35325B] px-2 py-1 rounded border border-[#EEEEEC] outline-none">
                            {stages.map(s => <option key={s.id} value={String(s.id)}>{s.label}</option>)}
                          </select>
                        ) : (
                          <StageBadge stageLabel={reunion.opportunity_stage_label} stageNum={reunion.opportunity_stage} stages={stages} />
                        )}
                      </TableCell>
                      <TableCell>
                        {editMode ? (
                          <select value={getEditedValue(reunion.client_id, 'status', reunion.status || '')} onChange={(e) => handleFieldChange(reunion.client_id, 'status', e.target.value)} className="text-xs bg-[#F5F5ED] text-[#35325B] px-2 py-1 rounded border border-[#EEEEEC] outline-none">
                            <option value="pending">Pendiente</option>
                            <option value="en_proceso">En Proceso</option>
                            <option value="cerrado">Cerrado</option>
                            <option value="alerted">Alertado</option>
                          </select>
                        ) : (
                          <StatusBadge reunion={reunion} />
                        )}
                      </TableCell>
                      <TableCell>
                        {reunion.propuesta || reunion.has_propuesta ? (
                          <span className="text-green-600 font-medium text-sm">Sí</span>
                        ) : (
                          <span className="text-[#B5B5AE] text-sm">No</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => setFeedbackReunion(reunion)} className="text-[#35325B] hover:bg-[#F5F5ED] p-1">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12 text-[#B5B5AE]">
                      Sin reuniones
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </Shell>
  );
}