'use client';

import { SidebarContext } from '@/context/sidebar-context';
import React from 'react';

function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false);
  React.useEffect(() => {
    const m = window.matchMedia(query);
    const onChange = () => setMatches(m.matches);
    onChange();
    m.addEventListener('change', onChange);
    return () => m.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const isMobile = useMediaQuery('(max-width: 1023px)'); // < lg
  const [open, setOpen] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const raw = window.localStorage.getItem('hc:sidebar-open');
    return raw === null ? true : raw === 'true';
  });
  React.useEffect(() => {
    window.localStorage.setItem('hc:sidebar-open', String(open));
  }, [open]);

  const value = React.useMemo(
    () => ({ open, toggle: () => setOpen(o => !o), setOpen, isMobile }),
    [open, isMobile]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}
