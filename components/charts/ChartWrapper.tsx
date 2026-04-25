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

  return (
    <div className={cn('relative w-full', className)} style={{ height }}>
      <canvas ref={canvasRef} />
    </div>
  );
}