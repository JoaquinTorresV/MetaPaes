import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Alert } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useAuthStore } from '@/store/authStore'
import { completeOnboarding } from '@/features/onboarding/services/onboardingService'
import { colors, radius, spacing, typography } from '@/config/theme'

export default function OnboardingReady() {
  const { user } = useAuthStore()
  const params = useLocalSearchParams<{
    name: string
    careerId: string
    careerName: string
    university: string
    targetScore: string
    subjects: string    // JSON array
  }>()
  const [saving, setSaving] = useState(false)

  const name = params.name ?? user?.full_name ?? 'Estudiante'
  const targetScore = parseInt(params.targetScore ?? '700', 10)
  const subjectList = params.subjects ? (JSON.parse(params.subjects) as string[]) : ['competencia_lectora', 'm1']
  const careerName = params.careerName ?? 'Tu carrera'
  const university = params.university ?? ''

  async function handleStart() {
    if (!user?.id) {
      Alert.alert('Error', 'No se encontró la sesión. Vuelve a iniciar sesión.')
      return
    }
    setSaving(true)
    try {
      const result = await completeOnboarding({
        userId: user.id,
        fullName: name,
        careerId: params.careerId ?? '',
        targetScore,
        selectedSubjects: subjectList as never[],
        examDate: '2026-11-28',
      })
      if (result.error) {
        Alert.alert('Error al guardar', result.error)
        return
      }
      // Recargar perfil y redirigir
      await useAuthStore.getState().loadUserProfile(user.id)
      router.replace('/(tabs)')
    } finally {
      setSaving(false)
    }
  }

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.checkCircle}>
          <Text style={{ fontSize: 36, color: '#fff' }}>✓</Text>
        </View>

        <Text style={s.title}>¡Tu plan está listo, {name}!</Text>
        <Text style={s.desc}>Hemos diseñado una ruta personalizada para alcanzar tu meta académica.</Text>

        <View style={s.card}>
          <Text style={s.cardLabel}>OBJETIVO</Text>
          <View style={s.cardRow}>
            <Text style={s.cardScore}>{targetScore} <Text style={s.cardPts}>pts</Text></Text>
            <Text style={{ fontSize: 40, opacity: 0.15 }}>🎓</Text>
          </View>
          <Text style={{ fontFamily: typography.family.semibold, fontSize: 13, color: colors.onSurfaceVariant, marginTop: 4 }}>
            {careerName} · {university}
          </Text>
        </View>

        <View style={s.grid}>
          <View style={s.gridCard}>
            <Text style={{ fontSize: 24, marginBottom: 8 }}>📚</Text>
            <Text style={s.gridLabel}>Asignaturas</Text>
            <View style={s.chips}>
              {subjectList.map(sub => (
                <View key={sub} style={s.chip}>
                  <Text style={s.chipText}>{sub.replace('competencia_lectora','Leng').replace('m1','Mat').replace('m2','Mat+').replace('historia','Hist').replace('biologia','Bio').replace('fisica','Fis').replace('quimica','Quim')}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={s.gridCard}>
            <Text style={{ fontSize: 24, marginBottom: 8 }}>📅</Text>
            <Text style={s.gridLabel}>Meta diaria</Text>
            <Text style={s.gridValue}>5 preguntas</Text>
            <Text style={s.gridSub}>por asignatura</Text>
          </View>
        </View>

        <View style={s.quoteCard}>
          <Text style={{ fontSize: 18, marginRight: 8 }}>💡</Text>
          <Text style={s.quoteText}>"La constancia es el secreto del éxito. Tu plan está optimizado para maximizar la retención."</Text>
        </View>

        <TouchableOpacity style={[s.btn, saving && s.btnDisabled]} onPress={handleStart} disabled={saving} activeOpacity={0.85}>
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.btnText}>Empezar ahora 🚀</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  scroll: { padding: spacing.xl, paddingBottom: 40, alignItems: 'center' },
  checkCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 20, shadowColor: colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.3, shadowRadius: 24, elevation: 6 },
  title: { fontFamily: typography.family.extrabold, fontSize: 26, letterSpacing: -0.02, color: colors.onSurface, textAlign: 'center', marginBottom: 8 },
  desc: { fontFamily: typography.family.regular, fontSize: 14, color: colors.onSurfaceVariant, textAlign: 'center', lineHeight: 21, marginBottom: 24, paddingHorizontal: 10 },
  card: { backgroundColor: colors.surfaceLowest, borderRadius: radius.xl, padding: 20, width: '100%', marginBottom: 12, shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 3 },
  cardLabel: { fontFamily: typography.family.bold, fontSize: 10, color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.08, marginBottom: 6 },
  cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardScore: { fontFamily: typography.family.extrabold, fontSize: 48, letterSpacing: -0.03, color: colors.onSurface },
  cardPts: { fontFamily: typography.family.medium, fontSize: 20, color: colors.onSurfaceVariant },
  grid: { flexDirection: 'row', gap: 10, width: '100%', marginBottom: 12 },
  gridCard: { flex: 1, backgroundColor: colors.surfaceLowest, borderRadius: radius.xl, padding: 16, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  gridLabel: { fontFamily: typography.family.semibold, fontSize: 13, color: colors.onSurface, marginBottom: 8 },
  chips: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  chip: { backgroundColor: '#dbeafe', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  chipText: { fontFamily: typography.family.bold, fontSize: 10, color: colors.primary },
  gridValue: { fontFamily: typography.family.bold, fontSize: 15, color: colors.primary },
  gridSub: { fontFamily: typography.family.regular, fontSize: 12, color: colors.onSurfaceVariant },
  quoteCard: { flexDirection: 'row', backgroundColor: '#eff6ff', borderRadius: 16, padding: 16, width: '100%', marginBottom: 24, alignItems: 'flex-start' },
  quoteText: { fontFamily: typography.family.regular, fontSize: 13, color: colors.primary, lineHeight: 20, flex: 1, fontStyle: 'italic' },
  btn: { backgroundColor: colors.primary, borderRadius: radius.full, paddingVertical: 16, alignItems: 'center', width: '100%', shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 4 },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontFamily: typography.family.bold, fontSize: 15, color: '#fff' },
})
