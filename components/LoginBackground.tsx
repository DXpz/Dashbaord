'use client';

import { useEffect, useRef } from 'react';

const FORMULAS = [
  'Σ(xi - x̄)²', 'μ = Σxi / n', 'σ = √(Σ(xi-μ)²/n)',
  'r = Σ(x-x̄)(y-ȳ) / √[Σ(x-x̄)²Σ(y-ȳ)²]',
  '∫f(x)dx', '∂/∂x', '∑', 'π', 'Δ = b² - 4ac',
  'P(A|B) = P(B|A)P(A) / P(B)',
  'e = mc²', 'log(x)', '√x', 'lim→0',
];

const MINI_CHART_DATA = [
  [20, 35, 25, 50, 40, 60, 45],
  [10, 25, 40, 30, 55, 45, 70],
  [50, 40, 60, 55, 75, 65, 80],
  [30, 20, 45, 60, 50, 70, 55],
];

export function LoginBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let offset = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();

    const drawMiniChart = (
      x: number,
      y: number,
      w: number,
      h: number,
      data: number[],
      color: string,
      alpha: number
    ) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.fillStyle = color;

      const stepX = w / (data.length - 1);
      const min = Math.min(...data);
      const max = Math.max(...data);
      const range = max - min || 1;

      ctx.beginPath();
      ctx.moveTo(x, y + h - ((data[0] - min) / range) * h);
      data.forEach((v, i) => {
        const px = x + i * stepX;
        const py = y + h - ((v - min) / range) * h;
        ctx.lineTo(px, py);
      });
      ctx.stroke();

      ctx.beginPath();
      data.forEach((v, i) => {
        const px = x + i * stepX;
        const py = y + h - ((v - min) / range) * h;
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    };

    const drawDoughnut = (
      x: number,
      y: number,
      r: number,
      segments: { value: number; color: string }[],
      alpha: number
    ) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.lineWidth = 4;

      let startAngle = -Math.PI / 2;
      const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;

      segments.forEach((seg) => {
        const ratio = seg.value / total;
        const endAngle = startAngle + ratio * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(x, y, r, startAngle, endAngle);
        ctx.strokeStyle = seg.color;
        ctx.stroke();
        startAngle = endAngle;
      });

      ctx.beginPath();
      ctx.arc(x, y, r * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(31, 29, 61, 0.15)';
      ctx.fill();

      ctx.restore();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.font = '11px monospace';
      ctx.fillStyle = 'rgba(31, 29, 61, 0.06)';

      const cols = Math.floor(canvas.width / 120);
      const rows = Math.floor(canvas.height / 80);

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const bx = i * 120 + 40 + Math.sin(offset * 0.3 + i + j) * 5;
          const by = j * 80 + 30 + Math.cos(offset * 0.2 + i * j) * 5;

          const type = (i + j + Math.floor(offset / 2)) % 5;

          if (type === 0) {
            const fi = (i * 7 + j * 3) % FORMULAS.length;
            ctx.fillText(FORMULAS[fi], bx, by);
          } else if (type === 1) {
            const chartIdx = (i + j) % MINI_CHART_DATA.length;
            const colors = [
              'rgba(31, 29, 61, 0.15)',
              'rgba(53, 50, 91, 0.12)',
              'rgba(181, 181, 174, 0.1)',
              'rgba(34, 197, 94, 0.1)',
            ];
            drawMiniChart(bx, by, 60, 30, MINI_CHART_DATA[chartIdx], colors[j % colors.length], 0.5);
          } else if (type === 2) {
            const colors = [
              'rgba(31, 29, 61, 0.12)',
              'rgba(53, 50, 91, 0.1)',
              'rgba(181, 181, 174, 0.08)',
            ];
            const segs = [
              { value: 60, color: 'rgba(31, 29, 61, 0.12)' },
              { value: 25, color: 'rgba(53, 50, 91, 0.1)' },
              { value: 15, color: 'rgba(181, 181, 174, 0.08)' },
            ];
            drawDoughnut(bx + 20, by + 20, 18, segs, 0.4);
          } else if (type === 3) {
            const barW = 8;
            const heights = [14, 22, 18, 26, 20];
            const spacing = 12;
            const baseY = by + 30;
            heights.forEach((h, k) => {
              ctx.fillStyle = `rgba(31, 29, 61, ${0.06 + k * 0.02})`;
              ctx.fillRect(bx + k * spacing, baseY - h, barW, h);
            });
          } else {
            const fi = (i * 11 + j * 5) % FORMULAS.length;
            ctx.fillText(FORMULAS[fi], bx, by);
          }
        }
      }

      offset += 0.04;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none' }}
    />
  );
}