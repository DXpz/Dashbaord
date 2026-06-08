'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { useState } from 'react';
import { Menu } from 'lucide-react';

export function VersionsShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#EEEEEC]">
      <Sidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
      <main className="flex-1 min-w-0">
        <header className="bg-[#F5F5ED] border-b border-[#EEEEEC]">
          <div className="flex items-center px-6 pt-5 pb-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden w-10 h-10 mr-3 flex items-center justify-center text-[#1F1D3D]"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-base font-semibold text-[#1F1D3D]">Versiones</h1>
          </div>
        </header>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}