'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      // Read theme from DOM class set by the script tag in layout.tsx
      const root = document.documentElement
      const hasDark = root.classList.contains('dark')
      
      if (hasDark) {
        setTheme('dark')
      } else {
        // Fallback: check localStorage or default to dark
        const savedTheme = localStorage.getItem('theme') as Theme | null
        if (savedTheme) {
          setTheme(savedTheme)
        } else {
          // Default to dark theme
          setTheme('dark')
        }
      }
    }
  }, [])

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return
    
    const root = document.documentElement
    // For Tailwind's class-based dark mode, we only add 'dark' class when dark
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme, mounted])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  // Always provide the context, even before mounted (during SSR)
  // The script tag in layout.tsx will handle the initial theme class
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    // During SSR/build, return dark as default
    if (typeof window === 'undefined') {
      return { theme: 'dark' as Theme, toggleTheme: () => {} }
    }
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
