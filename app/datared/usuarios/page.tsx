'use client';

import { useState, useMemo } from 'react';
import { Shell } from '@/components/layout/Shell';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Users,
  UserPlus,
  RefreshCw,
  Trash2,
  Power,
  Search,
  Copy,
  Check,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// DEMO: Datos hardcodeados — pendiente conectar a endpoint /api/datared/usuarios

interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  pais: 'SV' | 'GT';
  rol: 'admin' | 'comercial' | 'tecnico' | 'soporte';
  activo: boolean;
}

const USUARIOS_INICIALES: Usuario[] = [
  { id: 1, nombre: 'Roberto Mendez', correo: 'rmendez@datared.com.sv', pais: 'SV', rol: 'admin', activo: true },
  { id: 2, nombre: 'Patricia Salinas', correo: 'psalinas@datared.com.sv', pais: 'SV', rol: 'comercial', activo: true },
  { id: 3, nombre: 'Carlos Barrera', correo: 'cbarrera@datared.com.sv', pais: 'SV', rol: 'tecnico', activo: true },
  { id: 4, nombre: 'Lucia Conde', correo: 'lconde@datared.com.gt', pais: 'GT', rol: 'comercial', activo: true },
  { id: 5, nombre: 'Mario Ceron', correo: 'mceron@datared.com.sv', pais: 'SV', rol: 'soporte', activo: false },
  { id: 6, nombre: 'Karla Lopez', correo: 'klopez@datared.com.sv', pais: 'SV', rol: 'comercial', activo: true },
  { id: 7, nombre: 'Diego Delgado', correo: 'ddelgado@datared.com.sv', pais: 'SV', rol: 'tecnico', activo: true },
  { id: 8, nombre: 'Mabel Flores', correo: 'mflores@datared.com.gt', pais: 'GT', rol: 'comercial', activo: true },
];

const ROL_BADGE: Record<Usuario['rol'], { label: string; bg: string; text: string }> = {
  admin: { label: 'Admin', bg: 'bg-[#1F1D3D]', text: 'text-white' },
  comercial: { label: 'Comercial', bg: 'bg-[#0c6aa1]', text: 'text-white' },
  tecnico: { label: 'Técnico', bg: 'bg-[#7c3aed]', text: 'text-white' },
  soporte: { label: 'Soporte', bg: 'bg-[#f59e0b]', text: 'text-white' },
};

