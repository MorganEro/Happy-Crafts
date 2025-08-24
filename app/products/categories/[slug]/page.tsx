// app/products/categories/[slug]/page.tsx
import { ProductCard } from '@/components/products/ProductCard';
import BackLink from '@/components/ui/BackLink';
import EmptyState from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { Separator } from '@/components/ui/separator';
import prisma from '@/lib/db';
import { slugToCategory } from '@/lib/slug';
import { notFound } from 'next/navigation';

type PageProps = { params: Promise<{ slug: string }> };

export const dynamic = 'force-dynamic'; // optional

export async function generateMetadata({ params }: PageProps) {
  const category = slugToCategory((await params).slug);
  return {
    title: category ? `${category} • Happy Crafts` : 'Products • Happy Crafts',
  };
}

export default async function ProductsByCategoryPage({ params }: PageProps) {
  const slug = (await params).slug ?? '';
  const category = slugToCategory(slug);

  if (!category) {
    // Unknown slug → 404
    notFound();
  }

  const products = await prisma.product.findMany({
    where: { category },
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, image: true },
  });

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <BackLink />
      <PageHeader
        title={`Category: ${category}`}
        subtitle={`${products.length} ${
          products.length === 1 ? 'Product' : 'Products'
        } found`}
      />
      <Separator />

      {products.length === 0 ? (
        <EmptyState
          heading={`No products found in “${category}”.`}
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
