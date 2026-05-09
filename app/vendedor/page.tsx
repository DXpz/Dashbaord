'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { API } from '@/services/api';
import { KPICard } from '@/components/kpi/KPICard';
import { ChartCard } from '@/components/charts/ChartCard';
import { ChartWrapper } from '@/components/charts/ChartWrapper';
import { Skeleton } from '@/components/ui/skeleton';
import { Target, TrendingUp, Users, CheckCircle } from 'lucide-react';

const COLORS = {
  dark: '#1F1D3D',
  medium: '#35325B',
  light: '#B5B5AE',
  accent: '#EEEEEC',
  primary: '#1F1D3D',
};

const MONTHS = [
  { value: '01', label: 'Enero' },
  { value: '02', label: 'Febrero' },
  { value: '03', label: 'Marzo' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Mayo' },
  { value: '06', label: 'Junio' },
  { value: '07', label: 'Julio' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
];

function getMonthFromDate(dateStr: string): { month: string; year: string } {
  if (!dateStr) return { month: '', year: '' };
  const [year, month] = dateStr.split('-');
  return { month, year };
}

function setMonth(month: string, year: string): { desde: string; hasta: string } {
  const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
  return {
    desde: `${year}-${month}-01`,
    hasta: `${year}-${month}-${String(lastDay).padStart(2, '0')}`,
  };
}

export default function VendedorDashboard() {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
  const currentDates = setMonth(currentMonth, String(currentYear));

  const [filters, setFilters] = useState({
    desde: currentDates.desde,
    hasta: currentDates.hasta,
    pais: user?.country_code || '',
    asesor: '',
  });

  useEffect(() => {
    if (user?.full_name) {
      setFilters(f => ({ ...f, pais: user.country_code || '', asesor: user.full_name }));
    }
  }, [user]);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!filters.asesor) return;
    setLoading(true);
    try {
      const result = await API.dashboard(
        filters.desde || '',
        filters.hasta || '',
        30,
        40,
        { pais: filters.pais || undefined, asesor: filters.asesor || undefined }
      );
      setData(result);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters.desde, filters.hasta, filters.pais, filters.asesor]);

  useEffect(() => {
    if (!user || !filters.asesor) return;
    fetchData();
  }, [fetchData, user, filters.asesor]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleMonthChange = (newMonth: string) => {
    const year = getMonthFromDate(filters.desde).year || String(currentYear);
    const dates = setMonth(newMonth, year);
    setFilters(prev => ({ ...prev, desde: dates.desde, hasta: dates.hasta }));
  };

  const handleYearChange = (newYear: string) => {
    const month = getMonthFromDate(filters.desde).month || currentMonth;
    const dates = setMonth(month, newYear);
    setFilters(prev => ({ ...prev, desde: dates.desde, hasta: dates.hasta }));
  };

  const handleFiltrar = () => { fetchData(); };
  const handleLimpiar = () => {
    const d = setMonth(currentMonth, String(currentYear));
    setFilters(prev => ({ ...prev, desde: d.desde, hasta: d.hasta, pais: user?.country_code || '' }));
  };

  const { month, year } = getMonthFromDate(filters.desde);
  const years = [currentYear - 1, currentYear, currentYear + 1];

  const resumen = data?.resumen || {};
  const leadsPorStage = data?.leads_por_stage || [];

  const kpis = useMemo(() => ({
    leads: resumen.leads_aceptados ?? 0,
    cerradosGanados: resumen.ventas_cerradas ?? 0,
    cerradosPerdidos: resumen.ventas_perdidas ?? 0,
    tasaAceptacion: resumen.total_leads_general ? Math.round((resumen.leads_aceptados / resumen.total_leads_general) * 100) : 0,
    tasaCierre: resumen.cerrados_total ? Math.round((resumen.ventas_cerradas / resumen.cerrados_total) * 100) : 0,
    reunionesConRetro: resumen.reuniones_con_retro ?? 0,
    reunionesSinRetro: resumen.reuniones_sin_retro ?? 0,
    propuestas: resumen.propuestas_registradas ?? 0,
    seguimientos: resumen.seguimientos_registrados ?? 0,
  }), [resumen]);

  const stagesChartData = useMemo(() => {
    if (!leadsPorStage.length) return null;
    return {
      labels: leadsPorStage.map((s: any) => s.stage_label || '—'),
      values: leadsPorStage.map((s: any) => s.total || 0),
    };
  }, [leadsPorStage]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4 pb-4 border-b border-[#EEEEEC]">
        <div className="flex items-center gap-2">
          <select
            value={month}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="text-sm font-medium text-[#35325B] bg-transparent outline-none cursor-pointer"
          >
            <option value="">Mes</option>
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => handleYearChange(e.target.value)}
            className="text-sm font-medium text-[#35325B] bg-transparent outline-none cursor-pointer"
          >
            {years.map((y) => (
              <option key={y} value={String(y)}>{y}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleFiltrar}
          className="px-3 py-1.5 text-xs font-medium bg-[#1F1D3D] text-white rounded hover:bg-[#35325B] transition-colors"
        >
          Filtrar
        </button>
        <button
          onClick={handleLimpiar}
          className="px-3 py-1.5 text-xs font-medium text-[#35325B] border border-[#EEEEEC] rounded hover:bg-[#EEEEEC] transition-colors"
        >
          Limpiar
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard label="Leads Aceptados" value={kpis.leads} icon={Users} className="delay-1" />
        <KPICard label="Cerrados Ganados" value={kpis.cerradosGanados} icon={CheckCircle} className="delay-2" />
        <KPICard label="Cerrados Perdidos" value={kpis.cerradosPerdidos} icon={Target} className="delay-3" />
        <KPICard label="Tasa Aceptación %" value={kpis.tasaAceptacion} icon={TrendingUp} className="delay-4" />
        <KPICard label="Tasa Cierre %" value={kpis.tasaCierre} icon={Target} className="delay-5" />
      </div>

      {stagesChartData && (
        <ChartCard title="Mis Leads por Etapa" subtitle="Pipeline actual">
          <ChartWrapper type="bar" data={{
            labels: stagesChartData.labels,
            datasets: [{
              data: stagesChartData.values,
              backgroundColor: COLORS.primary,
              borderRadius: 4,
              borderSkipped: false,
            }],
          }} height="280px" />
        </ChartCard>
      )}

      <div className="bg-white border border-[#EEEEEC] p-5">
        <h3 className="text-sm font-medium text-[#1F1D3D] mb-4">Resumen de Desempeño</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-[#B5B5AE]">Reuniones con Retro</span>
            <p className="text-lg font-semibold text-[#1F1D3D]">{kpis.reunionesConRetro}</p>
          </div>
          <div>
            <span className="text-[#B5B5AE]">Reuniones Sin Retro</span>
            <p className="text-lg font-semibold text-[#1F1D3D]">{kpis.reunionesSinRetro}</p>
          </div>
          <div>
            <span className="text-[#B5B5AE]">Propuestas Registradas</span>
            <p className="text-lg font-semibold text-[#1F1D3D]">{kpis.propuestas}</p>
          </div>
          <div>
            <span className="text-[#B5B5AE]">Seguimientos</span>
            <p className="text-lg font-semibold text-[#1F1D3D]">{kpis.seguimientos}</p>
          </div>
        </div>
      </div>
    </div>
  );
}