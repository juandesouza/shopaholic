'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingList } from './components/ShoppingList'
import { ShoppingCart } from './components/ShoppingCart'
import SupabaseStatus from './components/SupabaseStatus'
import DeleteAccountButton from './components/DeleteAccountButton'
import { createSupabaseBrowserClient } from './lib/supabase/client'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
    },
  },
}

export default function Home() {
  // Handle OAuth callback - ensure session is retrieved after redirect
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const supabase = createSupabaseBrowserClient()
      
      // Check for OAuth callback in URL (both hash and query params for cross-browser compatibility)
      const hash = window.location.hash
      const searchParams = new URLSearchParams(window.location.search)
      const hasOAuthParams = hash && (hash.includes('access_token') || hash.includes('code')) ||
                            searchParams.has('code') || searchParams.has('access_token')
      
      if (hasOAuthParams) {
        try {
          // Wait a bit for Supabase to process the callback
          await new Promise(resolve => setTimeout(resolve, 100))
          
          // Get the session - this will exchange the code/token for a session
          const { data: { session }, error } = await supabase.auth.getSession()
          
          if (error) {
            console.error('Error getting session after OAuth:', error)
          } else if (session) {
            console.log('OAuth callback successful, user:', session.user.email)
          }
          
          // Clear OAuth parameters from URL after processing
          if (hash && (hash.includes('access_token') || hash.includes('code'))) {
            window.location.hash = ''
          }
          if (searchParams.has('code') || searchParams.has('access_token')) {
            window.history.replaceState({}, '', window.location.pathname)
          }
        } catch (error) {
          console.error('Error handling OAuth callback:', error)
        }
      }
    }
    
    // Run immediately and also after a short delay for browsers that load slowly
    handleOAuthCallback()
    const timeoutId = setTimeout(handleOAuthCallback, 500)
    
    return () => clearTimeout(timeoutId)
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-12"
        style={{ opacity: 1 }}
      >
        {/* Header Section */}
        <motion.section variants={itemVariants} className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="block">Welcome to</span>
            <span className="block bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">
              shopaholic
            </span>
          </h1>
        </motion.section>

        {/* Supabase Status */}
        <motion.section variants={itemVariants}>
          <SupabaseStatus />
        </motion.section>

        {/* Shopping List Section */}
        <motion.section variants={itemVariants}>
          <ShoppingList />
        </motion.section>

        {/* Shopping Cart Section */}
        <motion.section variants={itemVariants}>
          <ShoppingCart />
        </motion.section>

        {/* Delete Account Button */}
        <motion.section variants={itemVariants}>
          <DeleteAccountButton />
        </motion.section>
      </motion.div>
    </div>
  )
}
