'use client';

import { cn } from '@/lib/utils';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

export function ChartCard({ title, subtitle, children, className, actions }: ChartCardProps) {
  return (
    <div className={cn(
      'bg-white border border-[#EEEEEC] animate-slide-up',
      className
    )}>
      <div className="px-5 py-4 border-b border-[#EEEEEC] flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-[#1F1D3D]">{title}</h3>
          {subtitle && <p className="text-xs text-[#B5B5AE] mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}