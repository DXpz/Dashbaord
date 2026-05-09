'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { LayoutDashboard, Calendar, LogOut } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/vendedor', label: 'Resumen', icon: LayoutDashboard },
  { href: '/vendedor/reuniones', label: 'Mis Reuniones', icon: Calendar },
];

export default function VendedorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-[#EEEEEC]">
      <aside className="w-64 bg-[#F5F5ED] border-r border-[#EEEEEC] flex flex-col">
        <div className="p-4 border-b border-[#EEEEEC]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1F1D3D] rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">{user?.full_name?.[0] ?? 'V'}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1F1D3D]">{user?.full_name}</p>
              <p className="text-xs text-[#B5B5AE] capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#1F1D3D] text-white'
                    : 'text-[#35325B] hover:bg-[#EEEEEC] hover:text-[#1F1D3D]'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
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
        <header className="bg-[#F5F5ED] border-b border-[#EEEEEC] px-6 pt-5 pb-4">
          <h1 className="text-base font-semibold text-[#1F1D3D]">
            {NAV_ITEMS.find(n => n.href === pathname)?.label ?? 'Dashboard'}
          </h1>
        </header>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}