import { ProductCard } from '@/components/products/ProductCard';
import Container from '@/components/layout/Container';
import InnerContainer from '@/components/layout/InnerContainer';
import { PageHeader } from '@/components/ui/PageHeader';
import { Separator } from '@/components/ui/separator';
import EmptyState from '@/components/ui/EmptyState';

import { ProductsFilters } from '@/components/products/ProductsFilters';
import { PaginationNav } from '@/components/ui/PaginationNav';
import { fetchProductsPage, RawSearchParams } from '@/lib/server/products';

type PageProps = { searchParams: Promise<RawSearchParams> };

export const dynamic = 'force-dynamic';

export default async function ProductsIndex(props: PageProps) {
  const sp = await props.searchParams;

  const { items, total, page, perPage, totalPages, filters } =
    await fetchProductsPage(sp);

  const baseParams = {
    category: filters.category || undefined,
    tag: filters.tag || undefined,
    perPage: String(perPage),
  };

  return (
    <Container className="py-12">
      <PageHeader
        title="Products"
        subtitle="Browse my collection of handmade crafts"
      />

      {/* Filters (SRP) */}
      <ProductsFilters
        activeCategory={filters.category}
        activeTag={filters.tag}
        perPage={perPage}
      />

      <Separator className="my-4" />
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Showing{' '}
          <span className="font-medium">{(page - 1) * perPage + 1}</span>
          {'–'}
          <span className="font-medium">
            {Math.min(page * perPage, total)}
          </span>{' '}
          of <span className="font-medium">{total}</span>
        </div>
        <div className="ml-auto flex items-center justify-center">
          <PaginationNav
            page={page}
            totalPages={totalPages}
            baseParams={baseParams}
            className="mt-0"
          />
        </div>
      </div>

      {/* Grid */}
      {items.length === 0 ? (
        <EmptyState
          heading={
            filters.category || filters.tag
              ? 'No products match your filters.'
              : 'No products yet.'
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-4">
            {items.map(p => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                imageUrl={p.image}
              />
            ))}
          </div>

          {/* Pagination (SRP) */}
          <div className="mt-2 text-sm text-muted-foreground">
            Showing{' '}
            <span className="font-medium">{(page - 1) * perPage + 1}</span>
            {'–'}
            <span className="font-medium">
              {Math.min(page * perPage, total)}
            </span>{' '}
            of <span className="font-medium">{total}</span>
          </div>

          <PaginationNav
            page={page}
            totalPages={totalPages}
            baseParams={baseParams}
          />
        </>
      )}
    </Container>
  );
}
