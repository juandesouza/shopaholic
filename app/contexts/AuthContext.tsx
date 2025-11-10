'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createSupabaseBrowserClient } from '@/app/lib/supabase/client'

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  deleteAccount: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()

    // Get initial session - important for OAuth redirects
    const initializeAuth = async () => {
      try {
        // Get session - Supabase will automatically handle OAuth callbacks from URL
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
        }
        
        // Set user immediately if session exists
        if (session?.user) {
          console.log('Session found on init:', session.user.email)
          setUser(session.user)
        } else {
          setUser(null)
        }
        
        // Only clear OAuth params AFTER Supabase has processed them (after getSession)
        // Wait a bit to ensure Supabase processed the callback
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            const hash = window.location.hash
            const searchParams = new URLSearchParams(window.location.search)
            
            if (hash && (hash.includes('access_token') || hash.includes('code'))) {
              window.location.hash = ''
            }
            if (searchParams.has('code') || searchParams.has('access_token')) {
              window.history.replaceState({}, '', window.location.pathname)
            }
          }, 100)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error initializing auth:', error)
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes (including OAuth redirects)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      
      // Immediately update user state from the event
      if (session?.user) {
        setUser(session.user)
      } else {
        setUser(null)
      }
      
      // Set loading to false on auth events
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'SIGNED_OUT') {
        setLoading(false)
      }
      
      // For OAuth redirects, immediately refresh session to ensure it's set
      if (event === 'SIGNED_IN') {
        try {
          // Get fresh session to ensure it's properly set
          const { data: { session: latestSession }, error } = await supabase.auth.getSession()
          if (error) {
            console.error('Error getting session after SIGNED_IN:', error)
          } else if (latestSession?.user) {
            console.log('Session confirmed after SIGNED_IN:', latestSession.user.email)
            setUser(latestSession.user)
            setLoading(false)
          }
        } catch (error) {
          console.error('Error refreshing session after SIGNED_IN:', error)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    const supabase = createSupabaseBrowserClient()
    
    // Determine redirect URL - use just origin (no pathname) for better compatibility
    let redirectTo: string
    if (typeof window !== 'undefined') {
      redirectTo = window.location.origin
    } else {
      redirectTo = process.env.NEXT_PUBLIC_APP_URL || 
        (process.env.NEXT_PUBLIC_VERCEL_URL ? 
          `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` :
          'https://shopaholic-mbcjdvn09-juan-de-souzas-projects-51f7e08a.vercel.app')
    }
    
    console.log('Starting OAuth login, redirectTo:', redirectTo)
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        // Remove queryParams that might interfere with Google's 2FA flow
        // Let Google handle authentication prompts naturally
      },
    })
    
    if (error) {
      console.error('OAuth error:', error)
      // Provide more helpful error message for provider not enabled
      if (error.message.includes('provider is not enabled') || 
          error.message.includes('Unsupported provider')) {
        throw new Error('Google OAuth provider is not enabled in Supabase. Please enable it in the Supabase dashboard under Authentication > Providers.')
      }
      throw error
    }
    
    console.log('OAuth redirect initiated:', data?.url)
  }

  const signInWithEmail = async (email: string, password: string) => {
    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signUpWithEmail = async (email: string, password: string) => {
    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })
    if (error) throw error
  }

  const signOut = async () => {
    try {
      const supabase = createSupabaseBrowserClient()
      
      // Clear user state first
      setUser(null)
      
      // Sign out from Supabase - try both local and global scope
      const { error: localError } = await supabase.auth.signOut({ scope: 'local' })
      if (localError) {
        console.warn('Local sign out error:', localError)
      }
      
      const { error: globalError } = await supabase.auth.signOut({ scope: 'global' })
      if (globalError) {
        console.warn('Global sign out error:', globalError)
      }
      
      // Manually clear all Supabase-related cookies
      if (typeof window !== 'undefined') {
        // Clear cookies by setting them to expire
        const cookies = document.cookie.split(';')
        const domain = window.location.hostname
        const path = '/'
        
        cookies.forEach(cookie => {
          const eqPos = cookie.indexOf('=')
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
          
          // Clear Supabase auth cookies
          if (name.includes('supabase') || name.includes('sb-') || name.includes('auth')) {
            // Try multiple domain/path combinations
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain};`
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=.${domain};`
          }
        })
        
        // Clear localStorage
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.includes('supabase') || key.includes('auth') || key.includes('sb-'))) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key))
        
        // Clear sessionStorage
        const sessionKeysToRemove: string[] = []
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i)
          if (key && (key.includes('supabase') || key.includes('auth') || key.includes('sb-'))) {
            sessionKeysToRemove.push(key)
          }
        }
        sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key))
      }
      
      // Force a fresh session check
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        console.warn('Session still exists after sign out, forcing clear')
        // If session still exists, something is wrong - force clear
        setUser(null)
      }
    } catch (error) {
      console.error('Error in signOut:', error)
      // Still clear user state even on error
      setUser(null)
      throw error
    }
  }

  const deleteAccount = async () => {
    if (!user) throw new Error('No user logged in')

    const supabase = createSupabaseBrowserClient()

    // Delete all user's shopping lists
    const { error: deleteError } = await supabase
      .from('shopping_lists')
      .delete()
      .eq('user_id', user.id)

    if (deleteError) throw deleteError

    // Sign out the user (this will clear the session)
    // Note: The actual auth user deletion requires admin API access
    // For now, we delete all their data and sign them out
    // They can request account deletion through Supabase dashboard if needed
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

