import { Plus } from 'lucide-react'
import { useProductContext } from '../context/ProductContext'
import { AddProductForm } from './AddProductForm'
import type { UseAppForm } from '@/types/form'
import { AppDialog } from '@/components/AppDialog'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ProductDialogProps {
  handleOpenDialog: () => void
  sizes: Array<string>
  colors: Array<string>
  form: UseAppForm
}

export function ProductDialog({
  handleOpenDialog,
  sizes,
  colors,
  form,
}: ProductDialogProps) {
  const { editingProduct } = useProductContext()
  return (
    <AppDialog
      trigger={
        <Button
          size="sm"
          className="ml-auto w-fit"
          onClick={() => handleOpenDialog()}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      }
    >
      <DialogHeader>
        <DialogTitle>
          {editingProduct ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogDescription className="text-xs text-[#a0a0a0]">
          Manage your product information
        </DialogDescription>
      </DialogHeader>
      <AddProductForm
        sizes={sizes}
        colors={colors}
        form={form as unknown as UseAppForm}
      />
    </AppDialog>
  )
}
