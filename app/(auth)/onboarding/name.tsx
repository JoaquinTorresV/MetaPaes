import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native'
import { router } from 'expo-router'
import { colors, radius, spacing, typography } from '@/config/theme'

function ProgressHeader({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / total) * 100)
  return (
    <View style={ph.wrap}>
      <View style={ph.labelRow}>
        <Text style={ph.left}>PROGRESO DE PERFIL</Text>
        <Text style={ph.right}>{pct}%</Text>
      </View>
      <View style={ph.track}>
        <View style={[ph.fill, { width: `${pct}%` as `${number}%` }]} />
      </View>
    </View>
  )
}

const ph = StyleSheet.create({
  wrap: { marginBottom: 28 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  left: { fontFamily: typography.family.bold, fontSize: 10, color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.05 },
  right: { fontFamily: typography.family.bold, fontSize: 10, color: colors.onSurfaceVariant },
  track: { height: 4, backgroundColor: '#e2e8f0', borderRadius: 999, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.primary, borderRadius: 999 },
})

export default function OnboardingName() {
  const [name, setName] = useState('')

  return (
    <SafeAreaView style={s.container}>
      <View style={s.content}>
        {/* Back */}
        <TouchableOpacity style={s.backRow} onPress={() => router.back()}>
          <Text style={s.backArrow}>←</Text>
          <Text style={s.backTitle}>Scholar Pro</Text>
        </TouchableOpacity>

        <ProgressHeader step={1} total={7} />

        <View style={s.card}>
          <View style={s.iconBox}>
            <Text style={{ fontSize: 28 }}>👤</Text>
          </View>
          <Text style={s.title}>¿Cómo te llamas?</Text>
          <Text style={s.desc}>Queremos personalizar tu experiencia de estudio en la academia.</Text>

          <TextInput
            style={s.input}
            value={name}
            onChangeText={setName}
            placeholder="Escribe tu nombre"
            placeholderTextColor={colors.outline}
            autoCapitalize="words"
            autoFocus
          />

          <TouchableOpacity
            style={[s.btn, !name.trim() && s.btnDisabled]}
            onPress={() => name.trim() && router.push('/(auth)/onboarding/career')}
            activeOpacity={0.85}
          >
            <Text style={s.btnText}>Continuar →</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.step}>Paso 1 de un breve cuestionario de 7 preguntas.</Text>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { flex: 1, padding: spacing.xl, paddingTop: 32 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 28 },
  backArrow: { fontFamily: typography.family.bold, fontSize: 20, color: colors.onSurface },
  backTitle: { fontFamily: typography.family.bold, fontSize: 16, color: colors.onSurface },
  card: { backgroundColor: colors.surfaceLowest, borderRadius: radius.xxl, padding: 28, shadowColor: colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.08, shadowRadius: 32, elevation: 4 },
  iconBox: { width: 56, height: 56, borderRadius: 14, backgroundColor: colors.surfaceLow, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontFamily: typography.family.extrabold, fontSize: 28, letterSpacing: -0.02, color: colors.onSurface, marginBottom: 10 },
  desc: { fontFamily: typography.family.regular, fontSize: 14, color: colors.onSurfaceVariant, lineHeight: 21, marginBottom: 24 },
  input: { backgroundColor: colors.surfaceHigh, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 16, fontFamily: typography.family.regular, fontSize: 15, color: colors.onSurface, marginBottom: 16 },
  btn: { backgroundColor: colors.primary, borderRadius: radius.full, paddingVertical: 16, alignItems: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 4 },
  btnDisabled: { opacity: 0.5 },
  btnText: { fontFamily: typography.family.bold, fontSize: 15, color: '#fff' },
  step: { textAlign: 'center', fontFamily: typography.family.regular, fontSize: 12, color: colors.outline, marginTop: 20 },
})
