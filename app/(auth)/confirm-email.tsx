import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { colors, radius, spacing, typography } from '@/config/theme'

export default function ConfirmEmailScreen() {
  const params = useLocalSearchParams<{ email?: string }>()
  const email = params.email?.trim() ?? ''

  return (
    <SafeAreaView style={s.container}>
      <View style={s.content}>
        <View style={s.iconWrap}>
          <Text style={s.icon}>✉️</Text>
        </View>

        <Text style={s.title}>Revisa tu correo</Text>
        <Text style={s.desc}>
          Te enviamos un enlace de confirmación para activar tu cuenta.
        </Text>

        {email ? (
          <View style={s.emailBox}>
            <Text style={s.emailLabel}>Correo registrado</Text>
            <Text style={s.emailValue}>{email}</Text>
          </View>
        ) : null}

        <Text style={s.help}>
          Cuando confirmes tu email, vuelve a iniciar sesión para continuar con tu onboarding.
        </Text>

        <TouchableOpacity
          style={s.btnPrimary}
          onPress={() => router.replace({ pathname: '/(auth)/login', params: { mode: 'login' } })}
          activeOpacity={0.85}
        >
          <Text style={s.btnPrimaryText}>Ir a iniciar sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.btnSecondary}
          onPress={() => router.replace('/(auth)')}
          activeOpacity={0.85}
        >
          <Text style={s.btnSecondaryText}>Volver al inicio</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { flex: 1, padding: spacing.xl, justifyContent: 'center' },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  icon: { fontSize: 32 },
  title: {
    fontFamily: typography.family.extrabold,
    fontSize: 30,
    letterSpacing: -0.02,
    color: colors.onSurface,
    textAlign: 'center',
    marginBottom: 10,
  },
  desc: {
    fontFamily: typography.family.regular,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 18,
  },
  emailBox: {
    backgroundColor: colors.surfaceLowest,
    borderRadius: radius.xl,
    padding: 16,
    marginBottom: 14,
  },
  emailLabel: {
    fontFamily: typography.family.semibold,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    marginBottom: 4,
  },
  emailValue: {
    fontFamily: typography.family.bold,
    fontSize: 15,
    color: colors.onSurface,
  },
  help: {
    fontFamily: typography.family.regular,
    fontSize: 13,
    color: colors.outline,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  btnPrimary: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  btnPrimaryText: {
    fontFamily: typography.family.bold,
    fontSize: 15,
    color: '#fff',
  },
  btnSecondary: {
    borderRadius: radius.full,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
  },
  btnSecondaryText: {
    fontFamily: typography.family.semibold,
    fontSize: 15,
    color: colors.onSurface,
  },
})
