import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { colors, radius, spacing, typography } from '@/config/theme'

type AnswerState = 'unanswered' | 'correct' | 'wrong'

const MOCK_QUESTION = {
  subject: 'MATEMÁTICA',
  axis: 'Geometría Plana',
  number: 3,
  total: 10,
  statement: 'Considera un triángulo equilátero circunscrito a una circunferencia de radio r. Si doblamos el lado de ese triángulo, ¿cuál será la nueva relación entre el área del triángulo y el área del círculo inscrito?',
  options: [
    { key: 'A', text: 'La nueva razón es el doble de la original.' },
    { key: 'B', text: 'La razón entre las áreas permanece constante.' },
    { key: 'C', text: 'El raio del círculo inscrito aumenta en proporción al cuadrado.' },
    { key: 'D', text: 'La nueva razón depende de la constante de Euler.' },
  ],
  correctKey: 'B',
  explanationCorrect: 'La razón entre el área del triángulo equilátero y el área del círculo inscrito es constante (depende solo de la geometría relativa, no del tamaño). Al escalar el lado por un factor k, ambas áreas escalan por k², por lo que su razón se mantiene.',
  explanationWrong: {
    A: 'Incorrecto. Al doblar el lado, ambas áreas se cuadruplican (escala k²). La razón entre ellas no varía.',
    C: 'El radio del círculo inscrito sí aumenta (se dobla), pero la pregunta es sobre la razón entre las áreas, que permanece constante.',
    D: 'La constante de Euler (e) no tiene relación con razones métricas de polígonos regulares inscritos.',
  },
}

function OptionItem({
  optKey, text, state, onPress, correctKey,
}: { optKey: string; text: string; state: AnswerState; onPress: () => void; correctKey: string }) {
  const isCorrect = optKey === correctKey && state !== 'unanswered'
  const isWrong = state === 'wrong' && optKey !== correctKey
  const isChosen = state !== 'unanswered' && !isCorrect && !isWrong

  return (
    <TouchableOpacity
      style={[s.opt, isCorrect && s.optCorrect, isWrong && s.optWrong]}
      onPress={onPress}
      disabled={state !== 'unanswered'}
      activeOpacity={0.8}
    >
      <View style={[s.optLetter, isCorrect && s.letterCorrect, isWrong && s.letterWrong]}>
        <Text style={[s.optLetterText, (isCorrect || isWrong) && { color: '#fff' }]}>{optKey}</Text>
      </View>
      <Text style={[s.optText, isCorrect && { color: '#166534' }, isWrong && { color: colors.error }]}>{text}</Text>
    </TouchableOpacity>
  )
}

