import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { colors, radius, spacing, typography } from '@/config/theme'

export default function OnboardingScore() {
  const params = useLocalSearchParams<{
    name: string
    careerId: string
    careerName: string
    university: string
    targetScore: string
    requiredSubjects: string
    optionalSubjects: string
  }>()

  const targetScore = parseInt(params.targetScore ?? '700', 10)
  const careerName = params.careerName ?? 'Tu carrera'
  const university = params.university ?? ''

  function handleContinue() {
    router.push({
      pathname: '/(auth)/onboarding/subjects',
      params: {
        name: params.name,
        careerId: params.careerId,
        careerName,
        university,
        targetScore: targetScore.toString(),
        requiredSubjects: params.requiredSubjects ?? '[]',
        optionalSubjects: params.optionalSubjects ?? '[]',
      },
    })
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.content}>
        <View style={s.topRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={s.back}>←</Text>
          </TouchableOpacity>
          <Text style={s.stepText}>Paso 3 de 4</Text>
        </View>

        <View style={{ height: 4, backgroundColor: '#e2e8f0', borderRadius: 999, marginBottom: 24, overflow: 'hidden' }}>
          <View style={{ height: '100%', width: '75%', backgroundColor: colors.primary, borderRadius: 999 }} />
        </View>

        <View style={s.imageBox}>
          <Text style={s.imageTitle}>{careerName}</Text>
          <Text style={s.imageUni}>{university}</Text>
          <Text style={s.imageDesc}>Para esta carrera necesitas aproximadamente:</Text>
        </View>

        <View style={s.scoreDisplay}>
          <Text style={s.scoreNum}>{targetScore}</Text>
          <Text style={s.scorePts}> puntos</Text>
        </View>

        <View style={s.card}>
          <View style={s.cardIcon}><Text style={{ fontSize: 28 }}>📊</Text></View>
          <Text style={s.cardTitle}>Análisis de Admisión</Text>
          <Text style={s.cardDesc}>
            Basado en el último convocado de la cohorte anterior y los
            ponderadores oficiales de la carrera seleccionada.
          </Text>
        </View>

        <TouchableOpacity style={s.btn} onPress={handleContinue} activeOpacity={0.85}>
          <Text style={s.btnText}>Continuar →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { flex: 1, padding: spacing.xl },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  back: { fontFamily: typography.family.bold, fontSize: 22, color: colors.onSurface },
  stepText: { fontFamily: typography.family.semibold, fontSize: 14, color: colors.onSurfaceVariant },
  imageBox: { backgroundColor: colors.surfaceLow, borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 8 },
  imageTitle: { fontFamily: typography.family.extrabold, fontSize: 18, color: colors.onSurface, marginBottom: 4 },
  imageUni: { fontFamily: typography.family.regular, fontSize: 13, color: colors.onSurfaceVariant, marginBottom: 10 },
  imageDesc: { fontFamily: typography.family.regular, fontSize: 14, color: colors.onSurfaceVariant },
  scoreDisplay: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', marginVertical: 24 },
  scoreNum: { fontFamily: typography.family.extrabold, fontSize: 72, letterSpacing: -0.04, color: colors.onSurface },
  scorePts: { fontFamily: typography.family.bold, fontSize: 24, color: colors.primary, marginLeft: 8 },
  card: { backgroundColor: colors.surfaceLowest, borderRadius: radius.xl, padding: 24, alignItems: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 3, marginBottom: 24 },
  cardIcon: { width: 56, height: 56, borderRadius: 14, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  cardTitle: { fontFamily: typography.family.bold, fontSize: 16, color: colors.onSurface, marginBottom: 8 },
  cardDesc: { fontFamily: typography.family.regular, fontSize: 13, color: colors.onSurfaceVariant, lineHeight: 20, textAlign: 'center' },
  btn: { backgroundColor: colors.primary, borderRadius: radius.full, paddingVertical: 16, alignItems: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 4 },
  btnText: { fontFamily: typography.family.bold, fontSize: 15, color: '#fff' },
})
