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
    console.log('🔵 use-save-shopping-list: saveShoppingList called', { itemsCount: items.length, userId: user?.id })
    
    if (!user) {
      console.error('❌ No user found')
      throw new Error('You have to sign in in order to save a list')
    }

    console.log('✅ User found, setting isSaving to true')
    setIsSaving(true)
    setError(null)

    try {
      console.log('📦 Creating Supabase client...')
      console.log('🔍 Environment check:', {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30),
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        keyPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)
      })
      const supabase = createSupabaseBrowserClient()
      console.log('✅ Supabase client created')
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (!supabaseUrl) {
        throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
      }
      console.log('🔍 Client info:', {
        url: supabaseUrl,
        hasAuth: !!supabase.auth
      })

      // Skip session check - it's hanging. We have user from AuthContext, so auth should work.
      // If there's an auth issue, the insert will fail with a clear error.
      console.log('📝 Attempting to insert shopping list with user_id:', user.id, 'items:', items)
      console.log('💡 Skipping session check - going straight to insert. If auth fails, we will get an error.')

      // Insert with user_id - RLS policy requires auth.uid() = user_id
      console.log('🚀 Making insert request to Supabase...')
      console.log('📋 Insert data:', { items, user_id: user.id })
      
      // Use direct fetch instead of Supabase client - the client's insert method seems to hang
      console.log('📤 Making direct HTTP request to Supabase REST API...')
      console.log('🔗 Supabase URL:', supabaseUrl)
      
      // Get auth token - try to get it from the client's current session
      // Supabase stores session in localStorage with a specific key format
      let authToken: string | null = null
      if (typeof window !== 'undefined') {
        // Try to find Supabase auth token in localStorage
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.includes('supabase') && key.includes('auth-token')) {
            const tokenData = localStorage.getItem(key)
            if (tokenData) {
              try {
                const parsed = JSON.parse(tokenData)
                authToken = parsed?.access_token || null
                if (authToken) break
              } catch (e) {
                // Not JSON, skip
              }
            }
          }
        }
      }
      
      console.log('🔑 Auth token found:', authToken ? 'Yes' : 'No')
      
      // Make direct fetch request to Supabase REST API
      const insertUrl = `${supabaseUrl}/rest/v1/shopping_lists`
      const insertPayload = {
        items: items,
        user_id: user.id,
      }
      
      console.log('📡 Making fetch request to:', insertUrl)
      console.log('📦 Payload:', insertPayload)
      
      const response = await fetch(insertUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': authToken 
            ? `Bearer ${JSON.parse(authToken).access_token}` 
            : `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
          'Prefer': 'return=representation', // Return the inserted row
        },
        body: JSON.stringify(insertPayload),
      })
      
      console.log('📥 Response received:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ HTTP Error:', errorText)
        throw new Error(`Insert failed: ${response.status} ${response.statusText} - ${errorText}`)
      }
      
      const data = await response.json()
      console.log('✅ Insert successful, data:', data)

      if (!data || (Array.isArray(data) && data.length === 0)) {
        console.error('❌ No data returned from insert')
        throw new Error('Shopping list was not created. No data returned.')
      }

      const insertedData = Array.isArray(data) ? data[0] : data
      console.log('✅ Shopping list saved successfully:', insertedData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save shopping list'
      console.error('❌ Save shopping list error:', errorMessage, err)
      console.error('❌ Full error object:', err)
      setError(errorMessage)
      throw err
    } finally {
      console.log('🏁 Setting isSaving to false')
      setIsSaving(false)
    }
  }

  return {
    saveShoppingList,
    isSaving,
    error,
  }
}


