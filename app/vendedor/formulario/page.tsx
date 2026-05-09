'use client';

import { useState } from 'react';
import { Formulario, type FormStage } from '@/components/formulario/Formulario';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function VendedorFormularioPage() {
  const [selectedLead, setSelectedLead] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSave = async (stage: FormStage, data: Record<string, string>) => {
    console.log('Saving stage:', stage, 'data:', data);
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