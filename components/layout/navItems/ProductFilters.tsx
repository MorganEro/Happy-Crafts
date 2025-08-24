// components/sidebar/ProductFilters.tsx
'use client';

import {
  PRODUCT_CATEGORIES,
  PRODUCT_TAGS
} from '@/lib/constants';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function withParam(sp: URLSearchParams, key: string, value: string) {
  const next = new URLSearchParams(sp);
  next.set(key, value);
  return `?${next.toString()}`;
}

function appendParam(sp: URLSearchParams, key: string, value: string) {
  const next = new URLSearchParams(sp);
  next.append(key, value);
  return `?${next.toString()}`;
}

export default function ProductFilters() {
  const sp = useSearchParams();

  return (
    <nav className="space-y-6 text-sm">
      {/* Categories */}
      <section>
        <h3 className="mb-2 font-semibold text-hc-asphalt">Categories</h3>
        <ul className="space-y-1">
          {PRODUCT_CATEGORIES.map(c => {
            const href = withParam(sp, 'category', c);
            const active = sp.get('category') === c;
            return (
              <li key={c}>
                <Link
                  href={`/shop${href}`}
                  className={`block rounded-md px-2 py-1 ${
                    active
                      ? 'bg-hc-cream text-hc-blue-600'
                      : 'text-hc-asphalt hover:bg-hc-cream'
                  }`}>
                  {c}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Tags */}
      <section>
        <h3 className="mb-2 font-semibold text-hc-asphalt">Tags</h3>
        <ul className="flex flex-wrap gap-2">
          {PRODUCT_TAGS.map(t => {
            const href = appendParam(sp, 'tag', t);
            const active = sp.getAll('tag').includes(t);
            return (
              <li key={t}>
                <Link
                  href={`/shop${href}`}
                  className={`inline-block rounded-full border px-2 py-1 ${
                    active
                      ? 'bg-hc-blue-600 border-hc-blue-600 text-hc-offwhite'
                      : 'bg-hc-offwhite text-hc-asphalt hover:bg-hc-cream'
                  }`}
                  aria-pressed={active}>
                  {t}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </nav>
  );
}
