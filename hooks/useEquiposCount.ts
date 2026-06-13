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
        const desde = filters.desde;
        const hasta = filters.hasta;
        const pais = filters.pais || user?.country_code;
        const result = await API.reuniones(desde, hasta, 500, 0, { pais, nombre: filters.asesor || undefined, tipoLead: filters.tipoLead || undefined });
        const list = result?.items || result?.reuniones || (Array.isArray(result) ? result : []);
        let total = 0;
        for (const item of list) {
          const stage = item.opportunity_stage;
          const sfRaw = item.stage_feedback_json || '';
          let sf: any = {};
          if (typeof sfRaw === 'string' && sfRaw.trim()) {
            try { sf = JSON.parse(sfRaw); } catch { sf = {}; }
          } else if (typeof sfRaw === 'object') { sf = sfRaw; }
          const isCierre = stage === 6;
          const isGanado = item.status === 'cerrado' && (sf['6']?.resultado_propuesta === 'ganada' || sf[6]?.resultado_propuesta === 'ganada');
          if (!isCierre || !isGanado) continue;
          const eq4 = sf['4']?.cantidad_equipos || sf[4]?.cantidad_equipos || '';
          if (eq4) {
            const num = parseInt(String(eq4), 10);
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
