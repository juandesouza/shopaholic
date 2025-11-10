'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Save } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useSaveShoppingList } from '@/app/hooks/use-save-shopping-list'
import { useShoppingLists } from '@/app/hooks/use-shopping-lists'
import { useToast } from './ui/use-toast'
import { useAuth } from '@/app/contexts/AuthContext'
import { useAuthDialog } from '@/app/contexts/AuthDialogContext'

const STORAGE_KEY = 'shopping_list_draft'

export function ShoppingList() {
  const [items, setItems] = useState<string[]>([])
  const [inputValue, setInputValue] = useState('')
  const { openDialog } = useAuthDialog()
  const [showCharLimitWarning, setShowCharLimitWarning] = useState(false)
  const { saveShoppingList, isSaving } = useSaveShoppingList()
  const { refetch: refetchLists } = useShoppingLists()
  const { toast } = useToast()
  const { user, loading: authLoading } = useAuth()
  
  const MAX_ITEM_LENGTH = 20

  // Load saved items from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setItems(parsed)
          }
        } catch (e) {
          // Invalid data, ignore
        }
      }
    }
  }, [])

  // Restore items when user becomes authenticated (after returning from OAuth)
  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setItems(parsed)
          }
        } catch (e) {
          // Invalid data, ignore
        }
      }
    }
  }, [user])

  // Save items to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (items.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
      } else {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [items])

  // Clear localStorage after successful save
  const clearDraft = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  const handleInputFocus = () => {
    if (!user && !authLoading) {
      openDialog()
      toast({
        variant: 'default',
        title: 'Sign in required',
        description: 'Please sign in to add items to your shopping list.',
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.length <= MAX_ITEM_LENGTH) {
      setInputValue(value)
      setShowCharLimitWarning(false)
    } else {
      setShowCharLimitWarning(true)
      toast({
        variant: 'default',
        title: 'Character limit',
        description: `Items can only have a maximum of ${MAX_ITEM_LENGTH} characters.`,
      })
    }
  }

  const handleAddItem = () => {
    if (!user && !authLoading) {
      handleInputFocus()
      return
    }

    const trimmedValue = inputValue.trim()
    if (trimmedValue === '') {
      return
    }

    if (trimmedValue.length > MAX_ITEM_LENGTH) {
      setShowCharLimitWarning(true)
      toast({
        variant: 'default',
        title: 'Character limit',
        description: `Items can only have a maximum of ${MAX_ITEM_LENGTH} characters.`,
      })
      return
    }

    setItems([...items, trimmedValue])
    setInputValue('')
    setShowCharLimitWarning(false)
  }

  const handleDeleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddItem()
    }
  }

  const handleSave = async () => {
    console.log('🔵 handleSave called', { itemsCount: items.length, user: user?.id, isSaving })
    
    if (items.length === 0) {
      console.log('⚠️ Cannot save: items array is empty')
      toast({
        variant: 'default',
        title: 'Cannot save empty list',
        description: 'Please add items to your shopping list before saving.',
      })
      return
    }

    if (!user) {
      console.log('⚠️ Cannot save: no user')
      // Save to localStorage before opening auth dialog
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
      }
      openDialog()
      toast({
        variant: 'default',
        title: 'Sign in required',
        description: 'You have to sign in in order to save a list',
      })
      return
    }

    console.log('✅ Starting save process...', { items, userId: user.id })
    try {
      console.log('📤 Calling saveShoppingList...')
      await saveShoppingList(items)
      console.log('✅ saveShoppingList completed successfully')
      console.log('✅ Save successful, showing success toast')
      toast({
        variant: 'success',
        title: 'Success!',
        description: 'Shopping list saved successfully.',
      })
      // Clear the list after successful save
      setItems([])
      clearDraft()
      // Refresh the shopping cart and trigger a custom event for other components
      console.log('🔄 Refetching lists...')
      await refetchLists()
      console.log('✅ Lists refetched')
      // Dispatch custom event to notify ShoppingCart to refresh
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('shoppingListSaved'))
      }
      console.log('✅ Save process complete')
    } catch (error) {
      console.error('❌ Error in handleSave:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save shopping list'
      console.error('❌ Error message:', errorMessage)
      
      if (errorMessage === 'You have to sign in in order to save a list') {
        openDialog()
      }
      
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ opacity: 1 }}
      className="mt-24 rounded-2xl border border-border bg-background p-8 shadow-lg"
    >
      <h2 className="mb-6 text-2xl font-bold text-foreground">
        Shopping List
      </h2>

      <div className="mb-6 flex gap-2">
        <div className="flex-1">
          <Input
            type="text"
            placeholder={user ? "Add an item..." : "Sign in to add items..."}
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onFocus={handleInputFocus}
            disabled={!user && !authLoading}
            maxLength={MAX_ITEM_LENGTH}
            className="w-full"
          />
          {inputValue.length > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              {inputValue.length}/{MAX_ITEM_LENGTH} characters
            </p>
          )}
        </div>
        <Button onClick={handleAddItem} size="default">
          Add
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">
          Your shopping list is empty. Add items to get started!
        </p>
      ) : (
        <>
          <ul className="mb-6 space-y-2">
            <AnimatePresence mode="popLayout">
              {items.map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4 transition-colors hover:bg-muted/50"
                >
                  <span className="flex-1 text-foreground">{item}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteItem(index)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    aria-label={`Delete ${item}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          <div className="flex justify-end">
            <Button
              onClick={(e) => {
                console.log('🔘 Save button clicked', { isSaving, itemsLength: items.length, disabled: isSaving || items.length === 0 })
                e.preventDefault()
                e.stopPropagation()
                handleSave()
              }}
              disabled={isSaving || items.length === 0}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save List'}
            </Button>
          </div>
        </>
      )}
    </motion.div>
  )
}

