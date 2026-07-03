/**
 * Datos demo de la jornada del gestor de cobros.
 *
 * Estructura alineada con el reporte de cuentas por cobrar (CxC):
 * Codigo, Cliente, Estado, Clasificacion, Motivo, rangos de mora (0-30/31-60/61-90/+90), Saldo Total, Fecha Evaluacion.
 */

export type EstadoCliente = 'CLIENTE' | 'PROSPECTO' | 'SUSPENDIDO' | 'BAJA';
export type Clasificacion = 'A' | 'B' | 'C' | 'D';
export type ResultadoLlamada =
  | 'sin_gestion'
  | 'contactado'
  | 'promesa_pago'
  | 'no_contesta'
  | 'rechazo'
  | 'numero_invalido'
  | 'reagendar';

export interface ClienteJornada {
  codigo: string;
  cliente: string;
  empresa: string;
  estado: EstadoCliente;
  clasificacion: Clasificacion | '';
  motivo: string;
  noVencido: number;
  de0a30: number;
  de31a60: number;
  de61a90: number;
  mas90: number;
  saldoTotal: number;
  fechaEvaluacion: string;
  telefono: string;
  correo: string;
  // Campos de gestion del dia (se llenan al gestionar)
  resultado?: ResultadoLlamada;
  montoPromesa?: number;
  fechaPromesa?: string;
  notas?: string;
  horaGestion?: string;
}

