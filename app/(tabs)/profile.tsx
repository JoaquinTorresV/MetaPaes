import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { Platform } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/services/supabase/client'
import { colors, radius, spacing, typography } from '@/config/theme'
import { SUBJECTS } from '@/config/subjects'
import type { SubjectCode } from '@/services/supabase/types'

function useProfile() {
  const { user } = useAuthStore()
  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const [careerRes, progressRes, streakRes, statsRes] = await Promise.all([
        supabase.from('user_careers')
          .select('target_score, selected_subjects, careers(name, university)')
          .eq('user_id', user!.id).eq('priority', 'primary').maybeSingle(),
        supabase.from('subject_progress')
          .select('subject, estimated_score').eq('user_id', user!.id),
        supabase.from('user_streaks')
          .select('current_streak, longest_streak').eq('user_id', user!.id).maybeSingle(),
        supabase.from('user_answers')
          .select('id, is_correct', { count: 'exact' }).eq('user_id', user!.id),
      ])
      return {
        career: careerRes.data as any,
        progress: (progressRes.data ?? []) as Array<{ subject: string; estimated_score: number }>,
        streak: streakRes.data as any,
        totalAnswered: statsRes.count ?? 0,
        correctAnswered: ((statsRes.data ?? []) as Array<{ is_correct: boolean }>).filter((a) => a.is_correct).length,
      }
    },
    enabled: !!user?.id,
  })
}

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore()
  const { data, isLoading } = useProfile()
  const firstName = user?.full_name?.split(' ')[0] ?? 'Estudiante'

  async function performSignOut() {
    try {
      await signOut()
      router.replace('/(auth)')
    } catch {
      Alert.alert('Error', 'No se pudo cerrar la sesión. Intenta de nuevo.')
    }
  }

  async function handleSignOut() {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('¿Estás seguro de cerrar sesión?')) {
        await performSignOut()
      }
      return
    }

    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión', style: 'destructive',
        onPress: performSignOut,
      },
    ])
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.topbar}>
        <View style={s.topbarLeft}>
          <View style={s.logoIcon}><Text style={s.logoIconText}>A</Text></View>
          <Text style={s.topbarTitle}>Atelier PAES</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <View style={s.profileCard}>
          <View style={s.avatarWrap}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{firstName[0]?.toUpperCase()}</Text>
            </View>
            {user?.plan === 'premium' && <View style={s.verifiedBadge}><Text style={{ fontSize: 10 }}>✓</Text></View>}
          </View>
          <Text style={s.name}>{user?.full_name ?? 'Estudiante'}</Text>
          {data?.career && (
            <Text style={s.careerLabel}>
              {data.career.careers?.name} · {data.career.careers?.university}
            </Text>
          )}

          <View style={s.badges}>
            <View style={[s.badge, { backgroundColor: user?.plan === 'premium' ? colors.primary : colors.surfaceHigh }]}>
              <Text style={[s.badgeText, { color: user?.plan === 'premium' ? '#fff' : colors.onSurfaceVariant }]}>
                {user?.plan === 'premium' ? '✦ Premium' : 'Plan Free'}
              </Text>
            </View>
          </View>

          {/* Stats */}
          {isLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 16 }} />
          ) : (
            <View style={s.statsRow}>
              <View style={s.statItem}>
                <Text style={s.statVal}>{data?.streak?.current_streak ?? 0}</Text>
                <Text style={s.statLabel}>Racha 🔥</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.statItem}>
                <Text style={s.statVal}>{data?.totalAnswered ?? 0}</Text>
                <Text style={s.statLabel}>Preguntas</Text>
              </View>
              <View style={s.statDivider} />
              <View style={s.statItem}>
                <Text style={s.statVal}>
                  {data && data.totalAnswered > 0
                    ? `${Math.round((data.correctAnswered / data.totalAnswered) * 100)}%`
                    : '—'}
                </Text>
                <Text style={s.statLabel}>Precisión</Text>
              </View>
            </View>
          )}
        </View>

        {/* Subjects progress */}
        {!isLoading && data && data.progress.length > 0 && (
          <View style={s.card}>
            <View style={s.cardHeader}>
              <Text style={{ fontSize: 18 }}>📊</Text>
              <Text style={s.cardTitle}>Mis puntajes estimados</Text>
            </View>
            {data.progress.map((p) => {
              const sub = SUBJECTS[p.subject as SubjectCode]
              return (
                <View key={p.subject} style={s.subjectRow}>
                  <Text style={{ fontSize: 18, marginRight: 10 }}>
                    {p.subject === 'competencia_lectora' ? '📖'
                      : p.subject === 'm1' || p.subject === 'm2' ? '🔢'
                      : p.subject === 'historia' ? '🌍'
                      : p.subject === 'biologia' ? '🔬'
                      : p.subject === 'fisica' ? '⚡'
                      : '🧪'}
                  </Text>
                  <Text style={s.subjectName}>{sub?.shortName ?? p.subject}</Text>
                  <Text style={s.subjectScore}>{p.estimated_score} pts</Text>
                </View>
              )
            })}
          </View>
        )}

        {/* Premium card */}
        {user?.plan !== 'premium' && (
          <View style={s.upgradeCard}>
            <Text style={s.upgradeTitle}>Desbloquea MetaPAES Premium</Text>
            <Text style={s.upgradeDesc}>Tutor IA ilimitado, exámenes cronometrados y análisis avanzado.</Text>
            <TouchableOpacity style={s.upgradeBtn}>
              <Text style={s.upgradeBtnText}>Ver planes desde $4.990/mes</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Settings */}
        <View style={s.card}>
          <Text style={s.sectionLabel}>CONFIGURACIÓN</Text>

          {[
            { icon: '👤', label: 'Editar perfil', onPress: () => {} },
            { icon: '🔔', label: 'Notificaciones', onPress: () => {} },
            { icon: '📚', label: 'Cambiar asignaturas', onPress: () => router.push('/(auth)/onboarding/subjects') },
            { icon: '❓', label: 'Centro de ayuda', onPress: () => {} },
          ].map((item) => (
            <TouchableOpacity key={item.label} style={s.settingRow} onPress={item.onPress} activeOpacity={0.7}>
              <Text style={{ fontSize: 18, marginRight: 12 }}>{item.icon}</Text>
              <Text style={s.settingLabel}>{item.label}</Text>
              <Text style={s.chevron}>›</Text>
            </TouchableOpacity>
          ))}

          <View style={s.separator} />

          <TouchableOpacity style={s.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
            <Text style={{ fontSize: 18, marginRight: 10 }}>🚪</Text>
            <Text style={s.signOutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.version}>MetaPAES v1.0.0 · PAES Chile 2027</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: 12, backgroundColor: 'rgba(255,255,255,0.85)' },
  topbarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  logoIconText: { color: '#fff', fontFamily: typography.family.extrabold, fontSize: 14 },
  topbarTitle: { fontFamily: typography.family.extrabold, fontSize: 16, color: colors.primary },
  scroll: { padding: spacing.xl, paddingBottom: 100 },
  profileCard: { backgroundColor: colors.surfaceLowest, borderRadius: radius.xxl, padding: 24, alignItems: 'center', marginBottom: 14, shadowColor: colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.08, shadowRadius: 32, elevation: 4 },
  avatarWrap: { position: 'relative', marginBottom: 14 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: typography.family.extrabold, fontSize: 32, color: '#fff' },
  verifiedBadge: { position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: 12, backgroundColor: '#16a34a', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  name: { fontFamily: typography.family.extrabold, fontSize: 22, letterSpacing: -0.02, color: colors.onSurface, marginBottom: 4 },
  careerLabel: { fontFamily: typography.family.regular, fontSize: 13, color: colors.onSurfaceVariant, marginBottom: 12, textAlign: 'center' },
  badges: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  badge: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 5 },
  badgeText: { fontFamily: typography.family.bold, fontSize: 12 },
  statsRow: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontFamily: typography.family.extrabold, fontSize: 22, letterSpacing: -0.02, color: colors.onSurface },
  statLabel: { fontFamily: typography.family.regular, fontSize: 11, color: colors.onSurfaceVariant, marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: colors.outlineVariant, opacity: 0.3 },
  card: { backgroundColor: colors.surfaceLowest, borderRadius: radius.xl, padding: spacing.xl, marginBottom: 14, shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  cardTitle: { fontFamily: typography.family.bold, fontSize: 16, color: colors.onSurface },
  subjectRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(195,198,215,0.1)' },
  subjectName: { fontFamily: typography.family.semibold, fontSize: 14, color: colors.onSurface, flex: 1 },
  subjectScore: { fontFamily: typography.family.bold, fontSize: 14, color: colors.primary },
  upgradeCard: { backgroundColor: colors.primary, borderRadius: radius.xl, padding: 20, marginBottom: 14, shadowColor: colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 6 },
  upgradeTitle: { fontFamily: typography.family.extrabold, fontSize: 17, color: '#fff', marginBottom: 8 },
  upgradeDesc: { fontFamily: typography.family.regular, fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 20, marginBottom: 14 },
  upgradeBtn: { backgroundColor: '#fff', borderRadius: radius.full, paddingVertical: 12, alignItems: 'center' },
  upgradeBtnText: { fontFamily: typography.family.bold, fontSize: 14, color: colors.primary },
  sectionLabel: { fontFamily: typography.family.bold, fontSize: 10, color: colors.outline, textTransform: 'uppercase', letterSpacing: 0.1, marginBottom: 8 },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(195,198,215,0.08)' },
  settingLabel: { fontFamily: typography.family.semibold, fontSize: 14, color: colors.onSurface, flex: 1 },
  chevron: { fontFamily: typography.family.regular, fontSize: 18, color: colors.outline },
  separator: { height: 1, backgroundColor: 'rgba(195,198,215,0.15)', marginVertical: 8 },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, backgroundColor: '#fff5f5', borderRadius: 10, paddingHorizontal: 12, marginTop: 4 },
  signOutText: { fontFamily: typography.family.bold, fontSize: 14, color: colors.error },
  version: { textAlign: 'center', fontFamily: typography.family.regular, fontSize: 10, color: colors.outline, textTransform: 'uppercase', letterSpacing: 0.08 },
})
