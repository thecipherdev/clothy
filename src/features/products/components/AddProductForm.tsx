import { FieldGroup } from '@/components/ui/field';
import { Button } from "@/components/ui/button";
import { useProductContext } from "../context/ProductContext";
import { useGlobalContext } from "@/context/GlobalContext";
import { useCategories } from "../model/queries";
import { Category } from "../types";
import { UseAppForm } from '@/types/form';

type Props = {
  form: UseAppForm;
  sizes: string[];
  colors: string[];
}


type AttrributeSelector = {
  form: UseAppForm;
  items: string[];
  label: string;
  name: 'sizes' | 'colors'
}

function AttributeSelector({
  form,
  items,
  label,
  name,
}: AttrributeSelector) {
  return (
    <form.AppField
      mode="array"
      name={name}
      children={(field) => {
        const toggleValue = (val: string) => {
          const current = (field.state.value || []) as string[]
          const index = current.indexOf(val)

          if (index > -1) {
            field.removeValue(index)
          } else {
            field.pushValue(val as never)
          }
        }
        return (
          <field.BadgeSelect
            label={label}
            items={items}
            handleClick={toggleValue}
          />
        )
      }}
    />
  )
}

export function AddProductForm({
  sizes,
  colors,
  form,
}: Props) {
  const { editingProduct } = useProductContext()
  const { data: categories } = useCategories()
  const { setIsDialogOpen } = useGlobalContext()

  return (
    <form onSubmit={(e: React.FormEvent) => {
      e.preventDefault();
      form.handleSubmit();
    }} className="space-y-4">
      <div className="space-y-4">
        <FieldGroup className="grid grid-cols-2 gap-4">
          <form.AppField
            name="sku"
            children={(field) => (
              <field.Input formBaseProps={{ label: "SKU" }} />
            )}
          />
          <form.AppField
            name="price"
            children={(field) => (
              <field.Input formBaseProps={{ label: "Price" }} />
            )}
          />
        </FieldGroup>
        <form.AppField
          name="name"
          children={(field) => (
            <field.Input formBaseProps={{ label: "Product Name" }} />
          )}
        />
        <form.AppField
          name="category_id"
          children={(field) => (
            <field.Select formBaseProps={{ label: "Category" }} items={categories?.data as Category[]} placeholder="Select Categories" />
          )}
        />
        <form.AppField
          name="description"
          children={(field) => (
            <field.Textarea formBaseProps={{ label: "Description" }} aria-describedby={field.name} />
          )}
        />
        <AttributeSelector name="sizes" label="Sizes" items={sizes} form={form as unknown as UseAppForm} />
        <AttributeSelector name="colors" label="Colors" items={colors} form={form as unknown as UseAppForm} />
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button type="submit">
            {editingProduct ? 'Update' : 'Create'}
          </Button>
        </div>
      </div>
    </form>
  )
}
