import { createServerFn } from '@tanstack/react-start'
import { supabase } from '@/integrations/supabase/client';
import { UpdateProductFormData, ProductForm } from '../types/schema';

export const createProduct = createServerFn({ method: 'POST' })
  .inputValidator(ProductForm)
  .handler(async ({ data }) => {
    const variantsPayload = data.sizes.flatMap(size => (
      data.colors.map(color => ({ size, color }))
    ))

    console.log(variantsPayload)

    const { data: newProductId, error } = await supabase.rpc('create_product_with_variants', {
      p_sku: data.sku,
      p_name: data.name,
      p_description: (data.description || null) as string,
      p_price: parseFloat(data.price),
      p_category_id: (data.category_id || null) as string,
      p_variants: variantsPayload
    })

    if (error) {
      console.error('Create Error:', error);
      throw new Error(error.message);
    }

    return { success: true, id: newProductId }
  })

export const updateProduct = createServerFn({ method: 'POST' })
  .inputValidator(UpdateProductFormData)
  .handler(async ({ data }) => {
    const {
      product,
      editingProduct
    } = data

    // Prepare the variants array for the SQL function
    const newVariants = product.sizes.flatMap((size) =>
      product.colors.map((color) => ({ size, color }))
    );

    // Call the RPC function
    const { error } = await supabase.rpc('update_product_with_variants', {
      p_product_id: editingProduct,
      p_sku: product.sku,
      p_name: product.name,
      p_description: (product.description || null) as unknown as string,
      p_price: parseFloat(product.price),
      p_category_id: (product.category_id || null) as unknown as string,
      p_variants: newVariants // Pass the JSON array directly
    });

    if (error) {
      console.error('Transaction Error:', error);
      throw new Error(error.message);
    }
    return { success: true };
  })

