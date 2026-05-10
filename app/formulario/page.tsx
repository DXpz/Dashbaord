'use client';

import { useState, useMemo } from 'react';
import { Formulario } from '@/components/formulario/Formulario';
import { Button } from '@/components/ui/button';
import { Search, X, RotateCcw } from 'lucide-react';
import { Shell } from '@/components/layout/Shell';
import { useAdminDashboard, useConnectionStatus, useFilters, useAllLeads } from '@/hooks';
import { Skeleton } from '@/components/ui/skeleton';

interface LeadOption {
  client_id: string;
  client_name: string;
  opportunity_stage_label: string;
  oportunidad_id: number;
  status?: string;
}

export default function FormularioPage() {
  const { filters, handleFilterChange, handleFiltrar, handleLimpiar } = useFilters();
  const { data, loading: dashboardLoading } = useAdminDashboard(filters);
  const connectionStatus = useConnectionStatus();
  const { leads, loading } = useAllLeads(filters);

  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadOption | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [reopening, setReopening] = useState(false);

  const filteredLeads = useMemo(() => {
    if (!searchTerm) return leads.slice(0, 30);
    const q = searchTerm.toLowerCase();
    return leads
      .filter(l =>
        (l.client_id || '').toLowerCase().includes(q) ||
        (l.client_name || '').toLowerCase().includes(q)
      )
      .slice(0, 30);
  }, [leads, searchTerm]);

  const handleSelectLead = (lead: any) => {
    setSelectedLead({
      client_id: lead.client_id || lead.opportunity_number || '',
      client_name: lead.client_name || lead.cliente || '',
      opportunity_stage_label: lead.opportunity_stage_label || lead.opportunity_stage || '',
      oportunidad_id: lead.id || 0,
      status: lead.status || '',
    });
    setSearchTerm(lead.client_id);
    setShowDropdown(false);
  };

  const handleReopenLead = async () => {
    if (!selectedLead) return;
    if (!confirm('¿Reabrir este lead? Volverá a etapa de Reunión.')) return;
    
    setReopening(true);
    try {
      const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
      const base = isHttps ? '/api/proxy?endpoint=' : 'http://200.35.189.139/api/';
      const key = process.env.API_KEY || '';
      
      const reason = encodeURIComponent('Reabierto por admin desde dashboard');
      const url = isHttps 
        ? `/api/proxy?endpoint=${encodeURIComponent(`/audit/${selectedLead.client_id}/reopen?reason=${reason}`)}`
        : `${base}audit/${selectedLead.client_id}/reopen?reason=${reason}`;
      
      const headers: Record<string, string> = {
        'X-API-KEY': key,
        'ngrok-skip-browser-warning': 'true',
      };
      
      const res = await fetch(url, { 
        method: 'POST',
        headers,
        credentials: 'include',
      });
      
      if (res.ok) {
        alert('Lead reabierto correctamente');
        setSelectedLead(null);
        setSearchTerm('');
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data?.detail || 'Error al reabrir lead');
      }
    } catch (err) {
      console.error('Error reopening lead:', err);
      alert('Error al reabrir lead');
    } finally {
      setReopening(false);
    }
  };

  return (
    <Shell
      pageTitle="Formulario"
      filters={filters}
      onFilterChange={handleFilterChange}
      onFiltrar={handleFiltrar}
      onLimpiar={handleLimpiar}
      asesores={[]}
      connectionStatus={connectionStatus}
    >
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white border border-[#EEEEEC] p-6">
            <h2 className="text-lg font-semibold text-[#1F1D3D] mb-4">Actualizar Lead</h2>

            <div className="space-y-4">
              <div>
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
                    className="w-full max-w-md pl-9 pr-8 py-2 bg-[#F5F5ED] border border-[#EEEEEC] rounded-lg text-sm text-[#1F1D3D] placeholder-[#B5B5AE] focus:outline-none focus:border-[#35325B] transition-colors"
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
                  <div className="absolute z-10 mt-1 w-full max-w-md bg-white border border-[#EEEEEC] rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {filteredLeads.map((lead) => (
                      <button
                        key={lead.client_id}
                        onClick={() => handleSelectLead(lead)}
                        className="w-full px-3 py-2 text-left hover:bg-[#F5F5ED] transition-colors flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-medium text-[#1F1D3D]">{lead.client_id}</p>
                          <p className="text-xs text-[#B5B5AE]">{lead.client_name}</p>
                        </div>
                        <span className="text-xs bg-[#F5F5ED] text-[#35325B] px-2 py-0.5 rounded">
                          {lead.opportunity_stage_label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {showDropdown && searchTerm && filteredLeads.length === 0 && !loading && (
                  <div className="absolute z-10 mt-1 w-full max-w-md bg-white border border-[#EEEEEC] rounded-lg shadow-lg px-3 py-2 text-sm text-[#B5B5AE]">
                    No se encontraron leads
                  </div>
                )}
              </div>

              {selectedLead && (
                <div className="bg-[#F5F5ED] border border-[#EEEEEC] rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#B5B5AE] uppercase tracking-wide">Lead seleccionado</p>
                    <p className="text-sm font-semibold text-[#1F1D3D]">{selectedLead.client_id}</p>
                    <p className="text-xs text-[#35325B]">{selectedLead.client_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleReopenLead}
                      disabled={reopening}
                      variant="outline"
                      className="gap-1.5 border-[#EEEEEC] text-[#B5B5AE] hover:text-[#35325B] hover:bg-[#EEEEEC]"
                    >
                      <RotateCcw className="h-4 w-4" />
                      {reopening ? 'Reabriendo...' : 'Reabrir'}
                    </Button>
                    <Button
                      onClick={() => setShowForm(true)}
                      className="bg-[#1F1D3D] hover:bg-[#35325B] text-white shrink-0"
                    >
                      Actualizar Lead
                    </Button>
                  </div>
                </div>
              )}

              {!selectedLead && !loading && leads.length > 0 && (
                <p className="text-xs text-[#B5B5AE]">Busca y selecciona un lead para actualizar</p>
              )}
            </div>
          </div>

          {showForm && selectedLead && (
            <Formulario
              clientId={selectedLead.client_id}
              initialStage="REUNION"
              onClose={() => setShowForm(false)}
            />
          )}
        </div>
      )}
    </Shell>
  );
}