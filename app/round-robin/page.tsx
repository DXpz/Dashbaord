'use client';

import { useState, useEffect } from 'react';
import { Shell } from '@/components/layout/Shell';
import { API } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';
import { useFilters } from '@/hooks';
import { useConnectionStatus } from '@/hooks/useDashboard';

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

function AdvisorList({ advisors, variant = 'default' }: { advisors: Advisor[]; variant?: 'default' | 'inactive' }) {
  if (advisors.length === 0) return null;
  return (
    <div className="space-y-2">
      {advisors.map((a) => (
        <div key={a.id} className="flex items-center justify-between text-sm py-1 border-b border-[#EEEEEC] last:border-0">
          <div>
            <p className={`font-medium ${variant === 'inactive' ? 'text-[#B5B5AE]' : 'text-[#35325B]'}`}>
              {a.nombre_vendedor}
            </p>
            {variant === 'inactive' && (
              <p className="text-xs text-[#B5B5AE]">{a.correo_vendedor}</p>
            )}
          </div>
          <span className={`text-xs px-2 py-0.5 rounded ${variant === 'inactive' ? 'bg-red-50 text-red-400' : 'bg-emerald-50 text-emerald-600'}`}>
            #{a.assignment_sequence}
          </span>
        </div>
      ))}
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
        <div className="flex gap-8">
          <Skeleton className="w-96 h-96 rounded-xl" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      ) : data ? (
        <div className="flex gap-8">
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-md">
              <svg viewBox="0 0 320 320" className="w-full drop-shadow-lg">
                <g transform="translate(160,160)">
                  {data.advisors.map((advisor, i) => {
                    const sliceAngle = 360 / data.advisors.length;
                    const startAngle = i * sliceAngle - 90;
                    const endAngle = startAngle + sliceAngle;
                    const startRad = (startAngle * Math.PI) / 180;
                    const endRad = (endAngle * Math.PI) / 180;
                    const x1 = 150 * Math.cos(startRad);
                    const y1 = 150 * Math.sin(startRad);
                    const x2 = 150 * Math.cos(endRad);
                    const y2 = 150 * Math.sin(endRad);
                    const largeArc = sliceAngle > 180 ? 1 : 0;
                    const isWinner = advisor.id === data.siguiente.id;
                    const colors = ['#1F1D3D', '#2d2a4a', '#3f3c6d', '#4f4d8f', '#6c6aad', '#8a88c4'];
                    const color = isWinner ? '#10B981' : colors[i % colors.length];

                    return (
                      <g key={advisor.id}>
                        <path
                          d={`M 0 0 L ${x1} ${y1} A 150 150 0 ${largeArc} 1 ${x2} ${y2} Z`}
                          fill={color}
                          stroke="#F5F5ED"
                          strokeWidth="2"
                        />
                        <text
                          transform={`rotate(${startAngle + sliceAngle / 2}) translate(80, 0) rotate(90)`}
                          textAnchor="middle"
                          className="fill-white text-[11px] font-medium uppercase tracking-wider"
                          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}
                        >
                          {advisor.nombre_vendedor.split(' ')[0]}
                        </text>
                      </g>
                    );
                  })}
                  <circle cx="0" cy="0" r="24" fill="#F5F5ED" stroke="#1F1D3D" strokeWidth="3" />
                  <text textAnchor="middle" dy="4" className="fill-[#1F1D3D] text-[12px] font-bold uppercase">
                    ↓
                  </text>
                </g>
              </svg>
            </div>
          </div>

          <div className="w-80 space-y-4">
            <div className="bg-white border border-[#EEEEEC] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-medium text-[#B5B5AE] uppercase tracking-wider">Activos</h3>
                <span className="text-xs font-bold text-[#1F1D3D] bg-emerald-50 px-2 py-0.5 rounded">{data.total_activos}</span>
              </div>
              <AdvisorList advisors={data.advisors} variant="default" />
            </div>

            <div className="bg-white border border-[#EEEEEC] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-medium text-[#B5B5AE] uppercase tracking-wider">Siguiente</h3>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
                <p className="text-lg font-bold text-[#1F1D3D]">{data.siguiente.nombre_vendedor}</p>
                <p className="text-xs text-[#B5B5AE] mt-1">{data.siguiente.pais} · #{data.siguiente.assignment_sequence}</p>
              </div>
            </div>

            <div className="bg-white border border-[#EEEEEC] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-medium text-[#B5B5AE] uppercase tracking-wider">Últimos</h3>
              </div>
              <div className="space-y-2">
                {data.ultimos_asignados.map((a) => (
                  <div key={a.id} className="flex items-center justify-between text-sm">
                    <span className="text-[#35325B]">{a.nombre_vendedor}</span>
                    <span className="text-[#B5B5AE] text-xs">
                      {new Date(a.ultima_asignacion).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[#EEEEEC] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-medium text-[#B5B5AE] uppercase tracking-wider">Inactivos</h3>
                <span className="text-xs font-bold text-[#1F1D3D] bg-red-50 px-2 py-0.5 rounded">{data.total_inactivos}</span>
              </div>
              <AdvisorList advisors={data.inactivos_round_robin || []} variant="inactive" />
            </div>
          </div>
        </div>
      ) : null}
    </Shell>
  );
}