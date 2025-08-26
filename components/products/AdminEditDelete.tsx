'use client';

import { useIsAdmin } from '@/lib/hooks/useAdmin';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { Edit } from 'lucide-react';
import DeleteProduct from './DeleteProduct';

function AdminEditDelete({ id }: { id: string }) {
  const isAdmin = useIsAdmin();
  const router = useRouter();

  const handleEditClick = () => {
    router.push(`/admin/products/${id}/edit`);
  };

  return (
    isAdmin && (
      <div className="inline-flex gap-2 border rounded-md p-3 bg-hc-orange/20">
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
    )
  );
}
export default AdminEditDelete;
