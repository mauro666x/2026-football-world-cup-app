import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Profile, AppNotification } from '@/types'

interface AppState {
  // User
  user: Profile | null
  setUser: (user: Profile | null) => void

  // Theme
  theme: 'dark' | 'light'
  toggleTheme: () => void

  // Notifications (in-app)
  notifications: AppNotification[]
  addNotification: (notif: Omit<AppNotification, 'id' | 'read' | 'created_at'>) => void
  markNotificationRead: (id: string) => void
  clearNotifications: () => void

  // Live mode
  isLivePolling: boolean
  setLivePolling: (val: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),

      theme: 'dark',
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

      notifications: [],
      addNotification: (notif) =>
        set((state) => ({
          notifications: [
            {
              ...notif,
              id: Date.now().toString(),
              read: false,
              created_at: new Date().toISOString(),
            },
            ...state.notifications,
          ].slice(0, 20), // Keep last 20
        })),
      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      clearNotifications: () => set({ notifications: [] }),

      isLivePolling: false,
      setLivePolling: (val) => set({ isLivePolling: val }),
    }),
    {
      name: 'mundial-2026-store',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
)
