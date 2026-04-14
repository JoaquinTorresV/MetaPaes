import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Copy .env.example to .env.local and fill in your credentials.'
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Usar MMKV para almacenamiento persistente en React Native
    // (más rápido que AsyncStorage)
    storage: {
      getItem: async (key: string) => {
        // TODO: reemplazar con MMKV cuando esté configurado
        return null
      },
      setItem: async (key: string, value: string) => {
        // TODO: reemplazar con MMKV
      },
      removeItem: async (key: string) => {
        // TODO: reemplazar con MMKV
      },
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
