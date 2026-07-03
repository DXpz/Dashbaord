/**
 * Cobros API Client (stub)
 *
 * Modulo de cobros/facturacion pendiente de disenar.
 * Por ahora solo existe el namespace para que las paginas placeholder
 * puedan importar tipos y clientes sin romperse.
 */

import { get, post, patch, del } from '../core/client';

export const CobrosAPI = {
  // TODO: definir endpoints cuando se disene el modulo
  health: () => get('/cobros/health', {}),

  // Placeholders
  listFacturas: () => get('/cobros/facturas', {}),
  createFactura: (body: any) => post('/cobros/facturas', body),
  updateFactura: (id: string, body: any) => patch(`/cobros/facturas/${encodeURIComponent(id)}`, body),
  deleteFactura: (id: string) => del(`/cobros/facturas/${encodeURIComponent(id)}`),
};