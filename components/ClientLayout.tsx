'use client';

import AuthProvider from '@/lib/auth-context';
import { NotificationProvider } from '@/components/ui/notification';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NotificationProvider>{children}</NotificationProvider>
    </AuthProvider>
  );
}