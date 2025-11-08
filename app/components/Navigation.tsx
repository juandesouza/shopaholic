'use client'

import { useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { useAuthDialog } from '../contexts/AuthDialogContext'
import { motion } from 'framer-motion'
import { Button } from './ui/button'
import { LogIn, LogOut, User } from 'lucide-react'

export function Navigation() {
  const { theme, toggleTheme } = useTheme()
  const { user, loading, signOut } = useAuth()
  const { isOpen: authDialogOpen, openDialog, closeDialog } = useAuthDialog()
  
  // Close dialog if user becomes authenticated (e.g., after OAuth redirect)
  useEffect(() => {
    if (user && !loading && authDialogOpen) {
      closeDialog()
    }
  }, [user, loading, authDialogOpen, closeDialog])
  
  // Check for OAuth redirect and close dialog if needed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if we're returning from OAuth (URL might have hash fragments)
      const hash = window.location.hash
      if (hash && (hash.includes('access_token') || hash.includes('code'))) {
        // OAuth redirect detected - ensure dialog is closed
        closeDialog()
      }
    }
  }, [closeDialog])

  const handleSignOut = async () => {
    try {
      await signOut()
      // Force page reload to ensure state is cleared
      window.location.reload()
    } catch (error) {
      console.error('Error signing out:', error)
      // Still reload even on error to clear any stale state
      window.location.reload()
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">shopaholic</h1>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user.email}</span>
                </div>
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            ) : (
              <Button
                onClick={openDialog}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-muted/50 transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2" />
                  <path d="M12 20v2" />
                  <path d="m4.93 4.93 1.41 1.41" />
                  <path d="m17.66 17.66 1.41 1.41" />
                  <path d="M2 12h2" />
                  <path d="M20 12h2" />
                  <path d="m6.34 17.66-1.41 1.41" />
                  <path d="m19.07 4.93-1.41 1.41" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </nav>
  )
}

