import { useState, useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/app/lib/supabase/client'
import { useAuth } from '@/app/contexts/AuthContext'

export interface ShoppingList {
  id: string
  items: string[]
  created_at: string
  updated_at: string
}

interface UseShoppingListsReturn {
  lists: ShoppingList[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useShoppingLists(): UseShoppingListsReturn {
  const [lists, setLists] = useState<ShoppingList[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const [lastUserId, setLastUserId] = useState<string | null>(null)

  const fetchLists = async () => {
    if (!user) {
      setLists([])
      setLoading(false)
      setLastUserId(null)
      return
    }

    // Only fetch if user actually changed
    if (user.id === lastUserId && lists.length > 0) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const supabase = createSupabaseBrowserClient()

      const { data, error: fetchError } = await supabase
        .from('shopping_lists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      setLists(data || [])
      setLastUserId(user.id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch shopping lists'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Only fetch if user ID actually changed
    if (user?.id !== lastUserId) {
      fetchLists()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  return {
    lists,
    loading,
    error,
    refetch: fetchLists,
  }
}

