import { useState, useMemo } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, TextInput, ActivityIndicator,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { getPopularCareers, type CareerSearchResult } from '@/features/onboarding/services/onboardingService'
import { colors, radius, spacing, typography } from '@/config/theme'

const CAREER_EMOJIS: Record<string, string> = {
  Medicina: '🩺', 'Ingeniería Civil': '⚙️', Derecho: '⚖️',
  Psicología: '🧠', Arquitectura: '🏛️', Odontología: '🦷',
  'Ingeniería Comercial': '📈', Bioquímica: '🔬',
  Enfermería: '💊', 'Trabajo Social': '🤝', 'Pedagogía Básica': '📚',
}

function ProgBar({ step }: { step: number }) {
  const pct = Math.round((step / 4) * 100)
  return (
    <View style={{ marginBottom: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={{ fontFamily: typography.family.bold, fontSize: 10, color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.05 }}>
          PASO {step} DE 4
        </Text>
      </View>
      <View style={{ height: 4, backgroundColor: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
        <View style={{ height: '100%', width: `${pct}%` as `${number}%`, backgroundColor: colors.primary, borderRadius: 999 }} />
      </View>
    </View>
  )
}

export default function OnboardingCareer() {
  const params = useLocalSearchParams<{ name: string }>()
  const [selected, setSelected] = useState<CareerSearchResult | null>(null)
  const [query, setQuery] = useState('')

  const { data: allCareers = [], isLoading } = useQuery({
    queryKey: ['careers'],
    queryFn: getPopularCareers,
    select: (result) => result.data,
    staleTime: 1000 * 60 * 60, // 1 hora — las carreras no cambian
  })

  const filtered = useMemo(() => {
    if (!query.trim()) return allCareers
    const q = query.toLowerCase()
    return allCareers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.university.toLowerCase().includes(q)
    )
  }, [allCareers, query])

  // Puntaje de corte del año más reciente disponible
  function getCutScore(career: CareerSearchResult): number {
    const years = Object.keys(career.cut_scores).sort().reverse()
    return career.cut_scores[years[0] ?? ''] ?? 700
  }

  function handleContinue() {
    if (!selected) return
    const cutScore = getCutScore(selected)
    router.push({
      pathname: '/(auth)/onboarding/score',
      params: {
        name: params.name,
        careerId: selected.id,
        careerName: selected.name,
        university: selected.university,
        targetScore: cutScore.toString(),
        requiredSubjects: JSON.stringify(selected.required_subjects),
        optionalSubjects: JSON.stringify(selected.optional_subjects),
      },
    })
  }

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.topRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={s.back}>←</Text>
          </TouchableOpacity>
          <Text style={s.stepText}>Paso 2 de 4</Text>
        </View>

        <ProgBar step={2} />

        <Text style={s.title}>¿Qué quieres estudiar?</Text>
        <Text style={s.desc}>
          Personalizaremos tu plan según las exigencias de tu carrera objetivo.
        </Text>

        <TextInput
          style={s.search}
          value={query}
          onChangeText={setQuery}
          placeholder="🔍  Busca carrera o universidad..."
          placeholderTextColor={colors.outline}
        />

        {isLoading && (
          <View style={{ alignItems: 'center', padding: 32 }}>
            <ActivityIndicator color={colors.primary} />
            <Text style={{ fontFamily: typography.family.regular, fontSize: 13, color: colors.onSurfaceVariant, marginTop: 8 }}>
              Cargando carreras...
            </Text>
          </View>
        )}

        {!isLoading && filtered.length === 0 && (
          <View style={s.emptyBox}>
            <Text style={s.emptyText}>No encontramos "{query}"</Text>
            <Text style={s.emptySubText}>Intenta con el nombre de la facultad o universidad.</Text>
          </View>
        )}

        {!isLoading && (
          <>
            {!query.trim() && (
              <Text style={s.sectionLabel}>RESULTADOS POPULARES</Text>
            )}
            {filtered.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[s.careerRow, selected?.id === c.id && s.careerSelected]}
                onPress={() => setSelected(c)}
                activeOpacity={0.8}
              >
                <View style={s.careerIcon}>
                  <Text style={{ fontSize: 22 }}>{CAREER_EMOJIS[c.name] ?? '🎓'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.careerName}>{c.name}</Text>
                  <Text style={s.careerUni}>{c.university}</Text>
                  <Text style={s.careerScore}>Corte ~{getCutScore(c)} pts</Text>
                </View>
                <View style={[s.radio, selected?.id === c.id && s.radioSelected]}>
                  {selected?.id === c.id && <View style={s.radioDot} />}
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        <View style={s.hint}>
          <Text style={{ fontSize: 14 }}>ⓘ</Text>
          <Text style={s.hintText}>
            ¿No encuentras tu carrera? Intenta buscar por facultad o escríbenos.
          </Text>
        </View>

        <TouchableOpacity
          style={[s.btn, !selected && s.btnDisabled]}
          onPress={handleContinue}
          disabled={!selected}
          activeOpacity={0.85}
        >
          <Text style={s.btnText}>Continuar →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.skip}
          onPress={() => router.push({
            pathname: '/(auth)/onboarding/score',
            params: { name: params.name, targetScore: '700', careerId: '', careerName: 'Mi carrera', university: '' },
          })}
        >
          <Text style={s.skipText}>Omitir por ahora</Text>
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
  stepText: { fontFamily: typography.family.semibold, fontSize: 14, color: colors.onSurfaceVariant },
  title: { fontFamily: typography.family.extrabold, fontSize: 26, letterSpacing: -0.02, color: colors.onSurface, marginBottom: 8 },
  desc: { fontFamily: typography.family.regular, fontSize: 14, color: colors.onSurfaceVariant, lineHeight: 21, marginBottom: 20 },
  search: { backgroundColor: colors.surfaceHigh, borderRadius: 14, paddingHorizontal: 18, paddingVertical: 14, fontFamily: typography.family.regular, fontSize: 15, color: colors.onSurface, marginBottom: 14 },
  sectionLabel: { fontFamily: typography.family.bold, fontSize: 10, color: colors.outline, textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 10 },
  emptyBox: { alignItems: 'center', padding: 24 },
  emptyText: { fontFamily: typography.family.bold, fontSize: 15, color: colors.onSurface, marginBottom: 6 },
  emptySubText: { fontFamily: typography.family.regular, fontSize: 13, color: colors.onSurfaceVariant, textAlign: 'center' },
  careerRow: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surfaceLowest, borderRadius: 16, borderWidth: 1.5, borderColor: colors.outlineVariant, padding: 16, marginBottom: 10 },
  careerSelected: { borderColor: colors.primary, backgroundColor: '#eff6ff' },
  careerIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center' },
  careerName: { fontFamily: typography.family.bold, fontSize: 15, color: colors.onSurface },
  careerUni: { fontFamily: typography.family.regular, fontSize: 12, color: colors.onSurfaceVariant },
  careerScore: { fontFamily: typography.family.semibold, fontSize: 11, color: colors.primary, marginTop: 2 },
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
