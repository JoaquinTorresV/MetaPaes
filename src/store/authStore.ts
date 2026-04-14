import { create } from 'zustand'
import type { User } from '@/services/supabase/types'
import { supabase } from '@/services/supabase/client'

interface AuthState {
  user: User | null
  session: { access_token: string; user: { id: string } } | null
  isLoading: boolean
  isAuthenticated: boolean

  // Actions
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signInWithGoogle: () => Promise<{ error: string | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  setSession: (session: AuthState['session']) => void
  setUser: (user: User | null) => void
  reset: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: false,
  isAuthenticated: false,

  signIn: async (email, password) => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { error: error.message }
      set({ session: data.session, isAuthenticated: true })
      return { error: null }
    } catch (e) {
      return { error: 'Error inesperado. Intenta de nuevo.' }
    } finally {
      set({ isLoading: false })
    }
  },

  signInWithGoogle: async () => {
    set({ isLoading: true })
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: 'metapaes://auth/callback' },
      })
      if (error) return { error: error.message }
      return { error: null }
    } finally {
      set({ isLoading: false })
    }
  },

  signUp: async (email, password, fullName) => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      if (error) return { error: error.message }
      set({ session: data.session, isAuthenticated: !!data.session })
      return { error: null }
    } finally {
      set({ isLoading: false })
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    get().reset()
  },

  setSession: (session) =>
    set({ session, isAuthenticated: !!session }),

  setUser: (user) => set({ user }),

  reset: () =>
    set({ user: null, session: null, isAuthenticated: false, isLoading: false }),
}))
