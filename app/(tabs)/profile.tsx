import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '@/store/authStore'
import { colors, radius, spacing, typography } from '@/config/theme'

function SettingRow({ icon, label, onPress, danger }: { icon: string; label: string; onPress?: () => void; danger?: boolean }) {
  return (
    <TouchableOpacity style={s.settingRow} onPress={onPress} activeOpacity={0.7}>
      <Text style={{ fontSize: 18, marginRight: 12 }}>{icon}</Text>
      <Text style={[s.settingLabel, danger && { color: colors.error }]}>{label}</Text>
      {!danger && <Text style={s.chevron}>›</Text>}
    </TouchableOpacity>
  )
}

function StatBadge({ value, label }: { value: string | number; label: string }) {
  return (
    <View style={s.statBadge}>
      <Text style={s.statBadgeValue}>{value}</Text>
      <Text style={s.statBadgeLabel}>{label}</Text>
    </View>
  )
}

export default function ProfileScreen() {
  const { signOut } = useAuthStore()

  async function handleSignOut() {
    Alert.alert('Cerrar sesión', '¿Estás seguro de que quieres cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: async () => { await signOut(); router.replace('/(auth)') } },
    ])
  }

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
        {/* Avatar + info */}
        <View style={s.profileCard}>
          <View style={s.avatarWrap}>
            <View style={s.avatar}><Text style={s.avatarText}>M</Text></View>
            <View style={s.verifiedBadge}><Text style={{ fontSize: 12 }}>✓</Text></View>
          </View>
          <Text style={s.name}>Matías Herrera</Text>
          <Text style={s.careerLabel}>Medicina — UC · 4° Medio</Text>
          <View style={s.badges}>
            <View style={s.premiumBadge}><Text style={s.premiumText}>✦ Premium</Text></View>
            <View style={s.idBadge}><Text style={s.idText}>ID: 4920</Text></View>
          </View>

          {/* Stats */}
          <View style={s.statsRow}>
            <StatBadge value={6} label="Racha" />
            <View style={s.statDivider} />
            <StatBadge value={248} label="Preguntas" />
            <View style={s.statDivider} />
            <StatBadge value="770" label="Puntaje" />
          </View>

          <TouchableOpacity style={s.editBtn}><Text style={s.editBtnText}>Editar perfil</Text></TouchableOpacity>
        </View>

        {/* Career */}
        <View style={s.card}>
          <View style={s.cardHeader}><Text style={{ fontSize: 18 }}>🎓</Text><Text style={s.cardTitle}>Carrera objetivo</Text></View>
          <View style={s.careerRow}>
            <View style={s.careerIcon}><Text style={{ fontSize: 22 }}>🩺</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.careerName}>Medicina</Text>
              <Text style={s.careerUni}>Pontificia Universidad Católica</Text>
            </View>
            <View style={s.cutScoreBadge}><Text style={s.cutScoreText}>870 pts</Text></View>
          </View>
        </View>

        {/* My subjects */}
        <View style={s.card}>
          <View style={s.cardHeader}><Text style={{ fontSize: 18 }}>📚</Text><Text style={s.cardTitle}>Mis asignaturas</Text></View>
          {[
            { name: 'Competencia Lectora', emoji: '📖', score: 680 },
            { name: 'Matemática M1', emoji: '🔢', score: 720 },
            { name: 'Ciencias — Biología', emoji: '🔬', score: 665 },
          ].map(sub => (
            <View key={sub.name} style={s.subjectRow}>
              <Text style={{ fontSize: 18, marginRight: 10 }}>{sub.emoji}</Text>
              <Text style={s.subjectName}>{sub.name}</Text>
              <Text style={s.subjectScore}>{sub.score} pts</Text>
            </View>
          ))}
          <TouchableOpacity style={s.addSubjectBtn}><Text style={s.addSubjectText}>+ Gestionar asignaturas</Text></TouchableOpacity>
        </View>

        {/* Premium */}
        <View style={s.premiumCard}>
          <View style={s.premiumCardTop}>
            <Text style={{ fontSize: 28, marginBottom: 10 }}>✦</Text>
            <View style={s.premiumLabel}><Text style={s.premiumLabelText}>PREMIUM</Text></View>
          </View>
          <Text style={s.premiumCardSub}>Próxima renovación</Text>
          <Text style={s.premiumCardDate}>12 de octubre, 2025</Text>
          <TouchableOpacity style={s.manageBtn}><Text style={s.manageBtnText}>Gestionar plan</Text></TouchableOpacity>
        </View>

        {/* Settings */}
        <View style={s.card}>
          <Text style={s.sectionLabel}>CUENTA Y SOPORTE</Text>
          <SettingRow icon="👤" label="Configuración de cuenta" />
          <SettingRow icon="🔔" label="Notificaciones" />
          <SettingRow icon="❓" label="Centro de ayuda" />
          <SettingRow icon="🔒" label="Privacidad y términos" />
          <View style={s.separator} />
          <SettingRow icon="🚪" label="Cerrar sesión" onPress={handleSignOut} danger />
        </View>

        <Text style={s.version}>Atelier PAES v1.0.0 · Entorno académico</Text>
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
  profileCard: { backgroundColor: colors.surfaceLowest, borderRadius: radius.xxl, padding: 24, alignItems: 'center', marginBottom: 14, shadowColor: colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.08, shadowRadius: 32, elevation: 4 },
  avatarWrap: { position: 'relative', marginBottom: 14 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: typography.family.extrabold, fontSize: 32, color: '#fff' },
  verifiedBadge: { position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: 12, backgroundColor: '#16a34a', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  name: { fontFamily: typography.family.extrabold, fontSize: 22, letterSpacing: -0.02, color: colors.onSurface, marginBottom: 4 },
  careerLabel: { fontFamily: typography.family.regular, fontSize: 13, color: colors.onSurfaceVariant, marginBottom: 12 },
  badges: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  premiumBadge: { backgroundColor: colors.primary, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 },
  premiumText: { fontFamily: typography.family.bold, fontSize: 11, color: '#fff' },
  idBadge: { backgroundColor: colors.surfaceHigh, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 },
  idText: { fontFamily: typography.family.semibold, fontSize: 11, color: colors.onSurfaceVariant },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 0, marginBottom: 20, width: '100%' },
  statBadge: { flex: 1, alignItems: 'center' },
  statBadgeValue: { fontFamily: typography.family.extrabold, fontSize: 22, letterSpacing: -0.02, color: colors.onSurface },
  statBadgeLabel: { fontFamily: typography.family.regular, fontSize: 11, color: colors.onSurfaceVariant, marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: colors.outlineVariant, opacity: 0.3 },
  editBtn: { backgroundColor: colors.primary, borderRadius: radius.full, paddingHorizontal: 28, paddingVertical: 10, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 3 },
  editBtnText: { fontFamily: typography.family.bold, fontSize: 14, color: '#fff' },
  card: { backgroundColor: colors.surfaceLowest, borderRadius: radius.xl, padding: spacing.xl, marginBottom: 14, shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  cardTitle: { fontFamily: typography.family.bold, fontSize: 16, color: colors.onSurface },
  careerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surfaceLow, borderRadius: 12, padding: 14 },
  careerIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center' },
  careerName: { fontFamily: typography.family.bold, fontSize: 14, color: colors.onSurface },
  careerUni: { fontFamily: typography.family.regular, fontSize: 12, color: colors.onSurfaceVariant },
  cutScoreBadge: { backgroundColor: '#dbeafe', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  cutScoreText: { fontFamily: typography.family.bold, fontSize: 12, color: colors.primary },
  subjectRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(195,198,215,0.12)' },
  subjectName: { fontFamily: typography.family.semibold, fontSize: 14, color: colors.onSurface, flex: 1 },
  subjectScore: { fontFamily: typography.family.bold, fontSize: 14, color: colors.primary },
  addSubjectBtn: { alignItems: 'center', paddingTop: 14 },
  addSubjectText: { fontFamily: typography.family.semibold, fontSize: 13, color: colors.primary },
  premiumCard: { backgroundColor: colors.primary, borderRadius: radius.xl, padding: 20, marginBottom: 14, shadowColor: colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 6 },
  premiumCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  premiumLabel: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, paddingHorizontal: 10, paddingVertical: 3 },
  premiumLabelText: { fontFamily: typography.family.bold, fontSize: 11, color: '#fff', letterSpacing: 0.06 },
  premiumCardSub: { fontFamily: typography.family.regular, fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  premiumCardDate: { fontFamily: typography.family.extrabold, fontSize: 18, color: '#fff', marginBottom: 14 },
  manageBtn: { backgroundColor: '#fff', borderRadius: radius.full, paddingVertical: 12, alignItems: 'center' },
  manageBtnText: { fontFamily: typography.family.bold, fontSize: 14, color: colors.primary },
  sectionLabel: { fontFamily: typography.family.bold, fontSize: 10, color: colors.outline, textTransform: 'uppercase', letterSpacing: 0.1, marginBottom: 8 },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(195,198,215,0.1)' },
  settingLabel: { fontFamily: typography.family.semibold, fontSize: 14, color: colors.onSurface, flex: 1 },
  chevron: { fontFamily: typography.family.regular, fontSize: 18, color: colors.outline },
  separator: { height: 1, backgroundColor: 'rgba(195,198,215,0.15)', marginVertical: 8 },
  version: { textAlign: 'center', fontFamily: typography.family.regular, fontSize: 10, color: colors.outline, textTransform: 'uppercase', letterSpacing: 0.08, marginTop: 8 },
})
