'use client';

import { useState, useEffect, useMemo } from 'react';
import { Formulario } from '@/components/formulario/Formulario';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { Shell } from '@/components/layout/Shell';
import { useAdminDashboard, useConnectionStatus, useFilters } from '@/hooks';
import { Skeleton } from '@/components/ui/skeleton';

interface LeadOption {
  client_id: string;
  client_name: string;
  opportunity_stage_label: string;
  oportunidad_id: number;
}

export default function FormularioPage() {
  const { filters, handleFilterChange, handleFiltrar, handleLimpiar } = useFilters();
  const { data, loading: dashboardLoading } = useAdminDashboard(filters);
  const connectionStatus = useConnectionStatus();

  const [leads, setLeads] = useState<LeadOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadOption | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    async function fetchLeads() {
      setLoading(true);
      try {
        const result = await fetch(`/api/proxy?_path=metrics/reuniones&desde=${filters.desde}&hasta=${filters.hasta}&limite=1000`, {
          credentials: 'include',
        });
        const json = await result.json();
        const list = json?.reuniones || json?.items || (Array.isArray(json) ? json : []);

        const mapped: LeadOption[] = list.map((r: any) => ({
          client_id: r.client_id || r.opportunity_number || '',
          client_name: r.client_name || r.cliente || '',
          opportunity_stage_label: r.opportunity_stage_label || r.opportunity_stage || '',
          oportunidad_id: r.id || r.opportunity_id || 0,
        }));

        const unique = mapped.reduce((acc: LeadOption[], lead: LeadOption) => {
          if (!acc.find(l => l.client_id === lead.client_id)) {
            acc.push(lead);
          }
          return acc;
        }, []);

        setLeads(unique);
      } catch (err) {
        console.error('Error fetching leads:', err);
      } finally {
        setLoading(false);
      }
    }

    if (filters.desde && filters.hasta) {
      fetchLeads();
    }
  }, [filters.desde, filters.hasta]);

  const filteredLeads = useMemo(() => {
    if (!searchTerm) return leads.slice(0, 30);
    const q = searchTerm.toLowerCase();
    return leads
      .filter(l =>
        l.client_id.toLowerCase().includes(q) ||
        l.client_name.toLowerCase().includes(q)
      )
      .slice(0, 30);
  }, [leads, searchTerm]);

  const handleSelectLead = (lead: LeadOption) => {
    setSelectedLead(lead);
    setSearchTerm(lead.client_id);
    setShowDropdown(false);
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
                  <Button
                    onClick={() => setShowForm(true)}
                    className="bg-[#1F1D3D] hover:bg-[#35325B] text-white shrink-0"
                  >
                    Actualizar Lead
                  </Button>
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