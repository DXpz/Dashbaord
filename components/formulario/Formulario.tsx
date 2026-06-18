'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Check, Loader2, Lock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { useNotification } from '@/components/ui/notification';

export type FormStage = 'REUNION' | 'DEMO' | 'PROPUESTA' | 'SEGUIMIENTO' | 'CIERRE';

export const STAGE_ORDER: FormStage[] = ['REUNION', 'DEMO', 'PROPUESTA', 'SEGUIMIENTO', 'CIERRE'];

export type FieldType = 'text' | 'textarea' | 'select' | 'date' | 'number';

export interface StageField {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
}

interface StageConfig {
  id: FormStage;
  label: string;
  color: string;
  fields: StageField[];
  stageNumber: number;
  endpoint: string;
  method: 'PATCH' | 'PUT';
}

const REUNION_FIELDS: StageField[] = [
  { id: 'industria_sector', label: 'Industria / Sector', type: 'select', required: true, options: [
    { value: '', label: 'Seleccionar…' },
    { value: 'logistica_transporte', label: 'Logística o transporte' },
    { value: 'industria', label: 'Industria' },
    { value: 'construccion', label: 'Construcción' },
    { value: 'turismo_hoteleria', label: 'Turismo u hoteles' },
    { value: 'seguridad_privada', label: 'Seguridad privada' },
    { value: 'gobierno', label: 'Gobierno' },
    { value: 'otro', label: 'Otro' },
  ]},
  { id: 'tipo_reunion', label: 'Tipo de Reunión', type: 'select', required: true, options: [
    { value: '', label: 'Seleccionar…' },
    { value: 'Llamada Virtual', label: 'Llamada Virtual' },
    { value: 'Reunion Presencial', label: 'Reunión Presencial' },
    { value: 'Llamada Telefonica', label: 'Llamada Telefónica' },
  ]},
  { id: 'interes_producto', label: 'Interés en el producto', type: 'select', required: true, options: [
    { value: '', label: 'Seleccionar…' },
    { value: 'si', label: 'Sí' },
    { value: 'no', label: 'No' },
    { value: 'evaluando', label: 'Lo evalúa' },
  ]},
  { id: 'productos_ofrecidos', label: 'Productos Ofrecidos', type: 'textarea', required: true, placeholder: 'Describe los equipos y servicios ofrecidos' },
  { id: 'requiere_demo', label: '¿Requiere Demo?', type: 'select', required: true, options: [
    { value: '', label: 'Seleccionar…' },
    { value: 'si', label: 'Sí' },
    { value: 'no', label: 'No' },
  ]},
  { id: 'fecha_reunion', label: 'Fecha de Reunión', type: 'date', required: true },
  { id: 'retroalimentacion', label: 'Retroalimentación', type: 'textarea', required: true, placeholder: 'Observaciones y comentarios de la reunión' },
  { id: 'notes', label: 'Notas', type: 'textarea', required: false, placeholder: 'Notas adicionales' },
];

const DEMO_FIELDS: StageField[] = [
  { id: 'fecha_demo', label: 'Fecha de Demo', type: 'date', required: true },
  { id: 'cobertura_demo', label: 'Cobertura Demo', type: 'select', required: true, options: [
    { value: '', label: 'Seleccionar…' },
    { value: 'nacional', label: 'Nacional' },
    { value: 'mayor_3km', label: 'Mayor a 3 km' },
    { value: 'local', label: 'Local (urbana)' },
  ]},
  { id: 'servicio_demo', label: 'Servicio en Demo', type: 'select', required: true, options: [
    { value: '', label: 'Seleccionar…' },
    { value: 'voz', label: 'Solo voz' },
    { value: 'voz_gps', label: 'Voz + GPS' },
    { value: 'voz_gps_tareas', label: 'Voz + GPS + Tareas' },
    { value: 'voz_gps_tareas_video', label: 'Voz + GPS + Tareas + Video' },
    { value: 'full', label: 'Full (todo)' },
  ]},
  { id: 'uso_equipos_demo', label: '¿El cliente usó los equipos?', type: 'select', required: true, options: [
    { value: '', label: 'Seleccionar…' },
    { value: 'si', label: 'Sí' },
    { value: 'no', label: 'No' },
    { value: 'parcial', label: 'Parcialmente' },
  ]},
  { id: 'pruebas_cobertura', label: '¿Probaron cobertura?', type: 'select', required: true, options: [
    { value: '', label: 'Seleccionar…' },
    { value: 'si', label: 'Sí' },
    { value: 'no', label: 'No' },
  ]},
  { id: 'retroalimentacion', label: 'Retroalimentación', type: 'textarea', required: true, placeholder: 'Observaciones y comentarios de la demo' },
  { id: 'notes', label: 'Notas', type: 'textarea', required: false, placeholder: 'Notas adicionales' },
];

