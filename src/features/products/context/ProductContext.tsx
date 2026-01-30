import { useNavigate } from '@tanstack/react-router'
import { useContext, createContext, useMemo, useState, SetStateAction, Dispatch } from 'react';
import { SearchParamsType } from '../types/schema';


type ProductContextType = {
  editingProduct: string | null;
  setEditingProduct: Dispatch<SetStateAction<string | null>>;
  updateFilter: (name: keyof SearchParamsType, value: unknown) => void
}

const initialValue = {
  editingProduct: "",
  setEditingProduct: () => { },
  updateFilter: () => { }
}


export const ProductContext = createContext<ProductContextType>(initialValue)
export const useProductContext = () => useContext(ProductContext)


export function ProductContextProvider({
  children,
}: { children: React.ReactNode }) {
  const navigate = useNavigate({ from: '/products/' })

  const updateFilter = (name: keyof SearchParamsType, value: unknown) => {
    return navigate({
      search: (prev) => ({
        ...prev,
        [name]: (!value || value === '' || value === 'all') ? undefined : value
      })
    })
  }

  const [editingProduct, setEditingProduct] = useState<string | null>(null);

  const value = useMemo(() => ({
    editingProduct,
    setEditingProduct,
    updateFilter
  }), [
    editingProduct,
    updateFilter,
  ])

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  )
}
