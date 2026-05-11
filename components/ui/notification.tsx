'use client';

import { useState, createContext, useContext, useCallback, ReactNode } from 'react';
import { CheckCircle, XCircle, Loader2, ChevronRight } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'loading' | null;

interface NotificationState {
  type: NotificationType;
  message: string;
  targetId?: string;
}

interface NotificationContextType {
  notification: NotificationState | null;
  showSuccess: (message: string, targetId?: string) => void;
  showError: (message: string, targetId?: string) => void;
  showLoading: (message: string, targetId?: string) => void;
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

  const showSuccess = useCallback((message: string, targetId?: string) => {
    setNotification({ type: 'success', message, targetId });
    setTimeout(() => setNotification(null), 2500);
  }, []);

  const showError = useCallback((message: string, targetId?: string) => {
    setNotification({ type: 'error', message, targetId });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const showLoading = useCallback((message: string, targetId?: string) => {
    setNotification({ type: 'loading', message, targetId });
  }, []);

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return (
    <NotificationContext.Provider value={{ notification, showSuccess, showError, showLoading, clearNotification }}>
      {children}
      <NotificationDisplay />
    </NotificationContext.Provider>
  );
}

function NotificationDisplay() {
  const { notification } = useNotification();
  if (!notification) return null;

  const icons = {
    success: <CheckCircle className="h-5 w-5" />,
    error: <XCircle className="h-5 w-5" />,
    loading: <Loader2 className="h-5 w-5 animate-spin" />,
  };

  const styles = {
    success: 'bg-[#22c55e]/10 border-[#22c55e] text-[#22c55e]',
    error: 'bg-[#c8151b]/10 border-[#c8151b] text-[#c8151b]',
    loading: 'bg-[#35325B]/10 border-[#35325B] text-[#35325B]',
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-slide-up">
      <div className={`
        flex items-center gap-3 px-4 py-3 rounded-xl border-l-4 shadow-lg
        bg-white/95 backdrop-blur-sm
        ${notification.type === 'success' ? 'border-l-[#22c55e] animate-success-pulse' : ''}
        ${notification.type === 'error' ? 'border-l-[#c8151b] animate-error-shake' : ''}
        ${notification.type === 'loading' ? 'border-l-[#35325B]' : ''}
      `}>
        <span className={styles[notification.type!]}>
          {icons[notification.type!]}
        </span>
        <p className="text-sm font-medium text-[#1F1D3D]">{notification.message}</p>
        {notification.type === 'loading' && (
          <ChevronRight className="h-4 w-4 text-[#B5B5AE] animate-pulse" />
        )}
      </div>
    </div>
  );
}

export function useAnimatedAction<T extends (...args: any[]) => Promise<any>>(
  action: T,
  onSuccess?: (result: Awaited<ReturnType<T>>) => void,
  onError?: (error: any) => void
) {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { showSuccess, showError } = useNotification();

  const execute = useCallback(async (...args: Parameters<T>) => {
    setState('loading');
    try {
      const result = await action(...args);
      setState('success');
      setTimeout(() => setState('idle'), 2000);
      showSuccess('Operación exitosa');
      onSuccess?.(result);
      return result;
    } catch (error: any) {
      setState('error');
      setTimeout(() => setState('idle'), 2000);
      const message = error?.message || 'Error en la operación';
      showError(message);
      onError?.(error);
      throw error;
    }
  }, [action, onSuccess, onError, showSuccess, showError]);

  return { execute, state };
}

interface AnimatedButtonProps {
  children: ReactNode;
  onClick: () => Promise<void>;
  variant?: 'default' | 'success' | 'danger';
  disabled?: boolean;
  className?: string;
}

export function AnimatedButton({ children, onClick, variant = 'default', disabled, className = '' }: AnimatedButtonProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleClick = async () => {
    if (state !== 'idle' || disabled) return;
    setState('loading');
    try {
      await onClick();
      setState('success');
      setTimeout(() => setState('idle'), 2000);
    } catch {
      setState('error');
      setTimeout(() => setState('idle'), 2000);
    }
  };

  const baseStyles = 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200';
  
  const variantStyles = {
    default: state === 'success' 
      ? 'bg-[#22c55e] text-white' 
      : state === 'error' 
        ? 'bg-[#c8151b] text-white' 
        : state === 'loading'
          ? 'bg-[#B5B5AE] text-white cursor-wait'
          : 'bg-[#1F1D3D] text-white hover:bg-[#35325B] active:scale-95',
    success: state === 'success'
      ? 'bg-[#22c55e] text-white'
      : state === 'error'
        ? 'bg-[#c8151b] text-white'
        : state === 'loading'
          ? 'bg-[#22c55e]/70 text-white cursor-wait'
          : 'bg-[#22c55e] text-white hover:bg-[#16a34a] active:scale-95',
    danger: state === 'success'
      ? 'bg-[#22c55e] text-white'
      : state === 'error'
        ? 'bg-[#c8151b] text-white'
        : state === 'loading'
          ? 'bg-[#c8151b]/70 text-white cursor-wait'
          : 'bg-[#c8151b] text-white hover:bg-[#a50f0f] active:scale-95',
  };

  const icons = {
    loading: <Loader2 className="h-4 w-4 animate-spin" />,
    success: <CheckCircle className="h-4 w-4 animate-scale-in" />,
    error: <XCircle className="h-4 w-4 animate-scale-in" />,
    idle: null,
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || state !== 'idle'}
      className={`${baseStyles} ${variantStyles[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {icons[state]}
      <span className={state === 'loading' ? 'animate-pulse' : ''}>
        {children}
      </span>
    </button>
  );
}

interface LeadCardAnimationProps {
  children: ReactNode;
  leadId: string;
  animationType: 'success' | 'error' | null;
}

export function LeadCardAnimation({ children, leadId, animationType }: LeadCardAnimationProps) {
  if (!animationType) return <>{children}</>;

  return (
    <div className={`
      relative overflow-hidden rounded-xl
      ${animationType === 'success' ? 'animate-success-glow' : ''}
      ${animationType === 'error' ? 'animate-error-shake' : ''}
    `}>
      {children}
      {animationType === 'success' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[#22c55e]/5 animate-success-fade" />
        </div>
      )}
    </div>
  );
}