const PROPUESTA_FIELDS: StageField[] = [
  { id: 'productos_propuestos', label: 'Productos Propuestos', type: 'textarea', required: true, placeholder: 'Describe la oferta propuesta' },
  { id: 'modelo_equipo_propuesto', label: 'Modelo de Equipo', type: 'select', required: true, options: [
    { value: '', label: 'Seleccionar…' },
    { value: 'TSP4-V1 4G SC', label: 'TSP4-V1 4G SC' },
    { value: 'TCP-7 4G SC', label: 'TCP-7 4G SC' },
    { value: 'FMT-1000 V2 NFC 4G', label: 'FMT-1000 V2 NFC 4G' },
    { value: 'FMT-1000 V1 4G SC', label: 'FMT-1000 V1 4G SC' },
    { value: 'TCR-200 4G SC', label: 'TCR-200 4G SC' },
    { value: 'TAC-3 10W SC', label: 'TAC-3 10W SC' },
    { value: 'TAC-7 SC', label: 'TAC-7 SC' },
    { value: 'TCR-300 45W', label: 'TCR-300 45W' },
    { value: 'TSP2-V1 3G SC', label: 'TSP2-V1 3G SC' },
    { value: 'FMT-1001 4G SC', label: 'FMT-1001 4G SC' },
    { value: 'FMT-2007 NFC 4G', label: 'FMT-2007 NFC 4G' },
    { value: 'GPS Lynux', label: 'GPS Lynux' },
    { value: 'GPS Antares', label: 'GPS Antares' },
    { value: 'GPS y Fleetomizer', label: 'GPS y Fleetomizer' },
    { value: 'mixto', label: 'Mixto' },
    { value: 'por_definir', label: 'Por definir' },
  ]},
  { id: 'cantidad_equipos', label: 'Cantidad de Equipos', type: 'number', required: true, placeholder: '0' },
  { id: 'plan_contrato_meses', label: 'Plan / Contrato (meses)', type: 'select', required: true, options: [
    { value: '', label: 'Seleccionar…' },
    { value: '12', label: '12 meses' },
    { value: '18', label: '18 meses' },
    { value: '24', label: '24 meses' },
    { value: '34', label: '34 meses' },
    { value: 'otro', label: 'Otro' },
  ]},
  { id: 'fecha_envio', label: 'Fecha de Envío', type: 'date', required: true },
  { id: 'medio_envio', label: 'Medio de Envío', type: 'select', required: true, options: [
    { value: '', label: 'Seleccionar…' },
    { value: 'correo', label: 'Correo electrónico' },
    { value: 'presencial', label: 'Presencial' },
    { value: 'portal', label: 'Portal / plataforma' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'otro', label: 'Otro' },
  ]},
  { id: 'retroalimentacion', label: 'Retroalimentación', type: 'textarea', required: true, placeholder: 'Observaciones y comentarios de la propuesta' },
  { id: 'notes', label: 'Notas', type: 'textarea', required: false, placeholder: 'Notas adicionales' },
];

const SEGUIMIENTO_FIELDS: StageField[] = [
  { id: 'fecha_seguimiento', label: 'Fecha de Seguimiento', type: 'date', required: true },
  { id: 'medio_seguimiento', label: 'Medio de Seguimiento', type: 'select', required: true, options: [
    { value: '', label: 'Seleccionar…' },
    { value: 'llamada', label: 'Llamada' },
    { value: 'correo', label: 'Correo' },
    { value: 'visita', label: 'Visita' },
    { value: 'whatsapp', label: 'WhatsApp' },
  ]},
  { id: 'respuesta_cliente', label: 'Respuesta del Cliente', type: 'select', required: true, options: [
    { value: '', label: 'Seleccionar…' },
    { value: 'positiva', label: 'Bien / positivo' },
    { value: 'neutral', label: 'Neutral' },
    { value: 'negativa', label: 'Mal / negativo' },
    { value: 'sin_respuesta', label: 'No respondió' },
  ]},
  { id: 'nivel_avance', label: 'Nivel de Avance', type: 'select', required: true, options: [
    { value: '', label: 'Seleccionar…' },
    { value: 'muy_cerca', label: 'Muy cerca' },
    { value: 'en_negociacion', label: 'En negociación' },
    { value: 'estancado', label: 'Parado' },
    { value: 'en_riesgo', label: 'En riesgo' },
  ]},
  { id: 'proximo_paso', label: 'Próximo Paso', type: 'textarea', required: true, placeholder: 'Describe el siguiente paso' },
  { id: 'retroalimentacion', label: 'Retroalimentación', type: 'textarea', required: true, placeholder: 'Observaciones y comentarios del seguimiento' },
  { id: 'notes', label: 'Notas', type: 'textarea', required: false, placeholder: 'Notas adicionales' },
];