export const RESULTADO_BADGE: Record<ResultadoLlamada, { label: string; bg: string; text: string; dot: string }> = {
  sin_gestion: { label: 'Sin gestion', bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400' },
  contactado: { label: 'Contactado', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  promesa_pago: { label: 'Promesa pago', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  no_contesta: { label: 'No contesta', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  rechazo: { label: 'Rechazo', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  numero_invalido: { label: 'Numero invalido', bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-500' },
  reagendar: { label: 'Reagendar', bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500' },
};

function fmt(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function build(): ClienteJornada[] {
  const base: Array<[string, EstadoCliente, Clasificacion | '', string, [number, number, number, number, number], string, string]> = [
    ['CL003300', 'CLIENTE', '', '', [5112.24, 5112.24, 5112.24, 5112.24, 15336.72], '7777-0001', 'cobros@alcaldia.gob.sv'],
    ['CL002620', 'CLIENTE', '', '', [0, 0, 113, 113, 764.10], '2252-5418', 'finanzas@wnd.com.sv'],
    ['CL003217', 'CLIENTE', '', '', [211.31, 211.31, 0, 0, 0], '7745-9377', 'cobros@seguridadconfianza.com.sv'],
    ['CL001855', 'CLIENTE', 'A', 'BUEN PAGADOR', [0, 1500, 800, 0, 0], '2200-8800', 'cobros@bancoagricola.com'],
    ['CL002910', 'CLIENTE', 'B', 'ATRASO MENOR', [200, 450, 0, 0, 0], '7837-3609', 'cbarrera@dacotrans.com.sv'],
    ['CL002811', 'CLIENTE', 'C', 'COBRO ACTIVO', [0, 0, 1200, 800, 2400], '69282801', 'joel.r@unorent.com.sv'],
    ['CL003405', 'CLIENTE', 'A', '', [0, 600, 0, 0, 0], '2252-5418', 'cobros@bancoagricola.com'],
    ['CL002740', 'CLIENTE', '', '', [0, 0, 0, 320, 0], '78621127', 'reina@wilbot.com.sv'],
    ['CL002199', 'CLIENTE', '', '', [0, 1100, 1100, 1100, 1100], '+502 2345-6789', 'rmendez@bacgt.com.gt'],
    ['CL003044', 'CLIENTE', 'B', 'RENOVACION PENDIENTE', [1100, 0, 0, 0, 0], '+502 2290-9000', 'alopez@tigo.com.gt'],
    ['CL002891', 'CLIENTE', 'A', 'BUEN PAGADOR', [5400, 0, 0, 0, 0], '2290-9000', 'cobros@tigo.com.sv'],
    ['CL002712', 'CLIENTE', '', '', [0, 480, 0, 0, 0], '2200-8800', 'cobros@bancoagricola.com'],
    ['CL003088', 'CLIENTE', 'C', 'COBRO JUDICIAL', [0, 0, 0, 0, 4400], '7777-0001', 'cobros@alcaldia.gob.sv'],
    ['CL003301', 'CLIENTE', '', '', [0, 850, 850, 850, 0], '7745-9377', 'cobros@seguridadconfianza.com.sv'],
    ['CL002661', 'CLIENTE', 'A', '', [1900, 0, 0, 0, 0], '7837-3609', 'cbarrera@dacotrans.com.sv'],
    ['CL002922', 'CLIENTE', 'B', 'ATRASO MENOR', [0, 240, 0, 0, 0], '69282801', 'joel.r@unorent.com.sv'],
    ['CL003066', 'CLIENTE', '', '', [0, 0, 320, 320, 0], '78621127', 'reina@wilbot.com.sv'],
    ['CL002533', 'CLIENTE', 'A', 'BUEN PAGADOR', [6400, 0, 0, 0, 0], '+502 2345-6789', 'rmendez@bacgt.com.gt'],
    ['CL002780', 'CLIENTE', '', '', [0, 320, 0, 0, 0], '+502 2290-9000', 'alopez@tigo.com.gt'],
    ['CL003155', 'CLIENTE', 'B', '', [2100, 0, 0, 0, 0], '2290-9000', 'cobros@tigo.com.sv'],
    ['CL002901', 'CLIENTE', '', '', [0, 0, 200, 200, 1100], '78621127', 'reina@wilbot.com.sv'],
    ['CL002644', 'CLIENTE', 'C', 'COBRO ACTIVO', [950, 0, 0, 0, 0], '7837-3609', 'cbarrera@dacotrans.com.sv'],
    ['CL003200', 'CLIENTE', '', '', [450, 0, 0, 0, 0], '7745-9377', 'cobros@seguridadconfianza.com.sv'],
    ['CL002455', 'CLIENTE', 'A', '', [0, 4800, 0, 0, 0], '2200-8800', 'cobros@bancoagricola.com'],
    ['CL003301b', 'CLIENTE', '', '', [280, 0, 0, 0, 0], '78621127', 'reina@wilbot.com.sv'],
    ['CL002188', 'CLIENTE', 'B', '', [0, 0, 1100, 0, 0], '+502 2290-9000', 'alopez@tigo.com.gt'],
    ['CL002977', 'CLIENTE', '', '', [1100, 0, 0, 0, 0], '2290-9000', 'cobros@tigo.com.sv'],
    ['CL003044b', 'CLIENTE', 'C', 'COBRO ACTIVO', [0, 0, 0, 600, 1800], '7837-3609', 'cbarrera@dacotrans.com.sv'],
    ['CL002509', 'CLIENTE', '', '', [0, 600, 0, 0, 0], '2200-8800', 'cobros@bancoagricola.com'],
    ['CL003122', 'CLIENTE', 'A', 'BUEN PAGADOR', [0, 950, 0, 0, 0], '7745-9377', 'cobros@seguridadconfianza.com.sv'],
    ['CL002833', 'CLIENTE', '', '', [0, 0, 320, 320, 0], '78621127', 'reina@wilbot.com.sv'],
    ['CL002244', 'CLIENTE', 'B', '', [6400, 0, 0, 0, 0], '+502 2345-6789', 'rmendez@bacgt.com.gt'],
    ['CL002677', 'CLIENTE', '', '', [0, 320, 0, 0, 0], '+502 2290-9000', 'alopez@tigo.com.gt'],
    ['CL002922b', 'CLIENTE', 'C', 'COBRO JUDICIAL', [0, 0, 0, 0, 3200], '78621127', 'reina@wilbot.com.sv'],
    ['CL003400', 'CLIENTE', '', '', [950, 0, 0, 0, 0], '7837-3609', 'cbarrera@dacotrans.com.sv'],
    ['CL002488', 'CLIENTE', 'A', '', [450, 0, 0, 0, 0], '7745-9377', 'cobros@seguridadconfianza.com.sv'],
    ['CL003220', 'CLIENTE', '', '', [0, 480, 0, 0, 0], '2200-8800', 'cobros@bancoagricola.com'],
    ['CL002711', 'CLIENTE', 'B', 'ATRASO MENOR', [280, 0, 0, 0, 0], '78621127', 'reina@wilbot.com.sv'],
    ['CL002866', 'CLIENTE', '', '', [0, 0, 1100, 0, 0], '+502 2290-9000', 'alopez@tigo.com.gt'],
    ['CL002544', 'CLIENTE', 'C', 'COBRO ACTIVO', [1100, 0, 0, 0, 0], '2290-9000', 'cobros@tigo.com.sv'],
  ];

  const NOMBRES: string[] = [
    'Maria Rodriguez', 'Jose Martinez', 'Carlos Barrera', 'Joel Rodriguez',
    'Norma Vargas', 'Diego Delgado', 'Eduardo Herrera', 'Roberto Mendez',
    'Ana Lopez', 'Carlos Mendez', 'Reina Vasquez', 'Karla Lopez',
    'Alvaro Mendez', 'Patricia Salinas', 'Luis Cardona', 'Sofia Reyes',
    'Fernando Pinto', 'Gabriela Torres', 'Miguel Salazar', 'Daniela Cruz',
    'Ricardo Pena', 'Valentina Ruiz', 'Andres Molina', 'Camila Vega',
    'Sergio Castillo', 'Isabella Romero', 'Javier Ortega', 'Lucia Conde',
    'Pablo Fuentes', 'Adriana Mejia', 'Tomas Aguilar', 'Ximena Cordero',
    'Manuel Estrada', 'Renata Orellana', 'Hugo Sandoval', 'Elena Maldonado',
    'Victor Palma', 'Natalia Quiroz', 'Oscar Trejo', 'Carla Bonilla',
  ];

  const clientes: string[] = [
    'ALCALDIA MUNICIPAL DE LA LIBERTAD SUR',
    'WND EL SALVADOR, S.A. DE C.V.',
    'SEGURIDAD Y SERVICIOS EXTREMA CONFIANZA, S.A. DE C.V.',
    'BANCO AGRICOLA, S.A.',
    'DACOTRANS, S.A. DE C.V.',
    'UNO RENT A CAR, S.A. DE C.V.',
    'HOLCIM EL SALVADOR, S.A.',
    'IMPRENTA WILBOT',
    'BAC GUATEMALA, S.A.',
    'TIGO GUATEMALA, S.A.',
    'TIGO EL SALVADOR, S.A.',
    'GRUPO BANCO AGRICOLA',
    'ALCALDIA MUNICIPAL',
    'SEGURIDAD Y SERVICIOS EXTREMA',
    'DACOTRANS SUCURSAL',
    'UNO RENT A CAR OFICINAS',
    'IMPRENTA WILBOT ANEXO',
    'BAC GUATEMALA HOLDING',
    'TIGO GUATEMALA COMERCIAL',
    'TIGO EL SALVADOR NEGOCIOS',
    'IMPRENTA WILBOT SERVICIOS',
    'DACOTRANS TRANSPORTE',
    'SEGURIDAD EXTREMA PATRULLAJE',
    'BANCO AGRICOLA AGENCIA',
    'IMPRENTA WILBOT DISENO',
    'TIGO GUATEMALA EMPRESAS',
    'TIGO EL SALVADOR RESIDENCIAL',
    'DACOTRANS LOGISTICA',
    'BANCO AGRICOLA CORPORATIVO',
    'SEGURIDAD EXTREMA MONITOREO',
    'IMPRENTA WILROT DIGITAL',
    'BAC GUATEMALA PREMIUM',
    'TIGO GUATEMALA MOVIL',
    'IMPRENTA WILBOT MAYORISTA',
    'DACOTRANS CARGA',
    'SEGURIDAD EXTREMA TECNOLOGIA',
    'BANCO AGRICOLA DIGITAL',
    'IMPRENTA WILBOT CORPORATIVO',
    'TIGO GUATEMALA CORPORATIVO',
    'TIGO EL SALVADOR MAYORISTA',
  ];

  const today = new Date();
  return base.map((row, i) => {
    const [codigo, estado, clasificacion, motivo, mont, tel, correo] = row;
    const [noVencido, de0a30, de31a60, de61a90, mas90] = mont;
    const saldoTotal = noVencido + de0a30 + de31a60 + de61a90 + mas90;
    const fechaBase = new Date(today);
    fechaBase.setDate(today.getDate() - (i % 7));
    return {
      codigo,
      cliente: NOMBRES[i] || `CONTACTO ${codigo}`,
      empresa: clientes[i] || `EMPRESA ${codigo}`,
      estado,
      clasificacion,
      motivo,
      noVencido,
      de0a30,
      de31a60,
      de61a90,
      mas90,
      saldoTotal,
      fechaEvaluacion: fmt(fechaBase),
      telefono: tel,
      correo,
    };
  });
}

export const CLIENTES_JORNADA: ClienteJornada[] = build();

export const CLASIFICACION_BADGE: Record<Clasificacion, string> = {
  A: 'bg-emerald-50 text-emerald-700',
  B: 'bg-blue-50 text-blue-700',
  C: 'bg-amber-50 text-amber-700',
  D: 'bg-red-50 text-red-700',
};

// -----------------------------------------------------------------------------
// Historial de la jornada ANTERIOR (referencia para el agente).
// Cada entrada es la ultima gestion conocida de un cliente.
// -----------------------------------------------------------------------------

export interface HistorialCliente {
  codigo: string;
  gestor: string;
  fecha: string;
  resultado: ResultadoLlamada;
  montoPrometido?: number;
  comentario: string;
}

export const HISTORIAL_JORNADA_ANTERIOR: HistorialCliente[] = [
  { codigo: 'CL003300', gestor: 'Mirna Dalila Castillo', fecha: '2026-06-29 09:30', resultado: 'contactado', comentario: 'Cliente confirma pago para el viernes. Ofrecer 5% descuento si paga completo.' },
  { codigo: 'CL002620', gestor: 'Mirna Dalila Castillo', fecha: '2026-06-29 10:15', resultado: 'no_contesta', comentario: 'Telefono apagado. Reintentar en horario de oficina.' },
  { codigo: 'CL003217', gestor: 'Mirna Dalila Castillo', fecha: '2026-06-29 11:00', resultado: 'promesa_pago', montoPrometido: 211.31, comentario: 'Promete pagar el monto completo antes del viernes. Anotar en sistema.' },
  { codigo: 'CL001855', gestor: 'Roberto Mendez', fecha: '2026-06-28 14:20', resultado: 'contactado', comentario: 'Buen pagador. Solo necesita recordatorio. Pidio enviar factura por correo.' },
  { codigo: 'CL002910', gestor: 'Roberto Mendez', fecha: '2026-06-28 15:45', resultado: 'promesa_pago', montoPrometido: 650, comentario: 'Cliente paga $650 esta semana y resto el lunes. Muy probable que cumpla.' },
  { codigo: 'CL002811', gestor: 'Mirna Dalila Castillo', fecha: '2026-06-28 16:00', resultado: 'rechazo', comentario: 'Indica que no pagara por disputa contractual. Escalar a juridico.' },
  { codigo: 'CL003405', gestor: 'Roberto Mendez', fecha: '2026-06-27 09:00', resultado: 'contactado', comentario: 'Pago confirmado para el lunes siguiente. Cliente satisfecho con el servicio.' },
  { codigo: 'CL002740', gestor: 'Mirna Dalila Castillo', fecha: '2026-06-27 10:30', resultado: 'no_contesta', comentario: 'No contesta. Intentar despues de las 2pm.' },
  { codigo: 'CL002199', gestor: 'Roberto Mendez', fecha: '2026-06-27 11:45', resultado: 'reagendar', comentario: 'Cliente solicito llamada para el viernes en la manana.' },
  { codigo: 'CL003044', gestor: 'Mirna Dalila Castillo', fecha: '2026-06-26 13:00', resultado: 'promesa_pago', montoPrometido: 1100, comentario: 'Renovacion firmada. Pagos mensuales automaticos a partir del proximo mes.' },
  { codigo: 'CL002891', gestor: 'Roberto Mendez', fecha: '2026-06-26 14:30', resultado: 'contactado', comentario: 'Cliente renueva contrato. Sin problemas de pago.' },
  { codigo: 'CL002712', gestor: 'Mirna Dalila Castillo', fecha: '2026-06-26 16:15', resultado: 'contactado', comentario: 'Pago programado, verificar cumplimiento el viernes.' },
  { codigo: 'CL003088', gestor: 'Roberto Mendez', fecha: '2026-06-25 09:20', resultado: 'rechazo', comentario: 'Caso judicial. No insistir por telefono.' },
  { codigo: 'CL003301', gestor: 'Mirna Dalila Castillo', fecha: '2026-06-25 10:00', resultado: 'promesa_pago', montoPrometido: 850, comentario: 'Pago quincenal. Cliente cumplio el mes anterior.' },
  { codigo: 'CL002661', gestor: 'Roberto Mendez', fecha: '2026-06-25 11:30', resultado: 'contactado', comentario: 'Verificar estado del servicio. Cliente sin quejas.' },
  { codigo: 'CL002922', gestor: 'Mirna Dalila Castillo', fecha: '2026-06-25 14:00', resultado: 'no_contesta', comentario: 'Reintentar por la tarde.' },
  { codigo: 'CL003066', gestor: 'Roberto Mendez', fecha: '2026-06-24 15:20', resultado: 'contactado', comentario: 'Pago recibido en ventanilla. Caso cerrado.' },
  { codigo: 'CL002533', gestor: 'Mirna Dalila Castillo', fecha: '2026-06-24 16:30', resultado: 'contactado', comentario: 'Recordatorio enviado. Paga automaticamente.' },
  { codigo: 'CL002780', gestor: 'Roberto Mendez', fecha: '2026-06-24 09:45', resultado: 'promesa_pago', montoPrometido: 320, comentario: 'Cliente paga solo una parte. Coordinar resto del pago.' },
  { codigo: 'CL003155', gestor: 'Mirna Dalila Castillo', fecha: '2026-06-23 10:00', resultado: 'contactado', comentario: 'Cliente confirma recibo de factura electronica.' },
  { codigo: 'CL002901', gestor: 'Roberto Mendez', fecha: '2026-06-23 11:15', resultado: 'rechazo', comentario: 'Cliente indico que no pagara por error en factura.' },
  { codigo: 'CL002644', gestor: 'Mirna Dalila Castillo', fecha: '2026-06-23 13:45', resultado: 'promesa_pago', montoPrometido: 950, comentario: 'Pago completo fin de semana.' },
  { codigo: 'CL003200', gestor: 'Roberto Mendez', fecha: '2026-06-23 15:00', resultado: 'contactado', comentario: 'Buena disposicion al pago. Verificar el viernes.' },
  { codigo: 'CL002455', gestor: 'Mirna Dalila Castillo', fecha: '2026-06-22 09:30', resultado: 'no_contesta', comentario: 'No contesto el telefono. Reintentar por la manana.' },
  { codigo: 'CL003301b', gestor: 'Roberto Mendez', fecha: '2026-06-22 10:45', resultado: 'no_contesta', comentario: 'Telefono fuera de servicio. Verificar correo.' },
  { codigo: 'CL002188', gestor: 'Mirna Dalila Castillo', fecha: '2026-06-22 12:00', resultado: 'contactado', comentario: 'Cliente paga en mostrador el lunes.' },
  { codigo: 'CL002977', gestor: 'Roberto Mendez', fecha: '2026-06-22 14:15', resultado: 'promesa_pago', montoPrometido: 1100, comentario: 'Pago completo despues de quincena.' },
  { codigo: 'CL002909', gestor: 'Mirna Dalila Castillo', fecha: '2026-06-22 15:30', resultado: 'contactado', comentario: 'Cliente renueva plan anual.' },
  { codigo: 'CL003122', gestor: 'Roberto Mendez', fecha: '2026-06-21 09:00', resultado: 'contactado', comentario: 'Cliente cumplio pago en tiempo. Felicitaciones.' },
  { codigo: 'CL002833', gestor: 'Mirna Dalila Castillo', fecha: '2026-06-21 10:30', resultado: 'no_contesta', comentario: 'No contesto. Reintentar mas tarde.' },
  { codigo: 'CL002244', gestor: 'Roberto Mendez', fecha: '2026-06-21 11:45', resultado: 'contactado', comentario: 'Cliente paga anualmente. Sin problemas.' },
  { codigo: 'CL002677', gestor: 'Mirna Dalila Castillo', fecha: '2026-06-21 13:00', resultado: 'promesa_pago', montoPrometido: 320, comentario: 'Pago fin de semana.' },
  { codigo: 'CL002922b', gestor: 'Roberto Mendez', fecha: '2026-06-20 14:30', resultado: 'rechazo', comentario: 'Cliente renuncio al servicio. Caso cerrado.' },
  { codigo: 'CL003400', gestor: 'Mirna Dalila Castillo', fecha: '2026-06-20 15:45', resultado: 'promesa_pago', montoPrometido: 950, comentario: 'Pago completo fin de semana.' },
  { codigo: 'CL002488', gestor: 'Roberto Mendez', fecha: '2026-06-20 16:30', resultado: 'contactado', comentario: 'Cliente recibio factura.' },
  { codigo: 'CL003220', gestor: 'Mirna Dalila Castillo', fecha: '2026-06-20 09:15', resultado: 'contactado', comentario: 'Buen pagador.' },
  { codigo: 'CL002711', gestor: 'Roberto Mendez', fecha: '2026-06-20 10:30', resultado: 'no_contesta', comentario: 'Reintentar despues.' },
  { codigo: 'CL002866', gestor: 'Mirna Dalila Castillo', fecha: '2026-06-20 11:45', resultado: 'contactado', comentario: 'Cliente confirma pago.' },
  { codigo: 'CL002544', gestor: 'Roberto Mendez', fecha: '2026-06-20 13:15', resultado: 'contactado', comentario: 'Recordatorio enviado.' },
];