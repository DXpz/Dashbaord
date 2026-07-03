'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useEcosystem } from '@/lib/ecosystem-context';
import { EcosystemSwitcher } from '@/components/layout/EcosystemSwitcher';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  Globe,
  ShieldCheck,
  X,
  CircleDot,
  LogOut,
  Lock,
  Info,
  AlertTriangle,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Resumen', icon: LayoutDashboard },
  { href: '/asesores', label: 'Asesores', icon: Users },
  { href: '/propuestas', label: 'Propuestas', icon: FileText },
  { href: '/reuniones', label: 'Reuniones', icon: Calendar },
  { href: '/metricas-etapas', label: 'Métricas Etapas', icon: AlertTriangle, adminOnly: true },
  { href: '/round-robin', label: 'Round Robin', icon: CircleDot },
  { href: '/origen-leads', label: 'Origen Leads', icon: Globe },
  { href: '/gestion-asesores', label: 'Gestión', icon: ShieldCheck },
  { href: '/formulario', label: 'Formulario', icon: FileText },
  { href: '/versiones', label: 'Versiones', icon: Info },
];

const EDGE_TRIGGER_WIDTH = 60;
const LEAVE_DELAY_MS = 2000;

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { ecosystem } = useEcosystem();
  const [isOpenDesktop, setIsOpenDesktop] = useState(false);
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
          'fixed top-0 left-0 z-40 h-screen w-64 bg-[#F5F5ED] border-r border-[#EEEEEC]',
          'transform transition-transform duration-200 ease-out',
          isVisible ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex-1 flex items-center justify-center">
              <div className="relative h-14 rounded-lg overflow-hidden">
                <Image
                  src="/logos/prospektia.png"
                  alt="ProspektIA"
                  width={170}
                  height={43}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center text-[#B5B5AE] hover:text-[#35325B] lg:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <EcosystemSwitcher />

          <nav className="flex-1 space-y-0.5">
            {ecosystem === 'datared' && (
              <>
                <Link
                  href="/datared"
                  onClick={handleClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors',
                    pathname === '/datared'
                      ? 'bg-[#1F1D3D] text-[#F5F5ED]'
                      : 'text-[#35325B] hover:text-[#1F1D3D] hover:bg-[#EEEEEC]'
                  )}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Panel DataRed</span>
                </Link>
                <Link
                  href="/datared/clientes"
                  onClick={handleClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors',
                    pathname === '/datared/clientes'
                      ? 'bg-[#1F1D3D] text-[#F5F5ED]'
                      : 'text-[#35325B] hover:text-[#1F1D3D] hover:bg-[#EEEEEC]'
                  )}
                >
                  <Users className="w-4 h-4" />
                  <span>Clientes</span>
                </Link>
                <Link
                  href="/datared/reuniones"
                  onClick={handleClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors',
                    pathname === '/datared/reuniones'
                      ? 'bg-[#1F1D3D] text-[#F5F5ED]'
                      : 'text-[#35325B] hover:text-[#1F1D3D] hover:bg-[#EEEEEC]'
                  )}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Reuniones</span>
                </Link>
                <Link
                  href="/datared/usuarios"
                  onClick={handleClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors',
                    pathname === '/datared/usuarios'
                      ? 'bg-[#1F1D3D] text-[#F5F5ED]'
                      : 'text-[#35325B] hover:text-[#1F1D3D] hover:bg-[#EEEEEC]'
                  )}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Usuarios</span>
                </Link>
                <Link
                  href="/datared/versiones"
                  onClick={handleClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors',
                    pathname === '/datared/versiones'
                      ? 'bg-[#1F1D3D] text-[#F5F5ED]'
                      : 'text-[#35325B] hover:text-[#1F1D3D] hover:bg-[#EEEEEC]'
                  )}
                >
                  <Info className="w-4 h-4" />
                  <span>Versiones</span>
                </Link>
              </>
            )}
            {ecosystem === 'prospektia' && navItems.map((item) => {
              if (item.adminOnly && user?.role !== 'admin') return null;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[#1F1D3D] text-[#F5F5ED]'
                      : 'text-[#35325B] hover:text-[#1F1D3D] hover:bg-[#EEEEEC]'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <Link
              href="/change-password"
              onClick={handleClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors',
                pathname === '/change-password'
                  ? 'bg-[#1F1D3D] text-[#F5F5ED]'
                  : 'text-[#35325B] hover:text-[#1F1D3D] hover:bg-[#EEEEEC]'
              )}
            >
              <Lock className="w-4 h-4" />
              <span>Cambiar contraseña</span>
            </Link>
          </nav>

          <div className="mt-4 px-2">
            <button
              onClick={logout}
              className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#B5B5AE] hover:text-[#c8151b] hover:bg-red-50 rounded transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}