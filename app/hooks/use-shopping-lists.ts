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

  const fetchLists = async (force = false) => {
    if (!user) {
      setLists([])
      setLoading(false)
      setLastUserId(null)
      return
    }

    // Only skip fetch if user hasn't changed AND we're not forcing a refresh
    if (!force && user.id === lastUserId && lists.length > 0) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('🔄 use-shopping-lists: Fetching lists for user:', user.id)
      const supabase = createSupabaseBrowserClient()

      // Use direct fetch instead of Supabase client to avoid hanging
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (!supabaseUrl) {
        throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
      }
      const fetchUrl = `${supabaseUrl}/rest/v1/shopping_lists?user_id=eq.${user.id}&order=created_at.desc`
      console.log('📡 Fetching from:', fetchUrl)
      
      const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
        },
      })

      console.log('📥 Fetch response:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Fetch error:', errorText)
        throw new Error(`Failed to fetch lists: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('✅ Fetched lists:', data.length, 'items')

      // Filter by user_id if user is logged in and user_id column exists
      let filteredData = data || []
      if (user && data && data.length > 0 && data[0].hasOwnProperty('user_id')) {
        filteredData = data.filter((list: any) => 
          !list.user_id || list.user_id === user.id
        )
      }

      console.log('✅ Filtered lists:', filteredData.length, 'items')
      setLists(filteredData)
      
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
    refetch: () => fetchLists(true), // Always force refresh when refetch is called
  }
}

