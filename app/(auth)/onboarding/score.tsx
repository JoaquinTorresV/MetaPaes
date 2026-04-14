import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native'
import { router } from 'expo-router'
import { colors, radius, spacing, typography } from '@/config/theme'

export default function OnboardingScore() {
  return (
    <SafeAreaView style={s.container}>
      <View style={s.content}>
        <TouchableOpacity onPress={() => router.back()}><Text style={s.back}>←</Text></TouchableOpacity>
        <View style={{ height: 4, backgroundColor: '#e2e8f0', borderRadius: 999, marginVertical: 16, overflow: 'hidden' }}>
          <View style={{ height: '100%', width: '57%', backgroundColor: colors.primary, borderRadius: 999 }} />
        </View>
        <Text style={{ fontFamily: typography.family.bold, fontSize: 10, color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.05, marginBottom: 4 }}>PASO 4 DE 7</Text>

        <View style={s.imageBox}>
          <Text style={{ fontFamily: typography.family.regular, fontSize: 14, color: colors.onSurfaceVariant, textAlign: 'center' }}>Para esta carrera necesitas aproximadamente:</Text>
        </View>

        <View style={s.scoreDisplay}>
          <Text style={s.scoreNum}>890</Text>
          <Text style={s.scorePts}> puntos</Text>
        </View>

        <View style={s.card}>
          <View style={s.cardIcon}><Text style={{ fontSize: 28 }}>📊</Text></View>
          <Text style={s.cardTitle}>Análisis de Admisión</Text>
          <Text style={s.cardDesc}>Este puntaje se calcula basándose en el último convocado de la cohorte anterior y los ponderadores de la carrera seleccionada.</Text>
        </View>

        <TouchableOpacity style={s.btn} onPress={() => router.push('/(auth)/onboarding/subjects')} activeOpacity={0.85}>
          <Text style={s.btnText}>Continuar →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { flex: 1, padding: spacing.xl },
  back: { fontFamily: typography.family.bold, fontSize: 22, color: colors.onSurface },
  imageBox: { backgroundColor: colors.surfaceLow, borderRadius: 16, padding: 20, alignItems: 'center', marginTop: 16, marginBottom: 8 },
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
