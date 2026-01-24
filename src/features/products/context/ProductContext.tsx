import { useContext, createContext, useMemo, useState, SetStateAction, Dispatch } from 'react';
import { Category } from '../types';


type ProductContextType = {
  editingProduct: string | null;
  setEditingProduct: Dispatch<SetStateAction<string | null>>;
}

const initialValue = {
  editingProduct: "",
  setEditingProduct: () => { },
}


export const ProductContext = createContext<ProductContextType>(initialValue)
export const useProductContext = () => useContext(ProductContext)


export function ProductContextProvider({
  children,
}: { children: React.ReactNode }) {
  const [editingProduct, setEditingProduct] = useState<string | null>(null);

  const value = useMemo(() => ({
    editingProduct,
    setEditingProduct,
  }), [
    editingProduct,
  ])

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  )
}
