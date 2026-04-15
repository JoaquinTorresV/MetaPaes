import { useEffect } from 'react'
import { Stack, router, useSegments } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StatusBar } from 'expo-status-bar'
import {
  useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope'
import * as SplashScreen from 'expo-splash-screen'
import { useAuthStore } from '@/store/authStore'

SplashScreen.preventAutoHideAsync()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, retry: 2 },
  },
})

function AuthGate() {
  const { isAuthenticated, initialized, user, initialize } = useAuthStore()
  const segments = useSegments()

  // Inicializar Supabase session una sola vez al arrancar
  useEffect(() => {
    initialize()
  }, [])

  useEffect(() => {
    if (!initialized) return  // Esperar a que Supabase lea la sesión guardada

    const inAuthGroup = segments[0] === '(auth)'

    if (!isAuthenticated && !inAuthGroup) {
      // No autenticado fuera del grupo auth → ir a login
      router.replace('/(auth)')
    } else if (isAuthenticated && inAuthGroup) {
      // Autenticado dentro del grupo auth → 
      // Si completó onboarding → home, si no → primer paso del onboarding
      if (user?.onboarding_done) {
        router.replace('/(tabs)')
      } else {
        router.replace('/(auth)/onboarding/name')
      }
    }
  }, [isAuthenticated, initialized, segments, user?.onboarding_done])

  return null
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  })

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync()
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <AuthGate />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="exam/[examId]"
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen name="exam/setup" />
      </Stack>
    </QueryClientProvider>
  )
}
