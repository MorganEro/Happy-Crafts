// components/product/FilterRail.tsx
'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import * as React from 'react';

type FilterRailProps = {
  /** The URL query key to set, e.g. "tag" or "category" */
  paramKey: 'tag' | 'category';
  /** List of chip values to render */
  items: readonly string[];
  /** Which value is currently active (from server) */
  activeValue?: string;
  /** Preserve these other query params when changing this one */
  otherParams?: Partial<Record<'tag' | 'category', string>>;
};

export function FilterRail({
  paramKey,
  items,
  activeValue = '',
  otherParams = {},
}: FilterRailProps) {
  const sp = useSearchParams();

  const buildHref = (val: string) => {
    const params = new URLSearchParams(sp.toString());
    // apply other preserved params
    if (otherParams.category !== undefined)
      params.set('category', otherParams.category);
    if (otherParams.tag !== undefined) params.set('tag', otherParams.tag);

    if (val && val !== activeValue) {
      params.set(paramKey, val);
    } else {
      params.delete(paramKey); // toggle off
    }
    const qs = params.toString();
    return qs ? `/products?${qs}` : '/products';
  };

  return (
    <div className="relative mb-2">
      <div
        className={cn(
          'flex gap-2 overflow-x-auto py-1',
          'scrollbar-none snap-x snap-mandatory',
          'scroll-px-4 px-1' // scroll padding (snap endpoints) + visual padding
        )}>
        {/* start spacer so first chip isn't flush/cut */}
        {/* <span
          aria-hidden
          className="shrink-0 w-4"
        /> */}

        {items.map(val => {
          const active = val === activeValue;
          return (
            <Link
              key={val}
              href={buildHref(val)}
              aria-pressed={active}
              className={cn(
                'snap-start inline-flex items-center whitespace-nowrap rounded-xl px-3 py-1.5 text-sm transition',
                'ring-1 ring-border',
                active
                  ? 'bg-hc-cream ring-2 ring-hc-orange text-hc-asphalt'
                  : 'hover:bg-hc-offwhite text-hc-asphalt'
              )}>
              <span className="capitalize">{val}</span>
            </Link>
          );
        })}

        {/* end spacer so last chip isn't flush/cut */}
        {/* <span
          aria-hidden
          className="shrink-0 w-1"
        /> */}
      </div>
    </div>
  );
}
