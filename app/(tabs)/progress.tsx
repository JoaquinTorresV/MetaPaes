import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { colors, radius, spacing, typography } from '@/config/theme'

function ScoreCard({ icon, label, score, trend, trendPositive }: {
  icon: string; label: string; score: number; trend: string; trendPositive: boolean
}) {
  return (
    <View style={s.scoreCard}>
      <Text style={{ fontSize: 22, marginBottom: 6 }}>{icon}</Text>
      <Text style={s.scoreCardLabel}>{label}</Text>
      <Text style={s.scoreCardValue}>{score}</Text>
      <Text style={[s.scoreCardTrend, { color: trendPositive ? '#16a34a' : colors.onSurfaceVariant }]}>{trend}</Text>
    </View>
  )
}

function AxisRow({ icon, label, pct, alert }: { icon: string; label: string; pct: number; alert?: boolean }) {
  const barColor = pct < 65 ? colors.error : pct < 80 ? '#d97706' : colors.primary
  return (
    <View style={s.axisRow}>
      <View style={s.axisTop}>
        <Text style={s.axisLabel}>{icon} {label}</Text>
        <Text style={[s.axisPct, { color: barColor }]}>{pct}%</Text>
      </View>
      <View style={s.barTrack}>
        <View style={[s.barFill, { width: `${pct}%` as `${number}%`, backgroundColor: barColor }]} />
      </View>
      {alert && <Text style={s.axisAlert}>! REQUIERE ATENCIÓN URGENTE</Text>}
    </View>
  )
}

