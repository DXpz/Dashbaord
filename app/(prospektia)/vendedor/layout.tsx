'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { VendedorFiltersProvider, useVendedorFilters } from '@/lib/vendedor-filters';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  MessageSquare,
  Users,
  LogOut,
  X,
  Menu,
  Lock,
  Info,
  ChevronDown,
  ChevronRight,
  Briefcase,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

interface NavGroup {
  id: string;
  label: string;
  icon?: LucideIcon;
  items: NavItem[];
  defaultCollapsed?: boolean;
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: 'prospectos',
    label: 'Prospectos',
    icon: Briefcase,
    defaultCollapsed: false,
    items: [
      { href: '/vendedor/prospectos/formulario', label: 'Formulario', icon: FileText },
      { href: '/vendedor/prospectos/reuniones', label: 'Mis Reuniones', icon: Calendar },
    ],
  },
  {
    id: 'seguimiento',
    label: 'Seguimiento',
    icon: MessageSquare,
    defaultCollapsed: false,
    items: [
      { href: '/vendedor/seguimiento/jornada', label: 'Jornada', icon: MessageSquare },
      { href: '/vendedor/seguimiento/clientes', label: 'Mis Clientes', icon: Users },
    ],
  },
  {
    id: 'cuenta',
    label: 'Mi cuenta',
    icon: Lock,
    defaultCollapsed: true,
    items: [
      { href: '/vendedor/cuenta/versiones', label: 'Versiones', icon: Info },
      { href: '/vendedor/cuenta/password', label: 'Cambiar contraseña', icon: Lock },
    ],
  },
];

const EDGE_TRIGGER_WIDTH = 60;
const LEAVE_DELAY_MS = 2000;

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

function NavLink({
  item,
  pathname,
  onClick,
}: {
  item: NavItem;
  pathname: string;
  onClick: () => void;
}) {
  const isActive = pathname === item.href;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-2.5 px-2.5 py-2 rounded text-xs font-medium transition-colors',
        isActive
          ? 'bg-[#1F1D3D] text-[#F5F5ED]'
          : 'text-[#35325B] hover:text-[#1F1D3D] hover:bg-[#EEEEEC]'
      )}
    >
      <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{item.label}</span>
    </Link>
  );
}

