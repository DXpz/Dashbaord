'use client';

import Link from 'next/link';
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
  Briefcase,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type IconKey = 'resumen' | 'formulario' | 'reuniones' | 'jornada' | 'clientes' | 'versiones' | 'password';

interface NavItem {
  href: string;
  label: string;
  icon: IconKey;
}

interface NavGroup {
  id: string;
  label: string;
  icon: 'briefcase' | 'messages' | 'users';
  items: NavItem[];
  defaultCollapsed?: boolean;
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: 'prospectos',
    label: 'Prospectos',
    icon: 'briefcase',
    defaultCollapsed: false,
    items: [
      { href: '/vendedor/prospectos/formulario', label: 'Formulario', icon: 'formulario' },
      { href: '/vendedor/prospectos/reuniones', label: 'Mis Reuniones', icon: 'reuniones' },
    ],
  },
  {
    id: 'seguimiento',
    label: 'Seguimiento',
    icon: 'messages',
    defaultCollapsed: false,
    items: [
      { href: '/vendedor/seguimiento/jornada', label: 'Jornada', icon: 'jornada' },
      { href: '/vendedor/seguimiento/clientes', label: 'Mis Clientes', icon: 'clientes' },
    ],
  },
  {
    id: 'cuenta',
    label: 'Mi cuenta',
    icon: 'users',
    defaultCollapsed: true,
    items: [
      { href: '/vendedor/cuenta/versiones', label: 'Versiones', icon: 'versiones' },
      { href: '/vendedor/cuenta/password', label: 'Cambiar contraseña', icon: 'password' },
    ],
  },
];

const ICONS: Record<IconKey, typeof LayoutDashboard> = {
  resumen: LayoutDashboard,
  formulario: FileText,
  reuniones: Calendar,
  jornada: MessageSquare,
  clientes: Users,
  versiones: Info,
  password: Lock,
};

const GROUP_ICONS = {
  briefcase: Briefcase,
  messages: MessageSquare,
  users: Users,
} as const;

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

function NavGroupSection({
  group,
  pathname,
  collapsedGroups,
  toggleGroup,
  onNavigate,
}: {
  group: NavGroup;
  pathname: string;
  collapsedGroups: Record<string, boolean>;
  toggleGroup: (id: string) => void;
  onNavigate: () => void;
}) {
  const GroupIcon = GROUP_ICONS[group.icon];
  const isCollapsed = !!collapsedGroups[group.id];
  const groupActive = group.items.some((it) => pathname === it.href);

  return (
    <div>
      <button
        onClick={() => toggleGroup(group.id)}
        className={cn(
          'flex items-center justify-between w-full px-3 py-2 rounded text-sm font-medium transition-colors',
          groupActive && !isCollapsed
            ? 'text-[#1F1D3D]'
            : 'text-[#35325B] hover:text-[#1F1D3D] hover:bg-[#EEEEEC]'
        )}
      >
        <span className="inline-flex items-center gap-2">
          <GroupIcon className="h-4 w-4" />
          {group.label}
        </span>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 transition-transform',
            isCollapsed ? '-rotate-90' : 'rotate-0'
          )}
        />
      </button>

      {!isCollapsed && (
        <div className="mt-1 ml-3 pl-2 border-l border-[#EEEEEC] space-y-1">
          {group.items.map((it) => {
            const Icon = ICONS[it.icon];
            const active = pathname === it.href;
            return (
              <Link
                key={it.href}
                href={it.href}
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors',
                  active
                    ? 'bg-[#1F1D3D] text-white font-medium'
                    : 'text-[#35325B] hover:text-[#1F1D3D] hover:bg-[#EEEEEC]'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {it.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function VendedorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
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
    return () => {
      clearLeaveTimeout();
    };
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

  // Titulo de la pagina actual (para el header)
  const allItems: NavItem[] = [
    { href: '/vendedor', label: 'Resumen', icon: 'resumen' },
    ...NAV_GROUPS.flatMap((g) => g.items),
  ];
  const currentTitle = allItems.find((n) => n.href === pathname)?.label ?? 'Dashboard';

  return (
    <VendedorFiltersProvider>
      <div className="flex min-h-screen bg-[#EEEEEC]">
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
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

          <nav className="flex-1 p-4 space-y-3 overflow-y-auto">
            {/* Resumen: item plano, fuera de las carpetas */}
            <Link
              href="/vendedor"
              onClick={handleClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors',
                pathname === '/vendedor'
                  ? 'bg-[#1F1D3D] text-white'
                  : 'text-[#35325B] hover:text-[#1F1D3D] hover:bg-[#EEEEEC]'
              )}
            >
              <LayoutDashboard className="h-4 w-4" />
              Resumen
            </Link>

            <div className="pt-2 border-t border-[#EEEEEC]" />

            {/* 3 carpetas colapsables */}
            {NAV_GROUPS.map((g) => (
              <NavGroupSection
                key={g.id}
                group={g}
                pathname={pathname}
                collapsedGroups={collapsedGroups}
                toggleGroup={toggleGroup}
                onNavigate={handleClose}
              />
            ))}
          </nav>

          <div className="p-4 border-t border-[#EEEEEC]">
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded text-sm font-medium text-[#B5B5AE] hover:text-[#c8151b] hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
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
