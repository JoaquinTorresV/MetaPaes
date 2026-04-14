import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native'
import { router } from 'expo-router'
import { useProgressStore } from '@/store/progressStore'
import { useUserStore } from '@/store/userStore'
import { colors, radius, spacing, typography } from '@/config/theme'
import { SUBJECTS } from '@/config/subjects'

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreCard({ currentScore, targetScore, career }: { currentScore: number; targetScore: number; career: string }) {
  const pct = Math.round((currentScore / targetScore) * 100)
  return (
    <View style={s.scoreCard}>
      <Text style={s.scoreLabel}>PROGRESO GENERAL</Text>
      <View style={s.scoreRow}>
        <Text style={s.scoreValue}>{currentScore}</Text>
        <Text style={s.scoreTarget}> / {targetScore} pts</Text>
      </View>
      <View style={s.metaRow}>
        <Text style={s.metaText}>Meta: {career}</Text>
        <Text style={s.metaPct}>{pct}%</Text>
      </View>
      <View style={s.progTrack}>
        <View style={[s.progFill, { width: `${Math.min(100, pct)}%` as `${number}%` }]} />
      </View>
    </View>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <View style={s.statCard}>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={s.statValue}>{value}</Text>
      {sub && <Text style={s.statSub}>{sub}</Text>}
    </View>
  )
}

