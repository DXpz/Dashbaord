/**
 * Datos demo de la jornada del gestor de cobros.
 *
 * Estructura alineada con el reporte de cuentas por cobrar (CxC):
 * Codigo, Cliente, Estado, Clasificacion, Motivo, rangos de mora (0-30/31-60/61-90/+90), Saldo Total, Fecha Evaluacion.
 */

export type EstadoCliente = 'CLIENTE' | 'PROSPECTO' | 'SUSPENDIDO' | 'BAJA';
export type Clasificacion = 'A' | 'B' | 'C' | 'D';

export interface ClienteJornada {
  codigo: string;
  cliente: string;
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
}

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
      cliente: clientes[i] || `CLIENTE ${codigo}`,
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