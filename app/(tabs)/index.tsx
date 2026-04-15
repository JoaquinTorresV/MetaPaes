import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '@/store/authStore'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { colors, radius, spacing, typography } from '@/config/theme'
import { SUBJECTS } from '@/config/subjects'
import type { SubjectCode } from '@/services/supabase/types'

const SUBJECT_EMOJI: Record<SubjectCode, string> = {
  competencia_lectora: '📖', m1: '🔢', m2: '∑',
  historia: '🌍', biologia: '🔬', fisica: '⚡', quimica: '🧪',
}

export default function HomeScreen() {
  const { user } = useAuthStore()
  const { data, isLoading, error, refetch } = useDashboard()

  const firstName = user?.full_name?.split(' ')[0] ?? 'Estudiante'
  const today = new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'short' })

  if (isLoading) {
    return (
      <SafeAreaView style={[s.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ fontFamily: typography.family.medium, fontSize: 14, color: colors.onSurfaceVariant, marginTop: 12 }}>
          Cargando tu plan...
        </Text>
      </SafeAreaView>
    )
  }

  if (error || !data) {
    return (
      <SafeAreaView style={[s.container, { alignItems: 'center', justifyContent: 'center', padding: 32 }]}>
        <Text style={{ fontSize: 40, marginBottom: 16 }}>😕</Text>
        <Text style={{ fontFamily: typography.family.bold, fontSize: 16, color: colors.onSurface, textAlign: 'center', marginBottom: 8 }}>
          No se pudo cargar tu plan
        </Text>
        <Text style={{ fontFamily: typography.family.regular, fontSize: 13, color: colors.onSurfaceVariant, textAlign: 'center', marginBottom: 24 }}>
          Verifica tu conexión e intenta de nuevo.
        </Text>
        <TouchableOpacity style={{ backgroundColor: colors.primary, borderRadius: radius.full, paddingHorizontal: 24, paddingVertical: 12 }} onPress={() => refetch()}>
          <Text style={{ fontFamily: typography.family.bold, fontSize: 14, color: '#fff' }}>Reintentar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={s.container}>
      {/* TopBar */}
      <View style={s.topbar}>
        <View style={s.topbarLeft}>
          <View style={s.avatar}><Text style={s.avatarText}>{firstName[0]?.toUpperCase()}</Text></View>
          <View>
            <Text style={s.topbarName}>Atelier PAES</Text>
          </View>
        </View>
        <TouchableOpacity style={s.topbarBtn} onPress={() => router.push('/(tabs)/profile')}>
          <Text style={{ fontSize: 18 }}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.greeting}>Hola, {firstName}</Text>
        <Text style={s.careerLabel}>{data.careerName} — {data.universityName}</Text>

        {/* Score card */}
        <View style={s.scoreCard}>
          <Text style={s.scoreLabel}>PROGRESO GENERAL</Text>
          <View style={s.scoreRow}>
            <Text style={s.scoreValue}>{data.totalScore}</Text>
            <Text style={s.scoreTarget}> / {data.targetScore} pts</Text>
          </View>
          <View style={s.metaRow}>
            <Text style={s.metaText}>Meta: {data.careerName}</Text>
            <Text style={s.metaPct}>{data.progressPct}%</Text>
          </View>
          <View style={s.progTrack}>
            <View style={[s.progFill, { width: `${Math.min(100, data.progressPct)}%` as `${number}%` }]} />
          </View>
        </View>

        {/* Stats row */}
        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statLabel}>Racha</Text>
            <Text style={s.statValue}>{data.currentStreak} días {data.currentStreak > 0 ? '🔥' : '❄️'}</Text>
            <Text style={s.statSub}>días consecutivos</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statLabel}>Cuenta regresiva</Text>
            <Text style={s.statValue}>{data.daysToExam}</Text>
            <Text style={s.statSub}>días para la PAES</Text>
          </View>
        </View>

        {/* Gap card */}
        {data.gap > 0 && (
          <View style={s.gapCard}>
            <Text style={s.gapArrow}>↗</Text>
            <Text style={s.gapPre}>Te faltan</Text>
            <Text style={s.gapValue}>{data.gap} puntos</Text>
            <View style={s.gapBadge}>
              <Text style={s.gapBadgeText}>Para el puntaje de corte</Text>
            </View>
          </View>
        )}

        {/* Plan del día */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Plan del día</Text>
          <Text style={s.sectionDate}>{today}</Text>
        </View>

        {data.todayPlan.map(item => (
          <TouchableOpacity
            key={item.subject}
            style={s.planRow}
            onPress={() => router.push({ pathname: '/(tabs)/practice', params: { subject: item.subject } })}
            activeOpacity={0.75}
          >
            <View style={s.planIcon}>
              <Text style={{ fontSize: 20 }}>{SUBJECT_EMOJI[item.subject] ?? '📚'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.planSubject}>{SUBJECTS[item.subject]?.shortName ?? item.subject}</Text>
              <Text style={s.planMeta}>{item.count} preguntas</Text>
            </View>
            <Text style={{ color: colors.outline, fontSize: 18 }}>›</Text>
          </TouchableOpacity>
        ))}

        {data.todayPlan.length === 0 && (
          <View style={{ backgroundColor: '#dcfce7', borderRadius: 14, padding: 16, marginBottom: 14 }}>
            <Text style={{ fontFamily: typography.family.bold, fontSize: 14, color: '#166534' }}>
              🎉 ¡Meta del día completada!
            </Text>
            <Text style={{ fontFamily: typography.family.regular, fontSize: 13, color: '#166534', marginTop: 4 }}>
              Excelente trabajo. Puedes seguir practicando si quieres.
            </Text>
          </View>
        )}

        <TouchableOpacity style={s.btnOutline} onPress={() => router.push('/exam/setup')} activeOpacity={0.85}>
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
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: 12, backgroundColor: 'rgba(255,255,255,0.85)' },
  topbarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: typography.family.bold, fontSize: 15, color: '#fff' },
  topbarName: { fontFamily: typography.family.extrabold, fontSize: 16, color: colors.primary },
  topbarBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceLow, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: spacing.xl, paddingBottom: 100 },
  greeting: { fontFamily: typography.family.extrabold, fontSize: 28, letterSpacing: -0.02, color: colors.onSurface, marginBottom: 4 },
  careerLabel: { fontFamily: typography.family.regular, fontSize: 14, color: colors.onSurfaceVariant, marginBottom: 20 },
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
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  statCard: { flex: 1, backgroundColor: colors.surfaceLowest, borderRadius: radius.lg, padding: 16, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  statLabel: { fontFamily: typography.family.bold, fontSize: 10, color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.04, marginBottom: 4 },
  statValue: { fontFamily: typography.family.extrabold, fontSize: 22, letterSpacing: -0.02, color: colors.onSurface },
  statSub: { fontFamily: typography.family.regular, fontSize: 11, color: colors.onSurfaceVariant, marginTop: 2 },
  gapCard: { backgroundColor: colors.primary, borderRadius: radius.xl, padding: spacing.xl, marginBottom: 20, shadowColor: colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 32, elevation: 6 },
  gapArrow: { fontSize: 20, color: '#fff', marginBottom: 4 },
  gapPre: { fontFamily: typography.family.regular, fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  gapValue: { fontFamily: typography.family.extrabold, fontSize: 34, letterSpacing: -0.02, color: '#fff', marginBottom: 12 },
  gapBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 4 },
  gapBadgeText: { fontFamily: typography.family.medium, fontSize: 12, color: '#fff' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontFamily: typography.family.bold, fontSize: 16, color: colors.onSurface },
  sectionDate: { fontFamily: typography.family.regular, fontSize: 12, color: colors.onSurfaceVariant },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surfaceLowest, borderRadius: 14, padding: 14, marginBottom: 8 },
  planIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center' },
  planSubject: { fontFamily: typography.family.bold, fontSize: 14, color: colors.onSurface },
  planMeta: { fontFamily: typography.family.regular, fontSize: 12, color: colors.onSurfaceVariant },
  btnOutline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.primary, borderRadius: radius.full, paddingVertical: 14, marginBottom: 10, marginTop: 8 },
  btnOutlineText: { fontFamily: typography.family.semibold, fontSize: 15, color: colors.primary },
  btnPrimary: { backgroundColor: colors.primary, borderRadius: radius.full, paddingVertical: 16, alignItems: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 4 },
  btnPrimaryText: { fontFamily: typography.family.bold, fontSize: 15, color: '#fff' },
})
