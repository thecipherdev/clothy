import { getRouteApi, NavigateOptions, useNavigate } from '@tanstack/react-router';
import { useContext, createContext, useMemo } from 'react';

import { SearchParamsType } from '../types/schema';

interface InventoryContextTypes {
  updateFilter: (name: keyof SearchParamsType, value: unknown) => void
  searchParams: SearchParamsType;
  navigate: (args: NavigateOptions) => void
}

const initialValue = {
  updateFilter: () => { },
  searchParams: {},
  navigate: () => ""
}

const Route = getRouteApi('/(app)/inventory')

export const InventoryContext = createContext<InventoryContextTypes>(initialValue)
export const useInvetoryContext = () => {
  const context = useContext(InventoryContext)
  if (!context) {
    throw new Error('useInventoryContext must be used with a InventoryContext');
  }
  return context
}

export const InventoryProvider = ({ children }: { children: React.ReactNode }) => {
  const searchParams = Route.useSearch();
  const navigate = useNavigate({ from: '/inventory' });

  const updateFilter = (name: keyof SearchParamsType, value: unknown) => {
    console.log({ name, value })
    return navigate({
      search: (prev) => ({
        ...prev,
        [name]: (!value || value === '' || value === 'all') ? undefined : value
      })
    })
  }

  const value = useMemo(() => ({
    updateFilter,
    searchParams,
    navigate,
  }), [updateFilter, searchParams, navigate])

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  )
}