function PlanRow({ subject, count, axis, onPress }: { subject: string; count: number; axis: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={s.planRow} onPress={onPress} activeOpacity={0.75}>
      <View style={[s.planIcon, { backgroundColor: '#dbeafe' }]}>
        <Text style={{ fontSize: 18 }}>📚</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.planSubject}>{subject}</Text>
        <Text style={s.planMeta}>{count} preguntas · {axis}</Text>
      </View>
      <Text style={{ color: colors.outline }}>›</Text>
    </TouchableOpacity>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  // Datos mockeados para el prototipo — conectar con stores reales
  const currentScore = 770
  const targetScore = 890
  const gap = targetScore - currentScore
  const streak = 6
  const daysToExam = 124

  const today = new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'short' })

  return (
    <SafeAreaView style={s.container}>
      {/* TopBar */}
      <View style={s.topbar}>
        <View style={s.topbarLeft}>
          <View style={s.avatar}><Text style={s.avatarText}>M</Text></View>
          <View>
            <Text style={s.greeting}>Hola, Matías</Text>
            <Text style={s.careerTag}>Medicina — UC</Text>
          </View>
        </View>
        <TouchableOpacity style={s.topbarBtn} onPress={() => router.push('/(tabs)/profile')}>
          <Text style={{ fontSize: 18 }}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.hello}>Hola, Matías</Text>
        <Text style={s.careerLabel}>Medicina — UC</Text>

        {/* Score Card */}
        <ScoreCard currentScore={currentScore} targetScore={targetScore} career="Medicina UC" />

        {/* Stats Row */}
        <View style={s.statsRow}>
          <StatCard label="Racha" value={`${streak} días 🔥`} sub="días consecutivos" />
          <StatCard label="Cuenta regresiva" value={`${daysToExam}`} sub="días para la PAES" />
        </View>

        {/* Gap Card */}
        <View style={s.gapCard}>
          <Text style={s.gapArrow}>↗</Text>
          <Text style={s.gapPre}>Te faltan</Text>
          <Text style={s.gapValue}>{gap} puntos</Text>
          <View style={s.gapBadge}>
            <Text style={s.gapBadgeText}>Para el puntaje de corte</Text>
          </View>
        </View>

        {/* Plan del día */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Plan del día</Text>
          <Text style={s.sectionDate}>{today}</Text>
        </View>

        <PlanRow
          subject="Matemática M1"
          count={5}
          axis="Geometría"
          onPress={() => router.push('/(tabs)/practice')}
        />
        <PlanRow
          subject="Competencia Lectora"
          count={5}
          axis="Textos Literarios"
          onPress={() => router.push('/(tabs)/practice')}
        />

        {/* Quick actions */}
        <TouchableOpacity
          style={s.btnOutline}
          onPress={() => router.push('/exam/setup')}
          activeOpacity={0.85}
        >
          <Text style={{ fontSize: 16, marginRight: 6 }}>⏱</Text>
          <Text style={s.btnOutlineText}>Iniciar Ensayo Cronometrado</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.btnPrimary}
          onPress={() => router.push('/(tabs)/practice')}
          activeOpacity={0.85}
        >
          <Text style={s.btnPrimaryText}>Empezar práctica →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: 12, backgroundColor: 'rgba(255,255,255,0.8)' },
  topbarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: typography.family.bold, fontSize: 15, color: '#fff' },
  greeting: { fontFamily: typography.family.bold, fontSize: 13, color: colors.onSurface },
  careerTag: { fontFamily: typography.family.regular, fontSize: 11, color: colors.onSurfaceVariant },
  topbarBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceLow, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: spacing.xl, paddingBottom: 100 },
  hello: { fontFamily: typography.family.extrabold, fontSize: 28, letterSpacing: -0.02, color: colors.onSurface, marginBottom: 4 },
  careerLabel: { fontFamily: typography.family.regular, fontSize: 14, color: colors.onSurfaceVariant, marginBottom: 20 },
  // Score card
  scoreCard: { backgroundColor: colors.surfaceLowest, borderRadius: radius.xl, padding: spacing.xl, marginBottom: 10, shadowColor: colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.08, shadowRadius: 32, elevation: 4 },
  scoreLabel: { fontFamily: typography.family.bold, fontSize: 10, color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 6 },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline' },
  scoreValue: { fontFamily: typography.family.extrabold, fontSize: 42, letterSpacing: -0.03, color: colors.onSurface },
  scoreTarget: { fontFamily: typography.family.medium, fontSize: 18, color: colors.onSurfaceVariant },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, marginBottom: 8 },
  metaText: { fontFamily: typography.family.regular, fontSize: 13, color: colors.onSurfaceVariant },
  metaPct: { fontFamily: typography.family.bold, fontSize: 13, color: colors.primary },
  progTrack: { height: 6, backgroundColor: '#e2e8f0', borderRadius: 999, overflow: 'hidden' },
  progFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 999 },
  // Stats
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  statCard: { flex: 1, backgroundColor: colors.surfaceLowest, borderRadius: radius.lg, padding: 16, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  statLabel: { fontFamily: typography.family.bold, fontSize: 10, color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.04, marginBottom: 4 },
  statValue: { fontFamily: typography.family.extrabold, fontSize: 22, letterSpacing: -0.02, color: colors.onSurface },
  statSub: { fontFamily: typography.family.regular, fontSize: 11, color: colors.onSurfaceVariant, marginTop: 2 },
  // Gap card
  gapCard: { backgroundColor: colors.primary, borderRadius: radius.xl, padding: spacing.xl, marginBottom: 20, shadowColor: colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 32, elevation: 6 },
  gapArrow: { fontSize: 20, color: '#fff', marginBottom: 4 },
  gapPre: { fontFamily: typography.family.regular, fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  gapValue: { fontFamily: typography.family.extrabold, fontSize: 34, letterSpacing: -0.02, color: '#fff', marginBottom: 12 },
  gapBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 4 },
  gapBadgeText: { fontFamily: typography.family.medium, fontSize: 12, color: '#fff' },
  // Plan
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontFamily: typography.family.bold, fontSize: 16, color: colors.onSurface },
  sectionDate: { fontFamily: typography.family.regular, fontSize: 12, color: colors.onSurfaceVariant },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surfaceLowest, borderRadius: 14, padding: 14, marginBottom: 8 },
  planIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  planSubject: { fontFamily: typography.family.bold, fontSize: 14, color: colors.onSurface },
  planMeta: { fontFamily: typography.family.regular, fontSize: 12, color: colors.onSurfaceVariant },
  // Buttons
  btnOutline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.primary, borderRadius: radius.full, paddingVertical: 14, marginBottom: 10, marginTop: 8 },
  btnOutlineText: { fontFamily: typography.family.semibold, fontSize: 15, color: colors.primary },
  btnPrimary: { backgroundColor: colors.primary, borderRadius: radius.full, paddingVertical: 16, alignItems: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 4 },
  btnPrimaryText: { fontFamily: typography.family.bold, fontSize: 15, color: '#fff' },
})
