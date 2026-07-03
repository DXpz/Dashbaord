'use client';

import { Shell } from '@/components/layout/Shell';
import { ChartCard } from '@/components/charts/ChartCard';
import { ChartWrapper } from '@/components/charts/ChartWrapper';

const STAGE_COLORS = {
  visitas: '#1F1D3D',
  llamadas: '#7c3aed',
  contactoInicial: '#1F1D3D',
  correo: '#f59e0b',
  presentacion: '#3b82f6',
  cierreGanado: '#10b981',
  cierrePerdido: '#ef4444',
  altas: '#ef4444',
  medias: '#f59e0b',
  bajas: '#10b981',
};

const KPIS = [
  { label: 'Clientes Activos', value: 26 },
  { label: 'Visitas (6 sem)', value: 49 },
  { label: 'Llamadas (6 sem)', value: 16 },
  { label: 'Valor Pipeline', value: 311, prefix: '$' },
];

const ACTIVIDAD_SEMANAL = [
  { semana: 'Sem 25/6', visitas: 0, llamadas: 0, meta: 0 },
  { semana: 'Sem 1/6', visitas: 3, llamadas: 6, meta: 5 },
  { semana: 'Sem 8/6', visitas: 13, llamadas: 0, meta: 10 },
  { semana: 'Sem 15/6', visitas: 15, llamadas: 5, meta: 5 },
  { semana: 'Sem 22/6', visitas: 10, llamadas: 0, meta: 5 },
  { semana: 'Sem 29/6', visitas: 5, llamadas: 4, meta: 4 },
];

const PIPELINE_ETAPAS = [
  { etapa: 'Contacto Inicial', abiertas: 0, valor: 0, color: STAGE_COLORS.contactoInicial },
  { etapa: 'Correo/Propuesta Enviada', abiertas: 2, valor: 71, color: STAGE_COLORS.correo },
  { etapa: 'Presentación / Demo', abiertas: 0, valor: 0, color: STAGE_COLORS.presentacion },
  { etapa: 'Cierre Ganado ✓', abiertas: 2, valor: 240, color: STAGE_COLORS.cierreGanado },
  { etapa: 'Cierre Perdido ✗', abiertas: 1, valor: 0, color: STAGE_COLORS.cierrePerdido },
];

const ESTADO_CLIENTES = {
  prospectos: 58,
  activos: 26,
  inactivos: 0,
};

const NIVEL_OPORTUNIDADES = {
  altas: 13,
  medias: 51,
  bajas: 1,
};

function KpiCard({
  label,
  value,
  prefix,
}: {
  label: string;
  value: number;
  prefix?: string;
}) {
  return (
    <div className="bg-white border border-[#EEEEEC] rounded-xl p-4 flex flex-col items-center min-h-[140px]">
      <p className="text-[10px] font-medium text-[#B5B5AE] uppercase tracking-wider mb-2 text-center">
        {label}
      </p>
      <div className="flex-1 flex items-center justify-center w-full">
        <p className="text-4xl lg:text-6xl font-bold text-[#1F1D3D]">
          {prefix}
          {value.toLocaleString()}
        </p>
      </div>
    </div>
  );
}

function BarrasSemanales() {
  const totalVisitas = ACTIVIDAD_SEMANAL.reduce((acc, s) => acc + s.visitas, 0);
  const totalLlamadas = ACTIVIDAD_SEMANAL.reduce((acc, s) => acc + s.llamadas, 0);

  return (
    <ChartCard
      title="Actividad Semanal"
      subtitle={`${totalVisitas} visitas · ${totalLlamadas} llamadas (últimas 6 semanas)`}
    >
      <ChartWrapper
        type="bar"
        height="240px"
        data={{
          labels: ACTIVIDAD_SEMANAL.map((s) => s.semana),
          datasets: [
            {
              label: 'Visitas',
              data: ACTIVIDAD_SEMANAL.map((s) => s.visitas),
              backgroundColor: STAGE_COLORS.visitas,
              borderRadius: 0,
              borderSkipped: false,
            },
            {
              label: 'Llamadas',
              data: ACTIVIDAD_SEMANAL.map((s) => s.llamadas),
              backgroundColor: STAGE_COLORS.llamadas,
              borderRadius: 0,
              borderSkipped: false,
            },
          ],
        }}
        options={{
          indexAxis: 'y' as const,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx: any) => ` ${ctx.dataset.label}: ${ctx.raw}`,
              },
            },
          },
          scales: {
            x: {
              stacked: false,
              grid: { color: 'rgba(0,0,0,0.04)' },
              ticks: {
                font: { size: 11, family: 'Inter' },
                color: '#B5B5AE',
                stepSize: 5,
              },
            },
            y: {
              stacked: false,
              grid: { display: false },
              ticks: {
                font: { size: 12, family: 'Inter', weight: '500' },
                color: '#35325B',
              },
            },
          },
        }}
      />
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#EEEEEC]">
        <div className="flex items-center gap-1.5 text-[11px] text-[#35325B]">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: STAGE_COLORS.visitas }} />
          Visitas
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-[#35325B]">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: STAGE_COLORS.llamadas }} />
          Llamadas
        </div>
      </div>
    </ChartCard>
  );
}

