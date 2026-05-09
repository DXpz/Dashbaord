'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { API } from '@/services/api';
import { useAuth } from '@/lib/auth-context';

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
    { value: 'presencial', label: 'Presencial' },
    { value: 'llamada', label: 'Llamada' },
    { value: 'teams', label: 'Teams' },
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
];

const CIERRE_FIELDS: StageField[] = [
  { id: 'resultado_cierre', label: 'Resultado del Cierre', type: 'select', required: true, options: [
    { value: '', label: 'Seleccionar…' },
    { value: 'ganado', label: 'Ganado' },
    { value: 'perdido', label: 'Perdido' },
    { value: 'en_pausa', label: 'En pausa' },
  ]},
  { id: 'fecha_cierre_real', label: 'Fecha de Cierre', type: 'date', required: true },
  { id: 'razon_cierre', label: 'Razón / Comentario', type: 'textarea', required: true, placeholder: 'Describe por qué ganó, perdió o está en pausa' },
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
    { id: 'CIERRE', label: 'Cierre', color: '#35325B', stageNumber: 6, endpoint: '/seguimiento', method: 'PUT', fields: CIERRE_FIELDS },
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
}

export function Formulario({ clientId, initialStage = 'REUNION', onClose }: FormularioProps) {
  const { user } = useAuth();
  const [requiresDemo, setRequiresDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [stageData, setStageData] = useState<Record<string, Record<string, string>>>({});
  const [stages, setStages] = useState<StageConfig[]>(buildStages(false));
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const data = await API.auditByClient(clientId);
        if (data) {
          if (data.advisor_name && user?.full_name && data.advisor_name !== user.full_name) {
            setError('Solo el asesor asignado puede editar este lead');
            setIsOwner(false);
          } else {
            setIsOwner(true);
          }

          if (data.stage_feedback_json) {
            const feedback = data.stage_feedback_json;
            setStageData({
              2: feedback[2] || {},
              3: feedback[3] || {},
              4: feedback[4] || {},
              5: feedback[5] || {},
              6: feedback[6] || {},
            });
          }

          const demoReq = data.stage_feedback_json?.[2]?.requiere_demo === 'si';
          setRequiresDemo(demoReq);

          const initialStages = buildStages(demoReq);
          const initIdx = initialStages.findIndex(s => s.id === initialStage);
          setStages(initialStages);
          setCurrentStageIndex(initIdx >= 0 ? initIdx : 0);
        }
      } catch (err) {
        console.error('Error loading lead data:', err);
        setError('No se pudo cargar los datos del lead');
        setIsOwner(false);
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    }
    loadData();
  }, [clientId, user?.full_name, initialStage]);

  const handleChange = (fieldId: string, value: string) => {
    if (!isOwner) return;
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

  const handleSave = async () => {
    if (!isOwner) return;
    setSaving(true);
    setError(null);
    try {
      const current = stages[currentStageIndex];
      const data = stageData[current.stageNumber] || {};
      const stageFeedbackJson = { [current.stageNumber]: data };

      let body: Record<string, any> = { stage_feedback_json: stageFeedbackJson };

      if (current.id === 'REUNION' || current.id === 'DEMO') {
        body.stage = current.stageNumber;
      } else if (current.id === 'SEGUIMIENTO') {
        body.resultado_venta = data.resultado_cierre === 'ganado' ? 'cerrada' :
                               data.resultado_cierre === 'perdido' ? 'perdida' : 'en_seguimiento';
      }

      await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://200.35.189.139'}/api/audit/client/${encodeURIComponent(clientId)}${current.endpoint}`, {
        method: current.method,
        headers: { 'Content-Type': 'application/json', 'X-API-Key': process.env.API_KEY || '' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      onClose?.();
    } catch (err) {
      console.error('Error saving:', err);
      setError('Error al guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const currentStage = stages[currentStageIndex];
  const currentData = currentStage ? (stageData[currentStage.stageNumber] || {}) : {};
  const maxIndex = stages.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-[50rem] max-h-[94vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EEEEEC] shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-[#1F1D3D]">Actualizar Lead</h3>
            <p className="text-xs text-[#B5B5AE]">Lead: {clientId}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-[#B5B5AE] hover:text-[#35325B] hover:bg-[#F5F5ED] rounded transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {isInitialized && !loading && (
          <div className="flex border-b border-[#EEEEEC]">
            {stages.map((stage, idx) => (
              <button
                key={stage.id}
                onClick={() => setCurrentStageIndex(idx)}
                className={cn(
                  'flex-1 py-3 text-xs font-medium transition-colors border-b-2',
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

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#B5B5AE]" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 text-sm font-medium">{error}</p>
              {!isOwner && (
                <p className="text-[#B5B5AE] text-xs mt-2">Solo el asesor asignado puede editar este lead</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {currentStage?.fields.map((field) => (
                <div key={field.id} className="space-y-1.5">
                  <label htmlFor={`field-${field.id}`} className="text-xs font-medium text-[#35325B] uppercase tracking-wide">
                    {field.label}
                    {field.required && <span className="text-[#c8151b] ml-0.5">*</span>}
                  </label>
                  <FieldInput
                    field={field}
                    value={currentData[field.id] || ''}
                    onChange={handleChange}
                    readOnly={!isOwner}
                  />
                  {field.id === 'industria_sector' && currentData['industria_sector'] === 'otro' && (
                    <div className="space-y-1.5">
                      <label htmlFor="field-industria_otro" className="text-xs font-medium text-[#35325B] uppercase tracking-wide">
                        Especificar Industria
                        <span className="text-[#c8151b] ml-0.5">*</span>
                      </label>
                      <input
                        id="field-industria_otro"
                        type="text"
                        value={currentData['industria_otro'] || ''}
                        onChange={(e) => handleChange('industria_otro', e.target.value)}
                        disabled={!isOwner}
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

        <div className="flex items-center justify-between px-6 py-4 border-t border-[#EEEEEC] shrink-0 bg-[#F5F5ED]">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentStageIndex(prev => Math.max(0, prev - 1))}
            disabled={currentStageIndex === 0 || loading || !isOwner}
            className="gap-1.5 text-[#35325B]"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          <span className="text-xs text-[#B5B5AE]">
            {currentStageIndex + 1} de {stages.length}
          </span>

          {currentStageIndex < maxIndex ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStageIndex(prev => prev + 1)}
              disabled={loading || !isOwner}
              className="gap-1.5 bg-[#1F1D3D] text-white border-[#1F1D3D] hover:bg-[#35325B]"
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSave}
              disabled={saving || loading || !isOwner}
              className="gap-1.5 bg-[#1F1D3D] text-white border-[#1F1D3D] hover:bg-[#35325B]"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Guardar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export { buildStages };
export type { StageConfig };