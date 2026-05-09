'use client';

import { useState } from 'react';
import { Formulario, STAGES, type FormStage } from '@/components/formulario/Formulario';
import { useAuth } from '@/lib/auth-context';
import { API } from '@/services/api';
import { Button } from '@/components/ui/button';
import { FileText, Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function FormularioPage() {
  const { user } = useAuth();
  const [selectedLead, setSelectedLead] = useState<string>('');
  const [showForm, setShowForm] = useState(false);

  const handleSave = async (stage: FormStage, data: Record<string, string>) => {
    console.log('Saving stage:', stage, 'data:', data);
    alert(`Guardado - Etapa: ${stage}\nDatos: ${JSON.stringify(data, null, 2)}`);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#EEEEEC] p-6">
        <h2 className="text-lg font-semibold text-[#1F1D3D] mb-4">Formulario de Lead</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-[#35325B] uppercase tracking-wide mb-1.5 block">
              Ingresa el ID del Lead
            </label>
            <div className="flex gap-3">
              <Input
                placeholder="Ej. LD1234"
                value={selectedLead}
                onChange={(e) => setSelectedLead(e.target.value)}
                className="max-w-xs"
              />
              <Button
                onClick={() => selectedLead.trim() && setShowForm(true)}
                disabled={!selectedLead.trim()}
                className="bg-[#1F1D3D] hover:bg-[#35325B] text-white"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Nuevo Formulario
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#EEEEEC] p-6">
        <h3 className="text-sm font-medium text-[#1F1D3D] mb-4">Etapas disponibles</h3>
        <div className="grid grid-cols-5 gap-4">
          {STAGES.map((stage, idx) => (
            <div key={stage.id} className="text-center p-4 bg-[#F5F5ED] rounded-lg">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-white text-sm font-bold"
                style={{ backgroundColor: stage.color }}
              >
                {idx + 1}
              </div>
              <p className="text-sm font-medium text-[#1F1D3D]">{stage.label}</p>
              <p className="text-xs text-[#B5B5AE] mt-1">{stage.fields.length} campos</p>
            </div>
          ))}
        </div>
      </div>

      {showForm && selectedLead && (
        <Formulario
          clientId={selectedLead}
          initialStage="REUNION"
          onSave={handleSave}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}