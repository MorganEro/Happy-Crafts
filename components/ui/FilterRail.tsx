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
  activeValue?: string;
  /** Other params to preserve when building the URL (category, tag, perPage, etc.) */
  otherParams?: Partial<
    Record<'tag' | 'category' | 'page' | 'perPage', string>
  >;
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

    // Apply preserved params (category, tag, perPage, etc.)
    if (otherParams.category !== undefined)
      params.set('category', otherParams.category);
    if (otherParams.tag !== undefined) params.set('tag', otherParams.tag);
    if (otherParams.perPage !== undefined)
      params.set('perPage', otherParams.perPage);

    // When changing/toggling this filter, always reset to page 1
    params.set('page', '1');

    if (val && val !== activeValue) {
      params.set(paramKey, val);
    } else {
      // Toggle off the active chip removes this param
      params.delete(paramKey);
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
          'scroll-px-4 px-1'
        )}>
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
                  ? 'bg-hc-cream/50 ring-1 ring-hc-orange/50 text-hc-asphalt'
                  : 'hover:bg-hc-offwhite text-hc-asphalt'
              )}>
              <span
                className={cn(
                  'capitalize text-muted-foreground',
                  active ? ' text-hc-asphalt' : ''
                )}>
                {val}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
