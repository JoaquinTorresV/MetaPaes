import { useState, useMemo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { colors, radius, spacing, typography } from '@/config/theme'
import { SUBJECTS } from '@/config/subjects'
import type { SubjectCode } from '@/services/supabase/types'

const SUBJECT_CONFIG: Array<{
  key: SubjectCode
  emoji: string
  bg: string
  desc: string
}> = [
  { key: 'm1', emoji: '🔢', bg: '#dbeafe', desc: 'Competencia Matemática (M1) y avanzada (M2).' },
  { key: 'competencia_lectora', emoji: '📖', bg: '#ede9fe', desc: 'Comprensión de textos literarios y no literarios.' },
  { key: 'historia', emoji: '🌍', bg: '#dcfce7', desc: 'Ciencias Sociales, Geografía y Formación Ciudadana.' },
  { key: 'biologia', emoji: '🔬', bg: '#fef3c7', desc: 'Módulo común + electivo Biología.' },
  { key: 'fisica', emoji: '⚡', bg: '#fef3c7', desc: 'Módulo común + electivo Física.' },
  { key: 'quimica', emoji: '🧪', bg: '#fef3c7', desc: 'Módulo común + electivo Química.' },
  { key: 'm2', emoji: '∑', bg: '#f0f9ff', desc: 'Matemática avanzada (funciones, trigonometría, logaritmos).' },
]

export default function OnboardingSubjects() {
  const params = useLocalSearchParams<{
    name: string
    careerId: string
    careerName: string
    university: string
    targetScore: string
    requiredSubjects: string
    optionalSubjects: string
  }>()

  // Pre-seleccionar las asignaturas requeridas por la carrera
  const requiredSubjects = useMemo<SubjectCode[]>(() => {
    try { return JSON.parse(params.requiredSubjects ?? '[]') }
    catch { return ['competencia_lectora', 'm1'] }
  }, [params.requiredSubjects])

  const [selected, setSelected] = useState<SubjectCode[]>(
    requiredSubjects.length > 0 ? requiredSubjects : ['competencia_lectora', 'm1']
  )

  function toggle(key: SubjectCode) {
    // Las asignaturas requeridas no se pueden deseleccionar
    if (requiredSubjects.includes(key)) return
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  function handleContinue() {
    router.push({
      pathname: '/(auth)/onboarding/ready',
      params: {
        name: params.name,
        careerId: params.careerId,
        careerName: params.careerName,
        university: params.university,
        targetScore: params.targetScore,
        subjects: JSON.stringify(selected),
      },
    })
  }

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.topRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={s.back}>←</Text>
          </TouchableOpacity>
          <Text style={s.stepPct}>Paso 4 de 4</Text>
        </View>

        <View style={{ height: 4, backgroundColor: '#e2e8f0', borderRadius: 999, marginBottom: 6, overflow: 'hidden' }}>
          <View style={{ height: '100%', width: '100%', backgroundColor: colors.primary, borderRadius: 999 }} />
        </View>

        <Text style={s.title}>¿Qué pruebas vas a dar?</Text>
        <Text style={s.desc}>
          Selecciona todas las asignaturas de tu proceso de admisión.
          {requiredSubjects.length > 0 && ' Las obligatorias ya están marcadas.'}
        </Text>

        {SUBJECT_CONFIG.map(({ key, emoji, bg, desc }) => {
          const isSelected = selected.includes(key)
          const isRequired = requiredSubjects.includes(key)
          return (
            <TouchableOpacity
              key={key}
              style={[s.subCard, isSelected && s.subCardActive, isRequired && s.subCardRequired]}
              onPress={() => toggle(key)}
              activeOpacity={isRequired ? 1 : 0.8}
            >
              <View style={[s.subIcon, { backgroundColor: bg }]}>
                <Text style={{ fontSize: 22 }}>{emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <Text style={s.subName}>{SUBJECTS[key]?.shortName ?? key}</Text>
                  {isRequired && (
                    <View style={s.reqBadge}><Text style={s.reqBadgeText}>Obligatoria</Text></View>
                  )}
                </View>
                <Text style={s.subDesc}>{desc}</Text>
              </View>
              <View style={[s.check, isSelected && s.checkActive]}>
                {isSelected && <Text style={{ color: '#fff', fontSize: 12, fontFamily: typography.family.bold }}>✓</Text>}
              </View>
            </TouchableOpacity>
          )
        })}

        <View style={s.infoBox}>
          <Text style={{ fontSize: 13, color: colors.primary }}>
            ⓘ Podrás cambiar estas asignaturas más tarde desde tu perfil.
          </Text>
        </View>

        <TouchableOpacity
          style={[s.btn, selected.length === 0 && s.btnDisabled]}
          onPress={handleContinue}
          disabled={selected.length === 0}
          activeOpacity={0.85}
        >
          <Text style={s.btnText}>Ver mi plan →</Text>
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
  stepPct: { fontFamily: typography.family.semibold, fontSize: 14, color: colors.onSurfaceVariant },
  title: { fontFamily: typography.family.extrabold, fontSize: 26, letterSpacing: -0.02, color: colors.onSurface, marginBottom: 8 },
  desc: { fontFamily: typography.family.regular, fontSize: 14, color: colors.onSurfaceVariant, lineHeight: 21, marginBottom: 20 },
  subCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, backgroundColor: colors.surfaceLowest, borderRadius: 16, borderWidth: 1.5, borderColor: colors.outlineVariant, padding: 16, marginBottom: 10 },
  subCardActive: { borderColor: colors.primary, backgroundColor: '#eff6ff' },
  subCardRequired: { borderColor: '#16a34a', backgroundColor: '#f0fdf4' },
  subIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  subName: { fontFamily: typography.family.bold, fontSize: 15, color: colors.onSurface },
  subDesc: { fontFamily: typography.family.regular, fontSize: 12, color: colors.onSurfaceVariant, lineHeight: 18 },
  reqBadge: { backgroundColor: '#dcfce7', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  reqBadgeText: { fontFamily: typography.family.bold, fontSize: 10, color: '#166534' },
  check: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.outlineVariant, alignItems: 'center', justifyContent: 'center', marginTop: 2, flexShrink: 0 },
  checkActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  infoBox: { backgroundColor: '#eff6ff', borderRadius: 12, padding: 12, marginBottom: 16, marginTop: 4 },
  btn: { backgroundColor: colors.primary, borderRadius: radius.full, paddingVertical: 16, alignItems: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 4 },
  btnDisabled: { opacity: 0.5 },
  btnText: { fontFamily: typography.family.bold, fontSize: 15, color: '#fff' },
})
