import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/app/lib/supabase/client'
import { useAuth } from '@/app/contexts/AuthContext'

interface UseDeleteCartItemReturn {
  deleteItem: (item: string) => Promise<void>
  isDeleting: boolean
  error: string | null
}

export function useDeleteCartItem(): UseDeleteCartItemReturn {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const deleteItem = async (item: string): Promise<void> => {
    if (!user) {
      throw new Error('You must be signed in to delete items')
    }

    setIsDeleting(true)
    setError(null)

    try {
      const supabase = createSupabaseBrowserClient()

      // Get all user's lists
      const { data: lists, error: fetchError } = await supabase
        .from('shopping_lists')
        .select('*')
        .eq('user_id', user.id)

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      if (!lists || lists.length === 0) {
        return
      }

      // Remove the item from all lists that contain it
      const updatePromises = lists
        .filter((list) => list.items.includes(item))
        .map((list) => {
          const updatedItems = list.items.filter((i: string) => i !== item)
          return supabase
            .from('shopping_lists')
            .update({ items: updatedItems })
            .eq('id', list.id)
        })

      // If a list becomes empty, delete it
      const deletePromises = lists
        .filter((list) => {
          const updatedItems = list.items.filter((i: string) => i !== item)
          return updatedItems.length === 0
        })
        .map((list) => supabase.from('shopping_lists').delete().eq('id', list.id))

      // Execute all updates and deletes
      const results = await Promise.all([...updatePromises, ...deletePromises])
      
      // Check for errors
      const errors = results.filter((result) => result.error)
      if (errors.length > 0) {
        throw new Error(errors[0].error?.message || 'Failed to delete item')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete item'
      setError(errorMessage)
      throw err
    } finally {
      setIsDeleting(false)
    }
  }

  return {
    deleteItem,
    isDeleting,
    error,
  }
}

