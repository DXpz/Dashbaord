'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useVendedorFilters } from '@/lib/vendedor-filters';
import { API } from '@/services/api';
import { useVentasClientes, useVentasDashboard } from '@/hooks';
import { KPICard } from '@/components/kpi/KPICard';
import { Skeleton } from '@/components/ui/skeleton';
import { VendedorCalendar, CalendarEvent } from '@/components/calendar/VendedorCalendar';
import { Target, TrendingUp, Users, CheckCircle, AlertCircle, Play } from 'lucide-react';
import Link from 'next/link';

const COLORS = {
  dark: '#1F1D3D',
  medium: '#35325B',
  light: '#B5B5AE',
  accent: '#EEEEEC',
};

export default function VendedorDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { desde, hasta } = useVendedorFilters();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // Hooks para datos de Ventas (solo gestor_ventas los consume)
  const { data: ventasClientes } = useVentasClientes();
  const { data: ventasKpis } = useVentasDashboard();

  const isGestorVentas = user?.role === 'gestor_ventas';
  const isAdvisor = user?.role === 'advisor';

  useEffect(() => {
    if (!user?.full_name) return;
    if (authLoading) return;
    // SoloProspektIA metrics para advisor
    if (isGestorVentas) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await API.asesor(
          user.full_name,
          desde, hasta,
          user.country_code
        );
        setData(result);

        const calendarStart = new Date();
        calendarStart.setMonth(calendarStart.getMonth() - 1);
        const calendarEnd = new Date();
        calendarEnd.setMonth(calendarEnd.getMonth() + 3);
        const fmt = (d: Date) => d.toISOString().split('T')[0];
        const reunionesResult = await API.reuniones(
          fmt(calendarStart), fmt(calendarEnd), 500, 0,
          { pais: user.country_code, nombre: user.full_name }
        );
        const list = reunionesResult?.reuniones || reunionesResult?.items || (Array.isArray(reunionesResult) ? reunionesResult : []);
        const evs: CalendarEvent[] = [];
        for (const r of list) {
          if (r.advisor_name !== user.full_name) continue;
          const clientName = r.client_name || '';
          if (r.created_at) {
            evs.push({ date: r.created_at.split('T')[0], type: 'lead', label: 'Lead', clientName });
          }
          const sfRaw = r.stage_feedback_json;
          let sf: any = {};
          if (typeof sfRaw === 'string' && sfRaw.trim()) {
            try { sf = JSON.parse(sfRaw); } catch { sf = {}; }
          } else if (typeof sfRaw === 'object' && sfRaw) { sf = sfRaw; }
          if (r.start_time) {
            const startDate = r.start_time.split('T')[0];
            evs.push({ date: startDate, type: 'reunion', label: 'Reunión', clientName });
          }
          if (sf?.['2']?.fecha_reunion) {
            evs.push({ date: sf['2'].fecha_reunion.split('T')[0], type: 'reunion', label: 'Reunión', clientName });
          }
          if (sf?.['4']?.fecha_propuesta) {
            evs.push({ date: sf['4'].fecha_propuesta.split('T')[0], type: 'propuesta', label: 'Propuesta', clientName });
          }
          if (sf?.['5']?.fecha_seguimiento) {
            evs.push({ date: sf['5'].fecha_seguimiento.split('T')[0], type: 'seguimiento', label: 'Seguimiento', clientName });
          }
        }
        setEvents(evs);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.full_name, user?.country_code, authLoading, desde, hasta, refreshKey, isGestorVentas]);

  // KPIs advisor (ProspektIA)
  const metricas = data?.metricas || {};
  const kpisAdvisor = useMemo(
    () => ({
      leads: metricas.leads_aceptados ?? 0,
      cerradosGanados: metricas.cerrados_ganados ?? 0,
      cerradosPerdidos: metricas.cerrados_perdidos ?? 0,
      tasaAceptacion: metricas.total_leads_general
        ? Math.round((metricas.leads_aceptados / metricas.total_leads_general) * 100)
        : 0,
      tasaCierre: metricas.cerrados_total
        ? Math.round((metricas.cerrados_ganados / metricas.cerrados_total) * 100)
        : 0,
    }),
    [metricas]
  );

  // KPIs gestor_ventas (Ventas backend)
  const totalClientes = ventasClientes?.length ?? 0;
  const desatendidos =
    ventasClientes?.filter((c) => (c.dias_sin_contacto ?? 0) >= 7).length ?? 0;
  const enRiesgo =
    ventasClientes?.filter((c) => c.satisfaccion === 'insatisfecho' || c.satisfaccion === 'neutral').length ?? 0;

  if (authLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-[500px]" />
      </div>
    );
  }

  // Vista para gestor_ventas: 3 KPIs + CTA a jornada
  if (isGestorVentas) {
    return (
      <div className="space-y-5 max-w-7xl">
        <section className="bg-gradient-to-br from-[#1F1D3D] to-[#35325B] rounded-xl p-6 text-white">
          <h2 className="text-xl font-semibold mb-1">
            {user?.full_name ? `Hola, ${user.full_name.split(' ')[0]}` : 'Hola'}
          </h2>
          <p className="text-sm text-white/70 mb-4">
            {totalClientes} clientes existentes a tu cargo. Da seguimiento y registra su feedback.
          </p>
          <div className="flex items-center gap-2">
            <Link
              href="/vendedor/seguimiento/jornada"
              className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-white text-[#1F1D3D] font-semibold text-sm hover:bg-[#F5F5ED] transition-colors shadow-sm"
            >
              <Play className="w-4 h-4" />
              Iniciar jornada
            </Link>
            <Link
              href="/vendedor/seguimiento/clientes"
              className="inline-flex items-center gap-2 h-11 px-4 rounded-lg border border-white/30 bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors"
            >
              <Users className="w-4 h-4" />
              Ver mis clientes
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <KPICard label="Mis clientes" value={ventasKpis?.mis_clientes ?? totalClientes} icon={Users} className="delay-1" />
          <KPICard
            label="Desatendidos (7+ dias)"
            value={desatendidos}
            icon={AlertCircle}
            className="delay-2"
          />
          <KPICard
            label="En riesgo"
            value={ventasKpis?.en_riesgo ?? enRiesgo}
            icon={AlertCircle}
            className="delay-3"
          />
        </section>
      </div>
    );
  }

  // Vista para advisor / otros
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-[500px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard label="Leads Aceptados" value={kpisAdvisor.leads} icon={Users} className="delay-1" />
        <KPICard label="Cerrados Ganados" value={kpisAdvisor.cerradosGanados} icon={CheckCircle} className="delay-2" />
        <KPICard label="Cerrados Perdidos" value={kpisAdvisor.cerradosPerdidos} icon={Target} className="delay-3" />
        <KPICard label="Tasa Aceptación %" value={kpisAdvisor.tasaAceptacion} icon={TrendingUp} className="delay-4" />
        <KPICard label="Tasa Cierre %" value={kpisAdvisor.tasaCierre} icon={Target} className="delay-5" />
      </div>

      <VendedorCalendar events={events} />
    </div>
  );
}
