'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Save, ChevronDown } from 'lucide-react';

// DEMO: formulario en memoria — pendiente conectar a endpoint POST /api/datared/clientes

const ESTADOS = [
  { value: 'prospecto', label: 'Prospecto' },
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
];

const SECTORES = [
  'Sin especificar',
  'Banca y Finanzas',
  'Gobierno',
  'Salud',
  'Educación',
  'Tecnología',
  'Logística',
  'Comercio / Retail',
  'Manufactura',
  'Telecomunicaciones',
  'Seguro',
  'Legal',
  'Construcción',
  'Energía',
  'Otro',
];

const TAMAÑOS = [
  'Sin especificar',
  'Micro (1-10 emp.)',
  'Pequeña (11-50 emp.)',
  'Mediana (51-200 emp.)',
  'Grande (200+ emp.)',
];

export interface NuevoClienteData {
  empresa: string;
  estado: string;
  servicio: string;
  contacto: string;
  cargo: string;
  telefono: string;
  correo: string;
  sector: string;
  tamaño: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (data: NuevoClienteData) => void;
}

export function NuevoClienteModal({ open, onOpenChange, onSave }: Props) {
  const [form, setForm] = useState<NuevoClienteData>({
    empresa: '',
    estado: 'prospecto',
    servicio: '',
    contacto: '',
    cargo: '',
    telefono: '',
    correo: '',
    sector: 'Sin especificar',
    tamaño: 'Sin especificar',
  });

  const handleChange = (key: keyof NuevoClienteData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave?.(form);
    onOpenChange(false);
    setForm({
      empresa: '',
      estado: 'prospecto',
      servicio: '',
      contacto: '',
      cargo: '',
      telefono: '',
      correo: '',
      sector: 'Sin especificar',
      tamaño: 'Sin especificar',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-7">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-lg text-[#1F1D3D]">Nuevo Cliente</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Field label="Empresa" required>
            <InputShell>
              <input
                type="text"
                placeholder="Nombre de la empresa"
                value={form.empresa}
                onChange={(e) => handleChange('empresa', e.target.value)}
                className="w-full h-9 px-3 bg-transparent text-sm text-[#1F1D3D] placeholder:text-[#B5B5AE] focus:outline-none"
                required
              />
            </InputShell>
          </Field>

          <div className="grid grid-cols-2 gap-3.5">
            <Field label="Estado">
              <SelectShell value={form.estado} onChange={(v) => handleChange('estado', v)}>
                {ESTADOS.map((e) => (
                  <option key={e.value} value={e.value}>
                    {e.label}
                  </option>
                ))}
              </SelectShell>
            </Field>

            <Field label="Servicio">
              <InputShell>
                <input
                  type="text"
                  placeholder="Ej: Colocacion, Fibra..."
                  value={form.servicio}
                  onChange={(e) => handleChange('servicio', e.target.value)}
                  className="w-full h-9 px-3 bg-transparent text-sm text-[#1F1D3D] placeholder:text-[#B5B5AE] focus:outline-none"
                />
              </InputShell>
            </Field>

            <Field label="Contacto">
              <InputShell>
                <input
                  type="text"
                  placeholder="Nombre del contacto (opcional)"
                  value={form.contacto}
                  onChange={(e) => handleChange('contacto', e.target.value)}
                  className="w-full h-9 px-3 bg-transparent text-sm text-[#1F1D3D] placeholder:text-[#B5B5AE] focus:outline-none"
                />
              </InputShell>
            </Field>

            <Field label="Cargo del Contacto">
              <InputShell>
                <input
                  type="text"
                  placeholder="Ej: Gerente de TI"
                  value={form.cargo}
                  onChange={(e) => handleChange('cargo', e.target.value)}
                  className="w-full h-9 px-3 bg-transparent text-sm text-[#1F1D3D] placeholder:text-[#B5B5AE] focus:outline-none"
                />
              </InputShell>
            </Field>

            <Field label="Teléfono">
              <InputShell>
                <input
                  type="text"
                  placeholder="7000-0000 (opcional)"
                  value={form.telefono}
                  onChange={(e) => handleChange('telefono', e.target.value)}
                  className="w-full h-9 px-3 bg-transparent text-sm text-[#1F1D3D] placeholder:text-[#B5B5AE] focus:outline-none"
                />
              </InputShell>
            </Field>

            <Field label="Correo Electrónico">
              <InputShell>
                <input
                  type="email"
                  placeholder="contacto@empresa.com (opcional)"
                  value={form.correo}
                  onChange={(e) => handleChange('correo', e.target.value)}
                  className="w-full h-9 px-3 bg-transparent text-sm text-[#1F1D3D] placeholder:text-[#B5B5AE] focus:outline-none"
                />
              </InputShell>
            </Field>

            <Field label="Sector / Industria">
              <SelectShell value={form.sector} onChange={(v) => handleChange('sector', v)}>
                {SECTORES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </SelectShell>
            </Field>

            <Field label="Tamaño de Empresa">
              <SelectShell value={form.tamaño} onChange={(v) => handleChange('tamaño', v)}>
                {TAMAÑOS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </SelectShell>
            </Field>
          </div>

          <DialogFooter className="mt-5">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-10 px-4 rounded-lg border border-[#EEEEEC] bg-white text-sm font-medium text-[#35325B] hover:bg-[#F5F5ED] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="h-10 px-4 rounded-lg bg-[#1F1D3D] text-white text-sm font-medium hover:bg-[#35325B] transition-colors inline-flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              Guardar
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-[#B5B5AE] uppercase tracking-wider mb-1.5">
        {label}
        {required && <span className="text-[#ef4444] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function InputShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-[#F5F5ED] border border-transparent focus-within:border-[#1F1D3D] transition-colors">
      {children}
    </div>
  );
}

function SelectShell({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative rounded-lg bg-[#F5F5ED] border border-transparent focus-within:border-[#1F1D3D] transition-colors">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-9 px-3 bg-transparent text-sm text-[#1F1D3D] focus:outline-none appearance-none pr-9"
      >
        {children}
      </select>
      <ChevronDown className="w-4 h-4 text-[#B5B5AE] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}
