/**
 * Datos demo para el modulo Cobros.
 *
 * Mientras no exista backend real (Fase 7 del refactor),
 * estos arrays hardcodeados alimentan las vistas de /cobros.
 */

export type EstadoFactura =
  | 'pendiente'
  | 'en_revision'
  | 'pago_parcial'
  | 'pagada'
  | 'vencida'
  | 'cancelada';

export type Plan = 'Mensual' | 'Trimestral' | 'Anual' | 'Custom';
export type MetodoPago = 'Transferencia' | 'Tarjeta' | 'Efectivo' | 'Cheque';

export interface Factura {
  id: string;
  numero: string;
  clienteId: string;
  cliente: string;
  empresa: string;
  pais: 'SV' | 'GT';
  plan: Plan;
  servicio: string;
  monto: number;
  montoPagado: number;
  fechaEmision: string;
  fechaVencimiento: string;
  estado: EstadoFactura;
  diasVencidos: number;
  metodoPago?: MetodoPago;
  notas?: string;
}

export const FACTURAS: Factura[] = [
  {
    id: 'F-2026-0142', numero: 'F-2026-0142',
    clienteId: 'CLI-001', cliente: 'Maria Rodriguez', empresa: 'Holcim El Salvador',
    pais: 'SV', plan: 'Anual', servicio: 'Colocacion',
    monto: 4800, montoPagado: 4800,
    fechaEmision: '2026-01-15', fechaVencimiento: '2026-02-15',
    estado: 'pagada', diasVencidos: 0,
    metodoPago: 'Transferencia',
  },
  {
    id: 'F-2026-0156', numero: 'F-2026-0156',
    clienteId: 'CLI-002', cliente: 'Jose Martinez', empresa: 'Banco Agricola',
    pais: 'SV', plan: 'Anual', servicio: 'Servidor Backup',
    monto: 7200, montoPagado: 7200,
    fechaEmision: '2026-02-01', fechaVencimiento: '2026-03-01',
    estado: 'pagada', diasVencidos: 0,
    metodoPago: 'Transferencia',
  },
  {
    id: 'F-2026-0189', numero: 'F-2026-0189',
    clienteId: 'CLI-003', cliente: 'Joel Edgardo Rodriguez', empresa: 'UNO RENT A CAR',
    pais: 'SV', plan: 'Mensual', servicio: 'Colocacion',
    monto: 850, montoPagado: 0,
    fechaEmision: '2026-06-15', fechaVencimiento: '2026-07-15',
    estado: 'pendiente', diasVencidos: 0,
  },
  {
    id: 'F-2026-0190', numero: 'F-2026-0190',
    clienteId: 'CLI-003', cliente: 'Joel Edgardo Rodriguez', empresa: 'UNO RENT A CAR',
    pais: 'SV', plan: 'Mensual', servicio: 'Colocacion',
    monto: 850, montoPagado: 0,
    fechaEmision: '2026-05-15', fechaVencimiento: '2026-06-15',
    estado: 'vencida', diasVencidos: 17,
    notas: 'Cliente indico pago fin de mes. Confirmar telefono.',
  },
  {
    id: 'F-2026-0192', numero: 'F-2026-0192',
    clienteId: 'CLI-004', cliente: 'Norma Vargas', empresa: 'Matus International',
    pais: 'SV', plan: 'Mensual', servicio: 'Servidor Backup',
    monto: 450, montoPagado: 200,
    fechaEmision: '2026-06-01', fechaVencimiento: '2026-07-01',
    estado: 'pago_parcial', diasVencidos: 1,
    notas: 'Pago parcial recibido via transferencia.',
    metodoPago: 'Transferencia',
  },
  {
    id: 'F-2026-0195', numero: 'F-2026-0195',
    clienteId: 'CLI-005', cliente: 'Diego Delgado', empresa: 'Grupo Natura',
    pais: 'SV', plan: 'Trimestral', servicio: 'Colocacion',
    monto: 2100, montoPagado: 2100,
    fechaEmision: '2026-04-01', fechaVencimiento: '2026-07-01',
    estado: 'pagada', diasVencidos: 0,
    metodoPago: 'Tarjeta',
  },
  {
    id: 'F-2026-0201', numero: 'F-2026-0201',
    clienteId: 'CLI-006', cliente: 'Carlos Barrera', empresa: 'Dacotrans',
    pais: 'SV', plan: 'Mensual', servicio: 'Colocacion',
    monto: 950, montoPagado: 0,
    fechaEmision: '2026-05-20', fechaVencimiento: '2026-06-20',
    estado: 'vencida', diasVencidos: 12,
    notas: 'Coordinar visita del agente.',
  },
  {
    id: 'F-2026-0203', numero: 'F-2026-0203',
    clienteId: 'CLI-007', cliente: 'Eduardo Herrera', empresa: 'Aeromantenimiento',
    pais: 'SV', plan: 'Mensual', servicio: 'Fibra',
    monto: 320, montoPagado: 0,
    fechaEmision: '2026-07-01', fechaVencimiento: '2026-08-01',
    estado: 'pendiente', diasVencidos: 0,
  },
  {
    id: 'F-2026-0205', numero: 'F-2026-0205',
    clienteId: 'CLI-008', cliente: 'Roberto Mendez', empresa: 'BAC Guatemala',
    pais: 'GT', plan: 'Anual', servicio: 'Servidor Backup',
    monto: 6400, montoPagado: 3200,
    fechaEmision: '2026-05-10', fechaVencimiento: '2026-06-10',
    estado: 'pago_parcial', diasVencidos: 22,
    notas: 'Pago parcial en 2 cuotas. Segunda esperada esta semana.',
    metodoPago: 'Transferencia',
  },
  {
    id: 'F-2026-0208', numero: 'F-2026-0208',
    clienteId: 'CLI-009', cliente: 'Ana Lopez', empresa: 'Tigo Guatemala',
    pais: 'GT', plan: 'Mensual', servicio: 'Colocacion',
    monto: 1100, montoPagado: 0,
    fechaEmision: '2026-06-25', fechaVencimiento: '2026-07-25',
    estado: 'en_revision', diasVencidos: 0,
    notas: 'Pendiente firma de renovacion.',
  },
  {
    id: 'F-2026-0210', numero: 'F-2026-0210',
    clienteId: 'CLI-010', cliente: 'Carlos Mendez', empresa: 'Tigo El Salvador',
    pais: 'SV', plan: 'Anual', servicio: 'Colocacion',
    monto: 5400, montoPagado: 5400,
    fechaEmision: '2026-06-20', fechaVencimiento: '2026-06-20',
    estado: 'pagada', diasVencidos: 0,
    metodoPago: 'Transferencia',
  },
  {
    id: 'F-2026-0212', numero: 'F-2026-0212',
    clienteId: 'CLI-002', cliente: 'Jose Martinez', empresa: 'Banco Agricola',
    pais: 'SV', plan: 'Mensual', servicio: 'Servidor Backup',
    monto: 600, montoPagado: 600,
    fechaEmision: '2026-07-01', fechaVencimiento: '2026-08-01',
    estado: 'pagada', diasVencidos: 0,
    metodoPago: 'Transferencia',
  },
  {
    id: 'F-2026-0214', numero: 'F-2026-0214',
    clienteId: 'CLI-004', cliente: 'Norma Vargas', empresa: 'Matus International',
    pais: 'SV', plan: 'Mensual', servicio: 'Servidor Backup',
    monto: 450, montoPagado: 0,
    fechaEmision: '2026-07-01', fechaVencimiento: '2026-08-01',
    estado: 'pendiente', diasVencidos: 0,
  },
  {
    id: 'F-2026-0216', numero: 'F-2026-0216',
    clienteId: 'CLI-011', cliente: 'Reina de Vasquez', empresa: 'Imprenta Wilbot',
    pais: 'SV', plan: 'Mensual', servicio: 'Servidor Backup',
    monto: 280, montoPagado: 0,
    fechaEmision: '2026-05-10', fechaVencimiento: '2026-06-10',
    estado: 'vencida', diasVencidos: 22,
  },
];

