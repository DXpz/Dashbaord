'use client';

import { useState, useEffect, useMemo } from 'react';
import { Formulario } from '@/components/formulario/Formulario';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth-context';
import { API } from '@/services/api';
import { useVendedorFilters } from '@/lib/vendedor-filters';
import { Search, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeadOption {
  client_id: string;
  client_name: string;
  opportunity_stage_label: string;
}

export default function VendedorFormularioPage() {
  const { user } = useAuth();
  const { desde, hasta } = useVendedorFilters();
  const [leads, setLeads] = useState<LeadOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadOption | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!user?.full_name) return;
    
    async function fetchLeads() {
      if (!user) return;
      setLoading(true);
      try {
        const result = await API.reuniones(desde, hasta, 200, 0, { nombre: user.full_name });
        const list = result?.items || result?.reuniones || (Array.isArray(result) ? result : []);
        
        const leadsWithStage = list
          .map((r: any) => {
            const stage = r.opportunity_stage_label || '';
            return {
              client_id: r.client_id || r.opportunity_number || '',
              client_name: r.client_name || r.cliente || '',
              opportunity_stage_label: r.opportunity_stage_label || stage || '',
            };
          });
        
        const uniqueLeads = leadsWithStage.reduce((acc: LeadOption[], lead: LeadOption) => {
          if (!acc.find(l => l.client_id === lead.client_id)) {
            acc.push(lead);
          }
          return acc;
        }, []);
        
        setLeads(uniqueLeads);
      } catch (err) {
        console.error('Error fetching leads:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchLeads();
  }, [user?.full_name, desde, hasta]);

  const filteredLeads = useMemo(() => {
    if (!searchTerm) return leads.slice(0, 20);
    const q = searchTerm.toLowerCase();
    return leads
      .filter(l => 
        l.client_id.toLowerCase().includes(q) || 
        l.client_name.toLowerCase().includes(q)
      )
      .slice(0, 20);
  }, [leads, searchTerm]);

  const handleSelectLead = (lead: LeadOption) => {
    setSelectedLead(lead);
    setSearchTerm(lead.client_id);
    setShowDropdown(false);
  };

  const handleOpenForm = () => {
    if (selectedLead) {
      setShowForm(true);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-[#EEEEEC] p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-[#1F1D3D] mb-4">Actualizar Lead</h2>

        <div className="space-y-4">
          <div className="relative">
            <label className="text-xs font-medium text-[#35325B] uppercase tracking-wide mb-1.5 block">
              Selecciona el Lead
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Search className="h-4 w-4 text-[#B5B5AE]" />
              </div>
              <input
                type="text"
                placeholder="Busca por LD o nombre..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                  if (!e.target.value) setSelectedLead(null);
                }}
                onFocus={() => setShowDropdown(true)}
                className="w-full pl-9 pr-8 py-2 bg-[#F5F5ED] border border-[#EEEEEC] rounded-lg text-sm text-[#1F1D3D] placeholder-[#B5B5AE] focus:outline-none focus:border-[#35325B] transition-colors"
                disabled={loading}
              />
              {searchTerm && (
                <button
                  onClick={() => { setSearchTerm(''); setSelectedLead(null); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#B5B5AE] hover:text-[#35325B]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {showDropdown && searchTerm && filteredLeads.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-[#EEEEEC] rounded-lg shadow-lg max-h-64 overflow-y-auto">
                {filteredLeads.map((lead) => (
                  <button
                    key={lead.client_id}
                    onClick={() => handleSelectLead(lead)}
                    className="w-full px-3 py-2 text-left hover:bg-[#F5F5ED] transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#1F1D3D]">{lead.client_id}</p>
                      <p className="text-xs text-[#B5B5AE]">{lead.client_name}</p>
                    </div>
                    <span className="text-xs bg-[#F5F5ED] text-[#35325B] px-2 py-0.5 rounded whitespace-nowrap">
                      {lead.opportunity_stage_label}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {showDropdown && searchTerm && filteredLeads.length === 0 && !loading && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-[#EEEEEC] rounded-lg shadow-lg px-3 py-2 text-sm text-[#B5B5AE]">
                No se encontraron leads
              </div>
            )}

            {loading && (
              <p className="text-xs text-[#B5B5AE] mt-1">Cargando leads...</p>
            )}
          </div>

        {selectedLead && (
          <div className="bg-[#F5F5ED] border border-[#EEEEEC] rounded-lg p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs text-[#B5B5AE] uppercase tracking-wide">Lead seleccionado</p>
              <p className="text-sm font-semibold text-[#1F1D3D]">{selectedLead.client_id}</p>
              <p className="text-xs text-[#35325B]">{selectedLead.client_name}</p>
            </div>
            <Button
              onClick={handleOpenForm}
              className="bg-[#1F1D3D] hover:bg-[#35325B] text-white shrink-0"
            >
              Actualizar Lead
            </Button>
          </div>
        )}

        {!selectedLead && !loading && leads.length > 0 && (
          <p className="text-xs text-[#B5B5AE]">Busca y selecciona un lead para actualizar</p>
        )}</div>
      </div>

      {showForm && selectedLead && (
        <Formulario
          clientId={selectedLead.client_id}
          initialStage="REUNION"
          readOnly={false}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}