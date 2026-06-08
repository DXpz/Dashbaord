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
  showPaisFilter,
}: {
  children: React.ReactNode;
  pageTitle: string;
  filters: {
    desde: string;
    hasta: string;
    pais: string;
    asesor: string;
    tipoLead: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onFiltrar: () => void;
  onLimpiar: () => void;
  asesores: Array<{ value: string; label: string }>;
  connectionStatus: 'connected' | 'connecting' | 'error';
  showPaisFilter?: boolean;
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
            <div className="flex items-center px-6 pt-5 pb-0">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden w-10 h-10 mr-3 flex items-center justify-center text-[#1F1D3D]"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-base font-semibold text-[#1F1D3D]">{pageTitle}</h1>
            </div>
            <FilterBar
              filters={filters}
              onFilterChange={onFilterChange}
              onFiltrar={onFiltrar}
              onLimpiar={onLimpiar}
              asesores={asesores}
              connectionStatus={connectionStatus}
              showPaisFilter={showPaisFilter}
            />
          </header>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </VoiceAgentProvider>
  );
}
