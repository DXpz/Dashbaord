'use client';

import * as React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { FilterBar } from '@/components/layout/FilterBar';
import { VoiceAgentProvider } from '@/components/VoiceAgentButton';
import { Menu } from 'lucide-react';
import { useState } from 'react';

export function Shell({
  children,
  pageTitle,
  filters,
  onFilterChange,
  onFiltrar,
  onLimpiar,
  asesores,
  connectionStatus,
}: {
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
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <VoiceAgentProvider>
      <div className="flex min-h-screen bg-[#EEEEEC]">
        <Sidebar
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
        <main className="flex-1 min-w-0">
          <header className="bg-[#F5F5ED] border-b border-[#EEEEEC]">
            <div className="flex items-center justify-between px-4 pt-4 pb-0 lg:px-6 lg:pt-5">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden w-10 h-10 flex items-center justify-center text-[#1F1D3D]"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-base font-semibold text-[#1F1D3D]">{pageTitle}</h1>
              <div className="w-10 lg:hidden" />
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
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </VoiceAgentProvider>
  );
}