const CIERRE_FIELDS: StageField[] = [
  { id: 'resultado_cierre', label: 'Resultado del Cierre', type: 'select', required: true, options: [
    { value: '', label: 'Seleccionar…' },
    { value: 'ganado', label: 'Ganado' },
    { value: 'perdido', label: 'Perdido' },
    { value: 'en_pausa', label: 'En pausa' },
  ]},
  { id: 'fecha_cierre_real', label: 'Fecha de Cierre', type: 'date', required: true },
  { id: 'retroalimentacion', label: 'Retroalimentación / Razón', type: 'textarea', required: true, placeholder: 'Razón del cierre o comentarios finales' },
];

function buildStages(requiresDemo: boolean): StageConfig[] {
  const stages: StageConfig[] = [
    { id: 'REUNION', label: 'Reunión', color: '#1F1D3D', stageNumber: 2, endpoint: '/retroalimentacion', method: 'PATCH', fields: REUNION_FIELDS },
  ];
  if (requiresDemo) {
    stages.push({ id: 'DEMO', label: 'Demo', color: '#35325B', stageNumber: 3, endpoint: '/retroalimentacion', method: 'PATCH', fields: DEMO_FIELDS });
  }
  stages.push(
    { id: 'PROPUESTA', label: 'Propuesta', color: '#B5B5AE', stageNumber: 4, endpoint: '/propuesta', method: 'PUT', fields: PROPUESTA_FIELDS },
    { id: 'SEGUIMIENTO', label: 'Seguimiento', color: '#1F1D3D', stageNumber: 5, endpoint: '/seguimiento', method: 'PUT', fields: SEGUIMIENTO_FIELDS },
    { id: 'CIERRE', label: 'Cierre', color: '#35325B', stageNumber: 6, endpoint: '/cierre', method: 'PUT', fields: CIERRE_FIELDS },
  );
  return stages;
}

