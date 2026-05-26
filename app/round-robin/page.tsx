'use client';

import { useState, useEffect, useMemo } from 'react';
import { Shell } from '@/components/layout/Shell';
import { API } from '@/services/api';
import { ChartWrapper } from '@/components/charts/ChartWrapper';
import { Skeleton } from '@/components/ui/skeleton';
import { useFilters, useConnectionStatus, useAuth } from '@/hooks';

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

function SectionCard({ title, children, badge, badgeColor = 'emerald' }: { title: string; children: React.ReactNode; badge?: number; badgeColor?: 'emerald' | 'red' }) {
  return (
    <div className="bg-white border border-[#EEEEEC] rounded-xl overflow-hidden">
      <div className="px-3 lg:px-4 py-2.5 lg:py-3 border-b border-[#EEEEEC] flex items-center justify-between">
        <h3 className="text-[10px] lg:text-xs font-medium text-[#B5B5AE] uppercase tracking-wider">{title}</h3>
        {badge !== undefined && (
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${badgeColor === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
            {badge}
          </span>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
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
      <span className="text-xs text-[#B5B5AE]">#{advisor.assignment_sequence}</span>
    </div>
  );
}

export default function RoundRobinPage() {
  const { filters, handleFilterChange, handleFiltrar, handleLimpiar } = useFilters();
  const connectionStatus = useConnectionStatus();
  const { user } = useAuth();
  const [data, setData] = useState<RoundRobinData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const result = await API.roundRobin(user.country_code, true);
      setData(result as RoundRobinData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const chartData = useMemo(() => {
    if (!data) return null;
    const COLORS = ['#1F1D3D', '#2d2a4a', '#3f3c6d', '#4f4d8f', '#6c6aad', '#8a88c4', '#a5a3d4'];
    const labels = data.advisors.map(a => a.nombre_vendedor.split(' ')[0]);
    const values = data.advisors.map(a => a.id === data.siguiente.id ? 2 : 1);
    return {
      labels,
      datasets: [{
        data: values,
        backgroundColor: data.advisors.map((a, i) =>
          a.id === data.siguiente.id ? '#10B981' : COLORS[i % COLORS.length]
        ),
        borderWidth: 0,
      }],
    };
  }, [data]);

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
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl hidden sm:block" />
            <Skeleton className="h-48 rounded-xl hidden sm:block" />
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      ) : data ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-4">
              <SectionCard title="Siguiente">
                <div className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <span className="text-emerald-700 text-xs lg:text-sm font-bold uppercase">
                      {data.siguiente.nombre_vendedor.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm lg:text-base font-bold text-[#1F1D3D] truncate">{data.siguiente.nombre_vendedor}</p>
                    <p className="text-[10px] lg:text-xs text-[#B5B5AE] truncate">{data.siguiente.correo_vendedor}</p>
                    <p className="text-[10px] lg:text-xs text-[#B5B5AE] mt-0.5">#{data.siguiente.assignment_sequence} · {data.siguiente.pais}</p>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Últimos Asignados">
                <div className="divide-y divide-[#EEEEEC]">
                  {data.ultimos_asignados.map((a) => (
                    <div key={a.id} className="flex items-center justify-between px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-[#F5F5ED] flex items-center justify-center shrink-0">
                          <span className="text-[#35325B] text-[8px] lg:text-[10px] font-bold uppercase">
                            {a.nombre_vendedor.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                        <span className="text-xs lg:text-sm text-[#35325B] truncate">{a.nombre_vendedor}</span>
                      </div>
                      <span className="text-[10px] lg:text-xs text-[#B5B5AE] shrink-0 ml-2">
                        {new Date(a.ultima_asignacion).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>

            <SectionCard title="Distribución" badge={data.total_activos} badgeColor="emerald">
              <div className="p-3 lg:p-4">
                {chartData && (
                  <ChartWrapper
                    type="doughnut"
                    data={chartData}
                    height="240px"
                    options={{
                      cutout: '60%',
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            font: { size: 10, family: 'Inter' },
                            color: '#35325B',
                            padding: 8,
                          },
                        },
                      },
                    }}
                  />
                )}
              </div>
            </SectionCard>

            <SectionCard title="Inactivos" badge={data.total_inactivos} badgeColor="red">
              {data.inactivos_round_robin.length > 0 ? (
                <div className="divide-y divide-[#EEEEEC] max-h-64 overflow-y-auto">
                  {data.inactivos_round_robin.map((a) => (
                    <AdvisorRow key={a.id} advisor={a} showEmail />
                  ))}
                </div>
              ) : (
                <div className="p-4 lg:p-8 text-center">
                  <p className="text-xs text-[#B5B5AE]">Sin asesores inactivos</p>
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      ) : null}
    </Shell>
  );
}