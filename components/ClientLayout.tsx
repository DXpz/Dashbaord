'use client';

import AuthProvider from '@/lib/auth-context';
import { NotificationProvider } from '@/components/ui/notification';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <AuthProvider>{children}</AuthProvider>
    </NotificationProvider>
  );
}