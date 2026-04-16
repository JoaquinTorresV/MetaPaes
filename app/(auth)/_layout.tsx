import { Stack } from 'expo-router'

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="confirm-email" />
      <Stack.Screen name="onboarding/name" />
      <Stack.Screen name="onboarding/career" />
      <Stack.Screen name="onboarding/score" />
      <Stack.Screen name="onboarding/subjects" />
      <Stack.Screen name="onboarding/ready" />
    </Stack>
  )
}
