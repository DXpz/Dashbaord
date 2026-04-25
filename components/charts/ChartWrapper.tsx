'use client';

import { useEffect, useRef } from 'react';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { cn } from '@/lib/utils';

Chart.register(...registerables);

interface ChartWrapperProps {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar';
  data: any;
  options?: any;
  className?: string;
  height?: string;
}

const palette = {
  dark: '#1F1D3D',
  medium: '#35325B',
  light: '#B5B5AE',
  accent: '#EEEEEC',
};

function hasData(data: any): boolean {
  if (!data?.labels?.length) return false;
  if (!data?.datasets?.length) return false;
  const values = data.datasets[0]?.data;
  if (!Array.isArray(values)) return false;
  return values.some((v: any) => v > 0);
}

export function ChartWrapper({ type, data, options, className, height = '100%' }: ChartWrapperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    chartRef.current?.destroy();

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const defaultOptions: any = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: type === 'pie' || type === 'doughnut',
          position: 'bottom' as const,
          labels: {
            usePointStyle: true,
            padding: 16,
            font: { size: 11, family: 'Inter' },
            color: palette.light,
          },
        },
      },
      scales: type === 'bar' || type === 'line' ? {
        x: {
          grid: { display: false },
          ticks: { font: { size: 11, family: 'Inter' }, color: palette.light },
        },
        y: {
          grid: { color: 'rgba(0,0,0,0.04)' },
          ticks: { font: { size: 11, family: 'Inter' }, color: palette.light },
        },
      } : undefined,
    };

    chartRef.current = new Chart(ctx, {
      type,
      data,
      options: { ...defaultOptions, ...options },
    });

    return () => {
      chartRef.current?.destroy();
    };
  }, [type, data, options]);

  const hasChartData = hasData(data);

  return (
    <div className={cn('relative w-full', className)} style={{ height }}>
      {!hasChartData ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full max-w-[200px] space-y-3 opacity-30">
            {type === 'doughnut' || type === 'pie' ? (
              <div className="relative">
                <div className="aspect-square rounded-full border-8 border-dashed border-[#B5B5AE]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1/2 h-1/2 rounded-full bg-[#EEEEEC]" />
                </div>
              </div>
            ) : type === 'bar' || type === 'line' ? (
              <div className="flex items-end justify-around h-32 gap-2 pt-4">
                {[0.4, 0.6, 0.35, 0.8, 0.5, 0.65, 0.45].map((h, i) => (
                  <div key={i} className="w-6 bg-[#B5B5AE] rounded-t-sm" style={{ height: `${h * 100}%` }} />
                ))}
              </div>
            ) : (
              <div className="w-full h-32 border-4 border-dashed border-[#B5B5AE] rounded-lg" />
            )}
            <div className="h-3 bg-[#B5B5AE] rounded opacity-50" />
            <div className="h-3 bg-[#B5B5AE] rounded opacity-30 w-3/4 mx-auto" />
          </div>
        </div>
      ) : null}
      <canvas ref={canvasRef} className={!hasChartData ? 'invisible' : ''} />
    </div>
  );
}