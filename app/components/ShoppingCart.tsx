'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart as ShoppingCartIcon, Trash2 } from 'lucide-react'
import { Button } from './ui/button'
import { useShoppingLists } from '@/app/hooks/use-shopping-lists'
import { useDeleteCartItem } from '@/app/hooks/use-delete-cart-item'
import { useAuth } from '@/app/contexts/AuthContext'
import { useToast } from './ui/use-toast'
import { getStripe } from '@/app/lib/stripe/client'

export function ShoppingCart() {
  const { user } = useAuth()
  const { lists, loading, error, refetch } = useShoppingLists()
  const { deleteItem, isDeleting } = useDeleteCartItem()
  const { toast } = useToast()
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  // Refetch when user changes
  useEffect(() => {
    if (user) {
      refetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])


  // Handle successful payment redirect - clear cart immediately
  useEffect(() => {
    if (typeof window === 'undefined' || !user) return
    
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get('success')
    
    if (success === 'true') {
      // Clear all shopping lists immediately on client side
      const clearCart = async () => {
        try {
          console.log('🧹 Clearing cart after successful payment for user:', user.id)
          const { createSupabaseBrowserClient } = await import('@/app/lib/supabase/client')
          const supabase = createSupabaseBrowserClient()
          
          // Use direct fetch to delete all shopping lists for this user
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
          if (!supabaseUrl) {
            throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
          }
          const deleteUrl = `${supabaseUrl}/rest/v1/shopping_lists?user_id=eq.${user.id}`
          console.log('🗑️ Deleting from:', deleteUrl)
          
          const response = await fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
              'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
              'Prefer': 'return=representation', // Return deleted rows
            },
          })
          
          console.log('📥 Delete response:', response.status, response.statusText)
          
          if (!response.ok) {
            const errorText = await response.text()
            console.error('❌ Error clearing cart:', errorText)
            toast({
              variant: 'destructive',
              title: 'Error',
              description: 'Failed to clear shopping cart. Please refresh the page.',
            })
            return
          }
          
          const deletedData = await response.json()
          console.log('✅ Deleted shopping lists:', deletedData?.length || 0, 'lists')
          
          // Clear URL parameter
          window.history.replaceState({}, '', window.location.pathname)
          
          // Small delay to ensure delete is processed
          await new Promise(resolve => setTimeout(resolve, 100))
          
          // Refresh cart to show it's empty
          console.log('🔄 Refetching lists after cart clear...')
          await refetch()
          console.log('✅ Refetch completed - cart should now be empty')
          
          toast({
            variant: 'success',
            title: 'Payment successful!',
            description: 'Your order has been processed. Shopping cart has been cleared.',
          })
        } catch (error) {
          console.error('❌ Error clearing cart:', error)
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to clear shopping cart. Please refresh the page.',
          })
        }
      }
      
      clearCart()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Listen for custom events when lists are saved or deleted
  useEffect(() => {
    const handleListSaved = async () => {
      if (user) {
        await refetch()
      }
    }

    window.addEventListener('shoppingListSaved', handleListSaved)
    return () => window.removeEventListener('shoppingListSaved', handleListSaved)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]) // Only depend on user, refetch is stable enough via closure
  
  // Also refetch when user changes (e.g., after OAuth login)
  useEffect(() => {
    if (user) {
      refetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const handleDeleteItem = async (item: string) => {
    try {
      // Delete the item first
      await deleteItem(item)
      // Immediately refetch to update the UI - this will force a refresh
      await refetch()
      toast({
        variant: 'success',
        title: 'Item deleted',
        description: `"${item}" has been removed from your shopping cart.`,
      })
      // Dispatch event to notify other components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('shoppingListSaved'))
      }
    } catch (error) {
      // On error, refetch to restore correct state
      await refetch()
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete item',
      })
    }
  }

  const handleCheckout = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication required',
        description: 'Please sign in to proceed with checkout.',
      })
      return
    }

    // Flatten all items from all lists
    const allItems = lists.flatMap((list) => list.items)
    const uniqueItems = Array.from(new Set(allItems))

    if (uniqueItems.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Empty cart',
        description: 'Your shopping cart is empty.',
      })
      return
    }

    setIsCheckingOut(true)

    try {
      // Create checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: uniqueItems,
          currency: 'brl', // Cards and Boleto use BRL currency
          userId: user.id, // Store user ID for clearing cart after payment
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create checkout session')
      }

      const { sessionId, url } = await response.json()

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url
      } else {
        throw new Error('No checkout URL received from server')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast({
        variant: 'destructive',
        title: 'Checkout failed',
        description: error instanceof Error ? error.message : 'An error occurred during checkout',
      })
      setIsCheckingOut(false)
    }
  }

  // Don't show anything if there's no user
  if (!user) {
    return null
  }

  // Flatten all items from all lists and check if empty
  const allItems = lists.flatMap((list) => list.items)
  const uniqueItems = Array.from(new Set(allItems))
  
  // Don't show cart if there are no items (even during loading)
  // This prevents showing "Loading..." when the cart is empty
  if (uniqueItems.length === 0) {
    return null
  }

  // Show loading state only if we're loading and have items
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-12 rounded-2xl border border-border bg-background p-8 shadow-lg"
      >
        <div className="flex items-center gap-3 mb-6">
          <ShoppingCartIcon className="h-6 w-6 text-accent" />
          <h2 className="text-2xl font-bold text-foreground">Shopping Cart</h2>
        </div>
        <p className="py-8 text-center text-muted-foreground">Loading...</p>
      </motion.div>
    )
  }

  // Show error state if there's an error
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-12 rounded-2xl border border-border bg-background p-8 shadow-lg"
      >
        <div className="flex items-center gap-3 mb-6">
          <ShoppingCartIcon className="h-6 w-6 text-accent" />
          <h2 className="text-2xl font-bold text-foreground">Shopping Cart</h2>
        </div>
        <p className="py-8 text-center text-destructive">Error: {error}</p>
        <Button onClick={() => refetch()} className="w-full mt-4">
          Retry
        </Button>
      </motion.div>
    )
  }

  // Calculate price for an item (1 dollar per letter)
  const calculatePrice = (item: string): number => {
    // Count only letters (ignore spaces, numbers, special characters)
    const letterCount = item.replace(/[^a-zA-Z]/g, '').length
    return letterCount
  }

  // Calculate total price
  const totalPrice = uniqueItems.reduce((sum, item) => sum + calculatePrice(item), 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-12 rounded-2xl border border-border bg-background p-8 shadow-lg"
    >
      <div className="flex items-center gap-3 mb-6">
        <ShoppingCartIcon className="h-6 w-6 text-accent" />
        <h2 className="text-2xl font-bold text-foreground">Shopping Cart</h2>
        <span className="ml-auto text-sm text-muted-foreground">
          {uniqueItems.length} {uniqueItems.length === 1 ? 'item' : 'items'} from {lists.length}{' '}
          {lists.length === 1 ? 'list' : 'lists'}
        </span>
      </div>

      <ul className="space-y-2 w-full lg:w-[70%] lg:mx-auto">
        <AnimatePresence mode="popLayout">
          {uniqueItems.map((item, index) => (
            <motion.li
              key={`${item}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3 flex-1">
                <span className="text-sm font-medium text-accent min-w-[2.5rem] text-right">
                  ${calculatePrice(item)}
                </span>
                <span className="text-foreground">{item}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteItem(item)}
                disabled={isDeleting}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                aria-label={`Delete ${item}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <div className="mt-6 pt-6 border-t border-border w-full lg:w-[70%] lg:mx-auto">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold text-foreground">Total</span>
          <span className="text-2xl font-bold text-accent">${totalPrice}</span>
        </div>
        <Button
          className="w-full gap-2"
          size="lg"
          onClick={handleCheckout}
          disabled={isCheckingOut || isDeleting}
        >
          {isCheckingOut ? 'Processing...' : 'Checkout'}
        </Button>
      </div>
    </motion.div>
  )
}

