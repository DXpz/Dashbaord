'use client';

import { useState, useEffect, useMemo } from 'react';
import { Shell } from '@/components/layout/Shell';
import { useConnectionStatus, useAsesores, useFilters } from '@/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { API } from '@/services/api';
import { Plus, RefreshCw, Trash2, Power } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Advisor {
  id?: string;
  nombre_vendedor?: string;
  correo_vendedor?: string;
  pais?: string;
  activo?: boolean;
}

export default function GestionAsesoresPage() {
  const { filters, handleFilterChange, handleFiltrar, handleLimpiar } = useFilters();
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [advisorToDelete, setAdvisorToDelete] = useState<Advisor | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [newAdvisor, setNewAdvisor] = useState({ nombre: '', correo: '', pais: '', activo: true });

  const connectionStatus = useConnectionStatus();
  const asesoresList = useAsesores(filters);
  const AsesoresOptions = useMemo(() => asesoresList.map((a) => ({ value: a, label: a })), [asesoresList]);

  const fetchAdvisors = async () => {
    setLoading(true);
    try {
      const data = await API.advisorsList({ activo: undefined });
      setAdvisors(Array.isArray(data) ? data : data?.advisors || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdvisors(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAdvisors();
    setRefreshing(false);
  };

  const handleCreateAdvisor = async () => {
    if (!newAdvisor.nombre || !newAdvisor.correo || !newAdvisor.pais) return;
    try {
      await API.advisorsCreate({ nombre_vendedor: newAdvisor.nombre, correo_vendedor: newAdvisor.correo, pais: newAdvisor.pais, activo: newAdvisor.activo });
      setShowCreateModal(false);
      setNewAdvisor({ nombre: '', correo: '', pais: '', activo: true });
      await fetchAdvisors();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleToggleActivo = async (advisor: Advisor) => {
    if (!advisor.id) return;
    try {
      await API.advisorsPatch(advisor.id, { activo: !advisor.activo });
      await fetchAdvisors();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleDeleteClick = (advisor: Advisor) => {
    setAdvisorToDelete(advisor);
    setShowDeleteModal(true);
    setDeleteConfirmText('');
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmText !== 'ELIMINAR' || !advisorToDelete?.id) return;
    try {
      await API.advisorsDelete(advisorToDelete.id);
      setShowDeleteModal(false);
      setAdvisorToDelete(null);
      setDeleteConfirmText('');
      await fetchAdvisors();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const filteredAdvisors = filters.pais ? advisors.filter((a) => a.pais === filters.pais) : advisors;

  return (
    <Shell
      pageTitle="Gestión"
      filters={filters}
      onFilterChange={handleFilterChange}
      onFiltrar={handleFiltrar}
      onLimpiar={handleLimpiar}
      asesores={AsesoresOptions}
      connectionStatus={connectionStatus}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Asesores</h2>
            <p className="text-sm text-gray-500 mt-0.5">{filteredAdvisors.length} registrados</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="h-9 px-3 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 cursor-pointer"
              value={filters.pais}
              onChange={(e) => handleFilterChange('pais', e.target.value)}
            >
              <option value="">Todos</option>
              <option value="SV">SV</option>
              <option value="GT">GT</option>
            </select>
            <Button size="sm" onClick={() => setShowCreateModal(true)} className="gap-2 bg-gray-900 hover:bg-gray-800">
              <Plus className="h-4 w-4" />
              Nuevo
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="gap-2">
              <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (<Skeleton key={i} className="h-40" />))}
          </div>
        ) : filteredAdvisors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAdvisors.map((advisor, i) => (
              <Card
                key={advisor.id || i}
                className={cn(
                  'transition-all hover:shadow-md animate-slide-up',
                  advisor.activo ? 'border-l-2 border-l-gray-900' : 'border-l-2 border-l-gray-300 opacity-60'
                )}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{advisor.nombre_vendedor || '—'}</h3>
                      <p className="text-xs text-gray-500 mt-1">{advisor.correo_vendedor || '—'}</p>
                    </div>
                    <span className={cn('text-xs font-medium px-2 py-1 rounded', advisor.activo ? 'bg-gray-100 text-gray-700' : 'bg-gray-50 text-gray-400')}>
                      {advisor.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm mb-4 pt-2 border-t border-gray-100">
                    <span className="text-gray-400">País:</span>
                    <span className="font-medium text-gray-700">{advisor.pais || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs" onClick={() => handleToggleActivo(advisor)}>
                      <Power className="h-3 w-3" />
                      {advisor.activo ? 'Desactivar' : 'Activar'}
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5 text-red-600 hover:text-red-700" onClick={() => handleDeleteClick(advisor)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400 bg-white rounded-lg border border-gray-100">
            Sin asesores registrados
          </div>
        )}
      </div>

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Asesor</DialogTitle>
            <DialogDescription>Crea un nuevo perfil.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nombre</label>
              <Input placeholder="Nombre completo" value={newAdvisor.nombre} onChange={(e) => setNewAdvisor((p) => ({ ...p, nombre: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Correo</label>
              <Input type="email" placeholder="correo@ejemplo.com" value={newAdvisor.correo} onChange={(e) => setNewAdvisor((p) => ({ ...p, correo: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">País</label>
              <select className="h-10 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm" value={newAdvisor.pais} onChange={(e) => setNewAdvisor((p) => ({ ...p, pais: e.target.value }))}>
                <option value="">Seleccionar</option>
                <option value="SV">El Salvador</option>
                <option value="GT">Guatemala</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Activo</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={newAdvisor.activo} onChange={() => setNewAdvisor((p) => ({ ...p, activo: true }))} className="w-4 h-4" /> <span className="text-sm">Sí</span></label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={!newAdvisor.activo} onChange={() => setNewAdvisor((p) => ({ ...p, activo: false }))} className="w-4 h-4" /> <span className="text-sm">No</span></label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancelar</Button>
            <Button onClick={handleCreateAdvisor}>Crear</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Perfil</DialogTitle>
            <DialogDescription>Va a eliminar a <strong>{advisorToDelete?.nombre_vendedor}</strong>.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-red-600 font-medium mb-4">Escriba <strong>ELIMINAR</strong> para confirmar:</p>
            <Input placeholder="ELIMINAR" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleteConfirmText !== 'ELIMINAR'}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}