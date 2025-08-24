// app/products/[id]/edit/page.tsx
import prisma from '@/lib/db';
import EditProductClient from './EditProductClient';
import { ProductCategory, ProductTag } from '@/lib/constants';

type EditProductPageProps = { params: Promise<{ id: string }> };

const EditProductPage = async ({ params }: EditProductPageProps) => {
  const product = await prisma.product.findUnique({
    where: { id: (await params).id },
    include: {
      images: {
        orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
      },
    },
  });

  if (!product) {
    // redirect or notFound
    return null;
  }

  // prepare ordered urls (primary first)
  const existingUrls = product.images.length
    ? product.images.map(i => i.url)
    : product.image
    ? [product.image]
    : [];

  const mainImageIndex = Math.max(
    0,
    existingUrls.findIndex(u => u === product.image)
  );

  return (
    <EditProductClient
      productId={product.id}
      defaults={{
        name: product.name,
        company: product.company,
        description: product.description,
        category: product.category as ProductCategory,
        options: product.options ?? [],
        tags: product.tags as ProductTag[],
        price: product.price,
        existingUrls,
        newImages: [],
        mainImageIndex: mainImageIndex === -1 ? 0 : mainImageIndex,
      }}
    />
  );
};

export default EditProductPage;
