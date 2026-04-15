import { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, ActivityIndicator,
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useSession } from '@/features/practice/hooks/useSession'
import { colors, radius, spacing, typography } from '@/config/theme'
import { SUBJECTS } from '@/config/subjects'
import type { SubjectCode } from '@/services/supabase/types'

// ─── Session summary ──────────────────────────────────────────────────────────

function SessionSummary({
  accuracy, total, durationSeconds, subject, onFinish,
}: {
  accuracy: number; total: number; durationSeconds: number; subject: string; onFinish: () => void
}) {
  const pct = Math.round(accuracy * 100)
  const emoji = pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '💪'
  const label = pct >= 80 ? '¡Excelente!' : pct >= 60 ? '¡Bien hecho!' : '¡Sigue practicando!'
  const mins = Math.floor(durationSeconds / 60)
  const secs = durationSeconds % 60

  return (
    <View style={ss.container}>
      <Text style={ss.emoji}>{emoji}</Text>
      <Text style={ss.title}>{label}</Text>
      <Text style={ss.sub}>Completaste {total} preguntas de {subject}</Text>

      <View style={ss.statsRow}>
        <View style={ss.statBox}>
          <Text style={ss.statVal}>{pct}%</Text>
          <Text style={ss.statLabel}>Precisión</Text>
        </View>
        <View style={ss.statDivider} />
        <View style={ss.statBox}>
          <Text style={ss.statVal}>{total}</Text>
          <Text style={ss.statLabel}>Preguntas</Text>
        </View>
        <View style={ss.statDivider} />
        <View style={ss.statBox}>
          <Text style={ss.statVal}>{mins > 0 ? `${mins}m` : `${secs}s`}</Text>
          <Text style={ss.statLabel}>Tiempo</Text>
        </View>
      </View>

      {pct < 70 && (
        <View style={ss.tipBox}>
          <Text style={ss.tipText}>
            💡 Tu tutor IA puede explicarte los temas donde tuviste dificultades.
          </Text>
        </View>
      )}

      <TouchableOpacity style={ss.btnPrimary} onPress={onFinish}>
        <Text style={ss.btnPrimaryText}>Volver al inicio</Text>
      </TouchableOpacity>
      <TouchableOpacity style={ss.btnSecondary} onPress={() => router.push('/(tabs)/tutor')}>
        <Text style={ss.btnSecondaryText}>Preguntarle al tutor</Text>
      </TouchableOpacity>
    </View>
  )
}

const ss = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: spacing.xl, paddingTop: 60 },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontFamily: typography.family.extrabold, fontSize: 28, letterSpacing: -0.02, color: colors.onSurface, marginBottom: 8 },
  sub: { fontFamily: typography.family.regular, fontSize: 14, color: colors.onSurfaceVariant, marginBottom: 32, textAlign: 'center' },
  statsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceLowest, borderRadius: radius.xl, padding: 20, width: '100%', marginBottom: 20, shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 3 },
  statBox: { flex: 1, alignItems: 'center' },
  statVal: { fontFamily: typography.family.extrabold, fontSize: 28, letterSpacing: -0.02, color: colors.onSurface },
  statLabel: { fontFamily: typography.family.regular, fontSize: 12, color: colors.onSurfaceVariant, marginTop: 4 },
  statDivider: { width: 1, height: 40, backgroundColor: colors.outlineVariant, opacity: 0.3 },
  tipBox: { backgroundColor: '#eff6ff', borderRadius: 12, padding: 14, marginBottom: 28, width: '100%' },
  tipText: { fontFamily: typography.family.regular, fontSize: 13, color: colors.primary, lineHeight: 20 },
  btnPrimary: { backgroundColor: colors.primary, borderRadius: radius.full, paddingVertical: 16, alignItems: 'center', width: '100%', marginBottom: 10, shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 4 },
  btnPrimaryText: { fontFamily: typography.family.bold, fontSize: 15, color: '#fff' },
  btnSecondary: { borderRadius: radius.full, paddingVertical: 14, alignItems: 'center', width: '100%', borderWidth: 1.5, borderColor: colors.primary },
  btnSecondaryText: { fontFamily: typography.family.semibold, fontSize: 15, color: colors.primary },
})

// ─── Main Practice Screen ─────────────────────────────────────────────────────

