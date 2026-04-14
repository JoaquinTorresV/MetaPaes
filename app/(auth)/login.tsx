import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '@/store/authStore'
import { colors, radius, spacing, typography } from '@/config/theme'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { signIn, signInWithGoogle, isLoading } = useAuthStore()

  async function handleLogin() {
    if (!email || !password) { setError('Completa todos los campos'); return }
    const result = await signIn(email, password)
    if (result.error) { setError(result.error); return }
    router.replace('/(tabs)')
  }

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          {/* Logo */}
          <View style={s.logoRow}>
            <View style={s.logoIcon}><Text style={s.logoText}>A</Text></View>
            <Text style={s.logoName}>Scholar Pro</Text>
          </View>

          {/* Card */}
          <View style={s.card}>
            <Text style={s.title}>Bienvenido de vuelta</Text>
            <Text style={s.subtitle}>Ingresa tus credenciales para continuar con tu aprendizaje.</Text>

            {error && (
              <View style={s.errorBox}>
                <Text style={s.errorText}>{error}</Text>
              </View>
            )}

            <View style={s.inputGroup}>
              <Text style={s.label}>Correo electrónico</Text>
              <TextInput
                style={s.input}
                value={email}
                onChangeText={setEmail}
                placeholder="tu@nombre.com"
                placeholderTextColor={colors.outline}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={s.inputGroup}>
              <View style={s.labelRow}>
                <Text style={s.label}>Contraseña</Text>
                <TouchableOpacity><Text style={s.forgot}>Olvidé mi contraseña</Text></TouchableOpacity>
              </View>
              <TextInput
                style={s.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.outline}
                secureTextEntry
                autoComplete="password"
              />
            </View>

            <TouchableOpacity style={s.btnPrimary} onPress={handleLogin} disabled={isLoading}>
              {isLoading
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.btnPrimaryText}>Iniciar sesión</Text>
              }
            </TouchableOpacity>
          </View>

          <View style={s.dividerRow}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>O TAMBIÉN</Text>
            <View style={s.dividerLine} />
          </View>

          <TouchableOpacity style={s.btnGoogle} onPress={signInWithGoogle}>
            <Text style={s.googleG}>G</Text>
            <Text style={s.btnGoogleText}>Continuar con Google</Text>
          </TouchableOpacity>

          <View style={s.signupRow}>
            <Text style={s.signupText}>¿No tienes una cuenta?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/onboarding/name')}>
              <Text style={s.signupLink}> Crear cuenta</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  scroll: { padding: spacing.xl, paddingBottom: 40 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xxxl },
  logoIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontFamily: typography.family.extrabold, fontSize: 16, color: '#fff' },
  logoName: { fontFamily: typography.family.extrabold, fontSize: 18, color: colors.primary },
  card: { backgroundColor: colors.surfaceLowest, borderRadius: radius.xxl, padding: 28, marginBottom: spacing.xl, shadowColor: colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.08, shadowRadius: 32, elevation: 4 },
  title: { fontFamily: typography.family.extrabold, fontSize: 28, letterSpacing: -0.02, color: colors.onSurface, marginBottom: 8 },
  subtitle: { fontFamily: typography.family.regular, fontSize: 14, color: colors.onSurfaceVariant, lineHeight: 21, marginBottom: 24 },
  errorBox: { backgroundColor: colors.errorContainer, borderRadius: radius.md, padding: 12, marginBottom: 16 },
  errorText: { fontFamily: typography.family.medium, fontSize: 13, color: colors.error },
  inputGroup: { marginBottom: 14 },
  label: { fontFamily: typography.family.semibold, fontSize: 12, color: colors.onSurfaceVariant, marginBottom: 6, letterSpacing: 0.03 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  forgot: { fontFamily: typography.family.semibold, fontSize: 12, color: colors.primary },
  input: { backgroundColor: colors.surfaceHighest, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 16, fontFamily: typography.family.regular, fontSize: 15, color: colors.onSurface },
  btnPrimary: { backgroundColor: colors.primary, borderRadius: radius.full, paddingVertical: 16, alignItems: 'center', marginTop: 8, shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 4 },
  btnPrimaryText: { fontFamily: typography.family.bold, fontSize: 15, color: '#fff' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.outlineVariant },
  dividerText: { fontFamily: typography.family.bold, fontSize: 10, color: colors.outline, letterSpacing: 0.06 },
  btnGoogle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: colors.surfaceLowest, borderWidth: 1.5, borderColor: colors.outlineVariant, borderRadius: radius.full, paddingVertical: 14, marginBottom: spacing.xl },
  googleG: { fontFamily: typography.family.bold, fontSize: 16, color: '#4285F4' },
  btnGoogleText: { fontFamily: typography.family.semibold, fontSize: 15, color: colors.onSurface },
  signupRow: { flexDirection: 'row', justifyContent: 'center' },
  signupText: { fontFamily: typography.family.regular, fontSize: 14, color: colors.onSurfaceVariant },
  signupLink: { fontFamily: typography.family.bold, fontSize: 14, color: colors.primary },
})