function FieldInput({ field, value, onChange, readOnly = false }: {
  field: StageField;
  value: string;
  onChange: (id: string, val: string) => void;
  readOnly?: boolean;
}) {
  const id = `field-${field.id}`;
  const required = readOnly ? false : field.required;
  const baseClass = 'w-full px-3 py-2 bg-[#F5F5ED] border border-[#EEEEEC] rounded-lg text-sm text-[#1F1D3D] placeholder-[#B5B5AE] focus:outline-none focus:border-[#35325B] transition-colors';

  switch (field.type) {
    case 'select':
      return (
        <select id={id} value={value} onChange={(e) => onChange(field.id, e.target.value)} disabled={readOnly} required={required} className={baseClass}>
          {(field.options || []).map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
    case 'textarea':
      if (field.id === 'retroalimentacion') {
        const charsSinEspacios = (value || '').replace(/\s+/g, '').length;
        const cumpleMin = charsSinEspacios >= 35;
        return (
          <div className="space-y-1">
            <textarea
              id={id}
              value={value}
              onChange={(e) => onChange(field.id, e.target.value)}
              readOnly={readOnly}
              required={required}
              placeholder={field.placeholder}
              rows={3}
              minLength={35}
              className={cn(baseClass, 'resize-y min-h-[5rem]')}
            />
            <p className={cn('text-[10px] text-right', cumpleMin ? 'text-emerald-600' : 'text-[#c8151b]')}>
              {charsSinEspacios} / 35 caracteres (sin espacios) {cumpleMin ? '✓' : '— mínimo 35'}
            </p>
          </div>
        );
      }
      return (
        <textarea id={id} value={value} onChange={(e) => onChange(field.id, e.target.value)} readOnly={readOnly} required={required} placeholder={field.placeholder} rows={3} className={cn(baseClass, 'resize-y min-h-[5rem]')} />
      );
    case 'number':
      return (
        <input id={id} type="number" step="any" min="0" value={value} onChange={(e) => onChange(field.id, e.target.value)} readOnly={readOnly} required={required} placeholder={field.placeholder} className={baseClass} />
      );
    case 'date':
      return (
        <input id={id} type="date" value={value} onChange={(e) => onChange(field.id, e.target.value)} readOnly={readOnly} required={required} className={cn(baseClass, 'bg-white')} />
      );
    default:
      return (
        <input id={id} type="text" value={value} onChange={(e) => onChange(field.id, e.target.value)} readOnly={readOnly} required={required} placeholder={field.placeholder} className={baseClass} />
      );
  }
}

interface FormularioProps {
  clientId: string;
  initialStage?: FormStage;
  onClose?: () => void;
  readOnly?: boolean;
  vendorReadOnlyBanner?: boolean;
}

interface LoadedData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  sellerName: string;
  oportunidadId: string;
  etapaActual: number;
  stageFeedback: Record<string, any>;
  history: any[];
}

export function Formulario({ clientId, initialStage = 'REUNION', onClose, readOnly = false, vendorReadOnlyBanner = false }: FormularioProps) {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const enforceStageValidation = user?.role === 'advisor';
  const [requiresDemo, setRequiresDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedData, setLoadedData] = useState<LoadedData | null>(null);
  const [stages, setStages] = useState<StageConfig[]>(buildStages(false));
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [showLostDialog, setShowLostDialog] = useState(false);
  const [lostReason, setLostReason] = useState('');
  const [lostDescription, setLostDescription] = useState('');
  const [isClosed, setIsClosed] = useState(false);
  const [leadStatus, setLeadStatus] = useState<'ganado' | 'perdido' | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
        const base = isHttps ? '/api/proxy?endpoint=' : 'http://200.35.189.139/api/';
        const key = process.env.API_KEY || '';

        const headers = {
          'X-API-KEY': key,
          'ngrok-skip-browser-warning': 'true',
          ...(isHttps ? {} : { 'Authorization': `Bearer ${''}` }),
        };

        const fetchUrl = (path: string) => {
          if (isHttps) {
            return fetch(`/api/proxy?endpoint=${encodeURIComponent(path)}`, { credentials: 'include' });
          }
          return fetch(`${base}${path}`, { headers });
        };

        const [stagesRes, auditRes] = await Promise.all([
          fetchUrl('/opportunity-stages'),
          fetchUrl(`/audit/by-client/${encodeURIComponent(clientId)}`),
        ]);

        const stagesData = stagesRes.ok ? await stagesRes.json() : {};
        const rawAuditData = auditRes.ok ? await auditRes.json() : {};
        const auditData = rawAuditData.audit || rawAuditData || {};

        console.log('[Formulario] stages data:', JSON.stringify(stagesData).substring(0, 500));
        console.log('[Formulario] audit data:', JSON.stringify(auditData).substring(0, 500));

        const clientName = auditData?.client_name || '';
        const clientEmail = auditData?.client_email || '';
        const clientPhone = auditData?.client_phone || '';
        const sellerName = auditData?.advisor_name || '';
        const oportunidadId = auditData?.client_id || '';
        const etapaActual = auditData?.opportunity_stage || 2;
        const resultadoVenta = auditData?.resultado_venta || '';
        const isLeadClosed = resultadoVenta === 'cerrada' || resultadoVenta === 'perdida' || etapaActual === 6;
        const stageFeedback = auditData?.stage_feedback_json || {};
        const propuestaJson = auditData?.propuesta_json || {};
        const seguimientoJson = auditData?.seguimiento_json || {};
        const cierreJson = auditData?.cierre_json || {};

        const stage6Data = stageFeedback['6'] || stageFeedback[6] || cierreJson || {};
        const cierreResultado = String(stage6Data?.resultado_cierre || '').toLowerCase();
        const leadStatus: 'ganado' | 'perdido' | null =
          cierreResultado === 'ganado' ? 'ganado' :
          cierreResultado === 'perdido' || cierreResultado === 'perdida' ? 'perdido' :
          null;

        console.log('[Formulario] stageFeedback keys:', Object.keys(stageFeedback));
        console.log('[Formulario] seguimiento_json:', JSON.stringify(seguimientoJson));

        let demoRequired = false;
        const stage2Data = stageFeedback['2'] || stageFeedback[2];
        if (stage2Data?.requiere_demo === 'si') {
          demoRequired = true;
        }
        setRequiresDemo(demoRequired);

        const newStages = buildStages(demoRequired);
        setStages(newStages);

        const initIdx = newStages.findIndex(s => s.id === initialStage);
        setCurrentStageIndex(initIdx >= 0 ? initIdx : 0);

        const mergedStageData: Record<number, Record<string, string>> = {};
        Object.entries(stageFeedback).forEach(([stageKey, fields]) => {
          if (fields && typeof fields === 'object') {
            if (!isNaN(Number(stageKey))) {
              mergedStageData[Number(stageKey)] = fields as Record<string, string>;
            }
          }
        });

        if (Object.keys(seguimientoJson).length > 0) {
          mergedStageData[5] = { ...mergedStageData[5], ...seguimientoJson };
        }

        if (Object.keys(cierreJson).length > 0) {
          mergedStageData[6] = { ...mergedStageData[6], ...cierreJson };
        }

        if (Object.keys(propuestaJson).length > 0 && !mergedStageData[4]) {
          mergedStageData[4] = propuestaJson;
        } else if (Object.keys(propuestaJson).length > 0) {
          mergedStageData[4] = { ...mergedStageData[4], ...propuestaJson };
        }

        console.log('[Formulario] mergedStageData:', JSON.stringify(mergedStageData));
        setStageData(mergedStageData);

        setLoadedData({
          clientName,
          clientEmail,
          clientPhone,
          sellerName,
          oportunidadId,
          etapaActual,
          stageFeedback,
          history: [],
        });
        setIsClosed(isLeadClosed);
        setLeadStatus(leadStatus);
      } catch (err) {
        console.error('Error loading lead data:', err);
        setError('No se pudo cargar los datos del lead');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [clientId, initialStage]);

  const [stageData, setStageData] = useState<Record<number, Record<string, string | boolean>>>({});
  const [isDirty, setIsDirty] = useState(false);

  const getFieldValue = (fieldId: string) => String(currentData[fieldId] || '');

  const isFieldEmpty = (field: StageField, value: string) => {
    if (field.type === 'select' || field.type === 'date' || field.type === 'number') return !String(value || '').trim();
    return !String(value || '').trim();
  };

  const validateStage = (stageIndex: number) => {
    if (!enforceStageValidation) return { valid: true, firstMissing: '' };
    const stage = stages[stageIndex];
    if (!stage) return { valid: true, firstMissing: '' };

    const data = stageData[stage.stageNumber] || {};

    const missing = stage.fields.find((field) => {
      if (!field.required) return false;
      return isFieldEmpty(field, String(data[field.id] || ''));
    });

    if (missing) return { valid: false, firstMissing: missing.label };

    if (stage.id === 'REUNION' && String(data.industria_sector || '') === 'otro' && !String(data.industria_otro || '').trim()) {
      return { valid: false, firstMissing: 'Especificar Industria' };
    }

    // La retroalimentacion debe tener al menos 35 caracteres sin contar espacios
    // para evitar que los vendedores la salten con solo "-"
    const retroField = stage.fields.find((f) => f.id === 'retroalimentacion');
    if (retroField && retroField.required) {
      const texto = String(data.retroalimentacion || '').trim();
      const charsSinEspacios = texto.replace(/\s+/g, '').length;
      if (charsSinEspacios < 35) {
        return {
          valid: false,
          firstMissing: `La retroalimentación debe tener al menos 35 caracteres (actual: ${charsSinEspacios})`,
        };
      }
    }

    return { valid: true, firstMissing: '' };
  };

  const handleStageChange = async (nextIndex: number) => {
    if (nextIndex === currentStageIndex) return;

    if (enforceStageValidation && nextIndex > currentStageIndex) {
      const currentValidation = validateStage(currentStageIndex);
      if (!currentValidation.valid) {
        setValidationError('Completa todos los campos obligatorios antes de continuar.');
        return;
      }

      for (let i = 0; i < nextIndex; i += 1) {
        const stepValidation = validateStage(i);
        if (!stepValidation.valid) {
          setValidationError('Completa todos los campos obligatorios antes de continuar.');
          setCurrentStageIndex(i);
          return;
        }
      }

      if (isDirty) {
        const saved = await handleSave(false);
        if (!saved) return;
      }
    }

    setValidationError(null);
    setCurrentStageIndex(nextIndex);
  };

  const handleChange = (fieldId: string, value: string) => {
    if (readOnly) return;
    setValidationError(null);
    setIsDirty(true);
    const stageNum = stages[currentStageIndex]?.stageNumber;
    setStageData(prev => ({
      ...prev,
      [stageNum]: { ...prev[stageNum], [fieldId]: value },
    }));

    if (fieldId === 'requiere_demo') {
      setRequiresDemo(value === 'si');
      const newStages = buildStages(value === 'si');
      setStages(newStages);
      const newIdx = newStages.findIndex(s => s.id === stages[currentStageIndex]?.id);
      setCurrentStageIndex(newIdx >= 0 ? newIdx : 0);
    }
  };

  const handleSave = async (showToast = true) => {
    if (readOnly) return;
    const validation = validateStage(currentStageIndex);
    if (!validation.valid) {
      setValidationError('Completa todos los campos obligatorios antes de guardar.');
      return false;
    }

    setSaving(true);
    setError(null);
    try {
      const current = stages[currentStageIndex];
      const data = stageData[current.stageNumber] || {};
      const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
      const base = isHttps ? '/api/proxy?endpoint=' : 'http://200.35.189.139/api/';
      const key = process.env.API_KEY || '';

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-API-KEY': key,
      };

      let url: string;
      let body: Record<string, any> = {};

      if (current.id === 'REUNION' || current.id === 'DEMO') {
        url = isHttps
          ? `/api/proxy?endpoint=${encodeURIComponent(`/audit/client/${clientId}/retroalimentacion`)}`
          : `${base}audit/client/${clientId}/retroalimentacion`;
        body = {
          stage: current.stageNumber,
          retroalimentacion: data.retroalimentacion || '',
          notes: data.notes || '',
          client_name: loadedData?.clientName || '',
          client_phone: loadedData?.clientPhone || '',
          client_email: loadedData?.clientEmail || '',
          stage_feedback_json: { [current.stageNumber]: data },
        };
        if (data.cierre_estimado) {
          body.cierre_estimado = data.cierre_estimado;
        }
      } else if (current.id === 'PROPUESTA') {
        url = isHttps
          ? `/api/proxy?endpoint=${encodeURIComponent(`/audit/client/${clientId}/propuesta`)}`
          : `${base}audit/client/${clientId}/propuesta`;
        body = {
          resumen_general: data.resumen_general || '',
          tipo_propuesta: data.tipo_propuesta || '',
          equipos: data.equipos || '',
          rubro: data.rubro || '',
          cantidad_oferta: data.cantidad_oferta || '',
          stage_feedback_json: { [`${current.stageNumber}`]: data },
        };
      } else if (current.id === 'SEGUIMIENTO') {
        url = isHttps
          ? `/api/proxy?endpoint=${encodeURIComponent(`/audit/client/${clientId}/seguimiento`)}`
          : `${base}audit/client/${clientId}/seguimiento`;

        body = {
          resumen_general: data.resumen_general || '',
          resultado_venta: 'en_seguimiento',
          cliente_ha_negociado: data.cliente_ha_negociado == 'si' || data.cliente_ha_negociado == true,
          stage_feedback_json: { [`${current.stageNumber}`]: data },
        };
      } else if (current.id === 'CIERRE') {
        url = isHttps
          ? `/api/proxy?endpoint=${encodeURIComponent(`/audit/client/${clientId}/cierre`)}`
          : `${base}audit/client/${clientId}/cierre`;

        const resultadoCierre = data.resultado_cierre || '';
        const cierreData: Record<string, any> = {
          resultado_cierre: resultadoCierre,
          fecha_cierre_real: data.fecha_cierre_real || '',
        };
        if (data.retroalimentacion) {
          cierreData.retroalimentacion = data.retroalimentacion;
        }

        body = {
          stage_feedback_json: { [`${current.stageNumber}`]: cierreData },
        };

        if (resultadoCierre === 'ganado') {
          body.resultado_venta = 'cerrada';
          body.resultado_propuesta = 'ganada';
          body.cliente_ha_negociado = true;
        } else if (resultadoCierre === 'perdido') {
          body.resultado_venta = 'perdida';
          body.resultado_propuesta = 'perdida';
          body.cliente_ha_negociado = false;
        }
      } else {
        throw new Error('Etapa no reconocida');
      }

      const res = await fetch(url, {
        method: current.method,
        headers,
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (res.ok) {
        if (showToast) showSuccess('Feedback guardado correctamente');
        setIsDirty(false);
        return true;
      } else {
        const errorData = await res.json().catch(() => ({}));
        showError(errorData?.detail || 'Error al guardar');
        return false;
      }
    } catch (err) {
      console.error('Error saving:', err);
      showError('Error al guardar. Intenta de nuevo.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleCloseAsLost = async () => {
    if (readOnly) return;
    if (!lostReason.trim() || !lostDescription.trim()) {
      showError('Selecciona un motivo y escribe una descripción');
      return;
    }

    setClosing(true);
    try {
      const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
      const base = isHttps ? '/api/proxy?endpoint=' : 'http://200.35.189.139/api/';
      const key = process.env.API_KEY || '';
      const current = stages[currentStageIndex];
      const data = stageData[current.stageNumber] || {};

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-API-KEY': key,
      };

      const motivoCompleto = `${lostReason}: ${lostDescription}`;
      const body = {
        resultado_venta: 'perdida',
        resultado_propuesta: 'perdida',
        motivo_perdida: motivoCompleto,
        resumen_general: motivoCompleto,
        cliente_interesado: false,
        cliente_ha_negociado: false,
        stage_feedback_json: {
          [`${current.stageNumber}`]: {
            resultado_cierre: 'perdido',
            razon_cierre: motivoCompleto,
            contacto_exitoso: 'false',
            motivo_no_contacto: lostReason,
            descripcion_no_contacto: lostDescription,
          },
        },
      };

      const url = isHttps
        ? `/api/proxy?endpoint=${encodeURIComponent(`/audit/client/${clientId}/cierre`)}`
        : `${base}audit/client/${clientId}/cierre`;

      const res = await fetch(url, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (res.ok) {
        showSuccess('Lead cerrado como perdido');
        setShowLostDialog(false);
        setLostReason('');
        setLostDescription('');
        onClose?.();
      } else {
        const errorData = await res.json().catch(() => ({}));
        showError(errorData?.detail || 'Error al cerrar lead');
      }
    } catch (err) {
      console.error('Error closing:', err);
      showError('Error al cerrar lead');
    } finally {
      setClosing(false);
    }
  };

  const handleCloseAsWon = async () => {
    if (readOnly) return;
    setClosing(true);
    try {
      const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
      const base = isHttps ? '/api/proxy?endpoint=' : 'http://200.35.189.139/api/';
      const key = process.env.API_KEY || '';
      const current = stages[currentStageIndex];
      const data = stageData[current.stageNumber] || {};

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-API-KEY': key,
      };

      const body = {
        resultado_venta: 'cerrada',
        resultado_propuesta: 'ganada',
        motivo_perdida: '',
        resumen_general: data.resumen_general || data.razon_cierre || '',
        cliente_interesado: true,
        cliente_ha_negociado: true,
        stage_feedback_json: {
          [`${current.stageNumber}`]: {
            resultado_cierre: 'ganado',
            fecha_cierre_real: data.fecha_cierre_real || new Date().toISOString().split('T')[0],
            razon_cierre: data.razon_cierre || '',
          },
        },
      };

const url = isHttps
        ? `/api/proxy?endpoint=${encodeURIComponent(`/audit/client/${clientId}/cierre`)}`
        : `${base}audit/client/${clientId}/cierre`;

      const res = await fetch(url, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (res.ok) {
        showSuccess('Lead cerrado como ganado');
        onClose?.();
      } else {
        const errorData = await res.json().catch(() => ({}));
        showError(errorData?.detail || 'Error al cerrar lead');
      }
    } catch (err) {
      console.error('Error closing:', err);
      showError('Error al cerrar lead');
    } finally {
      setClosing(false);
    }
  };


  const currentStage = stages[currentStageIndex];
  const currentData = currentStage ? (stageData[currentStage.stageNumber] || {}) : {};
  const maxIndex = stages.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#EEEEEC] shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-[#1F1D3D]">Actualizar Lead</h3>
              {leadStatus === 'perdido' && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                    Lead perdido
                  </span>
                  {stageData[6]?.motivo_perdida && (
                    <span className="text-[10px] text-red-600">{stageData[6].motivo_perdida}</span>
                  )}
                </div>
              )}
              {leadStatus === 'ganado' && (
                <span className="text-[10px] font-semibold uppercase tracking-wider text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded">
                  Venta concretada
                </span>
              )}
            </div>
            <p className="text-xs text-[#B5B5AE]">
              Lead: {clientId}
              {loadedData?.sellerName ? ` · Asesor: ${loadedData.sellerName}` : ''}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-[#B5B5AE] hover:text-[#35325B] hover:bg-[#F5F5ED] rounded transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {vendorReadOnlyBanner && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-[11px] font-medium text-red-700">
            Modo lectura — los asesores de Guatemala solo pueden visualizar el detalle del lead.
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:flex lg:flex-nowrap border-b border-[#EEEEEC] min-h-[44px]">
            {stages.map((stage, idx) => (
              <button
                key={stage.id}
                onClick={() => handleStageChange(idx)}
                className={cn(
                  'py-3 px-3 text-xs font-medium transition-colors border-b-2 whitespace-nowrap min-w-0 text-center lg:flex-1',
                  idx === currentStageIndex
                    ? 'text-[#1F1D3D]'
                    : 'border-transparent text-[#B5B5AE] hover:text-[#35325B]',
                )}
                style={idx === currentStageIndex ? { borderBottomColor: stage.color } : {}}
              >
                {stage.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {validationError && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              {validationError}
            </div>
          )}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#B5B5AE]" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {currentStage?.fields.map((field) => (
                <div key={field.id} className={cn('space-y-1.5', field.type === 'textarea' ? 'md:col-span-2' : '')}>
                  <label htmlFor={`field-${field.id}`} className="text-xs font-medium text-[#35325B] uppercase tracking-wide">
                    {field.label}
                    {field.required && <span className="text-[#c8151b] ml-0.5">*</span>}
                  </label>
                    <FieldInput
                      field={field}
                      value={getFieldValue(field.id)}
                      onChange={handleChange}
                      readOnly={readOnly}
                    />
                  {field.id === 'industria_sector' && currentData['industria_sector'] === 'otro' && !readOnly && (
                    <div className="space-y-1.5">
                      <label htmlFor="field-industria_otro" className="text-xs font-medium text-[#35325B] uppercase tracking-wide">
                        Especificar Industria
                        <span className="text-[#c8151b] ml-0.5">*</span>
                      </label>
                      <input
                        id="field-industria_otro"
                        type="text"
                        value={String(currentData['industria_otro'] || '')}
                        onChange={(e) => handleChange('industria_otro', e.target.value)}
                        placeholder="Describe el sector"
                        className="w-full px-3 py-2 bg-[#F5F5ED] border border-[#EEEEEC] rounded-lg text-sm text-[#1F1D3D] placeholder-[#B5B5AE] focus:outline-none focus:border-[#35325B] transition-colors"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-[#EEEEEC] shrink-0 bg-[#F5F5ED] gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleStageChange(Math.max(0, currentStageIndex - 1))}
            disabled={currentStageIndex === 0 || loading}
            className="gap-1.5 text-[#35325B]"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          <span className="text-xs text-[#B5B5AE]">
            {currentStageIndex + 1} de {stages.length}
          </span>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {!readOnly && !isClosed && (
              <>
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowLostDialog(true)}
                    disabled={closing || loading}
                    className="gap-1.5 border-[#c8151b] text-[#c8151b] hover:bg-red-50"
                  >
                    {closing ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                    Cerrar
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSave()}
                  disabled={saving || loading}
                  className="gap-1.5 bg-[#1F1D3D] text-white border-[#1F1D3D] hover:bg-[#35325B]"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Guardar
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleStageChange(Math.min(stages.length - 1, currentStageIndex + 1))}
              disabled={currentStageIndex === stages.length - 1 || loading}
              className="gap-1.5 text-[#35325B]"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {!readOnly && (
      <Dialog open={showLostDialog} onOpenChange={(open) => {
          if (!open) {
            setShowLostDialog(false);
            setLostReason('');
            setLostDescription('');
          }
        }}>
        <DialogContent className="w-full max-w-[90vw] sm:max-w-[425px] p-4">
          <div onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Cerrar como perdido</DialogTitle>
            <DialogDescription>Selecciona el motivo por el cual se cierra el lead y proporciona una descripción.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#35325B] uppercase tracking-wide">
                Motivo <span className="text-[#c8151b]">*</span>
              </label>
              <select
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value)}
                className="w-full px-3 py-2 bg-[#F5F5ED] border border-[#EEEEEC] rounded-lg text-sm text-[#1F1D3D] focus:outline-none focus:border-[#35325B]"
              >
                <option value="">Seleccionar...</option>
                <option value="no_respondio">No respondió</option>
                <option value="presupuesto">Presupuesto</option>
                <option value="precio">Precio</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-[#35325B] uppercase tracking-wide">
                Descripción <span className="text-[#c8151b]">*</span>
              </label>
              <textarea
                value={lostDescription}
                onChange={(e) => setLostDescription(e.target.value)}
                placeholder="Describe el intento de contacto..."
                rows={3}
                className="w-full px-3 py-2 bg-[#F5F5ED] border border-[#EEEEEC] rounded-lg text-sm text-[#1F1D3D] placeholder-[#B5B5AE] focus:outline-none focus:border-[#35325B] resize-y"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => { setShowLostDialog(false); setLostReason(''); setLostDescription(''); }}
              disabled={closing}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCloseAsLost}
              disabled={closing || !lostReason.trim() || !lostDescription.trim()}
              className="bg-[#c8151b] hover:bg-[#a50f0f] text-white"
            >
              {closing ? 'Cerrando...' : 'Cerrar como perdido'}
            </Button>
          </DialogFooter>
        </div>
        </DialogContent>
      </Dialog>
      )}
    </div>
  );
}

export { buildStages };
export type { StageConfig };
