'use client';

import { ConversationProvider, useConversation } from '@elevenlabs/react';
import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export function VoiceAgentProvider({ children }: { children: React.ReactNode }) {
  return <ConversationProvider>{children}</ConversationProvider>;
}

export function VoiceAgentButton() {
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
  const conversation = useConversation();
  const { status, startSession, endSession } = conversation;
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleVisible, setBubbleVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowBubble(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showBubble) {
      const t = setTimeout(() => setBubbleVisible(true), 50);
      return () => clearTimeout(t);
    }
  }, [showBubble]);

  useEffect(() => {
    if (status === 'connected') {
      setShowBubble(false);
      setBubbleVisible(false);
    }
  }, [status]);

  const handleClick = useCallback(async () => {
    if (status === 'connected' || status === 'connecting') {
      await endSession();
    } else {
      setShowBubble(false);
      setBubbleVisible(false);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
        await startSession({ agentId });
      } catch (err) {
        console.error('Error al iniciar:', err);
      }
    }
  }, [agentId, status, startSession, endSession]);

  const dismissBubble = () => {
    setBubbleVisible(false);
    setTimeout(() => setShowBubble(false), 300);
  };

  return (
    <>
      {showBubble && (
        <div
          className={cn(
            'fixed bottom-8 right-24 z-[9998] max-w-xs transition-all duration-300',
            bubbleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          )}
        >
          <div className="bg-white border border-[#EEEEEC] shadow-xl rounded-2xl p-4 relative">
            <button
              onClick={dismissBubble}
              className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-[#B5B5AE] hover:text-[#35325B] rounded-full hover:bg-[#EEEEEC] transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#1F1D3D] flex items-center justify-center flex-shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B5B5AE" strokeWidth="1.5">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
                </svg>
              </div>
              <p className="text-sm text-[#35325B] leading-relaxed pr-6">
                Hola, soy tu asistente virtual. Si necesitas ayuda, no dudes en consultarme.
              </p>
            </div>
          </div>
          <div className="absolute bottom-3 right-[-8px] w-4 h-4 bg-white border-r border-b border-[#EEEEEC] rotate-45" />
        </div>
      )}

      <button
        onClick={handleClick}
        className={cn(
          'fixed bottom-8 right-8 z-[9999] w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200',
          'shadow-lg hover:shadow-xl hover:scale-105 active:scale-95',
          status === 'connected'
            ? 'bg-green-600 hover:bg-green-700'
            : status === 'connecting'
            ? 'bg-[#35325B] animate-pulse'
            : 'bg-[#1F1D3D] hover:bg-[#35325B]',
        )}
      >
        {status === 'connecting' ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#B5B5AE" strokeWidth="1.5">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
          </svg>
        )}
      </button>
    </>
  );
}