'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginBackground } from '@/components/LoginBackground';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || data.error || 'Error al solicitar recuperación');
        setLoading(false);
        return;
      }
      setSent(true);
    } catch {
      setError('No se pudo conectar al servidor');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EEEEEC]">
      <div className="absolute inset-0 overflow-hidden">
        <LoginBackground />
      </div>

      <div className="relative z-10 w-full max-w-sm mx-auto px-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#EEEEEC] shadow-xl p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-[#1F1D3D]">Correo enviado</h2>
              <p className="text-sm text-[#35325B]">Si el correo existe en el sistema, recibirás una contraseña temporal.</p>
              <a href="/login" className="block text-sm text-[#1F1D3D] hover:text-[#35325B] font-medium">
                Volver al login
              </a>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-[#1F1D3D]">Recuperar contraseña</h2>
                <p className="text-xs text-[#B5B5AE] mt-1">Ingresa tu correo y te enviaremos una contraseña temporal</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-medium text-[#35325B] uppercase tracking-wide">
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="w-full px-4 py-2.5 bg-[#F5F5ED] border border-[#EEEEEC] rounded-lg text-sm text-[#1F1D3D] placeholder-[#B5B5AE] focus:outline-none focus:border-[#35325B] transition-colors"
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
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <span>Enviar contraseña temporal</span>
                  )}
                </button>

                <a href="/login" className="block text-center text-xs text-[#1F1D3D] hover:text-[#35325B]">
                  Volver al login
                </a>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}