'use client';

import * as React from 'react';
import { Sidebar } from './Sidebar';
import { FilterBar } from './FilterBar';

interface ShellProps {
  children: React.ReactNode;
  pageTitle: string;
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

export function Shell({
  children,
  pageTitle,
  filters,
  onFilterChange,
  onFiltrar,
  onLimpiar,
  asesores,
  connectionStatus,
}: ShellProps) {
  return (
    <div className="flex min-h-screen bg-[#EEEEEC]">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <header className="bg-[#F5F5ED] border-b border-[#EEEEEC]">
          <div className="px-6 pt-5 pb-0">
            <h1 className="text-base font-semibold text-[#1F1D3D]">{pageTitle}</h1>
          </div>
          <FilterBar
            filters={filters}
            onFilterChange={onFilterChange}
            onFiltrar={onFiltrar}
            onLimpiar={onLimpiar}
            asesores={asesores}
            connectionStatus={connectionStatus}
          />
        </header>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}