export default function UsuariosDataRedPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>(USUARIOS_INICIALES);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Usuario | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({ nombre: '', correo: '', pais: 'SV' as 'SV' | 'GT', rol: 'comercial' as Usuario['rol'], activo: true });
  const [createdCredentials, setCreatedCredentials] = useState<{ correo: string; password: string } | null>(null);
  const [copiedField, setCopiedField] = useState<'correo' | 'password' | null>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 600));
    setRefreshing(false);
  };

  const handleCreateUser = async () => {
    if (!newUser.nombre || !newUser.correo || !newUser.pais) return;
    setCreating(true);
    await new Promise((r) => setTimeout(r, 500));
    const generatedPassword = `DR${Math.random().toString(36).slice(-8).toUpperCase()}`;
    setCreatedCredentials({ correo: newUser.correo, password: generatedPassword });
    setUsuarios((prev) => [
      ...prev,
      {
        id: Math.max(...prev.map((u) => u.id), 0) + 1,
        nombre: newUser.nombre,
        correo: newUser.correo,
        pais: newUser.pais,
        rol: newUser.rol,
        activo: newUser.activo,
      },
    ]);
    setCreating(false);
  };

  const handleToggleActivo = (u: Usuario) => {
    setUsuarios((prev) => prev.map((x) => (x.id === u.id ? { ...x, activo: !x.activo } : x)));
  };

  const handleDeleteClick = (u: Usuario) => {
    setUserToDelete(u);
    setShowDeleteModal(true);
    setDeleteConfirmText('');
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmText !== 'ELIMINAR' || !userToDelete) return;
    setUsuarios((prev) => prev.filter((u) => u.id !== userToDelete.id));
    setShowDeleteModal(false);
    setUserToDelete(null);
    setDeleteConfirmText('');
  };

  const handleCopy = async (text: string, field: 'correo' | 'password') => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const filtered = useMemo(() => {
    if (!searchTerm) return usuarios;
    const q = searchTerm.toLowerCase();
    return usuarios.filter(
      (u) =>
        u.nombre.toLowerCase().includes(q) ||
        u.correo.toLowerCase().includes(q) ||
        u.pais.toLowerCase().includes(q) ||
        u.rol.toLowerCase().includes(q)
    );
  }, [usuarios, searchTerm]);

  const stats = useMemo(
    () => ({
      total: usuarios.length,
      activos: usuarios.filter((u) => u.activo).length,
      inactivos: usuarios.filter((u) => !u.activo).length,
    }),
    [usuarios]
  );

  const emptyFilters = {
    desde: '',
    hasta: '',
    pais: '',
    asesor: '',
    tipoLead: '',
    origen: '',
    tipoLlamada: '',
  };
  const handleChange = () => {};
  const handleFiltrar = () => {};
  const handleLimpiar = () => {};

  return (
    <Shell
      pageTitle="Usuarios DataRed"
      filters={emptyFilters}
      onFilterChange={handleChange}
      onFiltrar={handleFiltrar}
      onLimpiar={handleLimpiar}
      asesores={[]}
      connectionStatus="connected"
      showFilterBar={false}
    >
      <div className="space-y-6 max-w-7xl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1F1D3D]/5 flex items-center justify-center rounded-lg">
                <Users className="w-5 h-5 text-[#1F1D3D]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-medium text-[#1F1D3D]">
                  {stats.total} Usuarios
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                    {stats.activos} activos
                  </span>
                  <span className="text-xs text-[#35325B] bg-[#F5F5ED] px-2 py-0.5 rounded">
                    {stats.inactivos} inactivos
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B5B5AE]" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 pl-9 pr-3 w-48 rounded-lg border border-[#EEEEEC] bg-white text-sm text-[#1F1D3D] placeholder:text-[#B5B5AE] focus:outline-none focus:border-[#1F1D3D]"
              />
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-[#1F1D3D] hover:bg-[#35325B] text-white text-sm font-medium transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              Nuevo
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[#EEEEEC] bg-white text-[#35325B] hover:bg-[#F5F5ED] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
            </button>
          </div>
        </div>

        <div className="bg-white border border-[#EEEEEC] rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Nombre</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>País</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length > 0 ? (
                filtered.map((u) => {
                  const rol = ROL_BADGE[u.rol];
                  return (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#1F1D3D] rounded-full flex items-center justify-center">
                            <span className="text-[#F5F5ED] text-xs font-semibold">
                              {u.nombre[0].toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-[#1F1D3D]">
                            {u.nombre}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-[#B5B5AE]">{u.correo}</TableCell>
                      <TableCell>
                        <span className="text-xs bg-[#F5F5ED] text-[#35325B] px-2 py-1 rounded font-medium">
                          {u.pais}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'text-xs font-medium px-2 py-1 rounded',
                            rol.bg,
                            rol.text
                          )}
                        >
                          {rol.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'text-xs font-medium px-2 py-1 rounded',
                            u.activo
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          )}
                        >
                          {u.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleToggleActivo(u)}
                            className={cn(
                              'inline-flex items-center gap-1.5 px-2 h-7 rounded text-xs font-medium transition-colors',
                              u.activo
                                ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'
                                : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                            )}
                          >
                            <Power className="h-3 w-3" />
                            {u.activo ? 'Desactivar' : 'Activar'}
                          </button>
                          <button
                            onClick={() => handleDeleteClick(u)}
                            className="inline-flex items-center justify-center w-7 h-7 rounded text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-[#B5B5AE]">
                    Sin usuarios registrados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog
        open={showCreateModal}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateModal(false);
            setNewUser({ nombre: '', correo: '', pais: 'SV', rol: 'comercial', activo: true });
            setCreatedCredentials(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {createdCredentials ? 'Usuario Creado' : 'Nuevo Usuario'}
            </DialogTitle>
            <DialogDescription>
              {createdCredentials
                ? 'Estas son las credenciales del nuevo usuario. Guárdalas bien.'
                : 'Crea un perfil nuevo para un miembro del equipo DataRed.'}
            </DialogDescription>
          </DialogHeader>

          {createdCredentials ? (
            <div className="space-y-4 py-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-emerald-800">Correo</span>
                  <button
                    onClick={() => handleCopy(createdCredentials.correo, 'correo')}
                    className="text-emerald-600 hover:text-emerald-700 p-1"
                    title="Copiar"
                  >
                    {copiedField === 'correo' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-lg font-bold text-emerald-900">
                  {createdCredentials.correo}
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-amber-800">Contraseña</span>
                  <button
                    onClick={() => handleCopy(createdCredentials.password, 'password')}
                    className="text-amber-600 hover:text-amber-700 p-1"
                    title="Copiar"
                  >
                    {copiedField === 'password' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-lg font-bold text-amber-900 font-mono">
                  {createdCredentials.password}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#35325B]">
                  Nombre completo
                </label>
                <input
                  type="text"
                  placeholder="Ej: Juan Pérez"
                  value={newUser.nombre}
                  onChange={(e) =>
                    setNewUser((p) => ({ ...p, nombre: e.target.value }))
                  }
                  className="w-full h-10 px-4 rounded-lg border border-[#EEEEEC] bg-white text-sm text-[#1F1D3D] placeholder:text-[#B5B5AE] focus:outline-none focus:border-[#1F1D3D]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#35325B]">Correo</label>
                <input
                  type="email"
                  placeholder="correo@datared.com.sv"
                  value={newUser.correo}
                  onChange={(e) =>
                    setNewUser((p) => ({ ...p, correo: e.target.value }))
                  }
                  className="w-full h-10 px-4 rounded-lg border border-[#EEEEEC] bg-white text-sm text-[#1F1D3D] placeholder:text-[#B5B5AE] focus:outline-none focus:border-[#1F1D3D]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#35325B]">País</label>
                <select
                  className="h-10 w-full rounded-lg border border-[#EEEEEC] bg-white px-4 text-sm text-[#1F1D3D] focus:outline-none focus:border-[#1F1D3D]"
                  value={newUser.pais}
                  onChange={(e) =>
                    setNewUser((p) => ({
                      ...p,
                      pais: e.target.value as 'SV' | 'GT',
                    }))
                  }
                >
                  <option value="SV">El Salvador (SV)</option>
                  <option value="GT">Guatemala (GT)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#35325B]">Rol</label>
                <select
                  className="h-10 w-full rounded-lg border border-[#EEEEEC] bg-white px-4 text-sm text-[#1F1D3D] focus:outline-none focus:border-[#1F1D3D]"
                  value={newUser.rol}
                  onChange={(e) =>
                    setNewUser((p) => ({
                      ...p,
                      rol: e.target.value as Usuario['rol'],
                    }))
                  }
                >
                  <option value="comercial">Comercial</option>
                  <option value="tecnico">Técnico</option>
                  <option value="soporte">Soporte</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#35325B]">
                  Estado inicial
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={newUser.activo}
                      onChange={() =>
                        setNewUser((p) => ({ ...p, activo: true }))
                      }
                      className="w-4 h-4 text-[#1F1D3D]"
                    />
                    <span className="text-sm text-[#35325B]">Activo</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!newUser.activo}
                      onChange={() =>
                        setNewUser((p) => ({ ...p, activo: false }))
                      }
                      className="w-4 h-4 text-[#1F1D3D]"
                    />
                    <span className="text-sm text-[#35325B]">Inactivo</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {createdCredentials ? (
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreatedCredentials(null);
                  setNewUser({
                    nombre: '',
                    correo: '',
                    pais: 'SV',
                    rol: 'comercial',
                    activo: true,
                  });
                }}
                className="w-full h-10 px-4 rounded-lg bg-[#1F1D3D] hover:bg-[#35325B] text-white text-sm font-medium transition-colors"
              >
                Cerrar
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewUser({
                      nombre: '',
                      correo: '',
                      pais: 'SV',
                      rol: 'comercial',
                      activo: true,
                    });
                  }}
                  className="h-10 px-4 rounded-lg border border-[#EEEEEC] bg-white text-[#35325B] text-sm font-medium hover:bg-[#F5F5ED] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateUser}
                  disabled={
                    !newUser.nombre || !newUser.correo || !newUser.pais || creating
                  }
                  className="h-10 px-4 rounded-lg bg-[#1F1D3D] hover:bg-[#35325B] text-white text-sm font-medium transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {creating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Crear'
                  )}
                </button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar Usuario</DialogTitle>
            <DialogDescription>
              Se eliminará el perfil de <strong>{userToDelete?.nombre}</strong>.
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium text-[#35325B] block mb-2">
              Escribe <strong>ELIMINAR</strong> para confirmar
            </label>
            <input
              type="text"
              placeholder="ELIMINAR"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full h-10 px-4 rounded-lg border border-red-200 bg-white text-sm text-[#1F1D3D] placeholder:text-[#B5B5AE] focus:outline-none focus:border-red-400"
            />
          </div>
          <DialogFooter>
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteConfirmText('');
              }}
              className="h-10 px-4 rounded-lg border border-[#EEEEEC] bg-white text-[#35325B] text-sm font-medium hover:bg-[#F5F5ED] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={deleteConfirmText !== 'ELIMINAR'}
              className="h-10 px-4 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              Eliminar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
