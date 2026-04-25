'use client';

import { VoiceAgentButton } from './VoiceAgentButton';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <VoiceAgentButton />
    </>
  );
}