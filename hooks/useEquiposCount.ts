import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { API } from '@/services/api';
import { FilterState } from './useFilters';

export function useEquiposCount(filters: FilterState) {
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
        const result = await API.reuniones(desde, hasta, 500, 0, { pais, nombre: filters.asesor || undefined });
        const list = result?.items || result?.reuniones || (Array.isArray(result) ? result : []);
        let total = 0;
        for (const item of list) {
          const sfRaw = item.stage_feedback_json || '';
          let sf: any = {};
          if (typeof sfRaw === 'string' && sfRaw.trim()) {
            try { sf = JSON.parse(sfRaw); } catch { sf = {}; }
          } else if (typeof sfRaw === 'object') { sf = sfRaw; }
          const eq = sf.cantidad_equipos;
          if (eq) {
            const num = parseInt(String(eq), 10);
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
  }, [filters.desde, filters.hasta, filters.pais, filters.asesor, user?.country_code]);

  return { equipos, loading };
}