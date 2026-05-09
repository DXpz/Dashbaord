'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const MONTHS = [
  { value: '01', label: 'Enero' }, { value: '02', label: 'Febrero' },
  { value: '03', label: 'Marzo' }, { value: '04', label: 'Abril' },
  { value: '05', label: 'Mayo' }, { value: '06', label: 'Junio' },
  { value: '07', label: 'Julio' }, { value: '08', label: 'Agosto' },
  { value: '09', label: 'Septiembre' }, { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' }, { value: '12', label: 'Diciembre' },
];

function getDefaultDates() {
  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
  const lastDay = new Date(currentYear, parseInt(currentMonth) - 1, 0).getDate();
  return {
    desde: `${currentYear}-${currentMonth}-01`,
    hasta: `${currentYear}-${currentMonth}-${String(lastDay).padStart(2, '0')}`,
  };
}

interface VendedorFiltersContextType {
  month: string;
  year: string;
  desde: string;
  hasta: string;
  setMonth: (m: string) => void;
  setYear: (y: string) => void;
  handleFiltrar: () => void;
  handleLimpiar: () => void;
  availableYears: number[];
  months: typeof MONTHS;
}

const VendedorFiltersContext = createContext<VendedorFiltersContextType | null>(null);

function setMonthFn(month: string, year: string): { desde: string; hasta: string } {
  const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
  return {
    desde: `${year}-${month}-01`,
    hasta: `${year}-${month}-${String(lastDay).padStart(2, '0')}`,
  };
}

export function VendedorFiltersProvider({ children }: { children: ReactNode }) {
  const defaultDates = getDefaultDates();
  const [month, setMonthState] = useState(defaultDates.desde.split('-')[1]);
  const [year, setYearState] = useState(defaultDates.desde.split('-')[0]);
  const [desde, setDesde] = useState(defaultDates.desde);
  const [hasta, setHasta] = useState(defaultDates.hasta);

  useEffect(() => {
    const stored = localStorage.getItem('vendedor_filters');
    if (stored) {
      try {
        const { month: m, year: y } = JSON.parse(stored);
        if (m && y) {
          setMonthState(m);
          setYearState(y);
          const dates = setMonthFn(m, y);
          setDesde(dates.desde);
          setHasta(dates.hasta);
        }
      } catch {}
    }
  }, []);

  const setMonth = (m: string) => {
    setMonthState(m);
    const dates = setMonthFn(m, year);
    setDesde(dates.desde);
    setHasta(dates.hasta);
    localStorage.setItem('vendedor_filters', JSON.stringify({ month: m, year }));
  };

  const setYear = (y: string) => {
    setYearState(y);
    const dates = setMonthFn(month, y);
    setDesde(dates.desde);
    setHasta(dates.hasta);
    localStorage.setItem('vendedor_filters', JSON.stringify({ month, year: y }));
  };

  const handleFiltrar = () => {
    const dates = setMonthFn(month, year);
    setDesde(dates.desde);
    setHasta(dates.hasta);
  };

  const handleLimpiar = () => {
    const d = getDefaultDates();
    setMonthState(d.desde.split('-')[1]);
    setYearState(d.desde.split('-')[0]);
    setDesde(d.desde);
    setHasta(d.hasta);
    localStorage.removeItem('vendedor_filters');
  };

  const currentYear = new Date().getFullYear();
  const availableYears = [currentYear - 1, currentYear, currentYear + 1];

  return (
    <VendedorFiltersContext.Provider value={{
      month, year, desde, hasta,
      setMonth, setYear,
      handleFiltrar, handleLimpiar,
      availableYears, months: MONTHS
    }}>
      {children}
    </VendedorFiltersContext.Provider>
  );
}

export function useVendedorFilters() {
  const ctx = useContext(VendedorFiltersContext);
  if (!ctx) throw new Error('useVendedorFilters must be used inside VendedorFiltersProvider');
  return ctx;
}