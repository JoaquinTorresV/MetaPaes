import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native'
import { router } from 'expo-router'
import { colors, radius, spacing, typography } from '@/config/theme'

export default function EntryScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoText}>A</Text>
            </View>
            <Text style={styles.logoName}>Atelier PAES</Text>
          </View>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.editionBadge}>
            <Text style={styles.editionText}>EDICIÓN 2027</Text>
          </View>
          <Text style={styles.heroTitle}>
            Prepárate para la PAES con un{' '}
            <Text style={styles.heroAccent}>plan hecho para ti</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Un entorno académico digital diseñado para la máxima concentración y
            resultados de distinción.
          </Text>
        </View>

        {/* CTAs */}
        <View style={styles.ctas}>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => router.push({ pathname: '/(auth)/login', params: { mode: 'register' } })}
            activeOpacity={0.85}
          >
            <Text style={styles.btnPrimaryText}>Crear cuenta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => router.push({ pathname: '/(auth)/login', params: { mode: 'login' } })}
            activeOpacity={0.85}
          >
            <Text style={styles.btnSecondaryText}>Ya tengo cuenta</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>O CONTINÚA CON</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social */}
        <TouchableOpacity
          style={styles.btnSocial}
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.85}
        >
          <Text style={styles.googleG}>G</Text>
          <Text style={styles.btnSocialText}>Google</Text>
        </TouchableOpacity>

        {/* Feature list */}
        <View style={styles.features}>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.featureCard}>
              <View style={styles.featureIcon}>
                <Text style={styles.featureEmoji}>{f.emoji}</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>© 2027 Atelier PAES. Todos los derechos reservados.</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const FEATURES = [
  {
    emoji: '✦',
    title: 'IA Adaptativa',
    desc: 'Personalizamos tu ruta de aprendizaje basada en tus fortalezas y debilidades reales.',
  },
  {
    emoji: '📊',
    title: 'Analítica Profunda',
    desc: 'Visualiza tu progreso con datos precisos que predicen tu puntaje real en la PAES.',
  },
  {
    emoji: '📚',
    title: 'Atelier Editorial',
    desc: 'Contenido curado con estándares académicos de élite, basado en temarios DEMRE 2027.',
  },
]

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  scroll: { padding: spacing.xl, paddingBottom: 40 },
  header: { marginBottom: spacing.xxxl },
  logoBadge: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceLow, paddingHorizontal: 12,
    paddingVertical: 6, borderRadius: radius.full,
  },
  logoIcon: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  logoText: {
    color: '#fff', fontFamily: typography.family.extrabold, fontSize: 14,
  },
  logoName: {
    fontFamily: typography.family.bold, fontSize: 14, color: colors.onSurface,
  },
  hero: { marginBottom: spacing.xxxl },
  editionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#eff6ff', borderRadius: radius.full,
    paddingHorizontal: 12, paddingVertical: 4, marginBottom: spacing.md,
  },
  editionText: {
    fontFamily: typography.family.bold, fontSize: typography.size.xs,
    color: colors.primary, letterSpacing: 0.04,
  },
  heroTitle: {
    fontFamily: typography.family.extrabold,
    fontSize: 32, letterSpacing: -0.02,
    lineHeight: 38, color: colors.onSurface, marginBottom: spacing.md,
  },
  heroAccent: { color: colors.primary },
  heroSubtitle: {
    fontFamily: typography.family.regular,
    fontSize: typography.size.md, color: colors.onSurfaceVariant,
    lineHeight: 22,
  },
  ctas: { gap: spacing.sm, marginBottom: spacing.xl },
  btnPrimary: {
    backgroundColor: colors.primary, borderRadius: radius.full,
    paddingVertical: 16, alignItems: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25, shadowRadius: 24, elevation: 4,
  },
  btnPrimaryText: {
    fontFamily: typography.family.bold, fontSize: 15, color: '#fff',
  },
  btnSecondary: {
    borderRadius: radius.full, paddingVertical: 15,
    alignItems: 'center', borderWidth: 1.5, borderColor: colors.outlineVariant,
  },
  btnSecondaryText: {
    fontFamily: typography.family.semibold, fontSize: 15, color: colors.onSurface,
  },
  dividerRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.outlineVariant },
  dividerText: {
    fontFamily: typography.family.bold, fontSize: typography.size.xs,
    color: colors.outline, letterSpacing: 0.06,
  },
  btnSocial: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, backgroundColor: colors.surfaceLowest,
    borderWidth: 1.5, borderColor: colors.outlineVariant,
    borderRadius: radius.full, paddingVertical: 14, marginBottom: spacing.xxxl,
  },
  googleG: {
    fontFamily: typography.family.bold, fontSize: 16,
    color: '#4285F4',
  },
  btnSocialText: {
    fontFamily: typography.family.semibold, fontSize: 15, color: colors.onSurface,
  },
  features: { gap: spacing.sm, marginBottom: spacing.xxl },
  featureCard: {
    flexDirection: 'row', gap: spacing.md, backgroundColor: colors.surfaceLowest,
    borderRadius: radius.xl, padding: spacing.lg,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 16, elevation: 2,
  },
  featureIcon: {
    width: 44, height: 44, borderRadius: radius.md,
    backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center',
  },
  featureEmoji: { fontSize: 20 },
  featureContent: { flex: 1 },
  featureTitle: {
    fontFamily: typography.family.bold, fontSize: typography.size.lg,
    color: colors.onSurface, marginBottom: 4,
  },
  featureDesc: {
    fontFamily: typography.family.regular, fontSize: typography.size.sm,
    color: colors.onSurfaceVariant, lineHeight: 18,
  },
  footer: {
    textAlign: 'center', fontFamily: typography.family.regular,
    fontSize: typography.size.xs, color: colors.outline,
  },
})
