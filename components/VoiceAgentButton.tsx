'use client';

import { ConversationProvider, useConversation } from '@elevenlabs/react';
import { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

function VoiceAgentButtonInner() {
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || '';
  const conversation = useConversation();
  const { status, startSession, endSession, isMuted, setMuted } = conversation;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (agentId) setIsVisible(true);
  }, [agentId]);

  const toggleMute = useCallback(() => {
    setMuted(!isMuted);
  }, [isMuted, setMuted]);

  const handleClick = useCallback(async () => {
    if (!agentId) return;
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

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {status === 'connected' && (
        <button
          onClick={toggleMute}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
            'bg-white border border-[#EEEEEC] shadow-md',
            isMuted
              ? 'text-red-600 bg-red-50 hover:bg-red-100'
              : 'text-green-600 bg-green-50 hover:bg-green-100'
          )}
        >
          {isMuted ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
              <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          )}
          {isMuted ? 'Silenciado' : 'Escuchando'}
        </button>
      )}

      <button
        onClick={handleClick}
        className={cn(
          'w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200',
          'shadow-lg hover:scale-105 active:scale-95',
          status === 'connected'
            ? 'bg-green-600 hover:bg-green-700'
            : status === 'connecting'
            ? 'bg-[#35325B] animate-pulse'
            : 'bg-[#1F1D3D] hover:bg-[#35325B]',
        )}
        title={status === 'connected' ? 'Terminar' : 'Asistente de voz'}
      >
        {status === 'connecting' ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : status === 'connected' ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
            <line x1="8" x2="16" y1="19" y2="22" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B5B5AE" strokeWidth="1.5">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
            <line x1="8" x2="16" y1="19" y2="22" />
          </svg>
        )}
      </button>
    </div>
  );
}

export function VoiceAgentProvider({ children }: { children: React.ReactNode }) {
  return <ConversationProvider>{children}</ConversationProvider>;
}

export function VoiceAgentButton() {
  return <VoiceAgentButtonInner />;
}