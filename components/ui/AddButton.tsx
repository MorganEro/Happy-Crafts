'use client';
import { useIsAdmin } from '@/lib/hooks/useAdmin';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from './button';

function AddButton() {
  const isAdmin = useIsAdmin();

  return (
    <div>
      {isAdmin && (
        <div className="flex justify-end my-6 px-6 sm:px-4 lg:px-8">
          <Button
            variant="outline"
            size="sm"
            asChild>
            <Link
              href="/admin/products/create"
              title="Add Product">
              <Plus
                className="h-4 w-4"
                aria-label="Add Product"
              />
              Add Product
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
export default AddButton;
