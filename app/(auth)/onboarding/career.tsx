import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, TextInput } from 'react-native'
import { router } from 'expo-router'
import { colors, radius, spacing, typography } from '@/config/theme'

const CAREERS = [
  { id: '1', name: 'Medicina', university: 'Pontificia Universidad Católica', cutScore: 870, emoji: '🩺' },
  { id: '2', name: 'Ingeniería Civil', university: 'Universidad de Chile', cutScore: 760, emoji: '⚙️' },
  { id: '3', name: 'Derecho', university: 'Universidad de Concepción', cutScore: 710, emoji: '⚖️' },
  { id: '4', name: 'Psicología', university: 'Universidad Adolfo Ibáñez', cutScore: 630, emoji: '🧠' },
  { id: '5', name: 'Arquitectura', university: 'PUC', cutScore: 660, emoji: '🏛️' },
  { id: '6', name: 'Odontología', university: 'U. de Chile', cutScore: 800, emoji: '🦷' },
]

function ProgBar({ pct }: { pct: number }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ fontFamily: typography.family.bold, fontSize: 10, color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.05 }}>PASO 2 DE 7</Text>
      </View>
      <View style={{ height: 4, backgroundColor: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
        <View style={{ height: '100%', width: `${pct}%` as `${number}%`, backgroundColor: colors.primary, borderRadius: 999 }} />
      </View>
    </View>
  )
}

export default function OnboardingCareer() {
  const [selected, setSelected] = useState<string | null>('1')
  const [query, setQuery] = useState('')

  const filtered = CAREERS.filter(
    c => c.name.toLowerCase().includes(query.toLowerCase()) || c.university.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.topRow}>
          <TouchableOpacity onPress={() => router.back()}><Text style={s.back}>←</Text></TouchableOpacity>
          <Text style={s.stepText}>Paso 2 de 7</Text>
        </View>

        <ProgBar pct={28} />

        <Text style={s.title}>¿Qué quieres estudiar?</Text>
        <Text style={s.desc}>Personalizaremos tu plan de estudio según las exigencias de tu carrera objetivo.</Text>

        <TextInput
          style={s.search}
          value={query}
          onChangeText={setQuery}
          placeholder="🔍  Busca carrera o universidad..."
          placeholderTextColor={colors.outline}
        />

        <Text style={s.sectionLabel}>RESULTADOS POPULARES</Text>

        {filtered.map(c => (
          <TouchableOpacity
            key={c.id}
            style={[s.careerRow, selected === c.id && s.careerSelected]}
            onPress={() => setSelected(c.id)}
            activeOpacity={0.8}
          >
            <View style={s.careerIcon}>
              <Text style={{ fontSize: 22 }}>{c.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.careerName}>{c.name}</Text>
              <Text style={s.careerUni}>{c.university}</Text>
            </View>
            <View style={[s.radio, selected === c.id && s.radioSelected]}>
              {selected === c.id && <View style={s.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}

        <View style={s.hint}>
          <Text style={{ fontSize: 14, color: '#92400e' }}>ⓘ</Text>
          <Text style={s.hintText}>¿No encuentras tu opción? Intenta buscando por el nombre de la facultad.</Text>
        </View>

        <TouchableOpacity
          style={[s.btn, !selected && s.btnDisabled]}
          onPress={() => selected && router.push('/(auth)/onboarding/score')}
          activeOpacity={0.85}
        >
          <Text style={s.btnText}>Continuar →</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.skip} onPress={() => router.push('/(auth)/onboarding/score')}>
          <Text style={s.skipText}>Omitir por ahora</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  scroll: { padding: spacing.xl, paddingBottom: 40 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  back: { fontFamily: typography.family.bold, fontSize: 22, color: colors.onSurface },
  stepText: { fontFamily: typography.family.semibold, fontSize: 14, color: colors.onSurfaceVariant },
  title: { fontFamily: typography.family.extrabold, fontSize: 26, letterSpacing: -0.02, color: colors.onSurface, marginBottom: 8 },
  desc: { fontFamily: typography.family.regular, fontSize: 14, color: colors.onSurfaceVariant, lineHeight: 21, marginBottom: 20 },
  search: { backgroundColor: colors.surfaceHigh, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 14, fontFamily: typography.family.regular, fontSize: 15, color: colors.onSurface, marginBottom: 14 },
  sectionLabel: { fontFamily: typography.family.bold, fontSize: 10, color: colors.outline, textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 10 },
  careerRow: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surfaceLowest, borderRadius: 16, borderWidth: 1.5, borderColor: colors.outlineVariant, padding: 16, marginBottom: 10 },
  careerSelected: { borderColor: colors.primary, backgroundColor: '#eff6ff' },
  careerIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center' },
  careerName: { fontFamily: typography.family.bold, fontSize: 15, color: colors.onSurface },
  careerUni: { fontFamily: typography.family.regular, fontSize: 12, color: colors.onSurfaceVariant },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.outlineVariant, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  hint: { flexDirection: 'row', gap: 8, backgroundColor: '#fff7ed', borderRadius: 12, padding: 12, marginBottom: 16, alignItems: 'flex-start' },
  hintText: { fontFamily: typography.family.regular, fontSize: 12, color: '#92400e', flex: 1, lineHeight: 18 },
  btn: { backgroundColor: colors.primary, borderRadius: radius.full, paddingVertical: 16, alignItems: 'center', marginBottom: 10, shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 4 },
  btnDisabled: { opacity: 0.5 },
  btnText: { fontFamily: typography.family.bold, fontSize: 15, color: '#fff' },
  skip: { alignItems: 'center', paddingVertical: 8 },
  skipText: { fontFamily: typography.family.semibold, fontSize: 14, color: colors.primary },
})
