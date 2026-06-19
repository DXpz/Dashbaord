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
  showSuccess: (message: string, options?: { title?: string }) => void;
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

  const showSuccess = useCallback((message: string, options?: { title?: string }) => {
    clearTimer();
    setNotification({
      type: 'success',
      message,
      title: options?.title || 'Éxito',
    });
    const id = setTimeout(() => setNotification(null), 4000);
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
    if (!options?.persistent) {
      const id = setTimeout(() => setNotification(null), 8000);
      setTimerId(id);
    }
  }, [clearTimer]);

  const showLoading = useCallback((message: string) => {
    clearTimer();
    setNotification({ type: 'loading', message, title: 'Procesando' });
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

  // Mismo estilo de card para TODOS los tipos
  // (bg-white, border-[#EEEEEC], rounded-xl, icon en bg-[#F5F5ED], colores brand)
  const iconMap = {
    success: { Icon: CheckCircle, color: 'text-[#22c55e]' },
    error: { Icon: AlertTriangle, color: 'text-[#c8151b]' },
    loading: { Icon: Loader2, color: 'text-[#1F1D3D] animate-spin' },
  };
  const { Icon, color } = iconMap[notification.type!];

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-slide-down max-w-lg w-full mx-4">
      <div className="bg-white border border-[#EEEEEC] rounded-xl shadow-lg">
        <div className="flex items-start gap-3 px-5 py-4">
          <div className="w-10 h-10 rounded-lg bg-[#F5F5ED] flex items-center justify-center shrink-0">
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-[#1F1D3D] mb-0.5">
              {notification.title}
            </h4>
            <p className="text-sm text-[#35325B] leading-relaxed">
              {notification.message}
            </p>
          </div>
          {notification.type !== 'loading' && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-[#F5F5ED] rounded transition-colors shrink-0"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4 text-[#B5B5AE]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
