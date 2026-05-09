'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { VendedorFiltersProvider, useVendedorFilters } from '@/lib/vendedor-filters';
import { LayoutDashboard, Calendar, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/vendedor', label: 'Resumen', icon: LayoutDashboard },
  { href: '/vendedor/reuniones', label: 'Mis Reuniones', icon: Calendar },
  { href: '/vendedor/formulario', label: 'Formulario', icon: FileText },
];

const EDGE_TRIGGER_WIDTH = 40;
const LEAVE_DELAY_MS = 1500;

function FilterBar() {
  const { month, year, setMonth, setYear, handleLimpiar, availableYears, months } = useVendedorFilters();

  return (
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
  );
}

export default function VendedorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isHoveringSidebar, setIsHoveringSidebar] = useState(false);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearLeaveTimeout = useCallback(() => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
  }, []);

  const showSidebar = useCallback(() => {
    clearLeaveTimeout();
    setIsOpen(true);
  }, [clearLeaveTimeout]);

  const scheduleHide = useCallback(() => {
    leaveTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, LEAVE_DELAY_MS);
  }, [clearLeaveTimeout]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientX < EDGE_TRIGGER_WIDTH && !isHoveringSidebar) {
        showSidebar();
      }
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      clearLeaveTimeout();
    };
  }, [showSidebar, clearLeaveTimeout, isHoveringSidebar]);

  useEffect(() => {
    return () => { clearLeaveTimeout(); };
  }, [clearLeaveTimeout]);

  const handleMouseEnter = () => {
    setIsHoveringSidebar(true);
    clearLeaveTimeout();
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsHoveringSidebar(false);
    scheduleHide();
  };

  const handleClose = () => {
    clearLeaveTimeout();
    setIsOpen(false);
  };

  return (
    <VendedorFiltersProvider>
      <div className="flex min-h-screen bg-[#EEEEEC]">
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-30"
            onClick={handleClose}
          />
        )}

        <aside
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={cn(
            'fixed top-0 left-0 z-40 h-screen w-64 bg-[#F5F5ED] border-r border-[#EEEEEC] flex flex-col',
            'transform transition-transform duration-200 ease-out',
            isOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="p-4 border-b border-[#EEEEEC]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#1F1D3D] rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{user?.full_name?.[0] ?? 'V'}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1F1D3D]">{user?.full_name}</p>
                  <p className="text-xs text-[#B5B5AE] capitalize">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center text-[#B5B5AE] hover:text-[#35325B]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <a
                  key={href}
                  href={href}
                  onClick={handleClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors',
                    active
                      ? 'bg-[#1F1D3D] text-white'
                      : 'text-[#35325B] hover:text-[#1F1D3D] hover:bg-[#EEEEEC]'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </a>
              );
            })}
          </nav>

          <div className="p-4 border-t border-[#EEEEEC]">
            <div className="flex items-center gap-2 px-3 py-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-[#35325B]">Sistema activo</span>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <header className="bg-[#F5F5ED] border-b border-[#EEEEEC]">
            <div className="px-6 pt-5 pb-0">
              <h1 className="text-base font-semibold text-[#1F1D3D]">
                {NAV_ITEMS.find(n => n.href === pathname)?.label ?? 'Dashboard'}
              </h1>
            </div>
            <FilterBar />
          </header>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </VendedorFiltersProvider>
  );
}