function GroupSection({
  group,
  pathname,
  collapsed,
  onToggle,
  onItemClick,
}: {
  group: NavGroup;
  pathname: string;
  collapsed: boolean;
  onToggle: () => void;
  onItemClick: () => void;
}) {
  return (
    <div className="mb-0.5">
      <button
        onClick={onToggle}
        className={cn(
          'w-full flex items-center justify-between px-2.5 py-1.5 rounded text-[11px] font-semibold uppercase tracking-wider transition-colors',
          'text-[#1F1D3D] hover:bg-[#EEEEEC]'
        )}
        aria-expanded={!collapsed}
      >
        <span className="inline-flex items-center gap-1.5">
          {group.icon && <group.icon className="w-3 h-3" />}
          {group.label}
        </span>
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3" />
        )}
      </button>
      {!collapsed && (
        <div className="mt-0.5 ml-2 pl-2.5 border-l border-[#EEEEEC] space-y-0.5">
          {group.items.map((it) => (
            <NavLink
              key={it.href}
              item={it}
              pathname={pathname}
              onClick={onItemClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function VendedorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenDesktop, setIsOpenDesktop] = useState(false);
  const [isHoveringSidebar, setIsHoveringSidebar] = useState(false);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Colapso: arrancamos con los defaults (prospectos+seguimiento expandidos, cuenta colapsado)
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    NAV_GROUPS.forEach((g) => {
      init[g.id] = !!g.defaultCollapsed;
    });
    return init;
  });

  const toggleGroup = useCallback((id: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const clearLeaveTimeout = useCallback(() => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
  }, []);

  const showSidebar = useCallback(() => {
    clearLeaveTimeout();
    setIsOpenDesktop(true);
  }, [clearLeaveTimeout]);

  const scheduleHide = useCallback(() => {
    leaveTimeoutRef.current = setTimeout(() => {
      setIsOpenDesktop(false);
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
    return () => {
      clearLeaveTimeout();
    };
  }, [clearLeaveTimeout]);

  const handleMouseEnter = () => {
    setIsHoveringSidebar(true);
    clearLeaveTimeout();
    setIsOpenDesktop(true);
  };

  const handleMouseLeave = () => {
    setIsHoveringSidebar(false);
    scheduleHide();
  };

  const handleClose = useCallback(() => {
    clearLeaveTimeout();
    setIsOpen(false);
    setIsOpenDesktop(false);
  }, [clearLeaveTimeout]);

  const isVisible = isOpen || isOpenDesktop;

  // Titulo de la pagina actual (para el header)
  const allItems: NavItem[] = [
    { href: '/vendedor', label: 'Resumen', icon: LayoutDashboard },
    ...NAV_GROUPS.flatMap((g) => g.items),
  ];
  const currentTitle = allItems.find((n) => n.href === pathname)?.label ?? 'Dashboard';

  return (
    <VendedorFiltersProvider>
      <div className="flex min-h-screen bg-[#EEEEEC]">
        {isVisible && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
            onClick={handleClose}
          />
        )}

        <aside
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={cn(
            'fixed top-0 left-0 z-40 h-screen w-60 bg-[#F5F5ED] border-r border-[#EEEEEC] flex flex-col',
            'transform transition-transform duration-200 ease-out',
            isVisible ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          {/* Header: solo logo + X */}
          <div className="flex items-center justify-between px-3 pt-4 pb-3 flex-shrink-0">
            <div className="flex-1 flex items-center justify-center">
              <div className="relative h-9 rounded overflow-hidden">
                <Image
                  src="/logos/prospektia.png"
                  alt="ProspektIA"
                  width={130}
                  height={33}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-7 h-7 flex items-center justify-center text-[#B5B5AE] hover:text-[#35325B] lg:hidden"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <nav className="flex-1 min-h-0 px-3 mt-2 space-y-0.5 overflow-hidden">
            {/* Resumen: item plano, mismo estilo que NavLink */}
            <Link
              href="/vendedor"
              onClick={handleClose}
              className={cn(
                'flex items-center gap-2.5 px-2.5 py-2 rounded text-xs font-medium transition-colors',
                pathname === '/vendedor'
                  ? 'bg-[#1F1D3D] text-[#F5F5ED]'
                  : 'text-[#35325B] hover:text-[#1F1D3D] hover:bg-[#EEEEEC]'
              )}
            >
              <LayoutDashboard className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Resumen</span>
            </Link>

            <div className="my-1.5 border-t border-[#EEEEEC]" />

            {/* 3 carpetas colapsables (mismo estilo que super admin) */}
            {NAV_GROUPS.map((g) => (
              <GroupSection
                key={g.id}
                group={g}
                pathname={pathname}
                collapsed={!!collapsedGroups[g.id]}
                onToggle={() => toggleGroup(g.id)}
                onItemClick={handleClose}
              />
            ))}
          </nav>

          {/* Footer: solo logout (igual al super admin) */}
          <div className="flex-shrink-0 px-3 py-3 border-t border-[#EEEEEC] bg-[#F5F5ED]">
            <button
              onClick={logout}
              className="flex items-center gap-2 w-full px-2.5 py-2 text-xs text-[#35325B] hover:text-[#c8151b] hover:bg-red-50 rounded transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Cerrar sesión
            </button>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          <header className="bg-[#F5F5ED] border-b border-[#EEEEEC]">
            <div className="flex items-center justify-between px-4 pt-4 pb-0 lg:px-6 lg:pt-5">
              <button
                onClick={() => setIsOpen(true)}
                className="lg:hidden w-10 h-10 flex items-center justify-center text-[#1F1D3D]"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-base font-semibold text-[#1F1D3D]">{currentTitle}</h1>
              <div className="w-10 lg:hidden" />
            </div>
            <FilterBar />
          </header>
          <div className="p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </VendedorFiltersProvider>
  );
}
