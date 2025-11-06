import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/app/lib/supabase/client'
import { useAuth } from '@/app/contexts/AuthContext'

interface UseSaveShoppingListReturn {
  saveShoppingList: (items: string[]) => Promise<void>
  isSaving: boolean
  error: string | null
}

export function useSaveShoppingList(): UseSaveShoppingListReturn {
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const saveShoppingList = async (items: string[]): Promise<void> => {
    if (!user) {
      throw new Error('You have to sign in in order to save a list')
    }

    setIsSaving(true)
    setError(null)

    try {
      const supabase = createSupabaseBrowserClient()

      const { error: insertError } = await supabase
        .from('shopping_lists')
        .insert({
          items: items,
          user_id: user.id,
        })

      if (insertError) {
        throw new Error(insertError.message)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save shopping list'
      setError(errorMessage)
      throw err
    } finally {
      setIsSaving(false)
    }
  }

  return {
    saveShoppingList,
    isSaving,
    error,
  }
}

