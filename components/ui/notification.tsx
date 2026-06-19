'use client';

import { useState, createContext, useContext, useCallback, ReactNode, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, X, AlertTriangle } from 'lucide-react';

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
      title: options?.title || 'Error de validación',
      persistent: options?.persistent,
    });
    // Errores se muestran por más tiempo (8s) o son persistentes
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

  // Cleanup on unmount
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

  // Renderizar errores con estilo más prominente (modal-style)
  if (notification.type === 'error') {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto bg-white border-2 border-[#c8151b] rounded-2xl shadow-2xl max-w-2xl w-full mx-4 animate-error-shake">
          <div className="bg-[#c8151b] text-white px-6 py-4 rounded-t-2xl flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-bold">{notification.title || 'Error de validación'}</h3>
              <p className="text-xs opacity-90">Revisa los datos antes de continuar</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="px-6 py-5">
            <p className="text-sm text-[#1F1D3D] leading-relaxed whitespace-pre-wrap">
              {notification.message}
            </p>
            {notification.persistent && (
              <p className="text-xs text-[#B5B5AE] mt-3">
                Haz clic en la X para cerrar este mensaje.
              </p>
            )}
            {!notification.persistent && (
              <p className="text-xs text-[#B5B5AE] mt-3">
                Este mensaje se cerrará automáticamente en 8 segundos.
              </p>
            )}
          </div>
          <div className="px-6 py-3 bg-[#F5F5ED] rounded-b-2xl flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#1F1D3D] text-white text-sm font-medium rounded-lg hover:bg-[#2d2a4a] transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success y loading: toast pequeño abajo
  const styles = {
    success: 'bg-[#22c55e] text-white',
    loading: 'bg-[#1F1D3D] text-white',
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-slide-up">
      <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg ${styles[notification.type!]}`}>
        {notification.type === 'success' && <CheckCircle className="h-5 w-5" />}
        {notification.type === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
        <p className="text-sm font-medium">{notification.message}</p>
      </div>
    </div>
  );
}
