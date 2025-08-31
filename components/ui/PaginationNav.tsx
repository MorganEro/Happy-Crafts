// components/ui/PaginationNav.tsx
'use client';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { buildQuery } from '@/lib/server/products';
import { cn } from '@/lib/utils';

type Props = {
  page: number;
  totalPages: number;
  baseParams: Record<string, string | undefined>; // category, tag, perPage, etc.
  siblingCount?: number; // default 1
  className?: string;
};

function range(from: number, to: number): number[] {
  const out: number[] = [];
  for (let i = from; i <= to; i++) out.push(i);
  return out;
}

function getVisiblePages(
  current: number,
  total: number,
  siblingCount: number
): Array<number | '...'> {
  const first = 1;
  const last = total;

  const start = Math.max(first, current - siblingCount);
  const end = Math.min(last, current + siblingCount);

  const pages: Array<number | '...'> = [];

  if (start > first) {
    pages.push(first);
    if (start > first + 1) pages.push('...');
  }

  pages.push(...range(start, end));

  if (end < last) {
    if (end < last - 1) pages.push('...');
    pages.push(last);
  }

  return pages;
}

export function PaginationNav({
  page,
  totalPages,
  baseParams,
  siblingCount = 1,
  className,
}: Props) {
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const makeHref = (p: number) =>
    buildQuery({ ...baseParams, page: String(p) });

  const visible = getVisiblePages(page, totalPages, siblingCount);

  return (
    <Pagination className={cn('mt-8', className)}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={hasPrev ? makeHref(page - 1) : makeHref(page)}
            aria-disabled={!hasPrev}
            className={!hasPrev ? 'pointer-events-none opacity-50' : undefined}
          />
        </PaginationItem>

        {visible.map((v, idx) =>
          v === '...' ? (
            <PaginationItem key={`e-${idx}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={v}>
              <PaginationLink
                href={makeHref(v)}
                isActive={v === page}>
                {v}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            href={hasNext ? makeHref(page + 1) : makeHref(page)}
            aria-disabled={!hasNext}
            className={!hasNext ? 'pointer-events-none opacity-50' : undefined}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
