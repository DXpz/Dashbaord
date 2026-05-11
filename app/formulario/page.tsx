'use client';

import { useState, useMemo } from 'react';
import { Formulario } from '@/components/formulario/Formulario';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, X, RotateCcw, Plus, Trash2 } from 'lucide-react';
import { Shell } from '@/components/layout/Shell';
import { useAdminDashboard, useConnectionStatus, useFilters, useAllLeads } from '@/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { useNotification } from '@/components/ui/notification';

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
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newLead, setNewLead] = useState({ nombre: '', correo: '', telefono: '', pais: 'SV' });

  const { showSuccess, showError } = useNotification();

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

      const url = isHttps
        ? `/api/proxy?endpoint=${encodeURIComponent(`/audit/${selectedLead.client_id}/reopen`)}`
        : `${base}audit/${selectedLead.client_id}/reopen`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-API-KEY': key,
      };

      const res = await fetch(url, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ reason: 'Reabierto por admin desde dashboard' }),
      });

      if (res.ok) {
        showSuccess('Lead reabierto correctamente');
        setSelectedLead(null);
        setSearchTerm('');
      } else {
        const data = await res.json().catch(() => ({}));
        showError(data?.detail || 'Error al reabrir lead');
      }
    } catch (err) {
      console.error('Error reopening lead:', err);
      showError('Error al reabrir lead');
    } finally {
      setReopening(false);
    }
  };

  const handleDeleteLead = async () => {
    if (!selectedLead) return;
    if (!deleteReason.trim()) {
      showError('Escribe una razón para eliminar');
      return;
    }

    setDeleting(true);
    try {
      const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
      const base = isHttps ? '/api/proxy?endpoint=' : 'http://200.35.189.139/api/';
      const key = process.env.API_KEY || '';

      const url = isHttps
        ? `/api/proxy?endpoint=${encodeURIComponent(`/audit/${selectedLead.client_id}/no-agendado`)}`
        : `${base}audit/${selectedLead.client_id}/no-agendado`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-API-KEY': key,
      };

      const res = await fetch(url, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ reason: deleteReason }),
      });

      if (res.ok) {
        setShowDeleteDialog(false);
        setDeleteReason('');
        showSuccess('Lead marcado como no agendado');
        setSelectedLead(null);
        setSearchTerm('');
      } else {
        const data = await res.json().catch(() => ({}));
        showError(data?.detail || 'Error al eliminar lead');
      }
    } catch (err) {
      console.error('Error deleting lead:', err);
      showError('Error al eliminar lead');
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateLead = async () => {
    if (!newLead.nombre.trim() || !newLead.correo.trim()) {
      showError('Nombre y correo son obligatorios');
      return;
    }

    setCreating(true);
    try {
      const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
      const base = isHttps ? '/api/proxy?endpoint=' : 'http://200.35.189.139/api/';
      const key = process.env.API_KEY || '';

      const payload: Record<string, string> = {
        nombre: newLead.nombre.trim(),
        correo: newLead.correo.trim(),
        telefono: newLead.telefono.trim(),
        pais: newLead.pais || 'SV',
        asunto: 'Lead nuevo desde dashboard',
        ubicacion: '',
        descripcion: 'Creado por admin',
        validador: 'Lead Manual',
        dia_reunion: '',
      };
      if (newLead.pais) payload.pais = newLead.pais;

const url = isHttps
        ? `/api/proxy?endpoint=${encodeURIComponent('/audit/assign-round-robin?pais=' + newLead.pais)}`
        : `${base}audit/assign-round-robin?pais=${newLead.pais}`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-API-KEY': key,
      };

      console.log('Creating lead:', url, JSON.stringify(payload));

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        showSuccess(`Lead ${data.client_id} creado - Asesor: ${data.advisor_name || 'Asignado'}`);
        setShowCreateModal(false);
        setNewLead({ nombre: '', correo: '', telefono: '', pais: 'SV' });
      } else if (data.already_existed) {
        showSuccess(`Lead ${data.client_id} ya existía`);
        setShowCreateModal(false);
      } else {
        showError(data?.detail || 'Error al crear lead');
      }
    } catch (err) {
      console.error('Error creating lead:', err);
      showError('Error al crear lead');
    } finally {
      setCreating(false);
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
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
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
                <Button
                  onClick={() => setShowCreateModal(true)}
                  variant="outline"
                  className="gap-1.5 border-[#EEEEEC] text-[#35325B] hover:bg-[#F5F5ED]"
                >
                  <Plus className="h-4 w-4" />
                  Crear Lead
                </Button>
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

              {selectedLead && (
                <div className="bg-[#F5F5ED] border border-[#EEEEEC] rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[#B5B5AE] uppercase tracking-wide">Lead seleccionado</p>
                    <p className="text-sm font-semibold text-[#1F1D3D]">{selectedLead.client_id}</p>
                    <p className="text-xs text-[#35325B]">{selectedLead.client_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setShowDeleteDialog(true)}
                      variant="outline"
                      className="gap-1.5 border-[#EEEEEC] text-[#B5B5AE] hover:text-red-600 hover:bg-red-50 hover:border-red-200"
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </Button>
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

          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Lead</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#35325B] uppercase tracking-wide">
                    Nombre <span className="text-[#c8151b]">*</span>
                  </label>
                  <Input
                    value={newLead.nombre}
                    onChange={(e) => setNewLead({ ...newLead, nombre: e.target.value })}
                    placeholder="Nombre del cliente"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#35325B] uppercase tracking-wide">
                    Correo <span className="text-[#c8151b]">*</span>
                  </label>
                  <Input
                    type="email"
                    value={newLead.correo}
                    onChange={(e) => setNewLead({ ...newLead, correo: e.target.value })}
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#35325B] uppercase tracking-wide">
                    Teléfono
                  </label>
                  <Input
                    value={newLead.telefono}
                    onChange={(e) => setNewLead({ ...newLead, telefono: e.target.value })}
                    placeholder="5555-5555"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#35325B] uppercase tracking-wide">
                    País
                  </label>
                  <Input
                    value={newLead.pais}
                    onChange={(e) => setNewLead({ ...newLead, pais: e.target.value })}
                    placeholder="SV"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateLead}
                  disabled={creating}
                  className="bg-[#1F1D3D] hover:bg-[#35325B] text-white"
                >
                  {creating ? 'Creando...' : 'Crear Lead'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Marcar lead como no agendado</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#35325B] uppercase tracking-wide">
                    Razón <span className="text-[#c8151b]">*</span>
                  </label>
                  <Input
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    placeholder="Escribe la razón..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => { setShowDeleteDialog(false); setDeleteReason(''); }}
                  disabled={deleting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleDeleteLead}
                  disabled={deleting || !deleteReason.trim()}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {deleting ? 'Eliminando...' : 'Eliminar Lead'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </Shell>
  );
}