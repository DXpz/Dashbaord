import type { Metadata } from 'next';
import './globals.css';
import { VoiceAgentButton } from '@/components/VoiceAgentButton';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Métricas y Análisis de Ventas',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}