export default function ProgressScreen() {
  const weekData = [30, 90, 40, 20, 60, 45, 35]
  const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

  return (
    <SafeAreaView style={s.container}>
      <View style={s.topbar}>
        <View style={s.topbarLeft}>
          <View style={s.logoIcon}><Text style={{ color: '#fff', fontFamily: typography.family.extrabold, fontSize: 14 }}>A</Text></View>
          <Text style={s.topbarTitle}>Atelier PAES</Text>
        </View>
        <TouchableOpacity style={s.topbarBtn}><Text style={{ fontSize: 18 }}>⚙️</Text></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.sectionTag}>ANALYTICS</Text>
        <Text style={s.pageTitle}>Progress Insights</Text>

        {/* Score cards */}
        <View style={s.scoreRow}>
          <ScoreCard icon="∑" label="Math Score" score={720} trend="↗ +15 pts esta semana" trendPositive />
          <ScoreCard icon="∀" label="Lang Score" score={680} trend="→ Estable" trendPositive={false} />
        </View>

        {/* AI Insight */}
        <View style={s.aiBox}>
          <Text style={s.aiTag}>✦ AI MENTOR INSIGHT</Text>
          <Text style={s.aiText}>
            Tu punto débil actual es{' '}
            <Text style={s.aiHighlight}>Geometría</Text>
          </Text>
          <TouchableOpacity style={s.aiBtn} onPress={() => router.push('/(tabs)/practice')}>
            <Text style={s.aiBtnText}>Reforzar ahora</Text>
          </TouchableOpacity>
        </View>

        {/* Performance breakdown */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.cardTitle}>Performance Breakdown</Text>
            <TouchableOpacity><Text style={s.cardAction}>Ver reporte completo</Text></TouchableOpacity>
          </View>
          <Text style={s.cardSub}>Áreas prioritarias basadas en tus últimas sesiones</Text>
          <AxisRow icon="Σ" label="Álgebra" pct={80} />
          <AxisRow icon="△" label="Geometría" pct={60} alert />
          <AxisRow icon="∥" label="Probabilidad y Est." pct={75} />
          <AxisRow icon="∀" label="Comprensión Lectora" pct={72} />
          <AxisRow icon="⊕" label="Historia" pct={65} />
        </View>

        {/* Consistency chart */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Consistencia de estudio</Text>
          <View style={s.barChart}>
            {weekData.map((h, i) => (
              <View key={i} style={s.barCol}>
                <View style={s.barBg}>
                  <View style={[
                    s.barInner,
                    { height: `${h}%` as `${number}%`, backgroundColor: i === 1 ? colors.primary : '#93c5fd' }
                  ]} />
                </View>
                <Text style={s.barDay}>{days[i]}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Next milestone */}
        <View style={s.milestoneCard}>
          <Text style={s.milestoneTag}>PRÓXIMO HITO</Text>
          <Text style={s.milestoneTitle}>Simulacro Examen 04</Text>
          <Text style={s.milestoneDesc}>Enfocado en Geometría y Razonamiento Lógico.</Text>
          <View style={s.milestoneDate}>
            <Text style={{ fontSize: 14, marginRight: 4 }}>📅</Text>
            <Text style={s.milestoneDateText}>12 Mayo, 09:00 AM</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: 12, backgroundColor: 'rgba(255,255,255,0.8)' },
  topbarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  topbarTitle: { fontFamily: typography.family.extrabold, fontSize: 16, color: colors.primary },
  topbarBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceLow, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: spacing.xl, paddingBottom: 100 },
  sectionTag: { fontFamily: typography.family.bold, fontSize: 10, color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 4 },
  pageTitle: { fontFamily: typography.family.extrabold, fontSize: 26, letterSpacing: -0.02, color: colors.onSurface, marginBottom: 20 },
  scoreRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  scoreCard: { flex: 1, backgroundColor: colors.surfaceLowest, borderRadius: radius.xl, padding: 16, shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 3 },
  scoreCardLabel: { fontFamily: typography.family.semibold, fontSize: 12, color: colors.onSurfaceVariant, marginBottom: 4 },
  scoreCardValue: { fontFamily: typography.family.extrabold, fontSize: 32, letterSpacing: -0.02, color: colors.onSurface },
  scoreCardTrend: { fontFamily: typography.family.semibold, fontSize: 11, marginTop: 2 },
  aiBox: { backgroundColor: colors.primary, borderRadius: radius.xl, padding: 18, marginBottom: 14, shadowColor: colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 6 },
  aiTag: { fontFamily: typography.family.bold, fontSize: 10, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 0.07, marginBottom: 6 },
  aiText: { fontFamily: typography.family.bold, fontSize: 15, color: '#fff', marginBottom: 12 },
  aiHighlight: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 6, overflow: 'hidden', paddingHorizontal: 6 },
  aiBtn: { alignSelf: 'flex-start', backgroundColor: '#fff', borderRadius: radius.full, paddingHorizontal: 18, paddingVertical: 8 },
  aiBtnText: { fontFamily: typography.family.bold, fontSize: 13, color: colors.primary },
  card: { backgroundColor: colors.surfaceLowest, borderRadius: radius.xl, padding: spacing.xl, marginBottom: 14, shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardTitle: { fontFamily: typography.family.bold, fontSize: 16, color: colors.onSurface },
  cardAction: { fontFamily: typography.family.semibold, fontSize: 12, color: colors.primary },
  cardSub: { fontFamily: typography.family.regular, fontSize: 12, color: colors.onSurfaceVariant, marginBottom: 16 },
  axisRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(195,198,215,0.15)' },
  axisTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  axisLabel: { fontFamily: typography.family.semibold, fontSize: 13, color: colors.onSurface },
  axisPct: { fontFamily: typography.family.bold, fontSize: 13 },
  barTrack: { height: 5, backgroundColor: '#e2e8f0', borderRadius: 999, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 999 },
  axisAlert: { fontFamily: typography.family.bold, fontSize: 10, color: colors.error, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.04 },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 70, marginTop: 14 },
  barCol: { flex: 1, alignItems: 'center', gap: 6, height: '100%' },
  barBg: { flex: 1, width: '100%', justifyContent: 'flex-end', borderRadius: 4, backgroundColor: colors.surfaceHigh, overflow: 'hidden' },
  barInner: { width: '100%', borderRadius: 4 },
  barDay: { fontFamily: typography.family.bold, fontSize: 9, color: colors.outline },
  milestoneCard: { backgroundColor: '#fff7ed', borderRadius: radius.xl, padding: 18, borderLeftWidth: 3, borderLeftColor: '#f59e0b' },
  milestoneTag: { fontFamily: typography.family.bold, fontSize: 10, color: '#92400e', textTransform: 'uppercase', letterSpacing: 0.05, marginBottom: 6 },
  milestoneTitle: { fontFamily: typography.family.extrabold, fontSize: 16, color: colors.onSurface, marginBottom: 4 },
  milestoneDesc: { fontFamily: typography.family.regular, fontSize: 13, color: colors.onSurfaceVariant, marginBottom: 8 },
  milestoneDate: { flexDirection: 'row', alignItems: 'center' },
  milestoneDateText: { fontFamily: typography.family.semibold, fontSize: 12, color: colors.onSurfaceVariant },
})
