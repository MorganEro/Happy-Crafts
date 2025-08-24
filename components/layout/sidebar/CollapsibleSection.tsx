// components/sidebar/CollapsibleSection.tsx
'use client';

import { useId, useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import NavItem from '@/components/layout/navItems/NavItem';
import { useSidebar } from '@/context/sidebar-context';
import { ChevronDown } from 'lucide-react';

type Item = { href: string; label: string };

type Props = {
  icon: React.ReactNode;
  title: string;
  items: Item[];
  /** Initial expanded state on first render (uncontrolled) */
  defaultOpen?: boolean;
};

export default function CollapsibleSection({
  icon,
  title,
  items,
  defaultOpen = false,
}: Props) {
  const { open: sidebarOpen } = useSidebar();
  const [expanded, setExpanded] = useState<boolean>(defaultOpen);
  const panelId = useId();

  return (
    <Collapsible
      open={expanded}
      onOpenChange={setExpanded}>
      <div className="flex items-center px-2">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-hc-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hc-blue-600"
            aria-expanded={expanded}
            aria-controls={panelId}>
            <span
              aria-hidden
              className="shrink-0 opacity-90">
              {icon}
            </span>
            <span className={sidebarOpen ? 'truncate' : 'sr-only'}>
              {title}
            </span>

            {sidebarOpen && (
              <span className="ml-auto inline-flex items-center">
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    expanded ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </span>
            )}
          </button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent id={panelId}>
        <ul className="mt-1 space-y-1 px-2 capitalize ms-8 ">
          {items.map(it => {
            // ensure absolute path
            const href = it.href.startsWith('/') ? it.href : `/${it.href}`;

            return (
              <li
                key={`${href}-${it.label}`}
                className="w-[75%]">
                <NavItem
                  href={href}
                  icon={
                    <span className="h-1.5 w-1.5 rounded-full bg-hc-blue-400" />
                  }
                  label={it.label}
                  // robust active check (handles nested routes too)
                  activeWhen={path =>
                    path === href || path.startsWith(href + '/')
                  }
                />
              </li>
            );
          })}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}
