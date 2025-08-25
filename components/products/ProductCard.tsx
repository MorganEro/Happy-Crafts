'use client';

import { Button } from '@/components/ui/button';
import { useIsAdmin } from '@/lib/hooks/useAdmin';
import { cn } from '@/lib/utils';
import { Edit } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DeleteProduct from './DeleteProduct';
import FavoriteToggleButton from './FavoriteToggleButton';

type Props = {
  id: string;
  name: string;
  imageUrl: string;
  className?: string;
};

export function ProductCard({ id, name, imageUrl, className }: Props) {
  const isAdmin = useIsAdmin();
  const router = useRouter();

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/admin/products/${id}/edit`);
  };

  return (
    <Link
      href={`/products/${id}`}
      className={cn(
        'group rounded-2xl ring-1 ring-border overflow-hidden bg-hc-blue-400/10 hover:shadow-sm transition relative',
        className
      )}>
      {/* Favorites button */}
      <div className={`absolute right-2 top-2 z-10`}>
        <FavoriteToggleButton productId={id} />
        <span className="sr-only">Add to Favorites</span>
      </div>

      {/* Product image */}
      <div className="relative aspect-square">
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover group-hover:scale-[1.02] transition-transform"
        />
      </div>
      <div className="p-3 flex justify-between items-center">
        <h3 className="text-sm md:text-base font-medium text-foreground line-clamp-2">
          {name}
        </h3>
        {isAdmin && (
          <div className="flex">
            <Button
              variant="ghost"
              size="icon"
              className="p-2 rounded-full"
              onClick={handleEditClick}>
              <Edit className="h-3.5 w-3.5" />
              <span className="sr-only">Edit product</span>
            </Button>
            <DeleteProduct productId={id} />
          </div>
        )}
      </div>
    </Link>
  );
}
