'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface AuthDialogContextType {
  isOpen: boolean
  openDialog: () => void
  closeDialog: () => void
}

const AuthDialogContext = createContext<AuthDialogContextType | undefined>(undefined)

export function AuthDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <AuthDialogContext.Provider
      value={{
        isOpen,
        openDialog: () => setIsOpen(true),
        closeDialog: () => setIsOpen(false),
      }}
    >
      {children}
    </AuthDialogContext.Provider>
  )
}

export function useAuthDialog() {
  const context = useContext(AuthDialogContext)
  if (context === undefined) {
    throw new Error('useAuthDialog must be used within an AuthDialogProvider')
  }
  return context
}

