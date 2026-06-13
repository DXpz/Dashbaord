'use client';

import { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { cn } from '@/lib/utils';

Chart.register(...registerables);

interface ChartWrapperProps {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar';
  data: any;
  options?: any;
  className?: string;
  height?: string;
}

const COLORS = {
  dark: '#1F1D3D',
  medium: '#35325B',
  light: '#B5B5AE',
  accent: '#EEEEEC',
  green: '#22c55e',
  orange: '#f97316',
  red: '#c8151b',
  blue: '#145478',
};

function hasData(data: any): boolean {
  if (!data?.labels?.length) return false;
  if (!data?.datasets?.length) return false;
  const values = data.datasets[0]?.data;
  if (!Array.isArray(values)) return false;
  return values.some((v: any) => v > 0);
}

function DoughnutCenterLabel({ chart }: { chart: Chart }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!chart?.canvas) return;
    const canvas = chart.canvas;
    const listener = () => {
      const activeElements = chart.getActiveElements();
      setActiveIndex(activeElements.length > 0 ? activeElements[0].index : null);
    };
    canvas.addEventListener('mouseout', listener);
    canvas.addEventListener('mousemove', listener);
    return () => {
      if (!canvas) return;
      canvas.removeEventListener('mouseout', listener);
      canvas.removeEventListener('mousemove', listener);
    };
  }, [chart]);

  const dataArr = (chart.data.datasets[0]?.data || []) as number[];
  const total = dataArr.reduce((a: number, b: number) => a + b, 0);

  if (activeIndex !== null) {
    const val = dataArr[activeIndex] ?? 0;
    const label = (chart.data.labels?.[activeIndex] as string) || '';
    const pct = total > 0 ? Math.round(((val as number) / total) * 100) : 0;
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-bold text-[#1F1D3D]">{val}</span>
        <span className="text-xs font-medium text-[#35325B]">{label}</span>
        <span className="text-xs text-[#B5B5AE]">{pct}%</span>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      <span className="text-2xl font-bold text-[#1F1D3D]">{total}</span>
      <span className="text-xs text-[#B5B5AE]">Total</span>
    </div>
  );
}

function buildDefaultOptions(type: string, showCenter = false) {
  const isBar = type === 'bar';
  const isPieDoughnut = type === 'pie' || type === 'doughnut';

  const base: any = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 400 },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: COLORS.dark,
        titleFont: { size: 12, family: 'Inter', weight: '600' },
        bodyFont: { size: 11, family: 'Inter' },
        padding: 10,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label(context: any) {
            const value = context.parsed.y ?? context.parsed ?? 0;
            const dataArr = context.dataset.data;
            const total = Array.isArray(dataArr) ? dataArr.reduce((a: number, b: number) => a + b, 0) : 0;
            const pct = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return ` ${value.toLocaleString('es-ES')} (${pct}%)`;
          },
        },
      },
    },
  };

  if (isPieDoughnut) {
    base.cutout = '70%';
  }

  if (isBar) {
    base.scales = {
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 11, family: 'Inter' },
          color: COLORS.light,
          maxRotation: 45,
        },
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.04)' },
        ticks: {
          font: { size: 11, family: 'Inter' },
          color: COLORS.light,
          callback: (value: any) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value,
        },
      },
    };
  }

  return base;
}

export function ChartWrapper({ type, data, options, className, height = '100%' }: ChartWrapperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    chartRef.current?.destroy();

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const mergedOptions = {
      ...buildDefaultOptions(type),
      ...options,
    };

    chartRef.current = new Chart(ctx, {
      type,
      data,
      options: mergedOptions,
    });

    return () => { chartRef.current?.destroy(); };
  }, [type, data, options]);

  const hasChartData = hasData(data);
  const isDoughnut = type === 'doughnut';

  return (
    <div ref={containerRef} className={cn('relative w-full', className)} style={{ height }}>
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

      {hasChartData && isDoughnut && chartRef.current && chartRef.current.canvas && (
        <DoughnutCenterLabel chart={chartRef.current} />
      )}
    </div>
  );
}