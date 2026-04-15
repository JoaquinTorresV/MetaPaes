import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan variables de entorno de Supabase. Copia .env.example a .env.local y completa las credenciales.'
  )
}

// Cliente sin tipo genérico Database para evitar conflictos con Supabase v2.
// Los tipos Row se aplican explícitamente en cada query con `as RowType`.
// Para tipos auto-generados, ejecutar: npx supabase gen types typescript --project-id TU_ID
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
