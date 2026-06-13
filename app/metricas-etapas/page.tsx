'use client';

import { useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { useAdvisorOverdue, useAdvisorOverdueDetail, useAcknowledgeEvent } from '@/hooks';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Clock, ChevronRight, X } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

const STAGE_LABELS: Record<number, string> = {
  2: 'Reunión',
  3: 'Demo',
  4: 'Propuesta',
  5: 'Seguimiento',
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function MetricasEtapasPage() {
  const { user } = useAuth();
  const { advisors, loading, error, totalEvents, refetch } = useAdvisorOverdue();
  const [selectedAdvisor, setSelectedAdvisor] = useState<string | null>(null);
  const { detail, loading: detailLoading } = useAdvisorOverdueDetail(selectedAdvisor);
  const { acknowledge, loading: ackLoading } = useAcknowledgeEvent();
  const [acknowledgingId, setAcknowledgingId] = useState<number | null>(null);

  const handleAcknowledge = async (eventId: number) => {
    setAcknowledgingId(eventId);
    const ok = await acknowledge(eventId);
    setAcknowledgingId(null);
    if (ok) {
      refetch();
    }
  };

  return (
    <Shell
      pageTitle="Métricas por Etapas"
      filters={{} as any}
      onFilterChange={() => {}}
      onFiltrar={() => {}}
      onLimpiar={() => {}}
      connectionStatus={{ isConnected: true } as any}
    >
      <div className="space-y-6">
        <div className="bg-white border border-[#EEEEEC] p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-[#1F1D3D]">Eventos vencidos en total</p>
            <p className="text-xs text-[#B5B5AE]">Leads que superaron el deadline sin retroalimentación</p>
          </div>
          <div className="ml-auto text-2xl font-bold text-[#1F1D3D]">{totalEvents}</div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}
          </div>
        ) : error ? (
          <div className="text-sm text-red-500 p-4">{error}</div>
        ) : (
          <div className="bg-white border border-[#EEEEEC] overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F5F5ED]">
                  <TableHead>Asesor</TableHead>
                  <TableHead>País</TableHead>
                  <TableHead className="text-center">Total vencidos</TableHead>
                  <TableHead className="text-center">Reunión</TableHead>
                  <TableHead className="text-center">Demo</TableHead>
                  <TableHead className="text-center">Propuesta</TableHead>
                  <TableHead className="text-center">Seguimiento</TableHead>
                  <TableHead className="text-center">Confirmados</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {advisors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-sm text-[#B5B5AE] py-8">
                      No hay eventos vencidos
                    </TableCell>
                  </TableRow>
                ) : (
                  advisors.map((a) => (
                    <TableRow key={a.advisor_id} className="cursor-pointer hover:bg-[#F5F5ED]" onClick={() => setSelectedAdvisor(String(a.advisor_id))}>
                      <TableCell className="font-medium text-[#1F1D3D]">{a.advisor_name}</TableCell>
                      <TableCell>
                        <span className="text-xs bg-[#F5F5ED] text-[#35325B] px-2 py-0.5 rounded">{a.country}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        {a.total_vencidos > 0 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                            <AlertTriangle className="w-3 h-3" />{a.total_vencidos}
                          </span>
                        ) : (
                          <span className="text-xs text-[#B5B5AE]">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center text-xs">{a.stage_2_vencidos}</TableCell>
                      <TableCell className="text-center text-xs">{a.stage_3_vencidos}</TableCell>
                      <TableCell className="text-center text-xs">{a.stage_4_vencidos}</TableCell>
                      <TableCell className="text-center text-xs">{a.stage_5_vencidos}</TableCell>
                      <TableCell className="text-center text-xs text-[#B5B5AE]">{a.acknowledge_count}</TableCell>
                      <TableCell>
                        <ChevronRight className="w-4 h-4 text-[#B5B5AE]" />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {selectedAdvisor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setSelectedAdvisor(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#EEEEEC] shrink-0">
              <div>
                <h3 className="text-sm font-semibold text-[#1F1D3D]">Detalle de Eventos</h3>
                <p className="text-xs text-[#B5B5AE]">
                  {detail?.summary?.total_vencidos || 0} vencidos —{' '}
                  {STAGE_LABELS[2]}: {detail?.summary?.stage_2_vencidos || 0} ·{' '}
                  {STAGE_LABELS[3]}: {detail?.summary?.stage_3_vencidos || 0} ·{' '}
                  {STAGE_LABELS[4]}: {detail?.summary?.stage_4_vencidos || 0} ·{' '}
                  {STAGE_LABELS[5]}: {detail?.summary?.stage_5_vencidos || 0}
                </p>
              </div>
              <button onClick={() => setSelectedAdvisor(null)} className="w-8 h-8 flex items-center justify-center text-[#B5B5AE] hover:text-[#35325B] hover:bg-[#F5F5ED] rounded transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-4">
              {detailLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16" />)}
                </div>
              ) : detail?.events && detail.events.length > 0 ? (
                <div className="space-y-2">
                  {detail.events.map((ev) => (
                    <div key={ev.id} className="border border-[#EEEEEC] rounded-lg p-3 flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-[#1F1D3D]">{ev.client_id}</span>
                          <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded">
                            {STAGE_LABELS[ev.stage] || `Etapa ${ev.stage}`}
                          </span>
                          {ev.acknowledged ? (
                            <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Confirmado
                            </span>
                          ) : (
                            <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Pendiente
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-4 text-xs text-[#B5B5AE]">
                          <span>Deadline: {formatDateTime(ev.deadline)}</span>
                          <span>Activado: {formatDateTime(ev.triggered_at)}</span>
                          {ev.acknowledged_at && <span>Confirmado: {formatDateTime(ev.acknowledged_at)}</span>}
                        </div>
                      </div>
                      {!ev.acknowledged && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAcknowledge(ev.id)}
                          disabled={ackLoading && acknowledgingId === ev.id}
                          className="text-xs h-7 border-[#EEEEEC] text-[#35325B] hover:bg-[#F5F5ED] shrink-0"
                        >
                          {ackLoading && acknowledgingId === ev.id ? '...' : 'Confirmar'}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#B5B5AE] text-center py-8">No hay eventos para este asesor</p>
              )}
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}
