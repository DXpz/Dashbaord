'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffectiveUser } from '@/lib/role-context';
import { useEcosystem, EcosystemId } from '@/lib/ecosystem-context';
import { ECOSYSTEM_REGISTRY, getEcosystemsForRole, getEcosystemByRoute } from '@/lib/ecosystem-registry';
import { cn } from '@/lib/utils';

export function EcosystemSwitcher() {
  const { isSuperAdmin, isGestorCobros, user } = useEffectiveUser();
  const { ecosystem, setEcosystem } = useEcosystem();
  const router = useRouter();
  const pathname = usePathname();

  if (!isSuperAdmin && !isGestorCobros) return null;

  const role = user?.role || 'advisor';
  const allowed = getEcosystemsForRole(role, isSuperAdmin);
  const options = allowed.map((e) => e.id as EcosystemId);

  if (options.length < 2) return null;

  const handleSelect = (id: EcosystemId) => {
    if (id === ecosystem) return;
    setEcosystem(id);
    const config = ECOSYSTEM_REGISTRY[id];
    const target = config?.rootPrefix || '/';
    // Determinar el ecosistema actual por la URL (no por el state).
    // Esto evita el bug donde /datared/clientes.startsWith('') = true y nunca navega.
    const currentEcosystem = getEcosystemByRoute(pathname);
    if (currentEcosystem?.id === id) return;
    router.push(target || '/');
  };

  const indicatorWidth = `calc(${100 / options.length}% - ${4 / options.length}px)`;
  const activeIndex = Math.max(0, options.indexOf(ecosystem));
  const translateX = activeIndex <= 0
    ? '2px'
    : `calc(${activeIndex * 100}% + ${activeIndex}px)`;

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
              {ECOSYSTEM_REGISTRY[id]?.shortLabel || id}
            </button>
          );
        })}
        <span
          aria-hidden
          className={cn(
            'absolute top-1 bottom-1 rounded-md bg-[#1F1D3D] transition-transform duration-200 ease-out',
          )}
          style={{
            width: indicatorWidth,
            transform: `translateX(${translateX})`,
          }}
        />
      </div>
    </div>
  );
}