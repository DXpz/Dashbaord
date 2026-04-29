'use client';

import { useState, useEffect } from 'react';
import { Shell } from '@/components/layout/Shell';
import { API } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';
import { useFilters } from '@/hooks';
import { useConnectionStatus } from '@/hooks/useDashboard';
import { ChevronRight } from 'lucide-react';

interface Advisor {
  id: number;
  nombre_vendedor: string;
  correo_vendedor: string;
  pais: string;
  assignment_sequence: number;
  ultima_asignacion: string;
  assignment_status: string;
  reservation_time: string | null;
}

interface RoundRobinData {
  ok: boolean;
  total_activos: number;
  total_inactivos: number;
  advisors: Advisor[];
  ultimos_asignados: Advisor[];
  siguiente: Advisor;
  inactivos_round_robin: Advisor[];
}

function AdvisorRow({ advisor, showEmail = false }: { advisor: Advisor; showEmail?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 border-b border-[#EEEEEC] last:border-0 hover:bg-[#F5F5ED] transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#1F1D3D] flex items-center justify-center">
          <span className="text-white text-xs font-bold uppercase">
            {advisor.nombre_vendedor.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-[#1F1D3D]">{advisor.nombre_vendedor}</p>
          {showEmail && <p className="text-xs text-[#B5B5AE]">{advisor.correo_vendedor}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#B5B5AE]">#{advisor.assignment_sequence}</span>
        <ChevronRight className="h-4 w-4 text-[#B5B5AE]" />
      </div>
    </div>
  );
}

function SectionCard({ title, children, badge, badgeColor = 'emerald' }: { title: string; children: React.ReactNode; badge?: number; badgeColor?: 'emerald' | 'red' }) {
  return (
    <div className="bg-white border border-[#EEEEEC] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[#EEEEEC] flex items-center justify-between">
        <h3 className="text-xs font-medium text-[#B5B5AE] uppercase tracking-wider">{title}</h3>
        {badge !== undefined && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${badgeColor === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
            {badge}
          </span>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

export default function RoundRobinPage() {
  const { filters, handleFilterChange, handleFiltrar, handleLimpiar } = useFilters();
  const connectionStatus = useConnectionStatus();
  const [data, setData] = useState<RoundRobinData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await API.roundRobin('SV', true);
      setData(result as RoundRobinData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const AdvisorsOptions = [{ value: '', label: 'Todos' }];

  return (
    <Shell
      pageTitle="Round Robin"
      filters={filters}
      onFilterChange={handleFilterChange}
      onFiltrar={handleFiltrar}
      onLimpiar={handleLimpiar}
      asesores={AdvisorsOptions}
      connectionStatus={connectionStatus}
    >
      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      ) : data ? (
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-4">
            <SectionCard title="Siguiente" badge={data.total_activos} badgeColor="emerald">
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-emerald-700 text-sm font-bold uppercase">
                      {data.siguiente.nombre_vendedor.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="text-base font-bold text-[#1F1D3D]">{data.siguiente.nombre_vendedor}</p>
                    <p className="text-xs text-[#B5B5AE]">{data.siguiente.correo_vendedor}</p>
                  </div>
                </div>
                <div className="flex gap-2 text-xs text-[#B5B5AE]">
                  <span className="bg-[#F5F5ED] px-2 py-1 rounded">#{data.siguiente.assignment_sequence}</span>
                  <span className="bg-[#F5F5ED] px-2 py-1 rounded">{data.siguiente.pais}</span>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Últimos Asignados">
              <div className="divide-y divide-[#EEEEEC]">
                {data.ultimos_asignados.map((a) => (
                  <div key={a.id} className="flex items-center justify-between px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#F5F5ED] flex items-center justify-center">
                        <span className="text-[#35325B] text-[10px] font-bold uppercase">
                          {a.nombre_vendedor.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <span className="text-sm text-[#35325B]">{a.nombre_vendedor}</span>
                    </div>
                    <span className="text-xs text-[#B5B5AE]">
                      {new Date(a.ultima_asignacion).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          <SectionCard title="Lista Total de Asesores" badge={data.advisors.length} badgeColor="emerald">
            <div className="divide-y divide-[#EEEEEC]">
              {[...data.advisors].sort((a, b) => a.assignment_sequence - b.assignment_sequence).map((a) => (
                <AdvisorRow key={a.id} advisor={a} />
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Inactivos" badge={data.total_inactivos} badgeColor="red">
            {data.inactivos_round_robin.length > 0 ? (
              <div className="divide-y divide-[#EEEEEC]">
                {data.inactivos_round_robin.map((a) => (
                  <AdvisorRow key={a.id} advisor={a} showEmail />
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-sm text-[#B5B5AE]">Sin asesores inactivos</p>
              </div>
            )}
          </SectionCard>
        </div>
      ) : null}
    </Shell>
  );
}