export default function PracticeScreen() {
  const params = useLocalSearchParams<{ subject?: string; axis?: string }>()
  const subject = (params.subject ?? 'm1') as SubjectCode

  const {
    currentQuestion, currentIndex, total, isLoading, error,
    isSaving, isLastQuestion, sessionAccuracy, sessionDurationSeconds,
    answered, submitAnswer, goNext,
  } = useSession({ subject, count: 10 })

  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [sessionDone, setSessionDone] = useState(false)

  const subjectName = SUBJECTS[subject]?.shortName ?? subject

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <SafeAreaView style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={s.loadingText}>Preparando preguntas…</Text>
      </SafeAreaView>
    )
  }

  // ── Error / sin preguntas ──────────────────────────────────────────────────
  if (error || total === 0) {
    return (
      <SafeAreaView style={[s.container, { justifyContent: 'center', alignItems: 'center', padding: 32 }]}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>📭</Text>
        <Text style={s.emptyTitle}>No hay preguntas disponibles</Text>
        <Text style={s.emptyDesc}>
          El banco de preguntas para {subjectName} se está generando.{'\n'}
          Vuelve en unos minutos o contacta al soporte.
        </Text>
        <TouchableOpacity style={s.btnPrimary} onPress={() => router.back()}>
          <Text style={s.btnPrimaryText}>← Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  // ── Sesión terminada ───────────────────────────────────────────────────────
  if (sessionDone) {
    return (
      <SafeAreaView style={s.container}>
        <SessionSummary
          accuracy={sessionAccuracy}
          total={answered.length}
          durationSeconds={sessionDurationSeconds}
          subject={subjectName}
          onFinish={() => router.replace('/(tabs)')}
        />
      </SafeAreaView>
    )
  }

  const q = currentQuestion!

  // ── Responder ─────────────────────────────────────────────────────────────
  async function handleAnswer(key: string) {
    if (isAnswered || isSaving) return
    setSelectedKey(key)
    setIsAnswered(true)
    setTimeout(() => setShowExplanation(true), 250)
    await submitAnswer({ selectedKey: key })
  }

  function handleNext() {
    setSelectedKey(null)
    setIsAnswered(false)
    setShowExplanation(false)
    if (isLastQuestion) {
      setSessionDone(true)
    } else {
      goNext()
    }
  }

  const optionStyle = (key: string) => {
    if (!isAnswered) return s.opt
    if (key === q.correct_key) return [s.opt, s.optCorrect]
    if (key === selectedKey) return [s.opt, s.optWrong]
    return s.opt
  }

  const letterStyle = (key: string) => {
    if (!isAnswered) return s.optLetter
    if (key === q.correct_key) return [s.optLetter, s.letterCorrect]
    if (key === selectedKey) return [s.optLetter, s.letterWrong]
    return s.optLetter
  }

  return (
    <SafeAreaView style={s.container}>
      {/* Topbar */}
      <View style={s.topbar}>
        <TouchableOpacity onPress={() => router.back()}><Text style={s.back}>←</Text></TouchableOpacity>
        <Text style={s.topbarTitle}>Atelier PAES</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/tutor')}>
          <Text style={{ fontSize: 18 }}>🎓</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.qHeader}>
          <View>
            <View style={s.pill}><Text style={s.pillText}>{subjectName.toUpperCase()}</Text></View>
            <Text style={s.axisTitle}>{q.axis}</Text>
          </View>
          <View style={s.progressInfo}>
            <Text style={s.progressText}>{currentIndex + 1} / {total}</Text>
            <View style={s.progTrack}>
              <View style={[s.progFill, { width: `${((currentIndex + 1) / total) * 100}%` as `${number}%` }]} />
            </View>
          </View>
        </View>

        {/* Context (texto de lectura, tabla, etc.) */}
        {q.context && (
          <View style={s.contextBox}>
            <Text style={s.contextText}>{q.context}</Text>
          </View>
        )}

        {/* Statement */}
        <View style={s.questionCard}>
          <Text style={s.statement}>{q.statement}</Text>
        </View>

        {/* Options */}
        {(q.options as Array<{ key: string; text: string }>).map((o) => (
          <TouchableOpacity
            key={o.key}
            style={optionStyle(o.key)}
            onPress={() => handleAnswer(o.key)}
            disabled={isAnswered}
            activeOpacity={0.8}
          >
            <View style={letterStyle(o.key)}>
              <Text style={[s.optLetterText, isAnswered && (o.key === q.correct_key || o.key === selectedKey) && { color: '#fff' }]}>
                {o.key}
              </Text>
            </View>
            <Text style={[
              s.optText,
              isAnswered && o.key === q.correct_key && { color: '#166534', fontFamily: typography.family.semibold },
              isAnswered && o.key === selectedKey && o.key !== q.correct_key && { color: colors.error },
            ]}>
              {o.text}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Explanation */}
        {showExplanation && (
          <View style={[s.explanationBox, selectedKey === q.correct_key ? s.explCorrect : s.explWrong]}>
            <Text style={s.explTitle}>
              {selectedKey === q.correct_key ? '✓ ¡Correcto!' : `✗ La respuesta correcta es ${q.correct_key}`}
            </Text>
            <Text style={s.explText}>{q.explanation}</Text>
            {selectedKey && selectedKey !== q.correct_key && (q.wrong_explanations as Record<string, string>)[selectedKey] && (
              <View style={s.distractor}>
                <Text style={s.distractorTitle}>¿Por qué {selectedKey} es incorrecta?</Text>
                <Text style={s.explText}>{(q.wrong_explanations as Record<string, string>)[selectedKey]}</Text>
              </View>
            )}
          </View>
        )}

        {/* Actions */}
        <View style={s.actions}>
          <TouchableOpacity style={s.explainBtn} onPress={() => setShowExplanation((v) => !v)}>
            <Text style={{ fontSize: 14 }}>💡</Text>
            <Text style={s.explainBtnText}>{showExplanation ? 'Ocultar' : 'Ver explicación'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.nextBtn, (!isAnswered || isSaving) && s.nextBtnDisabled]}
            onPress={handleNext}
            disabled={!isAnswered || isSaving}
          >
            {isSaving
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={s.nextBtnText}>{isLastQuestion ? 'Finalizar ✓' : 'Siguiente →'}</Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  loadingText: { fontFamily: typography.family.medium, fontSize: 14, color: colors.onSurfaceVariant, marginTop: 12 },
  emptyTitle: { fontFamily: typography.family.bold, fontSize: 18, color: colors.onSurface, textAlign: 'center', marginBottom: 8 },
  emptyDesc: { fontFamily: typography.family.regular, fontSize: 14, color: colors.onSurfaceVariant, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: 12, backgroundColor: 'rgba(255,255,255,0.85)' },
  back: { fontFamily: typography.family.bold, fontSize: 22, color: colors.onSurface },
  topbarTitle: { fontFamily: typography.family.extrabold, fontSize: 16, color: colors.primary },
  scroll: { padding: spacing.xl, paddingBottom: 100 },
  qHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  pill: { backgroundColor: '#dbeafe', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 6 },
  pillText: { fontFamily: typography.family.bold, fontSize: 10, color: colors.primary, letterSpacing: 0.04 },
  axisTitle: { fontFamily: typography.family.extrabold, fontSize: 20, letterSpacing: -0.02, color: colors.onSurface },
  progressInfo: { alignItems: 'flex-end', gap: 6 },
  progressText: { fontFamily: typography.family.bold, fontSize: 13, color: colors.primary },
  progTrack: { width: 80, height: 4, backgroundColor: '#e2e8f0', borderRadius: 999, overflow: 'hidden' },
  progFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 999 },
  contextBox: { backgroundColor: colors.surfaceLow, borderRadius: 12, padding: 16, marginBottom: 12, borderLeftWidth: 3, borderLeftColor: colors.primary },
  contextText: { fontFamily: typography.family.regular, fontSize: 13, color: colors.onSurface, lineHeight: 21 },
  questionCard: { backgroundColor: colors.surfaceLowest, borderRadius: radius.xl, padding: 20, marginBottom: 14, shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 3 },
  statement: { fontFamily: typography.family.semibold, fontSize: 15, lineHeight: 24, color: colors.onSurface },
  opt: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surfaceLowest, borderRadius: 14, borderWidth: 1.5, borderColor: 'rgba(195,198,215,0.25)', padding: 16, marginBottom: 10 },
  optCorrect: { borderColor: '#16a34a', backgroundColor: '#f0fdf4' },
  optWrong: { borderColor: colors.error, backgroundColor: '#fff5f5' },
  optLetter: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceHigh, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  letterCorrect: { backgroundColor: '#16a34a' },
  letterWrong: { backgroundColor: colors.error },
  optLetterText: { fontFamily: typography.family.bold, fontSize: 13, color: colors.onSurfaceVariant },
  optText: { fontFamily: typography.family.regular, fontSize: 14, color: colors.onSurface, flex: 1, lineHeight: 20 },
  explanationBox: { borderRadius: 14, padding: 16, marginBottom: 16 },
  explCorrect: { backgroundColor: '#f0fdf4', borderLeftWidth: 3, borderLeftColor: '#16a34a' },
  explWrong: { backgroundColor: '#fff5f5', borderLeftWidth: 3, borderLeftColor: colors.error },
  explTitle: { fontFamily: typography.family.bold, fontSize: 14, color: '#166534', marginBottom: 6 },
  explText: { fontFamily: typography.family.regular, fontSize: 13, color: '#166534', lineHeight: 20 },
  distractor: { marginTop: 10, padding: 10, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 8 },
  distractorTitle: { fontFamily: typography.family.bold, fontSize: 12, color: colors.error, marginBottom: 4 },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  explainBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  explainBtnText: { fontFamily: typography.family.semibold, fontSize: 14, color: colors.primary },
  nextBtn: { backgroundColor: colors.primary, borderRadius: radius.full, paddingHorizontal: 24, paddingVertical: 12, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 3 },
  nextBtnDisabled: { opacity: 0.5 },
  nextBtnText: { fontFamily: typography.family.bold, fontSize: 14, color: '#fff' },
  btnPrimary: { backgroundColor: colors.primary, borderRadius: radius.full, paddingVertical: 16, alignItems: 'center', paddingHorizontal: 32, shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 4 },
  btnPrimaryText: { fontFamily: typography.family.bold, fontSize: 15, color: '#fff' },
})
