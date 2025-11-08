'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, LogIn, UserPlus, X } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useAuth } from '@/app/contexts/AuthContext'
import { useToast } from './ui/use-toast'

interface AuthDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthDialog({ isOpen, onClose }: AuthDialogProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth()
  const { toast } = useToast()

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password)
        toast({
          variant: 'success',
          title: 'Account created!',
          description: 'Please check your email to verify your account.',
        })
      } else {
        await signInWithEmail(email, password)
        toast({
          variant: 'success',
          title: 'Signed in!',
          description: 'Welcome back!',
        })
      }
      onClose()
      setEmail('')
      setPassword('')
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Authentication failed',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setIsLoading(true)
    try {
      // Don't close dialog - let OAuth redirect handle it
      // The dialog will close automatically when user becomes authenticated
      await signInWithGoogle()
      // Note: After Google OAuth, the page will redirect, so we don't need to handle success here
      // The dialog will be closed by the useEffect that watches for user authentication
    } catch (error) {
      let errorMessage = 'Google sign in failed'
      
      if (error instanceof Error) {
        // Check if it's a provider not enabled error
        if (error.message.includes('provider is not enabled') || 
            error.message.includes('Unsupported provider')) {
          errorMessage = 'Google sign in is not enabled. Please contact the administrator or use email sign in instead.'
        } else {
          errorMessage = error.message
        }
      }
      
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      })
      setIsLoading(false)
    }
  }

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Close dialog if user becomes authenticated (e.g., after OAuth redirect)
  const { user, loading } = useAuth()
  useEffect(() => {
    if (user && !loading && isOpen) {
      onClose()
    }
  }, [user, loading, isOpen, onClose])

  if (!isOpen || !mounted) return null

  const dialogContent = (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose()
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {isSignUp
                ? 'Create an account to save your shopping lists'
                : 'Sign in to access your saved shopping lists'}
            </p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button type="submit" className="w-full gap-2" disabled={isLoading}>
              {isSignUp ? (
                <>
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          <div className="my-4 flex items-center gap-2">
            <div className="flex-1 border-t border-border" />
            <span className="text-sm text-muted-foreground">OR</span>
            <div className="flex-1 border-t border-border" />
          </div>

          <Button
            onClick={handleGoogleAuth}
            variant="outline"
            className="w-full gap-2"
            disabled={isLoading}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="mt-4 text-center text-sm">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-accent hover:underline"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  )

  return createPortal(dialogContent, document.body)
}

