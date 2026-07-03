'use client';

import AuthProvider from '@/lib/auth-context';
import { EcosystemProvider } from '@/lib/ecosystem-context';
import { NotificationProvider } from '@/components/ui/notification';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <EcosystemProvider>
        <NotificationProvider>{children}</NotificationProvider>
      </EcosystemProvider>
    </AuthProvider>
  );
}