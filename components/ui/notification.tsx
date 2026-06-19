'use client';

import { useState, createContext, useContext, useCallback, ReactNode, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, X, Loader2 } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'loading' | null;

interface NotificationState {
  type: NotificationType;
  message: string;
  title?: string;
  persistent?: boolean;
}

interface NotificationContextType {
  notification: NotificationState | null;
  showSuccess: (message: string) => void;
  showError: (message: string, options?: { title?: string; persistent?: boolean }) => void;
  showLoading: (message: string) => void;
  clearNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);

  const clearTimer = useCallback(() => {
    if (timerId) {
      clearTimeout(timerId);
      setTimerId(null);
    }
  }, [timerId]);

  const showSuccess = useCallback((message: string) => {
    clearTimer();
    setNotification({ type: 'success', message });
    const id = setTimeout(() => setNotification(null), 3000);
    setTimerId(id);
  }, [clearTimer]);

  const showError = useCallback((message: string, options?: { title?: string; persistent?: boolean }) => {
    clearTimer();
    setNotification({
      type: 'error',
      message,
      title: options?.title || 'Error',
      persistent: options?.persistent,
    });
    // Errores duran 8s para dar tiempo a leerlos
    if (!options?.persistent) {
      const id = setTimeout(() => setNotification(null), 8000);
      setTimerId(id);
    }
  }, [clearTimer]);

  const showLoading = useCallback((message: string) => {
    clearTimer();
    setNotification({ type: 'loading', message });
  }, [clearTimer]);

  const clearNotification = useCallback(() => {
    clearTimer();
    setNotification(null);
  }, [clearTimer]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return (
    <NotificationContext.Provider value={{ notification, showSuccess, showError, showLoading, clearNotification }}>
      {children}
      <NotificationBar notification={notification} onClose={clearNotification} />
    </NotificationContext.Provider>
  );
}

function NotificationBar({
  notification,
  onClose,
}: {
  notification: NotificationState | null;
  onClose: () => void;
}) {
  if (!notification) return null;

  // Success: toast pequeño abajo, estilo del sistema
  if (notification.type === 'success') {
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-slide-up">
        <div className="flex items-center gap-3 px-5 py-3 bg-white border border-[#EEEEEC] rounded-xl shadow-lg">
          <CheckCircle className="h-5 w-5 text-[#22c55e] shrink-0" />
          <p className="text-sm font-medium text-[#1F1D3D]">{notification.message}</p>
        </div>
      </div>
    );
  }

  // Loading: toast pequeño abajo
  if (notification.type === 'loading') {
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100]">
        <div className="flex items-center gap-3 px-5 py-3 bg-[#1F1D3D] text-white rounded-xl shadow-lg">
          <Loader2 className="h-5 w-5 animate-spin shrink-0" />
          <p className="text-sm font-medium">{notification.message}</p>
        </div>
      </div>
    );
  }

  // Error: tarjeta más prominente, arriba al centro, estilo consistente con el sistema
  // (bg-white, border-[#EEEEEC], rounded-xl, colores brand)
  if (notification.type === 'error') {
    return (
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-slide-down max-w-lg w-full mx-4">
        <div className="bg-white border border-[#EEEEEC] rounded-xl shadow-lg overflow-hidden">
          <div className="flex items-start gap-3 px-5 py-4">
            <div className="w-10 h-10 rounded-lg bg-[#F5F5ED] flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-[#c8151b]" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-[#1F1D3D] mb-0.5">
                {notification.title || 'Error'}
              </h4>
              <p className="text-sm text-[#35325B] leading-relaxed">
                {notification.message}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-[#F5F5ED] rounded transition-colors shrink-0"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4 text-[#B5B5AE]" />
            </button>
          </div>
          <div className="h-1 bg-[#c8151b]" />
        </div>
      </div>
    );
  }

  return null;
}