export default function PracticeScreen() {
  const [selected, setSelected] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)

  const q = MOCK_QUESTION

  function handleAnswer(key: string) {
    if (answered) return
    setSelected(key)
    setAnswered(true)
    setTimeout(() => setShowExplanation(true), 300)
  }

  const answerState = (key: string): AnswerState => {
    if (!answered) return 'unanswered'
    if (key === q.correctKey) return 'correct'
    if (key === selected) return 'wrong'
    return 'unanswered'
  }

  return (
    <SafeAreaView style={s.container}>
      {/* Topbar */}
      <View style={s.topbar}>
        <View style={s.topbarLeft}>
          <TouchableOpacity onPress={() => router.back()}><Text style={s.backArrow}>←</Text></TouchableOpacity>
          <Text style={s.topbarTitle}>Atelier PAES</Text>
        </View>
        <View style={s.avatar}><Text style={s.avatarText}>M</Text></View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.questionHeader}>
          <View>
            <View style={s.subjectPill}><Text style={s.subjectText}>{q.subject}</Text></View>
            <Text style={s.axisTitle}>{q.axis}</Text>
          </View>
          <View style={s.progressInfo}>
            <Text style={s.progressText}>Questão {q.number} de {q.total}</Text>
            <View style={s.progressTrack}>
              <View style={[s.progressFill, { width: `${(q.number/q.total)*100}%` as `${number}%` }]} />
            </View>
          </View>
        </View>

        {/* Question card */}
        <View style={s.questionCard}>
          <Text style={s.statement}>{q.statement}</Text>
          <View style={s.figurePlaceholder}>
            <Text style={{ fontSize: 32, opacity: 0.4 }}>△◎</Text>
            <Text style={s.figureLabel}>Fig. 1: Geometría Analítica</Text>
          </View>
        </View>

        {/* Options */}
        {q.options.map(o => (
          <OptionItem
            key={o.key}
            optKey={o.key}
            text={o.text}
            state={answerState(o.key)}
            onPress={() => handleAnswer(o.key)}
            correctKey={q.correctKey}
          />
        ))}

        {/* Explanation */}
        {showExplanation && (
          <View style={[s.explanation, selected === q.correctKey ? s.explCorrect : s.explWrong]}>
            <Text style={s.explTitle}>
              {selected === q.correctKey ? '✓ ¡Correcto!' : `✗ La respuesta correcta es ${q.correctKey}`}
            </Text>
            <Text style={s.explText}>{q.explanationCorrect}</Text>
            {selected !== q.correctKey && selected && (
              <View style={s.explDistractor}>
                <Text style={s.explDistractorTitle}>¿Por qué {selected} es incorrecta?</Text>
                <Text style={s.explText}>{q.explanationWrong[selected as keyof typeof q.explanationWrong]}</Text>
              </View>
            )}
          </View>
        )}

        {/* Bottom actions */}
        <View style={s.bottomActions}>
          <TouchableOpacity style={s.explainBtn} onPress={() => setShowExplanation(v => !v)}>
            <Text style={{ fontSize: 16 }}>💡</Text>
            <Text style={s.explainBtnText}>Ver explicación</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.nextBtn, !answered && s.nextBtnDisabled]}
            onPress={() => { setSelected(null); setAnswered(false); setShowExplanation(false) }}
            disabled={!answered}
          >
            <Text style={s.nextBtnText}>Siguiente →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: 12, backgroundColor: 'rgba(255,255,255,0.8)' },
  topbarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backArrow: { fontFamily: typography.family.bold, fontSize: 22, color: colors.onSurface },
  topbarTitle: { fontFamily: typography.family.extrabold, fontSize: 16, color: colors.primary },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.surfaceHigh },
  avatarText: { fontFamily: typography.family.bold, fontSize: 14, color: colors.onSurfaceVariant },
  scroll: { padding: spacing.xl, paddingBottom: 100 },
  questionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  subjectPill: { backgroundColor: '#dbeafe', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 6 },
  subjectText: { fontFamily: typography.family.bold, fontSize: 10, color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.04 },
  axisTitle: { fontFamily: typography.family.extrabold, fontSize: 22, letterSpacing: -0.02, color: colors.onSurface },
  progressInfo: { alignItems: 'flex-end', gap: 6 },
  progressText: { fontFamily: typography.family.bold, fontSize: 13, color: colors.primary },
  progressTrack: { width: 80, height: 4, backgroundColor: '#e2e8f0', borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 999 },
  questionCard: { backgroundColor: colors.surfaceLowest, borderRadius: radius.xl, padding: spacing.xl, marginBottom: 14, shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 3 },
  statement: { fontFamily: typography.family.semibold, fontSize: 15, lineHeight: 24, color: colors.onSurface, marginBottom: 16 },
  figurePlaceholder: { backgroundColor: '#1e293b', borderRadius: 12, padding: 24, alignItems: 'center', gap: 8 },
  figureLabel: { fontFamily: typography.family.regular, fontSize: 12, color: '#64748b' },
  opt: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surfaceLowest, borderRadius: 14, borderWidth: 1.5, borderColor: 'rgba(195,198,215,0.25)', padding: 16, marginBottom: 10 },
  optCorrect: { borderColor: '#16a34a', backgroundColor: '#f0fdf4' },
  optWrong: { borderColor: colors.error, backgroundColor: '#fff5f5' },
  optLetter: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.surfaceHigh, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  letterCorrect: { backgroundColor: '#16a34a' },
  letterWrong: { backgroundColor: colors.error },
  optLetterText: { fontFamily: typography.family.bold, fontSize: 13, color: colors.onSurfaceVariant },
  optText: { fontFamily: typography.family.regular, fontSize: 14, color: colors.onSurface, flex: 1, lineHeight: 20 },
  explanation: { borderRadius: 14, padding: 16, marginBottom: 16 },
  explCorrect: { backgroundColor: '#f0fdf4', borderLeftWidth: 3, borderLeftColor: '#16a34a' },
  explWrong: { backgroundColor: '#fff5f5', borderLeftWidth: 3, borderLeftColor: colors.error },
  explTitle: { fontFamily: typography.family.bold, fontSize: 14, color: '#166534', marginBottom: 6 },
  explText: { fontFamily: typography.family.regular, fontSize: 13, color: '#166534', lineHeight: 20 },
  explDistractor: { marginTop: 12, padding: 12, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 10 },
  explDistractorTitle: { fontFamily: typography.family.bold, fontSize: 12, color: colors.error, marginBottom: 4 },
  bottomActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  explainBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  explainBtnText: { fontFamily: typography.family.semibold, fontSize: 14, color: colors.primary },
  nextBtn: { backgroundColor: colors.primary, borderRadius: radius.full, paddingHorizontal: 24, paddingVertical: 12 },
  nextBtnDisabled: { opacity: 0.5 },
  nextBtnText: { fontFamily: typography.family.bold, fontSize: 14, color: '#fff' },
})
