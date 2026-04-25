'use client';

import { ConversationProvider, useConversation } from '@elevenlabs/react';
import { useCallback } from 'react';
import { cn } from '@/lib/utils';

export function VoiceAgentProvider({ children }: { children: React.ReactNode }) {
  return <ConversationProvider>{children}</ConversationProvider>;
}

export function VoiceAgentButton() {
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
  const conversation = useConversation();
  const { status, startSession, endSession, setMuted, isMuted } = conversation;

  const handleClick = useCallback(async () => {
    if (status === 'connected' || status === 'connecting') {
      await endSession();
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
        await startSession({ agentId });
      } catch (err) {
        console.error('Error al iniciar:', err);
      }
    }
  }, [agentId, status, startSession, endSession]);

  return (
    <button
      onClick={handleClick}
      className={cn(
        'fixed bottom-8 right-8 z-[9999] w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200',
        'shadow-xl hover:scale-110 active:scale-95',
        status === 'connected'
          ? 'bg-green-600 hover:bg-green-700'
          : status === 'connecting'
          ? 'bg-[#35325B] animate-pulse'
          : 'bg-[#1F1D3D] hover:bg-[#35325B]',
      )}
    >
      {status === 'connecting' ? (
        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={status === 'connected' ? 'white' : '#B5B5AE'} strokeWidth="1.5">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" x2="12" y1="19" y2="22" />
          <line x1="8" x2="16" y1="19" y2="22" />
        </svg>
      )}
    </button>
  );
}