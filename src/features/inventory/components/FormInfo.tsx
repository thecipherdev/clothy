import { useInvetoryContext } from '../context/InventoryContext'

export function FormInfo() {
  const { selectedInventory } = useInvetoryContext()
  if (!selectedInventory) {
    return null
  }

  return (
    <div className="p-3 bg-muted rounded-lg">
      <p className="font-medium">{selectedInventory.variant?.product?.name}</p>
      <p className="text-sm text-muted-foreground">
        {selectedInventory.variant?.size} / {selectedInventory.variant?.color} •{' '}
        {selectedInventory.branch?.name}
      </p>
      <p className="text-sm mt-1">
        Current stock:{' '}
        <span className="font-medium">{selectedInventory.quantity}</span>
      </p>
    </div>
  )
}
