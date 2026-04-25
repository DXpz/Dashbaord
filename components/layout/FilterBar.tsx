'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  filters: {
    desde: string;
    hasta: string;
    pais: string;
    asesor: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onFiltrar: () => void;
  onLimpiar: () => void;
  asesores: Array<{ value: string; label: string }>;
  connectionStatus: 'connected' | 'connecting' | 'error';
}

export function FilterBar({
  filters,
  onFilterChange,
  onFiltrar,
  onLimpiar,
  asesores,
  connectionStatus,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 py-4 px-6 border-b border-[#EEEEEC]">
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={filters.desde}
          onChange={(e) => onFilterChange('desde', e.target.value)}
          className="text-sm text-[#35325B] bg-transparent outline-none border-none"
        />
        <span className="text-[#B5B5AE]">—</span>
        <input
          type="date"
          value={filters.hasta}
          onChange={(e) => onFilterChange('hasta', e.target.value)}
          className="text-sm text-[#35325B] bg-transparent outline-none border-none"
        />
      </div>

      <select
        value={filters.pais}
        onChange={(e) => onFilterChange('pais', e.target.value)}
        className="text-sm text-[#35325B] bg-transparent outline-none cursor-pointer"
      >
        <option value="">País</option>
        <option value="SV">El Salvador</option>
        <option value="GT">Guatemala</option>
      </select>

      <select
        value={filters.asesor}
        onChange={(e) => onFilterChange('asesor', e.target.value)}
        className="text-sm text-[#35325B] bg-transparent outline-none cursor-pointer"
      >
        <option value="">Asesor</option>
        {asesores.map((a) => (
          <option key={a.value} value={a.value}>{a.label}</option>
        ))}
      </select>

      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={onLimpiar}
          className="text-sm text-[#B5B5AE] hover:text-[#35325B] transition-colors px-3 py-1.5"
        >
          Limpiar
        </button>
        <button
          onClick={onFiltrar}
          className="text-sm bg-[#1F1D3D] text-[#F5F5ED] px-4 py-1.5 hover:bg-[#35325B] transition-colors"
        >
          Filtrar
        </button>
      </div>

      <div className={cn(
        'flex items-center gap-1.5 text-xs',
        connectionStatus === 'connected' ? 'text-[#B5B5AE]' :
        connectionStatus === 'error' ? 'text-red-500' :
        'text-[#B5B5AE]'
      )}>
        <div className={cn(
          'w-1.5 h-1.5 rounded-full',
          connectionStatus === 'connected' ? 'bg-[#B5B5AE]' :
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