// app/products/tags/[tag]/page.tsx
import { ProductCard } from '@/components/products/ProductCard';
import BackLink from '@/components/ui/BackLink';
import EmptyState from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Separator } from '@/components/ui/separator';
import prisma from '@/lib/db';

type PageProps = { params: Promise<{ tag: string }> };

export const dynamic = 'force-dynamic'; // optional: ensure fresh data

export async function generateMetadata({ params }: PageProps) {
  // tags
  const tag = decodeURIComponent((await params).tag);
  return { title: `Products tagged “${tag}” • Happy Crafts` };
}

export default async function ProductsByTagPage({ params }: PageProps) {
  const raw = (await params).tag ?? '';
  // URL may be encoded, e.g. girls%20trip
  const tag = decodeURIComponent(raw);

  // Fetch products that include this tag
  const products = await prisma.product.findMany({
    where: { tags: { has: tag } },
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, image: true },
  });

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <BackLink />

      <PageHeader
        title={`Tag: ${tag}`}
        subtitle={`${products.length} ${
          products.length === 1 ? 'Product' : 'Products'
        } found`}
      />
      <Separator className="mb-8" />

      {products.length === 0 ? (
        <EmptyState
          heading={`No products found for “${tag}”.`}
          content="Try searching for something else."
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
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
    </div>
  );
}
