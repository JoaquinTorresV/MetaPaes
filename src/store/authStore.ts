import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'
import { Platform } from 'react-native'
import type { User } from '@/services/supabase/types'
import { supabase } from '@/services/supabase/client'

function getEmailConfirmationRedirect(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}/login?confirmed=1`
  }
  return 'metapaes://login?confirmed=1'
}

interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  initialized: boolean   // true una vez que Supabase terminó de leer la sesión guardada

  // Actions
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, fullName: string) => Promise<{
    error: string | null
    needsEmailConfirmation?: boolean
  }>
  signInWithGoogle: () => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  setSession: (session: Session | null) => void
  loadUserProfile: (userId: string) => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: false,
  isAuthenticated: false,
  initialized: false,

  initialize: async () => {
    // Leer sesión guardada en AsyncStorage
    const { data: { session } } = await supabase.auth.getSession()
    set({ session, isAuthenticated: !!session, initialized: true })
    if (session?.user.id) {
      await get().loadUserProfile(session.user.id)
    }

    // Escuchar cambios de sesión (login, logout, token refresh)
    supabase.auth.onAuthStateChange(async (_event, session) => {
      set({ session, isAuthenticated: !!session })
      if (session?.user.id) {
        await get().loadUserProfile(session.user.id)
      } else {
        set({ user: null })
      }
    })
  },

  loadUserProfile: async (userId: string) => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) set({ user: data as User })
  },

  signIn: async (email, password) => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { error: error.message }
      set({ session: data.session, isAuthenticated: true })
      if (data.session?.user.id) await get().loadUserProfile(data.session.user.id)
      return { error: null }
    } catch {
      return { error: 'Error inesperado. Intenta de nuevo.' }
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
        options: {
          data: { full_name: fullName },
          emailRedirectTo: getEmailConfirmationRedirect(),
        },
      })
      if (error) return { error: error.message }
      // El trigger en Supabase crea la fila en users automáticamente
      set({ session: data.session, isAuthenticated: !!data.session })
      // Si hay confirmación por correo activa, Supabase devuelve session null.
      return { error: null, needsEmailConfirmation: !data.session }
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

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null, isAuthenticated: false })
  },

  setSession: (session) =>
    set({ session, isAuthenticated: !!session }),
}))
