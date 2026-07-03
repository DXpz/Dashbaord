'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useEcosystem, EcosystemId, ECOSYSTEMS } from '@/lib/ecosystem-context';
import { cn } from '@/lib/utils';

export function EcosystemSwitcher() {
  const { user } = useAuth();
  const { ecosystem, setEcosystem } = useEcosystem();
  const router = useRouter();
  const pathname = usePathname();

  if (!user?.is_super_admin) return null;

  const options: EcosystemId[] = ['prospektia', 'datared'];

  const handleSelect = (id: EcosystemId) => {
    if (id === ecosystem) return;
    setEcosystem(id);
    if (id === 'datared' && !pathname.startsWith('/datared')) {
      router.push('/datared');
    } else if (id === 'prospektia' && pathname.startsWith('/datared')) {
      router.push('/');
    }
  };

  return (
    <div className="mx-2 mb-4">
      <div
        role="tablist"
        aria-label="Cambiar ecosistema"
        className="relative flex items-center bg-[#EEEEEC] rounded-lg p-1 border border-[#EEEEEC]"
      >
        {options.map((id) => {
          const isActive = ecosystem === id;
          return (
            <button
              key={id}
              role="tab"
              aria-selected={isActive}
              onClick={() => handleSelect(id)}
              className={cn(
                'flex-1 relative z-10 px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1F1D3D]/40',
                isActive
                  ? 'text-white'
                  : 'text-[#35325B] hover:text-[#1F1D3D]'
              )}
            >
              {ECOSYSTEMS[id].shortLabel}
            </button>
          );
        })}
        <span
          aria-hidden
          className={cn(
            'absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-md bg-[#1F1D3D]',
            'transition-transform duration-200 ease-out',
            ecosystem === 'prospektia'
              ? 'translate-x-[4px]'
              : 'translate-x-[calc(100%+0px)]'
          )}
        />
      </div>
    </div>
  );
}
