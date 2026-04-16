import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'
import { Platform } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import { makeRedirectUri } from 'expo-auth-session'
import * as QueryParams from 'expo-auth-session/build/QueryParams'
import type { User } from '@/services/supabase/types'
import { supabase } from '@/services/supabase/client'

WebBrowser.maybeCompleteAuthSession()

function getEmailConfirmationRedirect(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}/login?confirmed=1`
  }
  return 'metapaes://login?confirmed=1'
}

function getOAuthRedirectUri(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}/login`
  }
  return makeRedirectUri({ scheme: 'metapaes', path: 'auth/callback' })
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
      const redirectTo = getOAuthRedirectUri()

      // En web dejamos que el navegador haga redirect directo.
      if (Platform.OS === 'web') {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo },
        })
        if (error) return { error: error.message }
        return { error: null }
      }

      // En móvil abrimos sesión auth y al volver seteamos access/refresh token.
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      })
      if (error) return { error: error.message }
      if (!data?.url) return { error: 'No se pudo iniciar el flujo con Google.' }

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)
      if (result.type !== 'success') {
        return { error: 'Inicio de sesión con Google cancelado.' }
      }

      const { params, errorCode } = QueryParams.getQueryParams(result.url)
      if (errorCode) {
        return { error: 'Google devolvió un error de autenticación.' }
      }

      const accessToken = typeof params.access_token === 'string' ? params.access_token : null
      const refreshToken = typeof params.refresh_token === 'string' ? params.refresh_token : null

      if (!accessToken || !refreshToken) {
        return { error: 'No se recibieron tokens de sesión desde Google.' }
      }

      const { data: sessionData, error: sessionErr } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })
      if (sessionErr) return { error: sessionErr.message }

      set({ session: sessionData.session, isAuthenticated: !!sessionData.session })
      if (sessionData.session?.user.id) {
        await get().loadUserProfile(sessionData.session.user.id)
      }

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
