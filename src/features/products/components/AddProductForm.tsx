import { useState } from "react";
import { useAppForm } from "@/components/form/hooks";
import { supabase } from "@/integrations/supabase/client";
import { formSchema } from "../types/schema";
import { toast } from 'sonner';
import { Product } from "../types";

export function AddProductForm() {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const form = useAppForm({
    defaultValues: {
      sku: "",
      price: "",
      name: "",
      category_id: "",
      description: "",
      sizes: [] as string[],
      colors: [] as string[],
    },
    validators: {
      onSubmit: formSchema
    },
    onSubmit: async ({ value }) => {
      try {
        if (editingProduct) {
          const { error } = await supabase
            .from('products')
            .update({
              sku: value.sku,
              name: value.name,
              description: value.description || null,
              price: parseFloat(value.price),
              category_id: value.category_id || null,
            })
            .eq('id', editingProduct.id);

          if (error) throw error;

          // Update variants - delete existing and create new
          await supabase
            .from('product_variants')
            .delete()
            .eq('product_id', editingProduct.id);

          if (value.sizes.length > 0 && value.colors.length > 0) {
            const variants = value.sizes.flatMap((size) =>
              value.colors.map((color) => ({
                product_id: editingProduct.id,
                size,
                color,
              }))
            );
            await supabase.from('product_variants').insert(variants);
          }

          toast.success('Product updated successfully');
        } else {
          const { data: newProduct, error } = await supabase
            .from('products')
            .insert({
              sku: value.sku,
              name: value.name,
              description: value.description || null,
              price: parseFloat(value.price),
              category_id: value.category_id || null,
            })
            .select()
            .single();

          if (error) throw error;

          // Create variants
          if (value.sizes.length > 0 && value.colors.length > 0) {
            const variants = value.sizes.flatMap((size) =>
              value.colors.map((color) => ({
                product_id: newProduct.id,
                size,
                color,
              }))
            );
            await supabase.from('product_variants').insert(variants);
          }

          toast.success('Product created successfully');
        }

        setIsDialogOpen(false);
        router.invalidate()
      } catch (error: any) {
        console.error('Error saving product:', error);
        toast.error(error.message || 'Failed to save product');
      }
    }
  })
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
            <field.Select formBaseProps={{ label: "Category" }} items={categories} placeholder="Select Categories" />
          )}
        />
        <form.AppField
          name="description"
          children={(field) => (
            <field.Textarea formBaseProps={{ label: "Description" }} aria-describedby={field.name} />
          )}
        />
        <form.AppField
          name="sizes"
          children={(field) => {
            const toggleSize = (size: string) => {
              const currentSize = field.state.value || []
              const index = currentSize.indexOf(size)

              if (index > -1) {
                field.removeValue(index)
              } else {
                field.pushValue(size)
              }
            }
            return <field.BadgeSelect label="Sizes" items={SIZES} onClick={toggleSize} />
          }}

        />
        <form.AppField
          mode="array"
          name="colors"
          children={(field) => {
            const toggleColor = (color: string) => {
              const currentColors = field.state.value || [];
              const index = currentColors.indexOf(color)

              if (index > -1) {
                field.removeValue(index)
              } else {
                field.pushValue(color)
              }
            }
            return <field.BadgeSelect label="Colors" items={COLORS} onClick={toggleColor} />
          }}
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
            {editingProduct ? 'Update' : 'Create'}
          </Button>
        </div>
      </div>
    </form>
  )
}
