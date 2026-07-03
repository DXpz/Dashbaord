/**
 * DataRed API Client (stub)
 *
 * Por ahora las páginas de DataRed usan datos demo hardcodeados.
 * Cuando se cree el backend DataRed, mover los endpoints aquí.
 */

import { get, post, patch, del } from '../core/client';

export const DataRedAPI = {
  // Clientes
  listClientes: () => get('/datared/clientes', {}),
  getCliente: (id: string) => get(`/datared/clientes/${encodeURIComponent(id)}`, {}),
  createCliente: (body: any) => post('/datared/clientes', body),
  updateCliente: (id: string, body: any) => patch(`/datared/clientes/${encodeURIComponent(id)}`, body),
  deleteCliente: (id: string) => del(`/datared/clientes/${encodeURIComponent(id)}`),

  // Reuniones
  listReuniones: (params: Record<string, any> = {}) => get('/datared/reuniones', params),
  createReunion: (body: any) => post('/datared/reuniones', body),
  updateReunion: (id: string, body: any) => patch(`/datared/reuniones/${encodeURIComponent(id)}`, body),
  deleteReunion: (id: string) => del(`/datared/reuniones/${encodeURIComponent(id)}`),

  // Usuarios
  listUsuarios: () => get('/datared/usuarios', {}),
  createUsuario: (body: any) => post('/datared/usuarios', body),
  updateUsuario: (id: string, body: any) => patch(`/datared/usuarios/${encodeURIComponent(id)}`, body),
  deleteUsuario: (id: string) => del(`/datared/usuarios/${encodeURIComponent(id)}`),

  // Resumen / KPIs
  resumen: (params: Record<string, any> = {}) => get('/datared/resumen', params),
};