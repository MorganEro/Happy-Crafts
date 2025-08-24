import { fetchProductWithImages } from '@/actions/product-actions';
import FavoriteToggleButton from '@/components/products/FavoriteToggleButton';
import { ProductGallery } from '@/components/products/ProductGallery';
import { Badge } from '@/components/ui/badge';
import BreadCrumbs from '@/components/ui/BreadCrumbs';
import { PageHeader } from '@/components/ui/PageHeader';
import { Separator } from '@/components/ui/separator';
import { categoryToSlug } from '@/lib/slug';
import Link from 'next/link';

async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await fetchProductWithImages(id);
  const galleryImages =
    product.images.length > 0
      ? product.images.map(im => ({
          url: im.url,
          alt: im.altText ?? product.name,
        }))
      : [{ url: product.image, alt: product.name }];

  return (
    <div className="max-w-6xl mx-auto pt-8 px-4">
      <BreadCrumbs
        previousName="Products"
        previousLink="/products"
        currentName={product.name}
      />
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title={product.name}
          subtitle={product.category}
        />
        <FavoriteToggleButton productId={product.id} />
      </div>
      <Separator className="mb-8" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Gallery */}
        <ProductGallery images={galleryImages} />

        {/* Details (no price/company per your request) */}
        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-hc-asphalt">
              Description
            </h2>
            <p className="text-base leading-relaxed text-hc-asphalt whitespace-pre-wrap">
              {product.description}
            </p>
          </section>

          {product.tags.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-sm font-medium text-hc-teal-500 uppercase tracking-wide">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map(tag => (
                  <Link
                    key={tag}
                    href={`/products/tags/${encodeURIComponent(tag)}`}>
                    <Badge className="cursor-pointer hover:opacity-90 capitalize">
                      {tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {product.category && (
            <section className="space-y-3">
              <h3 className="text-sm font-medium text-hc-teal-500 uppercase tracking-wide">
                Category
              </h3>
              <Link
                href={{
                  pathname: `/products/categories/${categoryToSlug(
                    product.category
                  )}`,
                  query: { category: product.category },
                }}>
                <Badge
                  variant="secondary"
                  className="cursor-pointer hover:opacity-90 capitalize">
                  {product.category}
                </Badge>
              </Link>
            </section>
          )}

          {product.options.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-sm font-medium text-hc-teal-500 uppercase tracking-wide">
                Options
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.options.map(o => (
                  <Badge
                    key={o}
                    variant="outline"
                    className="capitalize">
                    {o}
                  </Badge>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
export default ProductDetailPage;
