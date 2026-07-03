/**
 * Punto de entrada unico para todos los clientes API del front.
 *
 * Las paginas pueden importar desde aca:
 *   import { API } from '@/services/api';                 // ProspektIA (compat)
 *   import { API } from '@/services/api/prospektia';     // ProspektIA (recomendado)
 *   import { DataRedAPI } from '@/services/api/datared'; // DataRed
 *   import { CobrosAPI } from '@/services/api/cobros';   // Cobros
 */

export { API } from './prospektia';
export { DataRedAPI } from './datared';
export { CobrosAPI } from './cobros';
export {
  getBase,
  invalidateCache,
  fetchJson,
  paisParam,
  tipoLeadParam,
  origenParam,
  tipoLlamadaParam,
  nombreParam,
  asesorParam,
  normPaisQuery,
} from './core/client';