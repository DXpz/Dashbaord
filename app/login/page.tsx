'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoginBackground } from '@/components/LoginBackground';
import { useAuth } from '@/lib/auth-context';

function LoginPageInner() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showBye, setShowBye] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    if (searchParams.get('bye') === '1') {
      setShowBye(true);
      // Limpiar el query param para que el banner no aparezca en recargas
      router.replace('/login');
      const timer = setTimeout(() => setShowBye(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login(email, password);
    if (result.ok) {
      if (result.mustChangePassword) {
        router.push('/change-password');
      } else {
        router.push('/');
      }
    } else {
      setError(result.error || 'Error al iniciar sesión');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EEEEEC]">
      <div className="absolute inset-0 overflow-hidden">
        <LoginBackground />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        <div className="flex items-center justify-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logos/prospektia-v2.png"
            alt="ProspektIA"
            width={360}
            height={91}
            className="object-contain"
          />
        </div>
        {showBye && (
          <div className="mb-4 bg-white/90 backdrop-blur-sm border border-[#EEEEEC] rounded-xl px-4 py-3 shadow-md flex items-center gap-3 animate-[slideDown_0.3s_ease-out]">
            <div className="w-8 h-8 rounded-full bg-[#1F1D3D] flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-[#1F1D3D]">¡Esperamos volverte a ver!</div>
              <div className="text-xs text-[#B5B5AE]">Cerraste sesión correctamente</div>
            </div>
          </div>
        )}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#EEEEEC] shadow-xl p-8">
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

              {error && (
                <div className="bg-red-50 text-red-600 text-xs px-3 py-2 rounded border border-red-200">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded border-[#EEEEEC] accent-[#1F1D3D]" />
                  <span className="text-[#35325B]">Recordarme</span>
                </label>
                <a href="/forgot-password" className="text-[#1F1D3D] hover:text-[#35325B] transition-colors">
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
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}