function PipelineEtapas() {
  const totalAbiertas = PIPELINE_ETAPAS.reduce((acc, e) => acc + e.abiertas, 0);
  const totalValor = PIPELINE_ETAPAS.reduce((acc, e) => acc + e.valor, 0);

  return (
    <ChartCard
      title="Pipeline por Etapa"
      subtitle={`${totalAbiertas} oportunidades · $${totalValor.toLocaleString()} en juego`}
    >
      <ChartWrapper
        type="bar"
        height="240px"
        data={{
          labels: PIPELINE_ETAPAS.map((e) => e.etapa),
          datasets: [
            {
              label: 'Abiertas',
              data: PIPELINE_ETAPAS.map((e) => e.abiertas),
              backgroundColor: PIPELINE_ETAPAS.map((e) => e.color),
              borderRadius: 0,
              borderSkipped: false,
            },
          ],
        }}
        options={{
          indexAxis: 'y' as const,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx: any) => {
                  const idx = ctx.dataIndex;
                  const abiertas = PIPELINE_ETAPAS[idx].abiertas;
                  const valor = PIPELINE_ETAPAS[idx].valor;
                  return ` ${abiertas} abiertas · $${valor.toLocaleString()}`;
                },
              },
            },
          },
          scales: {
            x: {
              grid: { color: 'rgba(0,0,0,0.04)' },
              ticks: {
                font: { size: 11, family: 'Inter' },
                color: '#B5B5AE',
                stepSize: 1,
              },
            },
            y: {
              grid: { display: false },
              ticks: {
                font: { size: 12, family: 'Inter', weight: '500' },
                color: '#35325B',
              },
            },
          },
        }}
      />
    </ChartCard>
  );
}

function EstadoClientes() {
  return (
    <ChartCard title="Estado de Clientes" subtitle="Distribución de la cartera">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-[#EEEEEC] p-4 text-center">
          <p className="text-2xl font-semibold text-[#1F1D3D]">
            {ESTADO_CLIENTES.prospectos}
          </p>
          <p className="text-[11px] text-[#35325B] mt-1">Prospectos</p>
        </div>
        <div className="rounded-lg border border-[#EEEEEC] p-4 text-center">
          <p className="text-2xl font-semibold text-[#1F1D3D]">
            {ESTADO_CLIENTES.activos}
          </p>
          <p className="text-[11px] text-[#35325B] mt-1">Activos</p>
        </div>
        <div className="rounded-lg border border-[#EEEEEC] p-4 text-center">
          <p className="text-2xl font-semibold text-[#B5B5AE]">
            {ESTADO_CLIENTES.inactivos}
          </p>
          <p className="text-[11px] text-[#35325B] mt-1">Inactivos</p>
        </div>
      </div>
    </ChartCard>
  );
}

function NivelOportunidades() {
  return (
    <ChartCard title="Nivel de Oportunidades" subtitle="Calificación del pipeline">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-[#EEEEEC] p-4 text-center">
          <p
            className="text-2xl font-semibold"
            style={{ color: STAGE_COLORS.altas }}
          >
            {NIVEL_OPORTUNIDADES.altas}
          </p>
          <p className="text-[11px] text-[#35325B] mt-1">Altas</p>
        </div>
        <div className="rounded-lg border border-[#EEEEEC] p-4 text-center">
          <p
            className="text-2xl font-semibold"
            style={{ color: STAGE_COLORS.medias }}
          >
            {NIVEL_OPORTUNIDADES.medias}
          </p>
          <p className="text-[11px] text-[#35325B] mt-1">Medias</p>
        </div>
        <div className="rounded-lg border border-[#EEEEEC] p-4 text-center">
          <p
            className="text-2xl font-semibold"
            style={{ color: STAGE_COLORS.bajas }}
          >
            {NIVEL_OPORTUNIDADES.bajas}
          </p>
          <p className="text-[11px] text-[#35325B] mt-1">Bajas</p>
        </div>
      </div>
    </ChartCard>
  );
}

export default function DataredPage() {
  const emptyFilters = {
    desde: '',
    hasta: '',
    pais: '',
    asesor: '',
    tipoLead: '',
    origen: '',
    tipoLlamada: '',
  };

  const handleChange = () => {};
  const handleFiltrar = () => {};
  const handleLimpiar = () => {};

  return (
    <Shell
      pageTitle="Resumen DataRed"
      filters={emptyFilters}
      onFilterChange={handleChange}
      onFiltrar={handleFiltrar}
      onLimpiar={handleLimpiar}
      asesores={[]}
      connectionStatus="connected"
      showFilterBar={false}
    >
      {/* DEMO: Datos hardcodeados — pendiente conectar a endpoint /api/datared/resumen */}
      <div className="space-y-5 max-w-7xl">
        <section>
          <p className="text-[11px] text-[#B5B5AE] mb-2 italic">
            {/* DEMO: versión demo, datos no conectados a backend */}
            Versión demo — datos estáticos de muestra
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {KPIS.map((k) => (
              <KpiCard key={k.label} {...k} />
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <BarrasSemanales />
          <PipelineEtapas />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
            <EstadoClientes />
            <NivelOportunidades />
          </div>
        </section>
      </div>
    </Shell>
  );
}