export const ESTADO_FACTURA_BADGE: Record<EstadoFactura, { label: string; bg: string; text: string; dot: string }> = {
  pendiente: { label: 'Pendiente', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  en_revision: { label: 'En revisión', bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500' },
  pago_parcial: { label: 'Pago parcial', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  pagada: { label: 'Pagada', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  vencida: { label: 'Vencida', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  cancelada: { label: 'Cancelada', bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400' },
};

export interface ClienteDeudor {
  clienteId: string;
  cliente: string;
  empresa: string;
  pais: 'SV' | 'GT';
  telefono: string;
  correo: string;
  facturasPendientes: number;
  facturasVencidas: number;
  totalAdeudado: number;
  diasPromedioMora: number;
}

export const CLIENTES_DEUDORES: ClienteDeudor[] = [
  {
    clienteId: 'CLI-006', cliente: 'Carlos Barrera', empresa: 'Dacotrans',
    pais: 'SV', telefono: '7837-3609', correo: 'cbarrera@dacotrans.com.sv',
    facturasPendientes: 1, facturasVencidas: 1, totalAdeudado: 950, diasPromedioMora: 12,
  },
  {
    clienteId: 'CLI-003', cliente: 'Joel Edgardo Rodriguez', empresa: 'UNO RENT A CAR',
    pais: 'SV', telefono: '69282801', correo: 'joel.r@unorent.com.sv',
    facturasPendientes: 1, facturasVencidas: 1, totalAdeudado: 1700, diasPromedioMora: 17,
  },
  {
    clienteId: 'CLI-008', cliente: 'Roberto Mendez', empresa: 'BAC Guatemala',
    pais: 'GT', telefono: '+502 2345-6789', correo: 'rmendez@bacgt.com.gt',
    facturasPendientes: 0, facturasVencidas: 1, totalAdeudado: 3200, diasPromedioMora: 22,
  },
  {
    clienteId: 'CLI-011', cliente: 'Reina de Vasquez', empresa: 'Imprenta Wilbot',
    pais: 'SV', telefono: '78621127', correo: 'reina@wilbot.com.sv',
    facturasPendientes: 0, facturasVencidas: 1, totalAdeudado: 280, diasPromedioMora: 22,
  },
  {
    clienteId: 'CLI-004', cliente: 'Norma Vargas', empresa: 'Matus International',
    pais: 'SV', telefono: '7745 9377', correo: 'norma@matusint.com.sv',
    facturasPendientes: 1, facturasVencidas: 0, totalAdeudado: 250, diasPromedioMora: 1,
  },
  {
    clienteId: 'CLI-009', cliente: 'Ana Lopez', empresa: 'Tigo Guatemala',
    pais: 'GT', telefono: '+502 2290-9000', correo: 'alopez@tigo.com.gt',
    facturasPendientes: 1, facturasVencidas: 0, totalAdeudado: 1100, diasPromedioMora: 0,
  },
];