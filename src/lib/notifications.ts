/**
 * Web Push Notifications helper
 * Uses VAPID keys for 100% free push notifications
 */

export const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ''

/**
 * Subscribe the current user to push notifications
 */
export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications no soportadas en este browser')
    return null
  }

  const registration = await navigator.serviceWorker.ready
  const permission = await Notification.requestPermission()

  if (permission !== 'granted') {
    console.warn('Permiso de notificaciones denegado')
    return null
  }

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as unknown as ArrayBuffer,
  })

  return subscription
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false

  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()

  if (!subscription) return false
  return subscription.unsubscribe()
}

/**
 * Check if the user is currently subscribed
 */
export async function isPushSubscribed(): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false

  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()
  return !!subscription
}

/**
 * Helper: convert base64 VAPID key to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

/**
 * Show an in-app notification (fallback when push is not available)
 */
export function showInAppNotification(title: string, body: string): void {
  if (typeof window === 'undefined') return
  // Dispatch a custom event that the NotificationBanner component listens to
  window.dispatchEvent(new CustomEvent('in-app-notification', {
    detail: { title, body, id: Date.now().toString() }
  }))
}
