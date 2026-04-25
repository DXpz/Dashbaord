'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginBackground } from '@/components/LoginBackground';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      router.push('/');
    }, 800);
  };

  return (
    <div className="min-h-screen flex bg-[#EEEEEC]">
      <div className="absolute inset-0 overflow-hidden">
        <LoginBackground />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto flex items-center justify-center py-12 px-6">
        <div className="w-full max-w-sm">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#EEEEEC] shadow-xl p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-[#1F1D3D]">Iniciar sesión</h2>
              <p className="text-sm text-[#B5B5AE] mt-1">Accede a tu dashboard</p>
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

              <div className="space-y-1.5">
                <label htmlFor="password" className="text-xs font-medium text-[#35325B] uppercase tracking-wide">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-[#F5F5ED] border border-[#EEEEEC] rounded-lg text-sm text-[#1F1D3D] placeholder-[#B5B5AE] focus:outline-none focus:border-[#35325B] transition-colors"
                  required
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded border-[#EEEEEC] accent-[#1F1D3D]" />
                  <span className="text-[#35325B]">Recordarme</span>
                </label>
                <a href="#" className="text-[#1F1D3D] hover:text-[#35325B] transition-colors">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#1F1D3D] hover:bg-[#35325B] disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Ingresando...</span>
                  </>
                ) : (
                  <span>Entrar</span>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-[#EEEEEC] text-center">
              <p className="text-xs text-[#B5B5AE]">
                ¿No tienes cuenta?{' '}
                <a href="#" className="text-[#1F1D3D] hover:text-[#35325B] font-medium transition-colors">
                  Solicita acceso
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 hidden lg:flex lg:w-[65%] items-center justify-center p-20">
        <div className="max-w-3xl">
          <h1 className="leading-none mb-12 select-none">
            <span className="block text-[88px] font-bold text-[#1F1D3D] tracking-[-0.05em]">Conoce</span>
            <span className="block text-[88px] font-light text-[#1F1D3D] tracking-[-0.05em]">hoy tu</span>
            <span className="block text-[88px] font-semibold text-[#35325B] tracking-[-0.04em] uppercase mt-2">Asistente IA</span>
          </h1>

          <div className="ml-2 space-y-5">
            {[
              'Análisis predictivo de conversiones',
              'Seguimiento automático de reuniones',
              'Dashboard inteligente en tiempo real',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#1F1D3D]/10 flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1F1D3D" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="text-sm text-[#35325B]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}