'use client';

import * as React from 'react';
import { Menu } from 'lucide-react';
import { useState } from 'react';
import { useVendedorFilters } from '@/lib/vendedor-filters';

/**
 * Wrapper sin Sidebar para las paginas de /vendedor/*.
 * El Sidebar ya esta en app/(prospektia)/vendedor/layout.tsx.
 * Este componente solo renderiza el header + FilterBar + contenido.
 *
 * Similar a <Shell> pero SIN el <Sidebar> del super admin.
 */
export function VendedorContent({
  children,
  pageTitle,
  showFilterBar = true,
}: {
  children: React.ReactNode;
  pageTitle: string;
  showFilterBar?: boolean;
}) {
  const [mobileMenuOpen] = useState(false);
  const { month, year, setMonth, setYear, availableYears, months, handleLimpiar } = useVendedorFilters();

  return (
    <div className="flex min-h-screen bg-[#EEEEEC]">
      <main className="flex-1 min-w-0">
        <header className="bg-[#F5F5ED] border-b border-[#EEEEEC]">
          <div className="flex items-center justify-between px-4 pt-4 pb-0 lg:px-6 lg:pt-5">
            <button
              onClick={() => {/* el sidebar se abre con hover, no click */}}
              className="lg:hidden w-10 h-10 flex items-center justify-center text-[#1F1D3D] opacity-0 pointer-events-none"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-base font-semibold text-[#1F1D3D]">{pageTitle}</h1>
            <div className="w-10 lg:hidden" />
          </div>
          {showFilterBar && (
            <div className="flex flex-wrap items-center gap-4 py-4 px-6 border-b border-[#EEEEEC]">
              <div className="flex items-center gap-2">
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="text-sm font-medium text-[#35325B] bg-transparent outline-none cursor-pointer"
                >
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="text-sm font-medium text-[#35325B] bg-transparent outline-none cursor-pointer"
                >
                  {availableYears.map((y) => (
                    <option key={y} value={String(y)}>{y}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={handleLimpiar}
                  className="text-sm text-[#B5B5AE] hover:text-[#35325B] transition-colors px-3 py-1.5"
                >
                  Limpiar
                </button>
              </div>
            </div>
          )}
        </header>
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
