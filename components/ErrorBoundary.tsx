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
      <div className="text-center max-w-sm animate-[fadeIn_0.5s_ease-out]">
        <div className="mb-8">
          <WorkingAnimation />
        </div>
        <div className="space-y-3">
          <div className="w-12 h-1 bg-[#1F1D3D]/10 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-[#1F1D3D]/40 rounded-full animate-[slide_1.5s_ease-in-out_infinite]" style={{ width: '40%' }} />
          </div>
          <h1 className="text-lg font-semibold text-[#1F1D3D]">
            Mantenimiento en proceso
          </h1>
          <p className="text-sm text-[#B5B5AE] leading-relaxed">
            Estamos realizando mejoras para servirte mejor.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 text-sm bg-[#1F1D3D] text-[#F5F5ED] px-6 py-2.5 rounded-lg hover:bg-[#35325B] transition-colors"
        >
          Reintentar
        </button>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(150%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}

function WorkingAnimation() {
  return (
    <div className="relative w-28 h-28 mx-auto">
      <div className="absolute inset-0 rounded-full border-2 border-[#1F1D3D]/10" />
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#1F1D3D] animate-spin" style={{ animationDuration: '1.2s' }} />
      <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-[#35325B]/40 animate-spin" style={{ animationDuration: '0.8s', animationDirection: 'reverse' }} />
      <div className="absolute inset-4 rounded-full bg-[#1F1D3D]/5 flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-[#1F1D3D]/30 animate-pulse" />
      </div>
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.5); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}

export { DefaultErrorFallback, WorkingAnimation };