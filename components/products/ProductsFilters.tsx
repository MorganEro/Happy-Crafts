// components/products/ProductsFilters.tsx
'use client';

import Link from 'next/link';

import { PRODUCT_CATEGORIES, PRODUCT_TAGS } from '@/lib/constants';
import { FilterRail } from '../ui/FilterRail';
import InnerContainer from '../layout/InnerContainer';

type Props = {
  activeCategory: string;
  activeTag: string;
  perPage: number;
};

export function ProductsFilters({ activeCategory, activeTag, perPage }: Props) {
  return (
    <InnerContainer className="bg-hc-blue-400/5 rounded-lg pr-0">
      {/* Categories */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-hc-teal-500">
            Categories
          </h2>
          {(activeCategory || activeTag) && (
            <Link
              href="/products"
              className="text-xs text-hc-blue-600 hover:underline pe-2">
              Clear filters
            </Link>
          )}
        </div>

        <FilterRail
          paramKey="category"
          items={[...PRODUCT_CATEGORIES].sort((a, b) => a.localeCompare(b))}
          activeValue={activeCategory}
          otherParams={{ tag: activeTag, perPage: String(perPage) }} // no page here
        />
      </section>

      {/* Tags */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-hc-teal-500">
          Tags
        </h2>
        <FilterRail
          paramKey="tag"
          items={[...PRODUCT_TAGS].sort((a, b) => a.localeCompare(b))}
          activeValue={activeTag}
          otherParams={{ category: activeCategory, perPage: String(perPage) }} // no page here
        />
      </section>
    </InnerContainer>
  );
}
