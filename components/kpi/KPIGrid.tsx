'use client';

import { KPICard } from './KPICard';
import { LucideIcon } from 'lucide-react';
import {
  CheckCircle,
  XCircle,
  Calendar,
  FileText,
  Clock,
  Activity,
  Users,
  DollarSign,
} from 'lucide-react';

interface KPIGridProps {
  data: {
    aceptados: number;
    perdidos: number;
    reuniones: number;
    propuestas: number;
    pendientes: number;
    enProceso: number;
    noAgendados: number;
    ventasCerradas: number;
  };
}

export function KPIGrid({ data }: KPIGridProps) {
  const kpis: Array<{ label: string; value: number; icon: LucideIcon }> = [
    { label: 'Leads Aceptados', value: data.aceptados, icon: CheckCircle },
    { label: 'Leads Perdidos', value: data.perdidos, icon: XCircle },
    { label: 'Reuniones', value: data.reuniones, icon: Calendar },
    { label: 'Propuestas', value: data.propuestas, icon: FileText },
    { label: 'Pendientes', value: data.pendientes, icon: Clock },
    { label: 'En Proceso', value: data.enProceso, icon: Activity },
    { label: 'No Agendados', value: data.noAgendados, icon: Users },
    { label: 'Ventas Cerradas', value: data.ventasCerradas, icon: DollarSign },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, i) => (
        <KPICard
          key={kpi.label}
          label={kpi.label}
          value={kpi.value}
          icon={kpi.icon}
          className={`delay-${i + 1}`}
        />
      ))}
    </div>
  );
}