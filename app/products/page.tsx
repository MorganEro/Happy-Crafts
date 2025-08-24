// app/products/page.tsx
import Link from 'next/link';
import prisma from '@/lib/db';
import { PRODUCT_CATEGORIES, PRODUCT_TAGS } from '@/lib/constants';
import { ProductCard } from '@/components/products/ProductCard';
import { FilterRail } from '@/components/ui/FilterRail';
import { Prisma } from '@prisma/client';
import Container from '@/components/layout/Container';
import { PageHeader } from '@/components/ui/PageHeader';
import { Separator } from '@/components/ui/separator';
import EmptyState from '@/components/ui/EmptyState';
import InnerContainer from '@/components/layout/InnerContainer';

type RawSearchParams =
  | URLSearchParams
  | Record<string, string | string[] | undefined>;

type PageProps = {
  // 👇 Next 14.2+/15: searchParams is async in server components
  searchParams: Promise<RawSearchParams>;
};

function pickParam(sp: RawSearchParams, key: string): string {
  // handle both URLSearchParams and object shapes
  if (sp instanceof URLSearchParams) {
    return sp.get(key) ?? '';
  }
  const v = sp[key];
  if (Array.isArray(v)) return v[0] ?? '';
  return (v as string) ?? '';
}

export const dynamic = 'force-dynamic'; // show fresh items

async function fetchProducts(sp: RawSearchParams) {
  const where: Prisma.ProductWhereInput = {};
  const category = pickParam(sp, 'category');
  const tag = pickParam(sp, 'tag');
  if (category) where.category = category;
  if (tag) where.tags = { has: tag };

  return prisma.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, image: true },
  });
}

export default async function ProductsIndex(props: PageProps) {
  const sp = await props.searchParams; // 👈 IMPORTANT
  const activeCategory = pickParam(sp, 'category');
  const activeTag = pickParam(sp, 'tag');
  const products = await fetchProducts(sp);

  return (
    <Container className="py-12">
      <PageHeader
        title="Products"
        subtitle="Browse my collection of handmade crafts"
      />

      {/* Categories rail */}
      <InnerContainer className="bg-hc-blue-400/5 rounded-lg pr-0">
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-hc-teal-500">
              Categories
            </h2>
            {(activeCategory || activeTag) && (
              <Link
                href="/products"
                className="text-xs text-hc-blue-600 hover:underline">
                Clear filters
              </Link>
            )}
          </div>
          <FilterRail
            paramKey="category"
            items={[...PRODUCT_CATEGORIES].sort((a, b) => a.localeCompare(b))}
            activeValue={activeCategory}
            otherParams={{ tag: activeTag }}
          />
        </section>

        {/* Tags rail */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-hc-teal-500">
            Tags
          </h2>
          <FilterRail
            paramKey="tag"
            items={[...PRODUCT_TAGS].sort((a, b) => a.localeCompare(b))}
            activeValue={activeTag}
            otherParams={{ category: activeCategory }}
          />
        </section>
      </InnerContainer>
      <Separator className="my-4" />

      {/* Grid */}
      {products.length === 0 ? (
        <EmptyState
          heading={
            activeCategory || activeTag
              ? 'No products match your filters.'
              : 'No products yet.'
          }
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-4">
          {products.map(p => (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              imageUrl={p.image}
            />
          ))}
        </div>
      )}
    </Container>
  );
}
