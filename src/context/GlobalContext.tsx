import React, { useState, useMemo, useContext, createContext, Dispatch, SetStateAction } from 'react';

interface GlobalContextType {
  isDialogOpen: boolean;
  setIsDialogOpen: Dispatch<SetStateAction<boolean>>
}

const initialValue = {
  isDialogOpen: false,
  setIsDialogOpen: () => { },
}

export const GlobalContext = createContext<GlobalContextType>(initialValue)
export const useGlobalContext = () => useContext(GlobalContext)

export function GlobalContextProvider({ children }: { children: React.ReactNode }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const value = useMemo(() => ({
    isDialogOpen,
    setIsDialogOpen,
  }), [isDialogOpen])

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  )
} 
