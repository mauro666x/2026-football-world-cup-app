'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { subscribeToPush, unsubscribeFromPush, isPushSubscribed } from '@/lib/notifications'

export function useNotifications(userId: string | undefined) {
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    setSupported('serviceWorker' in navigator && 'PushManager' in window)
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      isPushSubscribed().then(setSubscribed)
    }
  }, [])

  const subscribe = async () => {
    if (!userId) return
    setLoading(true)
    try {
      const subscription = await subscribeToPush()
      if (!subscription) return

      const supabase = createClient()
      await supabase.from('push_subscriptions').upsert({
        user_id: userId,
        subscription: subscription.toJSON(),
      })
      setSubscribed(true)
    } finally {
      setLoading(false)
    }
  }

  const unsubscribe = async () => {
    if (!userId) return
    setLoading(true)
    try {
      await unsubscribeFromPush()
      const supabase = createClient()
      await supabase.from('push_subscriptions').delete().eq('user_id', userId)
      setSubscribed(false)
    } finally {
      setLoading(false)
    }
  }

  return { subscribed, loading, supported, subscribe, unsubscribe }
}
