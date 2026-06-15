'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Users, FileText, Target } from 'lucide-react';

export interface CalendarEvent {
  date: string;
  type: 'reunion' | 'propuesta' | 'seguimiento' | 'lead';
  label: string;
  clientName?: string;
}

interface VendedorCalendarProps {
  events: CalendarEvent[];
}

const TYPE_STYLES: Record<CalendarEvent['type'], { dot: string; bg: string; text: string; icon: any; label: string }> = {
  reunion: { dot: 'bg-[#1F1D3D]', bg: 'bg-[#1F1D3D]/5', text: 'text-[#1F1D3D]', icon: Users, label: 'Reunión' },
  propuesta: { dot: 'bg-[#35325B]', bg: 'bg-[#35325B]/5', text: 'text-[#35325B]', icon: FileText, label: 'Propuesta' },
  seguimiento: { dot: 'bg-[#22c55e]', bg: 'bg-[#22c55e]/5', text: 'text-[#22c55e]', icon: Clock, label: 'Seguimiento' },
  lead: { dot: 'bg-[#B5B5AE]', bg: 'bg-[#B5B5AE]/10', text: 'text-[#35325B]', icon: Target, label: 'Lead' },
};

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const FULL_DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: { date: Date; inMonth: boolean }[] = [];

  const firstDayOfWeek = (firstDay.getDay() + 6) % 7;
  for (let i = firstDayOfWeek; i > 0; i--) {
    const d = new Date(year, month, 1 - i);
    days.push({ date: d, inMonth: false });
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push({ date: new Date(year, month, d), inMonth: true });
  }

  const remaining = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    days.push({ date: new Date(year, month + 1, i), inMonth: false });
  }

  return days;
}

function fmtDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function VendedorCalendar({ events }: VendedorCalendarProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const days = useMemo(() => getMonthDays(year, month), [year, month]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const ev of events) {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    }
    return map;
  }, [events]);

  const upcomingEvents = useMemo(() => {
    const todayKey = fmtDateKey(today);
    return events
      .filter(e => e.date >= todayKey)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 10);
  }, [events, today]);

  const selectedEvents = selectedDate ? eventsByDate[selectedDate] || [] : [];

  const goPrev = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelectedDate(null);
  };
  const goNext = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelectedDate(null);
  };
  const goToday = () => { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelectedDate(null); };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 bg-white border border-[#EEEEEC] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#1F1D3D]" />
            <h3 className="text-sm font-medium text-[#1F1D3D]">Calendario</h3>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={goToday} className="text-[10px] font-medium uppercase tracking-wider text-[#35325B] hover:text-[#1F1D3D] px-2 py-1">
              Hoy
            </button>
            <button onClick={goPrev} className="p-1.5 rounded hover:bg-[#F5F5ED] text-[#35325B] hover:text-[#1F1D3D]">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-[#1F1D3D] min-w-[120px] text-center">
              {MONTHS[month]} {year}
            </span>
            <button onClick={goNext} className="p-1.5 rounded hover:bg-[#F5F5ED] text-[#35325B] hover:text-[#1F1D3D]">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAYS.map((d, i) => (
            <div key={i} className="text-center text-[10px] font-medium uppercase tracking-wider text-[#B5B5AE] py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((d, i) => {
            const key = fmtDateKey(d.date);
            const dayEvents = eventsByDate[key] || [];
            const hasEvents = dayEvents.length > 0;
            const isToday = key === fmtDateKey(today);
            const isSelected = key === selectedDate;
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(isSelected ? null : key)}
                className={`
                  aspect-square flex flex-col items-center justify-center rounded-lg text-sm relative
                  ${!d.inMonth ? 'text-[#B5B5AE]/40' : 'text-[#1F1D3D]'}
                  ${isToday && !isSelected ? 'ring-1 ring-[#1F1D3D] font-semibold' : ''}
                  ${isSelected ? 'bg-[#1F1D3D] text-white font-semibold' : ''}
                  ${!isSelected && d.inMonth ? 'hover:bg-[#F5F5ED]' : ''}
                  ${!isSelected && !d.inMonth ? 'hover:bg-[#F5F5ED]/50' : ''}
                `}
              >
                <span>{d.date.getDate()}</span>
                {hasEvents && !isSelected && (
                  <div className="flex gap-0.5 mt-0.5 absolute bottom-1.5">
                    {dayEvents.slice(0, 3).map((ev, idx) => (
                      <span key={idx} className={`w-1 h-1 rounded-full ${TYPE_STYLES[ev.type].dot}`} />
                    ))}
                  </div>
                )}
                {hasEvents && isSelected && (
                  <div className="flex gap-0.5 mt-0.5 absolute bottom-1.5">
                    {dayEvents.slice(0, 3).map((ev, idx) => (
                      <span key={idx} className="w-1 h-1 rounded-full bg-white" />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-[#EEEEEC]">
          {Object.entries(TYPE_STYLES).map(([type, style]) => (
            <div key={type} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${style.dot}`} />
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#B5B5AE]">{style.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[#EEEEEC] rounded-xl p-5">
        <h3 className="text-sm font-medium text-[#1F1D3D] mb-4">
          {selectedDate ? `${FULL_DAYS[(() => { const d = new Date(selectedDate); return (d.getDay() + 6) % 7; })()]} ${selectedDate}` : 'Próximos eventos'}
        </h3>

        {selectedDate ? (
          selectedEvents.length === 0 ? (
            <p className="text-sm text-[#B5B5AE]">No hay eventos este día.</p>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map((ev, i) => {
                const style = TYPE_STYLES[ev.type];
                const Icon = style.icon;
                return (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${style.bg}`}>
                    <Icon className={`w-4 h-4 mt-0.5 ${style.text}`} />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium uppercase tracking-wider ${style.text}`}>{style.label}</p>
                      <p className="text-sm text-[#1F1D3D] truncate">{ev.clientName || ev.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : upcomingEvents.length === 0 ? (
          <p className="text-sm text-[#B5B5AE]">No hay eventos próximos.</p>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {upcomingEvents.map((ev, i) => {
              const style = TYPE_STYLES[ev.type];
              const Icon = style.icon;
              const d = new Date(ev.date + 'T00:00:00');
              return (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${style.bg}`}>
                  <Icon className={`w-4 h-4 mt-0.5 ${style.text}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs font-medium uppercase tracking-wider ${style.text}`}>{style.label}</p>
                      <p className="text-[10px] text-[#B5B5AE]">{d.getDate()} {MONTHS[d.getMonth()].slice(0, 3)}</p>
                    </div>
                    <p className="text-sm text-[#1F1D3D] truncate">{ev.clientName || ev.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
