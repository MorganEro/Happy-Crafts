'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getProductById, type ProductWithRelations } from '@/services/products';
import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { ArrowLeft, Edit, Heart, ShoppingCart, Star, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAdmin } from '@/hooks/use-admin';

// Extended type for the product with all required fields
type SafeProduct = Omit<ProductWithRelations, 'reviews' | 'images' | 'likes'> & {
  reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    authorName: string | null;
    authorImageUrl: string | null;
    createdAt: Date | string;
    updatedAt: Date | string | null;
    customerId: string;
    productId: string;
  }>;
  images: Array<{
    id: string;
    url: string;
    altText: string | null;
    isPrimary: boolean;
    productId: string;
    createdAt: Date | string;
    updatedAt: Date | string;
  }>;
  likes: Array<{
    id: string;
    customerId: string;
    productId: string;
    createdAt: Date | string;
  }>;
  averageRating: number;
  likeCount: number;
  hasLiked: boolean;
};

// Type guard to check if an object is a valid ProductImage
const isProductImage = (img: any): img is { url: string } => {
  return img && typeof img === 'object' && 'url' in img && typeof img.url === 'string';
};

// Define the ProductContent props interface
interface ProductContentProps {
  product: ProductWithRelations;
  isAdmin: boolean;
  queryClient: QueryClient;
}

// Main component that handles data fetching
const ProductDetailPage = () => {
  const { id } = useParams();
  const { isAdmin } = useAdmin();
  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    data: product,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id as string),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Product not found</h2>
          <p className="text-muted-foreground mb-6">
            {error instanceof Error ? error.message : 'The requested product could not be found.'}
          </p>
          <Button onClick={() => router.push('/products')}>
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  return <ProductContent product={product} isAdmin={isAdmin} queryClient={queryClient} />;
};

// Component to render the actual product content
const ProductContent = ({
  product,
  isAdmin = false,
  queryClient,
}: ProductContentProps) => {
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Product not found</p>
      </div>
    );
  }
  const router = useRouter();
  const params = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>(['/placeholder-product.jpg']);

  // Set up gallery images when product data is loaded
  useEffect(() => {
    try {
      // Ensure product.image is a string
      const mainImage = typeof product.image === 'string' ? product.image : '/placeholder-product.jpg';

      // Get all images including the main image and any additional images
      const additionalImages = Array.isArray(product.images)
        ? product.images
            .filter((img) =>
              img && typeof img === 'object' && 'url' in img && typeof img.url === 'string'
            )
            .map((img) => img.url as string)
        : [];

      const allImages = [mainImage, ...additionalImages].filter(Boolean) as string[];

      // Fallback to placeholder if no images are available
      setGalleryImages(allImages.length > 0 ? allImages : ['/placeholder-product.jpg']);
    } catch (err) {
      console.error('Error setting up gallery images:', err);
      setGalleryImages(['/placeholder-product.jpg']);
    }
  }, [product]);

  const handlePreviousImage = () => {
    setSelectedImage((prev: number) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImage((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  const handleAddToCart = () => {
    // TODO: Implement add to cart functionality
    toast.success('Added to cart!');
  };

  const handleLike = async () => {
    try {
      setIsLiking(true);
      // TODO: Implement like functionality
      toast.success('Added to favorites!');
    } catch (error) {
      console.error('Error liking product:', error);
      toast.error('Failed to update favorites');
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      setIsDeleting(true);
      // TODO: Implement delete functionality
      await fetch(`/api/products/${product.id}`, {
        method: 'DELETE',
      });
      toast.success('Product deleted successfully');
      router.push('/products');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculate average rating safely
  const reviews = product.reviews ?? [];
  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, review) => acc + (review.rating ?? 0), 0) / reviews.length
    : 0;

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="mb-4 sm:mb-6 px-2">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm sm:text-base"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to products
        </Button>
      </div>

      <div className="grid gap-6 md:gap-8 md:grid-cols-2 bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-lg shadow-sm overflow-hidden">
        {/* Product Images */}
        <div className="space-y-3 sm:space-y-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-lg border">
            <Image
              src={galleryImages[selectedImage] || '/placeholder-product.jpg'}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={handlePreviousImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md transition-colors hover:bg-white"
                  aria-label="Previous image"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md transition-colors hover:bg-white"
                  aria-label="Next image"
                >
                  <ArrowLeft className="h-5 w-5 rotate-180" />
                </button>
              </>
            )}
          </div>

          {galleryImages.length > 1 && (
            <div className="grid grid-cols-6 gap-2 overflow-x-auto pb-2 px-1">
              {galleryImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square w-full min-w-[60px] overflow-hidden rounded-md border-2 transition-all ${
                    selectedImage === index ? 'border-blue-500' : 'border-transparent'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 25vw, 16.66vw"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
            <p className="mt-2 text-muted-foreground">{product.company}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= Math.round(averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground/30'
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                ({product.reviews?.length || 0} review{product.reviews?.length !== 1 ? 's' : ''})
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-3xl font-bold">${product.price.toFixed(2)}</p>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button size="lg" className="flex-1" onClick={handleAddToCart}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="group relative"
              onClick={handleLike}
              disabled={isLiking}
            >
              <Heart
                className={cn(
                  'mr-2 h-4 w-4 transition-colors',
                  product.hasLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'
                )}
              />
              {product.hasLiked ? 'Liked' : 'Add to Wishlist'}
            </Button>
          </div>

          {isAdmin && (
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/admin/products/${product.id}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12 border-t pt-8">
        <h2 className="mb-6 text-2xl font-semibold">Customer Reviews</h2>
        {reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => {
              const authorName = review.authorName ?? 'Anonymous';
              const authorImage = review.authorImageUrl ?? '/placeholder-avatar.png';

              return (
                <div key={review.id} className="rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full">
                      <Image
                        src={authorImage}
                        alt={authorName}
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{authorName}</p>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              'h-4 w-4',
                              star <= (review.rating ?? 0)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground/30'
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="mt-3 text-muted-foreground">{review.comment}</p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
        )}
      </div>

      {/* Product Details Section */}
      <div className="mt-6">
        <h2 className="text-sm font-medium text-foreground">Details</h2>
        <div className="mt-4 space-y-6">
          <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
            <li>High-quality materials</li>
            <li>Eco-friendly packaging</li>
            <li>Free shipping on orders over $50</li>
            <li>30-day return policy</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;