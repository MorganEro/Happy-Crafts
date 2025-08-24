'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import * as React from 'react';
import SidebarInner from './SidebarInner';
import { useSidebar } from '@/context/sidebar-context';

export default function Sidebar() {
  const { open, setOpen, isMobile } = useSidebar();

  // Mobile: render as a Sheet drawer
  if (isMobile) {
    return (
      <Sheet
        open={open}
        onOpenChange={setOpen}>
        <SheetContent
          side="left"
          className="p-0 w-72 bg-hc-offwhite text-hc-asphalt"
          aria-describedby={undefined}>
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <SidebarInner />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop static rail
  return (
    <aside
      className={[
        'group/sidebar sticky top-0 h-svh border-r border backdrop-blur bg-sidebar',
        'transition-[width] duration-200 ease-in-out shrink-0',
        open ? 'w-72' : 'w-[4.25rem]',
      ].join(' ')}
      aria-label="Sidebar navigation">
      <SidebarInner />
    </aside>
  );
}
