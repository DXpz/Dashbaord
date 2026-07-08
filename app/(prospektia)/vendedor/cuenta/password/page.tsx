'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';

export default function ChangePasswordPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || data.error || 'Error al cambiar contraseña');
        setLoading(false);
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        router.push(user?.role === 'advisor' ? '/vendedor' : '/');
      }, 2000);
    } catch {
      setError('No se pudo conectar al servidor');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EEEEEC]">
        <div className="bg-white rounded-2xl border border-[#EEEEEC] shadow-xl p-8 w-full max-w-sm mx-auto px-6 text-center">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
          </div>
          <h2 className="text-lg font-semibold text-[#1F1D3D]">Contraseña actualizada</h2>
          <p className="text-sm text-[#B5B5AE] mt-1">Redirigiendo al dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EEEEEC]">
      <div className="bg-white rounded-2xl border border-[#EEEEEC] shadow-xl p-8 w-full max-w-sm mx-auto px-6">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[#1F1D3D]/5 rounded-full flex items-center justify-center mx-auto mb-3">
            <Lock className="w-5 h-5 text-[#1F1D3D]" />
          </div>
          <h2 className="text-lg font-semibold text-[#1F1D3D]">Cambiar contraseña</h2>
          <p className="text-xs text-[#B5B5AE] mt-1">Ingresa tu contraseña temporal y crea una nueva</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#35325B] uppercase tracking-wide">
              Contraseña actual
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#F5F5ED] border border-[#EEEEEC] rounded-lg text-sm text-[#1F1D3D] placeholder-[#B5B5AE] focus:outline-none focus:border-[#35325B] transition-colors pr-10"
                placeholder="Contraseña temporal"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B5B5AE] hover:text-[#35325B]"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#35325B] uppercase tracking-wide">
              Nueva contraseña
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#F5F5ED] border border-[#EEEEEC] rounded-lg text-sm text-[#1F1D3D] placeholder-[#B5B5AE] focus:outline-none focus:border-[#35325B] transition-colors pr-10"
                placeholder="Mínimo 8 caracteres"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B5B5AE] hover:text-[#35325B]"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#35325B] uppercase tracking-wide">
              Confirmar nueva contraseña
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#F5F5ED] border border-[#EEEEEC] rounded-lg text-sm text-[#1F1D3D] placeholder-[#B5B5AE] focus:outline-none focus:border-[#35325B] transition-colors"
              placeholder="Repite la nueva contraseña"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-xs px-3 py-2 rounded border border-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#1F1D3D] hover:bg-[#35325B] disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <span>Actualizar contraseña</span>
            )}
          </button>

          <button
            type="button"
            onClick={logout}
            className="w-full py-2 text-sm text-[#B5B5AE] hover:text-[#35325B] transition-colors"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );
}