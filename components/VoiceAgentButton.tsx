'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { ConversationProvider } from '@elevenlabs/react';

const BUBBLE_MESSAGES = [
  '¿Necesitas ayuda en algo?',
  '¿En qué puedo ayudarte hoy?',
  '¿Tienes alguna duda?',
  '¿Necesitas assistance?',
];

const BUBBLE_INTERVAL_MS = 45000;

const VoiceAgentInner = dynamic(() => import('./VoiceAgentInner'), { ssr: false });

export function VoiceAgentProvider({ children }: { children: React.ReactNode }) {
  return <ConversationProvider>{children}</ConversationProvider>;
}

export function VoiceAgentButton() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <ConversationProvider>
      <VoiceAgentInner />
    </ConversationProvider>
  );
}