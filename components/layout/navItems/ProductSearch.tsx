// components/sidebar/ProductSearch.tsx
'use client';

import { z } from 'zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useProductSearch } from '@/lib/queries/product';

import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import Image from 'next/image';

const Schema = z.object({
  q: z.string().trim().max(120, 'Keep it short').optional(),
});

type Values = z.infer<typeof Schema>;

type Props = {
  /** If you want to render inline quick results in the sidebar */
  showInlineResults?: boolean;
  /** Limit inline preview count */
  inlineLimit?: number;
  /** If you prefer navigation, provide a results page href like `/products?search=` */
  resultsHrefBase?: string;
};

export default function ProductSearch({
  showInlineResults = true,
  inlineLimit = 6,
  resultsHrefBase = '/products?search=',
}: Props) {
  const form = useForm<Values>({
    resolver: zodResolver(Schema),
    defaultValues: { q: '' },
  });

  // Debounce the search text
  const [debouncedQ, setDebouncedQ] = useState('');
  const watchQ = form.watch('q') || '';

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(watchQ.trim()), 300);
    return () => clearTimeout(id);
  }, [watchQ]);

  const { data: results, isFetching } = useProductSearch(debouncedQ);

  const hasQuery = debouncedQ.length > 0;
  const preview = useMemo(
    () => (results || []).slice(0, inlineLimit),
    [results, inlineLimit]
  );

  const onSubmit = (values: Values) => {
    const q = (values.q || '').trim();
    if (!q) return;
    // Navigate to a full results page, or handle however you like
    window.location.href = `${resultsHrefBase}${encodeURIComponent(q)}`;
  };

  return (
    <div className="p-2">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-2 ">
          <FormField
            control={form.control}
            name="q"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex items-center gap-1">
                    <Input
                      {...field}
                      placeholder="Search products..."
                    />
                    <Button
                      type="submit"
                      size="sm">
                      Search
                    </Button>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>

      {showInlineResults && hasQuery && (
        <div className="mt-3">
          <p className="text-xs text-hc-teal-500">
            {isFetching
              ? 'Searching…'
              : `Top matches (${results?.length ?? 0})`}
          </p>

          <ScrollArea className="mt-2 max-h-72">
            <ul>
              {preview.map(p => (
                <li
                  key={p.id}
                  className="group">
                  <Link
                    href={`/products/${p.id}`}
                    className="rounded-xl border bg-hc-offwhite/70 hover:bg-hc-cream/50 transition p-2 grid grid-cols-[48px_1fr] gap-1.5 items-center mb-2">
                    <Image
                      src={p.image}
                      alt={p.name}
                      width={48}
                      height={48}
                      sizes="48px"
                      loading="lazy"
                      className="h-12 w-12 rounded-lg object-cover border border-hc-cream"
                    />{' '}
                    <div className="min-w-0">
                      <div className="font-medium text-sm text-hc-asphalt truncate capitalize">
                        {highlight(p.name, debouncedQ)}
                      </div>

                      <div className="text-xs text-hc-teal-500 truncate capitalize">
                        {highlight(p.category, debouncedQ)}
                      </div>
                      <div className="text-xs text-hc-teal-500 truncate">
                        {p.tags?.length ? (
                          <>
                            {p.tags.slice(0, 3).join(' | ')}
                            {p.tags.length > 3 ? '…' : ''}
                          </>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            {(results?.length ?? 0) > inlineLimit && (
              <div className="mt-3">
                <Link
                  className="text-sm underline text-hc-blue-600 hover:text-hc-blue-400"
                  href={`${resultsHrefBase}${encodeURIComponent(debouncedQ)}`}>
                  View all results →
                </Link>
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

/** Tiny helper to bold matched text (client-only) */
function highlight(text: string, q: string) {
  if (!q) return text;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i === -1) return text;
  const before = text.slice(0, i);
  const match = text.slice(i, i + q.length);
  const after = text.slice(i + q.length);
  return (
    <>
      {before}
      <span className="font-semibold bg-yellow-200 p-1 rounded">{match}</span>
      {after}
    </>
  );
}
