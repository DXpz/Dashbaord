'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, XCircle, Loader2, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'loading' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);

    if (type !== 'loading') {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 3000);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-[#22c55e]" />,
    error: <XCircle className="h-5 w-5 text-[#c8151b]" />,
    loading: <Loader2 className="h-5 w-5 animate-spin text-[#35325B]" />,
    info: <Info className="h-5 w-5 text-[#35325B]" />,
  };

  const styles = {
    success: 'border-l-4 border-[#22c55e]',
    error: 'border-l-4 border-[#c8151b]',
    loading: 'border-l-4 border-[#35325B]',
    info: 'border-l-4 border-[#35325B]',
  };

  return (
    <div
      className={`
        pointer-events-auto
        bg-white rounded-lg shadow-lg border border-[#EEEEEC]
        px-4 py-3 flex items-center gap-3
        min-w-[280px] max-w-[360px]
        animate-slide-in
        ${styles[toast.type]}
      `}
    >
      {icons[toast.type]}
      <p className="text-sm text-[#1F1D3D] flex-1">{toast.message}</p>
      {toast.type !== 'loading' && (
        <button
          onClick={() => onRemove(toast.id)}
          className="text-[#B5B5AE] hover:text-[#35325B] transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export const toast = {
  success: (message: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toast', { detail: { message, type: 'success' } }));
    }
  },
  error: (message: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toast', { detail: { message, type: 'error' } }));
    }
  },
  loading: (message: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toast', { detail: { message, type: 'loading' } }));
    }
  },
  info: (message: string) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toast', { detail: { message, type: 'info' } }));
    }
  },
};