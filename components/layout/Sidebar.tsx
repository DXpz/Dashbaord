'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  Globe,
  ShieldCheck,
  X,
  BarChart3,
  CircleDot,
  LogOut,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Resumen', icon: LayoutDashboard },
  { href: '/asesores', label: 'Asesores', icon: Users },
  { href: '/propuestas', label: 'Propuestas', icon: FileText },
  { href: '/reuniones', label: 'Reuniones', icon: Calendar },
  { href: '/round-robin', label: 'Round Robin', icon: CircleDot },
  { href: '/origen-leads', label: 'Origen Leads', icon: Globe },
  { href: '/gestion-asesores', label: 'Gestión', icon: ShieldCheck },
  { href: '/formulario', label: 'Formulario', icon: FileText },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearLeaveTimeout = useCallback(() => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
  }, []);

  const handleClose = useCallback(() => {
    clearLeaveTimeout();
    onClose?.();
  }, [clearLeaveTimeout, onClose]);

  useEffect(() => {
    return () => {
      clearLeaveTimeout();
    };
  }, [clearLeaveTimeout]);

  const handleMouseEnter = () => {
    clearLeaveTimeout();
  };

  const handleMouseLeave = () => {
  };

  const isVisible = isOpen;

  return (
    <>
      {isVisible && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={handleClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen w-64 bg-[#F5F5ED] border-r border-[#EEEEEC]',
          'transform transition-transform duration-200 ease-out',
          'lg:relative lg:translate-x-0 lg:h-auto lg:min-h-screen lg:block lg:z-auto',
          isVisible ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:block'
        )}
      >
        <div
          className="flex flex-col h-full p-4"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#1F1D3D] rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-[#B5B5AE]" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-[#1F1D3D] text-sm leading-tight">Dashboard</span>
                <span className="text-[10px] text-[#B5B5AE] leading-tight">Metrics</span>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center text-[#B5B5AE] hover:text-[#35325B] lg:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav className="flex-1 space-y-0.5">
            {navItems.map((item) => {
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