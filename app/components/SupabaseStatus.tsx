"use client"

import { useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/app/lib/supabase/client'

export default function SupabaseStatus() {
  const [status, setStatus] = useState<'ok' | 'fail' | 'idle'>('idle')

  useEffect(() => {
    try {
      const supabase = createSupabaseBrowserClient()
      // No query - just ensure client can be constructed with env vars
      if (supabase) setStatus('ok')
    } catch {
      setStatus('fail')
    }
  }, [])

  return (
    <div className="rounded-md border p-3 text-sm">
      <span className="font-medium">Supabase client:</span>{' '}
      <span className={status === 'ok' ? 'text-green-600' : status === 'fail' ? 'text-red-600' : ''}>
        {status === 'idle' ? 'checking…' : status === 'ok' ? 'initialized' : 'failed'}
      </span>
    </div>
  )
}
