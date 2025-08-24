'use client';

import React from 'react';

type SidebarContextValue = {
  open: boolean;
  toggle: () => void;
  setOpen: (next: boolean) => void;
  isMobile: boolean;
};

export const SidebarContext = React.createContext<SidebarContextValue | null>(
  null
);

export function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within <SidebarProvider>');
  return ctx;
}
