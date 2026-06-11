import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { API } from '@/services/api';
import { FiltersState } from './useFilters';

export function useEquiposCount(filters: FiltersState) {
  const { user } = useAuth();
  const [equipos, setEquipos] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (!filters.desde || !filters.hasta) return;
    const fetchEquipos = async () => {
      setLoading(true);
      try {
        const desde = `${filters.desde}T00:00:00`;
        const hasta = `${filters.hasta}T23:59:59.999`;
        const pais = filters.pais || user?.country_code;
        const result = await API.reuniones(desde, hasta, 500, 0, { pais, nombre: filters.asesor || undefined, tipoLead: filters.tipoLead || undefined });
        const list = result?.items || result?.reuniones || (Array.isArray(result) ? result : []);
        let total = 0;
        for (const item of list) {
          const resultado = item.resultado_venta || '';
          const isGanado = resultado === 'cerrada' || resultado === 'ganado';
          if (!isGanado) continue;
          const sfRaw = item.stage_feedback_json || '';
          let sf: any = {};
          if (typeof sfRaw === 'string' && sfRaw.trim()) {
            try { sf = JSON.parse(sfRaw); } catch { sf = {}; }
          } else if (typeof sfRaw === 'object') { sf = sfRaw; }
          const eq6 = sf['6']?.cantidad_equipos || sf[6]?.cantidad_equipos || '';
          if (eq6) {
            const num = parseInt(String(eq6), 10);
            if (!isNaN(num)) total += num;
          }
        }
        setEquipos(total);
      } catch (err) {
        console.error('Error fetching equipos:', err);
        setEquipos(0);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipos();
  }, [filters.desde, filters.hasta, filters.pais, filters.asesor, filters.tipoLead, user?.country_code]);

  return { equipos, loading };
}
