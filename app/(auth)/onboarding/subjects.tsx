import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { colors, radius, spacing, typography } from '@/config/theme'

const SUBJECTS_LIST = [
  { key: 'm1', name: 'Matemática', desc: 'Competencia Matemática (M1) y avanzada (M2).', emoji: '🔢', color: '#dbeafe' },
  { key: 'competencia_lectora', name: 'Lenguaje', desc: 'Competencia Lectora y comprensión de textos.', emoji: '📖', color: '#ede9fe' },
  { key: 'historia', name: 'Historia', desc: 'Ciencias Sociales, Geografía y Formación Ciudadana.', emoji: '🌍', color: '#dcfce7' },
  { key: 'biologia', name: 'Ciencias', desc: 'Módulo común y electivo: Biología, Física o Química.', emoji: '🔬', color: '#fef3c7' },
]

export default function OnboardingSubjects() {
  const [selected, setSelected] = useState<string[]>(['m1', 'competencia_lectora', 'biologia'])

  function toggle(key: string) {
    setSelected(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.topRow}>
          <TouchableOpacity onPress={() => router.back()}><Text style={s.back}>←</Text></TouchableOpacity>
          <Text style={s.stepPct}>70% completado</Text>
        </View>
        <View style={{ height: 4, backgroundColor: '#e2e8f0', borderRadius: 999, marginBottom: 6, overflow: 'hidden' }}>
          <View style={{ height: '100%', width: '70%', backgroundColor: colors.primary, borderRadius: 999 }} />
        </View>
        <Text style={{ fontFamily: typography.family.bold, fontSize: 10, color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.05, marginBottom: 20 }}>PASO 5 DE 7</Text>

        <Text style={s.title}>¿Qué pruebas vas a dar?</Text>
        <Text style={s.desc}>Selecciona todas las asignaturas que forman parte de tu proceso de admisión.</Text>

        {SUBJECTS_LIST.map(sub => {
          const active = selected.includes(sub.key)
          return (
            <TouchableOpacity
              key={sub.key}
              style={[s.subCard, active && s.subCardActive]}
              onPress={() => toggle(sub.key)}
              activeOpacity={0.8}
            >
              <View style={[s.subIcon, { backgroundColor: sub.color }]}>
                <Text style={{ fontSize: 22 }}>{sub.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.subName}>{sub.name}</Text>
                <Text style={s.subDesc}>{sub.desc}</Text>
              </View>
              <View style={[s.check, active && s.checkActive]}>
                {active && <Text style={{ color: '#fff', fontSize: 12, fontFamily: typography.family.bold }}>✓</Text>}
              </View>
            </TouchableOpacity>
          )
        })}

        <View style={s.infoBox}>
          <Text style={{ fontSize: 13, color: colors.primary }}>ⓘ Podrás añadir o cambiar estas asignaturas más tarde en tu perfil.</Text>
        </View>

        <TouchableOpacity
          style={[s.btn, selected.length === 0 && s.btnDisabled]}
          onPress={() => selected.length > 0 && router.push('/(auth)/onboarding/ready')}
          activeOpacity={0.85}
        >
          <Text style={s.btnText}>Continuar →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  scroll: { padding: spacing.xl, paddingBottom: 40 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  back: { fontFamily: typography.family.bold, fontSize: 22, color: colors.onSurface },
  stepPct: { fontFamily: typography.family.bold, fontSize: 14, color: colors.primary },
  title: { fontFamily: typography.family.extrabold, fontSize: 26, letterSpacing: -0.02, color: colors.onSurface, marginBottom: 8 },
  desc: { fontFamily: typography.family.regular, fontSize: 14, color: colors.onSurfaceVariant, lineHeight: 21, marginBottom: 20 },
  subCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, backgroundColor: colors.surfaceLowest, borderRadius: 16, borderWidth: 1.5, borderColor: colors.outlineVariant, padding: 18, marginBottom: 12 },
  subCardActive: { borderColor: colors.primary, backgroundColor: '#eff6ff' },
  subIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  subName: { fontFamily: typography.family.bold, fontSize: 15, color: colors.onSurface, marginBottom: 4 },
  subDesc: { fontFamily: typography.family.regular, fontSize: 12, color: colors.onSurfaceVariant, lineHeight: 18 },
  check: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.outlineVariant, alignItems: 'center', justifyContent: 'center', marginTop: 2, flexShrink: 0 },
  checkActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  infoBox: { backgroundColor: '#eff6ff', borderRadius: 12, padding: 12, marginBottom: 16, marginTop: 4 },
  btn: { backgroundColor: colors.primary, borderRadius: radius.full, paddingVertical: 16, alignItems: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 4 },
  btnDisabled: { opacity: 0.5 },
  btnText: { fontFamily: typography.family.bold, fontSize: 15, color: '#fff' },
})
