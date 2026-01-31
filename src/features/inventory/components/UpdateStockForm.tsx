import { useInvetoryContext } from '../context/InventoryContext'
import { FormInfo } from './FormInfo'
import type { UseAppForm } from '@/types/form'
import { Button } from '@/components/ui/button'
import { useGlobalContext } from '@/context/GlobalContext'

interface Props {
  form: UseAppForm
  adjustmentType: string
}

export function UpdateStockForm({ form, adjustmentType }: Props) {
  const { selectedInventory } = useInvetoryContext()
  const { setIsDialogOpen } = useGlobalContext()

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="space-y-4"
    >
      <FormInfo />

      <form.AppField
        name="quantity"
        children={(field) => (
          <field.Input
            formBaseProps={{ label: 'Quantity' }}
            id="quantity"
            type="number"
            min="1"
            max={
              adjustmentType === 'out' ? selectedInventory?.quantity : undefined
            }
          />
        )}
      />
      <form.AppField
        name="reason"
        children={(field) => (
          <field.Input
            formBaseProps={{ label: 'Reason (optional)' }}
            id="reason"
            placeholder={
              adjustmentType === 'in'
                ? 'e.g., New shipment, Return'
                : 'e.g., Sold, Damaged, Lost'
            }
          />
        )}
      />
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsDialogOpen(false)}
        >
          Cancel
        </Button>
        <Button type="submit">
          {adjustmentType === 'in' ? 'Add Stock' : 'Remove Stock'}
        </Button>
      </div>
    </form>
  )
}
