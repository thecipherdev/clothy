import { Plus } from 'lucide-react';
import { AppDialog } from '@/components/AppDialog';
import { AddProductForm } from './AddProductForm';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useProductContext } from '../context/ProductContext';
import { UseAppForm } from '@/types/form';

interface ProductDialogProps {
  handleOpenDialog: () => void;
  sizes: string[];
  colors: string[];
  form: UseAppForm;
}

export function ProductDialog({
  handleOpenDialog,
  sizes,
  colors,
  form,
}: ProductDialogProps) {
  const { editingProduct } = useProductContext()
  return (
    <AppDialog trigger={(
      <Button
        size="sm"
        className="ml-auto w-fit"
        onClick={() => handleOpenDialog()}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Product
      </Button>

    )}>
      <DialogHeader>
        <DialogTitle>
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogDescription className="text-xs text-[#a0a0a0]">
          Manage your product information
        </DialogDescription>
      </DialogHeader>
      <AddProductForm sizes={sizes} colors={colors} form={form as unknown as UseAppForm} />

    </AppDialog>
  )
}
