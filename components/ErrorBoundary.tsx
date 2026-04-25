'use client';

import { Component, ReactNode, ErrorInfo } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: string) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info.componentStack || '');
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <DefaultErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

function DefaultErrorFallback({ error }: { error?: Error }) {
  return (
    <div className="min-h-screen bg-[#EEEEEC] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <WorkingAnimation />
        </div>
        <h1 className="text-xl font-semibold text-[#1F1D3D] mb-2">
          Hey, estamos trabajando para mejorar nuestro servicio
        </h1>
        <p className="text-sm text-[#B5B5AE] mb-4">
          Regresaremos pronto. Gracias por tu paciencia.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-sm bg-[#1F1D3D] text-[#F5F5ED] px-4 py-2 rounded-lg hover:bg-[#35325B] transition-colors"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}

function WorkingAnimation() {
  return (
    <div className="relative w-32 h-32 mx-auto">
      <div className="absolute inset-0 flex items-center justify-center">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute w-3 h-3 bg-[#B5B5AE] rounded-full"
            style={{
              animation: `orbit-${i} ${1.5 + i * 0.3}s linear infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
        <div className="w-10 h-10 rounded-full bg-[#1F1D3D] flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B5B5AE" strokeWidth="1.5">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </div>
      </div>
      <style>{`
        @keyframes orbit-0 {
          0% { transform: rotate(0deg) translateX(40px) rotate(0deg); opacity: 0.4; }
          50% { opacity: 1; }
          100% { transform: rotate(360deg) translateX(40px) rotate(-360deg); opacity: 0.4; }
        }
        @keyframes orbit-1 {
          0% { transform: rotate(120deg) translateX(40px) rotate(-120deg); opacity: 0.4; }
          50% { opacity: 1; }
          100% { transform: rotate(480deg) translateX(40px) rotate(-480deg); opacity: 0.4; }
        }
        @keyframes orbit-2 {
          0% { transform: rotate(240deg) translateX(40px) rotate(-240deg); opacity: 0.4; }
          50% { opacity: 1; }
          100% { transform: rotate(600deg) translateX(40px) rotate(-600deg); opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

export { DefaultErrorFallback, WorkingAnimation };