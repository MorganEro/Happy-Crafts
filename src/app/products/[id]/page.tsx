'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getProductById, type ProductWithRelations } from '@/services/products';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Edit, Heart, ShoppingCart, Star, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAdmin } from '@/hooks/use-admin';




// Define the ProductContent props interface
interface ProductContentProps {
  product: ProductWithRelations;
  isAdmin: boolean;
}

// Main component that handles data fetching
const ProductDetailPage = () => {
  const { id } = useParams();
  const { isAdmin } = useAdmin();
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

  return <ProductContent product={product} isAdmin={isAdmin} />;
};

// Component to render the actual product content
const ProductContent = ({
  product,
  isAdmin = false,
}: ProductContentProps) => {
  const params = useParams();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  
  const id = params?.id;
  
  if (!id) {
    return <div>Product not found</div>;
  }

  // Type guard for ProductImage
  const isProductImage = useCallback((img: unknown): img is { url: string } => {
    return Boolean(
      img &&
      typeof img === 'object' &&
      'url' in img &&
      typeof (img as { url: unknown }).url === 'string'
    );
  }, []);

  // Set up gallery images when product data is loaded
  useEffect(() => {
    try {
      if (!product) return;
      
      // Ensure we have a valid main image or use empty string
      const mainImage = (typeof product.image === 'string' && product.image.trim() !== '')
        ? product.image
        : '';

      // Safely get additional images
      const additionalImages = (Array.isArray(product.images) ? product.images : [])
        .filter(isProductImage)
        .map(img => img.url);

      // Combine images
      const allImages = [mainImage, ...additionalImages]
        .filter((url): url is string => Boolean(url && url.trim() !== ''));
        
      setGalleryImages(allImages.length > 0 ? allImages : ['/placeholder-product.jpg']);

      // Error handling is done in the catch block below
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
    <div className="w-full max-w-7xl mx-auto backdrop-blur-xs py-4 sm:py-8">
      <div className="mb-4 sm:mb-6">
        <Button
          variant="link"
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-sm sm:text-base"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to products
        </Button>
      </div>

      <div className="grid gap-6 md:gap-8 md:grid-cols-2 p-4 sm:p-6 rounded-lg w-full mx-auto">
        {/* Product Images */}
        <div className="relative">
          <div className="relative aspect-square w-full overflow-hidden bg-gray-100 rounded-lg">
            {galleryImages.length > 0 && galleryImages[0] ? (
              <Image
                src={galleryImages[selectedImage] || ''}
                alt={product.name}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
                priority
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const container = target.parentElement;
                  if (container) {
                    const existingFallback = container.querySelector('.image-fallback');
                    if (!existingFallback) {
                      const fallback = document.createElement('div');
                      fallback.className = 'image-fallback flex items-center justify-center h-full w-full text-gray-500';
                      fallback.textContent = 'Image Not Available';
                      container.appendChild(fallback);
                    }
                  }
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full text-gray-500">
                No Image Available
              </div>
            )}
            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={handlePreviousImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md hover:bg-white transition-colors z-10"
                  aria-label="Previous image"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md hover:bg-white transition-colors z-10"
                  aria-label="Next image"
                >
                  <ArrowLeft className="h-5 w-5 rotate-180" />
                </button>
              </>
            )}
          </div>

          {galleryImages.length > 1 && (
            <div className="mt-3 grid grid-cols-6 gap-2">
              {galleryImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={cn(
                    "relative aspect-square w-full overflow-hidden rounded-md border-2 transition-all",
                    selectedImage === index ? "border-primary" : "border-transparent"
                  )}
                >
                  <Image
                    src={image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 16vw, 80px"
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
            <p>{product.description}</p>
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
                onClick={() => router.push(`/products/${product.id}/edit`)}
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
    </div>
  );
};

export default ProductDetailPage;