'use client';

import { useState, useEffect, useMemo } from 'react';
import { Shell } from '@/components/layout/Shell';
import { useConnectionStatus, useAsesores, useFilters } from '@/hooks';
import { useAuth } from '@/lib/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { API } from '@/services/api';
import { Plus, RefreshCw, Trash2, Power, Users, UserPlus, Search, Copy, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Advisor {
  id?: string;
  nombre_vendedor?: string;
  correo_vendedor?: string;
  pais?: string;
  activo?: boolean;
}

export default function GestionAsesoresPage() {
  const { user } = useAuth();
  const { filters, handleFilterChange, handleFiltrar, handleLimpiar } = useFilters();
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [advisorToDelete, setAdvisorToDelete] = useState<Advisor | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [newAdvisor, setNewAdvisor] = useState({ nombre: '', correo: '', pais: user?.country_code || '', rol: 'asesor' });
  const [searchTerm, setSearchTerm] = useState('');
  const [creating, setCreating] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ correo: string; password: string } | null>(null);

  const connectionStatus = useConnectionStatus();
  const asesoresList = useAsesores(filters);
  const AsesoresOptions = useMemo(() => asesoresList.map((a: string) => ({ value: a, label: a })), [asesoresList]);

  const fetchAdvisors = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { activo: undefined };
      if (user?.country_code) {
        params.pais = user.country_code;
      }
      const data = await API.advisorsList(params);
      setAdvisors(Array.isArray(data) ? data : data?.advisors || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (user) fetchAdvisors(); 
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAdvisors();
    setRefreshing(false);
  };

  const handleCreateAdvisor = async () => {
    if (!newAdvisor.nombre || !newAdvisor.correo || !newAdvisor.pais) return;
    setCreating(true);
    try {
      const result = await API.advisorsCreate({ nombre_vendedor: newAdvisor.nombre, correo_vendedor: newAdvisor.correo, pais: newAdvisor.pais, rol: newAdvisor.rol });
      if (result?.credentials) {
        setCreatedCredentials(result.credentials);
      } else {
        setShowCreateModal(false);
        setNewAdvisor({ nombre: '', correo: '', pais: user?.country_code || '', rol: 'asesor' });
      }
      await fetchAdvisors();
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setCreating(false);
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

  const filteredAdvisors = useMemo(() => {
    let list = filters.pais ? advisors.filter((a) => a.pais === filters.pais) : advisors;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((a) =>
        (a.nombre_vendedor || '').toLowerCase().includes(q) ||
        (a.correo_vendedor || '').toLowerCase().includes(q) ||
        (a.pais || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [advisors, filters.pais, searchTerm]);

  const stats = useMemo(() => ({
    total: advisors.length,
    activos: advisors.filter((a) => a.activo).length,
    inactivos: advisors.filter((a) => !a.activo).length,
  }), [advisors]);

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
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1F1D3D]/5 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#1F1D3D]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-medium text-[#1F1D3D]">{stats.total} Asesores</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded font-medium">{stats.activos} activos</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{stats.inactivos} inactivos</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B5B5AE]" />
              <Input
                placeholder="Buscar..."
                className="pl-9 w-48"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button size="sm" onClick={() => setShowCreateModal(true)} className="gap-2 bg-[#1F1D3D] hover:bg-[#35325B]">
              <UserPlus className="h-4 w-4" />
              Nuevo
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="gap-2">
              <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
            </Button>
          </div>
        </div>

        {loading ? (
          <Skeleton className="h-96 w-full" />
        ) : filteredAdvisors.length > 0 ? (
          <div className="bg-white border border-[#EEEEEC]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>País</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdvisors.map((advisor, i) => (
                  <TableRow key={advisor.id || i} className="animate-slide-up" style={{ animationDelay: `${i * 30}ms` }}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#1F1D3D] rounded-full flex items-center justify-center">
                          <span className="text-[#F5F5ED] text-xs font-semibold">
                            {(advisor.nombre_vendedor || '?')[0].toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-[#1F1D3D]">{advisor.nombre_vendedor || '—'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[#B5B5AE]">{advisor.correo_vendedor || '—'}</TableCell>
                    <TableCell>
                      <span className="text-xs bg-[#F5F5ED] text-[#35325B] px-2 py-1 rounded font-medium">{advisor.pais || '—'}</span>
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        'text-xs font-medium px-2 py-1 rounded',
                        advisor.activo ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                      )}>
                        {advisor.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActivo(advisor)}
                          className={cn(
                            'gap-1.5 text-xs',
                            advisor.activo ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50' : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                          )}
                        >
                          <Power className="h-3 w-3" />
                          {advisor.activo ? 'Desactivar' : 'Activar'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(advisor)}
                          className="gap-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-16 text-[#B5B5AE] bg-white rounded-lg border border-[#EEEEEC]">
            Sin asesores registrados
          </div>
        )}
      </div>

      <Dialog open={showCreateModal} onOpenChange={(open) => {
          if (!open) {
            setShowCreateModal(false);
            setNewAdvisor({ nombre: '', correo: '', pais: user?.country_code || '', rol: 'asesor' });
            setCreatedCredentials(null);
          }
        }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{createdCredentials ? 'Asesor Creado' : 'Nuevo Asesor'}</DialogTitle>
            <DialogDescription>
              {createdCredentials ? 'Estas son las credenciales del nuevo asesor. Guárdalas bien.' : 'Crea un perfil nuevo para un asesor.'}
            </DialogDescription>
          </DialogHeader>
          
          {createdCredentials ? (
            <div className="space-y-4 py-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-800">Correo</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(createdCredentials.correo)}
                    className="text-green-600 hover:text-green-700 p-1"
                    title="Copiar"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-lg font-bold text-green-900">{createdCredentials.correo}</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-amber-800">Contraseña</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(createdCredentials.password)}
                    className="text-amber-600 hover:text-amber-700 p-1"
                    title="Copiar"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-lg font-bold text-amber-900 font-mono">{createdCredentials.password}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#35325B]">Nombre completo</label>
                <Input
                  placeholder="Ej: Juan Pérez"
                  value={newAdvisor.nombre}
                  onChange={(e) => setNewAdvisor((p) => ({ ...p, nombre: e.target.value }))}
                  className="border-[#EEEEEC]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#35325B]">Correo</label>
                <Input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={newAdvisor.correo}
                  onChange={(e) => setNewAdvisor((p) => ({ ...p, correo: e.target.value }))}
                  className="border-[#EEEEEC]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#35325B]">País</label>
                <select
                  className="h-10 w-full rounded-lg border border-[#EEEEEC] bg-white px-4 text-sm text-[#35325B]"
                  value={newAdvisor.pais}
                  onChange={(e) => setNewAdvisor((p) => ({ ...p, pais: e.target.value }))}
                >
                  <option value="">Seleccionar país</option>
                  <option value="SV">El Salvador (SV)</option>
                  <option value="GT">Guatemala (GT)</option>
                  <option value="HN">Honduras (HN)</option>
                  <option value="CR">Costa Rica (CR)</option>
                  <option value="PA">Panamá (PA)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#35325B]">Rol</label>
                <select
                  className="h-10 w-full rounded-lg border border-[#EEEEEC] bg-white px-4 text-sm text-[#35325B]"
                  value={newAdvisor.rol}
                  onChange={(e) => setNewAdvisor((p) => ({ ...p, rol: e.target.value }))}
                >
                  <option value="asesor">Asesor</option>
                  <option value="jefe">Jefe de ventas</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            {createdCredentials ? (
              <Button onClick={() => { setShowCreateModal(false); setCreatedCredentials(null); setNewAdvisor({ nombre: '', correo: '', pais: user?.country_code || '', rol: 'asesor' }); }} className="bg-[#1F1D3D] hover:bg-[#35325B] w-full">
                Cerrar
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => { setShowCreateModal(false); setNewAdvisor({ nombre: '', correo: '', pais: user?.country_code || '', rol: 'asesor' }); }}>Cancelar</Button>
                <Button
                  onClick={handleCreateAdvisor}
                  disabled={!newAdvisor.nombre || !newAdvisor.correo || !newAdvisor.pais || creating}
                  className="bg-[#1F1D3D] hover:bg-[#35325B]"
                >
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Crear'}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar Asesor</DialogTitle>
            <DialogDescription>
              Se eliminará el perfil de <strong>{advisorToDelete?.nombre_vendedor}</strong>.
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium text-[#35325B] block mb-2">Escribe <strong>ELIMINAR</strong> para confirmar</label>
            <Input
              placeholder="ELIMINAR"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="border-red-200"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleteConfirmText !== 'ELIMINAR'}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}