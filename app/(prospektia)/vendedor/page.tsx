'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useVendedorFilters } from '@/lib/vendedor-filters';
import { API } from '@/services/api';
import { KPICard } from '@/components/kpi/KPICard';
import { Skeleton } from '@/components/ui/skeleton';
import { VendedorCalendar, CalendarEvent } from '@/components/calendar/VendedorCalendar';
import { Target, TrendingUp, Users, CheckCircle } from 'lucide-react';

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

  useEffect(() => {
    if (!user?.full_name) return;
    if (authLoading) return;
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
  }, [user?.full_name, user?.country_code, authLoading, desde, hasta, refreshKey]);

  const metricas = data?.metricas || {};

  const kpis = useMemo(() => ({
    leads: metricas.leads_aceptados ?? 0,
    cerradosGanados: metricas.cerrados_ganados ?? 0,
    cerradosPerdidos: metricas.cerrados_perdidos ?? 0,
    tasaAceptacion: metricas.total_leads_general ? Math.round((metricas.leads_aceptados / metricas.total_leads_general) * 100) : 0,
    tasaCierre: metricas.cerrados_total ? Math.round((metricas.cerrados_ganados / metricas.cerrados_total) * 100) : 0,
    reunionesConRetro: metricas.reuniones_con_retro ?? 0,
    reunionesSinRetro: metricas.reuniones_sin_retro ?? 0,
    propuestas: metricas.propuestas_registradas ?? 0,
    seguimientos: metricas.seguimientos_registrados ?? 0,
  }), [metricas]);

  if (authLoading || loading) {
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
        <KPICard label="Leads Aceptados" value={kpis.leads} icon={Users} className="delay-1" />
        <KPICard label="Cerrados Ganados" value={kpis.cerradosGanados} icon={CheckCircle} className="delay-2" />
        <KPICard label="Cerrados Perdidos" value={kpis.cerradosPerdidos} icon={Target} className="delay-3" />
        <KPICard label="Tasa Aceptación %" value={kpis.tasaAceptacion} icon={TrendingUp} className="delay-4" />
        <KPICard label="Tasa Cierre %" value={kpis.tasaCierre} icon={Target} className="delay-5" />
      </div>

      <VendedorCalendar events={events} />
    </div>
  );
}