'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { Button } from './ui/button'
import { useAuth } from '@/app/contexts/AuthContext'
import { useToast } from './ui/use-toast'

export default function DeleteAccountButton() {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const { user, deleteAccount, signOut } = useAuth()
  const { toast } = useToast()

  if (!user) {
    return null
  }

  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true)
      return
    }

    setIsDeleting(true)

    try {
      await deleteAccount()
      
      // If deleteAccount doesn't sign out automatically, sign out manually
      await signOut()
      
      toast({
        variant: 'success',
        title: 'Account deleted',
        description: 'Your account and all data have been deleted.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete account',
      })
      setIsDeleting(false)
      setShowConfirm(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex justify-center pb-8"
    >
      <Button
        onClick={handleDelete}
        disabled={isDeleting}
        variant="destructive"
        className="gap-2"
      >
        <Trash2 className="h-4 w-4" />
        {isDeleting
          ? 'Deleting...'
          : showConfirm
          ? 'Confirm Delete Account'
          : 'Delete Account'}
      </Button>
    </motion.div>
  )
}

