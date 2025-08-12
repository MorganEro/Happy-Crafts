'use client';

import { Button } from '@/components/ui/button';
import { useAdmin } from '@/hooks/use-admin';
import { ProductWithRelations } from '@/services/products';
import { Edit, Eye, Heart, ShoppingCart, Star, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface ProductCardProps {
  product: ProductWithRelations
}

export function ProductCard({ product }: ProductCardProps) {
  const { isAdmin, isLoading: isAuthLoading } = useAdmin();
  const router = useRouter();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast.success('Product deleted successfully');
        router.refresh();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete product');
      }
    } catch (error: any) {
      console.error('Error deleting product:', error);
      const errorMessage = error?.message || 'Failed to delete product';
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Failed to delete product');
    }
  };

  if (isAuthLoading) return null;

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/products/${product.id}/edit`);
  };

  return (
    <div 
      className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-950"
      onClick={() => router.push(`/products/${product.id}`)}
    >
      {/* Admin controls */}
      {isAdmin && (
        <div className="absolute right-2 top-2 z-20 flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm transition-colors hover:bg-blue-50 hover:text-blue-600 dark:bg-gray-900/80 dark:hover:bg-gray-800"
            onClick={handleEditClick}
          >
            <Edit className="h-3.5 w-3.5" />
            <span className="sr-only">Edit product</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm transition-colors hover:bg-red-50 hover:text-red-600 dark:bg-gray-900/80 dark:hover:bg-gray-800"
            onClick={handleDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sr-only">Delete product</span>
          </Button>
        </div>
      )}
      
      {/* Wishlist button */}
      <Button
        variant="ghost"
        size="icon"
        className={`absolute ${isAdmin ? 'left-2' : 'right-2'} top-2 z-10 h-9 w-9 rounded-full bg-white/80 backdrop-blur-sm transition-colors hover:bg-white hover:text-rose-500 dark:bg-gray-900/80 dark:hover:bg-gray-800`}
      >
        <Heart 
          className={`h-3.5 w-3.5 transition-colors ${product.hasLiked ? 'fill-rose-500 text-rose-500' : ''}`} 
        />
        <span className="sr-only">Add to wishlist</span>
      </Button>

      {/* Product image */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100 dark:bg-gray-900 cursor-pointer">
        <Image
          src={product.image || '/placeholder.svg'}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          priority={false}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          <Button variant="outline" className="flex items-center gap-2 bg-white/90 text-gray-900 hover:bg-white">
            <Eye className="h-4 w-4" />
            View Details
          </Button>
        </div>
      </div>

      {/* Product info */}
      <div className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <div className="mr-2">
            <Link href={`/products/${product.id}`}>
              <h3 className="font-medium text-gray-900 line-clamp-1 hover:text-primary dark:text-white dark:hover:text-primary">
                {product.name}
              </h3>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {product.company}
            </p>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            ${product.price.toFixed(2)}
          </div>
        </div>
        
        <div className="mt-3 flex items-center justify-between">
          {/* Rating */}
          <div className="flex items-center space-x-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${star <= Math.round(product.averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                />
              ))}
            </div>
            <span className="ml-1 text-sm text-gray-600 dark:text-gray-300">
              ({product.reviews?.length || 0})
            </span>
          </div>

          {/* Quick actions */}
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-sm hover:bg-primary hover:text-primary-foreground"
            >
              <ShoppingCart className="mr-1 h-4 w-4" />
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
