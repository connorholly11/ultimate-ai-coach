'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import type { FTUEData } from '@/types/auth'

interface FTUEContextType {
  data: Partial<FTUEData>
  updateData: (updates: Partial<FTUEData>) => void
  clearData: () => void
}

const FTUEContext = createContext<FTUEContextType | undefined>(undefined)

export function FTUEProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Partial<FTUEData>>({})
  
  const updateData = (updates: Partial<FTUEData>) => {
    setData(prev => ({ ...prev, ...updates }))
  }
  
  const clearData = () => {
    setData({})
  }
  
  return (
    <FTUEContext.Provider value={{ data, updateData, clearData }}>
      {children}
    </FTUEContext.Provider>
  )
}

export function useFTUE() {
  const context = useContext(FTUEContext)
  if (!context) {
    throw new Error('useFTUE must be used within FTUEProvider')
  }
  return context
}