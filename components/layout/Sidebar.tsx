'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useEffectiveUser } from '@/lib/role-context';
import { useEcosystem } from '@/lib/ecosystem-context';
import { EcosystemSwitcher } from '@/components/layout/EcosystemSwitcher';
import {
  ECOSYSTEM_REGISTRY,
  SidebarItem,
  SidebarGroup,
} from '@/lib/ecosystem-registry';
import { cn } from '@/lib/utils';
import {
  X,
  LogOut,
  Lock,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

const EDGE_TRIGGER_WIDTH = 60;
const LEAVE_DELAY_MS = 2000;

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

function isGroup(item: SidebarItem | SidebarGroup): item is SidebarGroup {
  return Array.isArray((item as SidebarGroup).items);
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { isAdmin } = useEffectiveUser();
  const { ecosystem } = useEcosystem();
  const [isOpenDesktop, setIsOpenDesktop] = useState(false);
  const [isHoveringSidebar, setIsHoveringSidebar] = useState(false);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Todas las carpetas inician colapsadas. El usuario las abre manualmente.
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const items = useMemo(() => {
    const config = ECOSYSTEM_REGISTRY[ecosystem];
    return config?.sidebarItems ?? [];
  }, [ecosystem]);

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
  };

  const handleMouseLeave = () => {
    setIsHoveringSidebar(false);
    scheduleHide();
  };

  const handleClose = useCallback(() => {
    clearLeaveTimeout();
    setIsOpenDesktop(false);
    onClose?.();
  }, [clearLeaveTimeout, onClose]);

  const isVisible = isOpen || isOpenDesktop;

  const toggleGroup = (id: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <>
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

        <div className="px-3 flex-shrink-0">
          <EcosystemSwitcher />
        </div>

        <nav className="flex-1 min-h-0 px-3 mt-2 space-y-0.5 overflow-hidden">
          {items.map((entry) => {
            if (isGroup(entry)) {
              return (
                <GroupSection
                  key={entry.id}
                  group={entry}
                  pathname={pathname}
                  isAdmin={isAdmin}
                  collapsed={!!collapsedGroups[entry.id]}
                  onToggle={() => toggleGroup(entry.id)}
                  onItemClick={handleClose}
                />
              );
            }
            return (
              <NavLink
                key={entry.href}
                item={entry}
                pathname={pathname}
                isAdmin={isAdmin}
                onClick={handleClose}
              />
            );
          })}
          <Link
            href="/change-password"
            onClick={handleClose}
            className={cn(
              'flex items-center gap-2.5 px-2.5 py-2 rounded text-xs font-medium transition-colors',
              pathname === '/change-password'
                ? 'bg-[#1F1D3D] text-[#F5F5ED]'
                : 'text-[#35325B] hover:text-[#1F1D3D] hover:bg-[#EEEEEC]'
            )}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Cambiar contraseña</span>
          </Link>
        </nav>

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
    </>
  );
}

function NavLink({
  item,
  pathname,
  isAdmin,
  onClick,
}: {
  item: SidebarItem;
  pathname: string;
  isAdmin: boolean;
  onClick: () => void;
}) {
  if (item.adminOnly && !isAdmin) return null;
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
  isAdmin,
  collapsed,
  onToggle,
  onItemClick,
}: {
  group: SidebarGroup;
  pathname: string;
  isAdmin: boolean;
  collapsed: boolean;
  onToggle: () => void;
  onItemClick: () => void;
}) {
  // Grupo activo: tiene un item en la ruta actual.
  const hasActive = group.items.some((i) => pathname === i.href);
  const visibleItems = group.items.filter(
    (i) => !(i.adminOnly && !isAdmin)
  );
  if (visibleItems.length === 0) return null;

  return (
    <div className="mb-0.5">
      <button
        onClick={onToggle}
        className={cn(
          'w-full flex items-center justify-between px-2.5 py-1.5 rounded text-[10px] font-semibold uppercase tracking-wider transition-colors',
          'text-[#B5B5AE] hover:text-[#1F1D3D] hover:bg-[#EEEEEC]',
          hasActive && 'text-[#1F1D3D]'
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
          {visibleItems.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              pathname={pathname}
              isAdmin={isAdmin}
              onClick={onItemClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}