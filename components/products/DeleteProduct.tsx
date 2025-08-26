'use client';
import { useDeleteProduct } from '@/lib/queries/product';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { ActionButton } from '../ui/ActionButton';

function DeleteProduct({ productId }: { productId: string }) {
  const deleteProduct = useDeleteProduct();

  const handleDelete = () => {
    deleteProduct.mutate(productId);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <ActionButton actionType="delete" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            product.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteProduct.isPending}
            className="rounded-md p-2">
            {deleteProduct.isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteProduct;
