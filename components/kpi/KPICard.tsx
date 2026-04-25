'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

export function KPICard({ label, value, icon: Icon, trend, trendValue, className }: KPICardProps) {
  return (
    <div className={cn(
      'bg-white border border-[#EEEEEC] p-6',
      'hover:border-[#B5B5AE] transition-colors duration-200',
      'animate-slide-up',
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-[#B5B5AE]" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-xs font-medium text-[#B5B5AE] uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-semibold text-[#1F1D3D] mt-1">{value}</p>
          </div>
        </div>
      </div>
    </div>
  );
}