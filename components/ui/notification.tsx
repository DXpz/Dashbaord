'use client';

import { useState, createContext, useContext, useCallback, ReactNode, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'loading' | null;

interface NotificationState {
  type: NotificationType;
  message: string;
}

interface NotificationContextType {
  notification: NotificationState | null;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
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

  const showSuccess = useCallback((message: string) => {
    setNotification({ type: 'success', message });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const showError = useCallback((message: string) => {
    setNotification({ type: 'error', message });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  const showLoading = useCallback((message: string) => {
    setNotification({ type: 'loading', message });
  }, []);

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return (
    <NotificationContext.Provider value={{ notification, showSuccess, showError, showLoading, clearNotification }}>
      {children}
      <NotificationBar notification={notification} />
    </NotificationContext.Provider>
  );
}

function NotificationBar({ notification }: { notification: NotificationState | null }) {
  if (!notification) return null;

  const styles = {
    success: 'bg-[#22c55e] text-white',
    error: 'bg-[#c8151b] text-white',
    loading: 'bg-[#1F1D3D] text-white',
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-slide-up">
      <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg ${styles[notification.type!]}`}>
        {notification.type === 'success' && <CheckCircle className="h-5 w-5" />}
        {notification.type === 'error' && <XCircle className="h-5 w-5" />}
        {notification.type === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
        <p className="text-sm font-medium">{notification.message}</p>
      </div>
    </div>
  );
}