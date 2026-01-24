import { useContext, createContext, useMemo, useState, SetStateAction, Dispatch } from 'react';
import { Category } from '../types';


type ProductContextType = {
  categories: Category[];
  setCategories: Dispatch<SetStateAction<Category[]>>;
  editingProduct: string | null;
  setEditingProduct: Dispatch<SetStateAction<string | null>>;
}

const initialValue = {
  categories: [],
  setCategories: () => { },
  editingProduct: "",
  setEditingProduct: () => { },
}


export const ProductContext = createContext<ProductContextType>(initialValue)
export const useProductContext = () => useContext(ProductContext)


export function ProductContextProvider({
  children,
}: { children: React.ReactNode }) {

  const [categories, setCategories] = useState<Category[]>([])
  const [editingProduct, setEditingProduct] = useState<string | null>(null);

  const value = useMemo(() => ({
    categories,
    setCategories,
    editingProduct,
    setEditingProduct,
  }), [
    categories,
    editingProduct,
  ])

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  )
}
