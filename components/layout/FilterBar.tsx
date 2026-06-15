'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  filters: {
    desde: string;
    hasta: string;
    pais: string;
    asesor: string;
    tipoLead: string;
    origen: string;
    tipoLlamada: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onFiltrar: () => void;
  onLimpiar: () => void;
  asesores: Array<{ value: string; label: string }>;
  connectionStatus: 'connected' | 'connecting' | 'error';
  showPaisFilter?: boolean;
}

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

export function FilterBar({
  filters,
  onFilterChange,
  onLimpiar,
  asesores,
  connectionStatus,
  showPaisFilter = false,
}: FilterBarProps) {
  const storageKey = 'dashboard_filters';
  const { month, year } = getMonthFromDate(filters.desde);
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  React.useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        ['desde', 'hasta', 'pais', 'asesor', 'tipoLead', 'origen', 'tipoLlamada'].forEach((key) => {
          if (parsed[key] !== undefined) onFilterChange(key, parsed[key]);
        });
      } catch {}
    }
  }, []);

  const persistFilters = (key: string, value: string) => {
    onFilterChange(key, value);
    const current = JSON.parse(localStorage.getItem(storageKey) || '{}');
    localStorage.setItem(storageKey, JSON.stringify({ ...current, [key]: value }));
  };

  const handleMonthChange = (newMonth: string) => {
    const newYear = year || String(currentYear);
    const dates = setMonth(newMonth, newYear);
    persistFilters('desde', dates.desde);
    persistFilters('hasta', dates.hasta);
  };

  const handleYearChange = (newYear: string) => {
    const newMonth = month || String(new Date().getMonth() + 1).padStart(2, '0');
    const dates = setMonth(newMonth, newYear);
    persistFilters('desde', dates.desde);
    persistFilters('hasta', dates.hasta);
  };

  return (
<div className="flex flex-wrap items-center gap-4 py-4 px-6 border-b border-[#EEEEEC]">
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

      {showPaisFilter && (
        <select
          value={filters.pais || ''}
          onChange={(e) => persistFilters('pais', e.target.value)}
          className="text-sm font-medium text-[#35325B] bg-transparent outline-none cursor-pointer"
        >
          <option value="">País</option>
          <option value="SV">SV</option>
          <option value="GT">GT</option>
        </select>
      )}

      <select
        value={filters.tipoLead || ''}
        onChange={(e) => persistFilters('tipoLead', e.target.value)}
        className="text-sm font-medium text-[#35325B] bg-transparent outline-none cursor-pointer"
      >
        <option value="">Tipo Lead</option>
        <option value="calificado">Calificado</option>
        <option value="no_calificado">No calificado</option>
        <option value="pendiente">Pendiente</option>
      </select>

      <select
        value={filters.origen || ''}
        onChange={(e) => persistFilters('origen', e.target.value)}
        className="text-sm font-medium text-[#35325B] bg-transparent outline-none cursor-pointer"
      >
        <option value="">Canal de origen</option>
        <option value="Página Web">Página Web</option>
        <option value="PostIAlo Redes Sociales">PostIAlo Redes Sociales</option>
        <option value="PostIAlo Mailing">PostIAlo Mailing</option>
        <option value="PBX SV">PBX SV</option>
        <option value="PBX GT">PBX GT</option>
      </select>

      <select
        value={filters.tipoLlamada || ''}
        onChange={(e) => persistFilters('tipoLlamada', e.target.value)}
        className="text-sm font-medium text-[#35325B] bg-transparent outline-none cursor-pointer"
      >
        <option value="">Tipo de llamada</option>
        <option value="Llamada Virtual">Llamada Virtual</option>
        <option value="Reunion Presencial">Reunión Presencial</option>
        <option value="Llamada Telefonica">Llamada Telefónica</option>
      </select>

      <select
        value={filters.asesor || ''}
        onChange={(e) => persistFilters('asesor', e.target.value)}
        className="text-sm font-medium text-[#35325B] bg-transparent outline-none cursor-pointer"
      >
        <option value="">Ejecutivo</option>
        {asesores.map((a) => (
          <option key={a.value} value={a.value}>{a.label}</option>
        ))}
      </select>

      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={() => {
            onLimpiar();
            localStorage.removeItem(storageKey);
          }}
          className="text-sm text-[#B5B5AE] hover:text-[#35325B] transition-colors px-3 py-1.5"
        >
          Limpiar
        </button>
      </div>

      <div className={cn(
        'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full',
        connectionStatus === 'connected' ? 'bg-green-50 text-[#1F1D3D]' :
        connectionStatus === 'error' ? 'bg-red-50 text-red-600' :
        'bg-[#EEEEEC] text-[#B5B5AE]'
      )}>
        <div className={cn(
          'w-1.5 h-1.5 rounded-full',
          connectionStatus === 'connected' ? 'bg-[#22c55e]' :
          connectionStatus === 'error' ? 'bg-red-500' :
          'bg-[#B5B5AE]'
        )} />
        <span>
          {connectionStatus === 'connected' ? 'Conectado' :
           connectionStatus === 'error' ? 'Error' : 'Conectando'}
        </span>
      </div>
    </div>
  );
}
