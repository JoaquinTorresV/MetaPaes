import { useState, useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { colors, radius, spacing, typography } from '@/config/theme'

const MOCK_QUESTIONS = [
  {
    id: '1', number: 12, total: 30, subject: 'Matemáticas', axis: 'GEOMETRÍA ANALÍTICA',
    statement: 'Considera la circunferencia definida por la ecuación x² + y² − 4x + 6y − 12 = 0. Si se aplica una traslación según el vector v = (3, −2), ¿cuál es la nueva coordenada del centro de la circunferencia?',
    hint: 'Recuerda que para identificar el centro original, debes completar cuadrados en la ecuación general de la circunferencia.',
    options: [{ key: 'A', text: '(5, −5)' }, { key: 'B', text: '(5, −1)' }, { key: 'C', text: '(−1, 5)' }, { key: 'D', text: '(1, −1)' }],
    correctKey: 'B',
    tip: 'El centro (h, k) de una circunferencia x² + y² + Dx + Ey + F = 0 se calcula como (−D/2, −E/2).',
  }
]

function useTimer(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds)
  useEffect(() => {
    const id = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [])
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

export default function ExamScreen() {
  const { examId } = useLocalSearchParams()
  const [selected, setSelected] = useState<string | null>('B')
  const [flagged, setFlagged] = useState(false)
  const timer = useTimer(8095)
  const q = MOCK_QUESTIONS[0]!

  function handleSubmit() {
    Alert.alert(
      'Finalizar ensayo',
      '¿Estás seguro de que quieres enviar el examen? No podrás modificar tus respuestas.',
      [
        { text: 'Seguir respondiendo', style: 'cancel' },
        { text: 'Enviar', style: 'destructive', onPress: () => router.replace('/(tabs)') },
      ]
    )
  }

  const timerWarning = timer < '00:10:00'

  return (
    <SafeAreaView style={s.container}>
      {/* Timer bar */}
      <View style={s.examTop}>
        <View style={s.timerBlock}>
          <Text style={{ fontSize: 18, marginRight: 6 }}>⏱</Text>
          <View>
            <Text style={[s.timerValue, timerWarning && { color: colors.error }]}>{timer}</Text>
            <Text style={s.timerLabel}>TIEMPO RESTANTE</Text>
          </View>
        </View>
        <TouchableOpacity style={s.submitBtn} onPress={handleSubmit}>
          <Text style={s.submitText}>Enviar examen</Text>
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      <View style={s.progressBar}>
        <View style={s.progressMeta}>
          <Text style={s.progressText}>Pregunta {q.number} de {q.total}</Text>
          <View style={s.subjectPill}><Text style={s.subjectText}>Materia: {q.subject}</Text></View>
        </View>
        <View style={s.progTrack}>
          <View style={[s.progFill, { width: `${(q.number/q.total)*100}%` as `${number}%` }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Axis + flag */}
        <View style={s.questionMeta}>
          <Text style={s.axisLabel}>EJE: {q.axis}</Text>
          <TouchableOpacity style={s.flagBtn} onPress={() => setFlagged(f => !f)}>
            <Text style={{ fontSize: 14, marginRight: 4 }}>{flagged ? '🚩' : '🏳️'}</Text>
            <Text style={[s.flagText, flagged && { color: colors.error }]}>MARCAR PARA REVISIÓN</Text>
          </TouchableOpacity>
        </View>

        {/* Statement */}
        <Text style={s.statement}>{q.statement}</Text>

        {/* Hint box */}
        <View style={s.hintBox}>
          <Text style={s.hintText}>"{q.hint}"</Text>
        </View>

        {/* Options */}
        {q.options.map(o => {
          const isSelected = selected === o.key
          return (
            <TouchableOpacity
              key={o.key}
              style={[s.opt, isSelected && s.optSelected]}
              onPress={() => setSelected(o.key)}
              activeOpacity={0.8}
            >
              <View style={[s.optLetter, isSelected && s.optLetterSelected]}>
                <Text style={[s.optLetterText, isSelected && { color: '#fff' }]}>{o.key}</Text>
              </View>
              <Text style={[s.optText, isSelected && { color: colors.primary, fontWeight: '600' }]}>{o.text}</Text>
            </TouchableOpacity>
          )
        })}

        {/* Scratch area */}
        <View style={s.scratchArea}>
          <Text style={{ fontSize: 20, marginBottom: 6, opacity: 0.4 }}>✏️</Text>
          <Text style={s.scratchLabel}>Espacio de bosquejo</Text>
          <Text style={s.scratchSub}>Toca para abrir el bloc de notas digital</Text>
        </View>

        {/* PAES tip */}
        <View style={s.tipBox}>
          <View style={s.tipIcon}><Text style={{ fontSize: 16 }}>💡</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={s.tipTitle}>Tip de PAES</Text>
            <Text style={s.tipText}>{q.tip}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom nav */}
      <View style={s.bottomNav}>
        <TouchableOpacity style={s.navBtn}>
          <Text style={s.navBtnText}>⠿</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navBtn} onPress={() => setFlagged(f => !f)}>
          <Text style={s.navBtnText}>{flagged ? '🚩' : '🏳️'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.nextBtn} onPress={() => {}}>
          <Text style={s.nextBtnText}>Siguiente →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  examTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: 12, backgroundColor: colors.surfaceLowest, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  timerBlock: { flexDirection: 'row', alignItems: 'center' },
  timerValue: { fontFamily: typography.family.extrabold, fontSize: 22, color: colors.primary },
  timerLabel: { fontFamily: typography.family.bold, fontSize: 9, color: colors.outline, textTransform: 'uppercase', letterSpacing: 0.05 },
  submitBtn: { backgroundColor: colors.primary, borderRadius: radius.full, paddingHorizontal: 18, paddingVertical: 10, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 3 },
  submitText: { fontFamily: typography.family.bold, fontSize: 13, color: '#fff' },
  progressBar: { backgroundColor: colors.surfaceLowest, paddingHorizontal: spacing.xl, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(195,198,215,0.15)' },
  progressMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  progressText: { fontFamily: typography.family.semibold, fontSize: 13, color: colors.onSurfaceVariant },
  subjectPill: { backgroundColor: '#dbeafe', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  subjectText: { fontFamily: typography.family.bold, fontSize: 11, color: colors.primary },
  progTrack: { height: 4, backgroundColor: '#e2e8f0', borderRadius: 999, overflow: 'hidden' },
  progFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 999 },
  scroll: { padding: spacing.xl, paddingBottom: 100 },
  questionMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  axisLabel: { fontFamily: typography.family.bold, fontSize: 10, color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.05 },
  flagBtn: { flexDirection: 'row', alignItems: 'center' },
  flagText: { fontFamily: typography.family.bold, fontSize: 10, color: colors.outline, textTransform: 'uppercase', letterSpacing: 0.04 },
  statement: { fontFamily: typography.family.semibold, fontSize: 15, lineHeight: 24, color: colors.onSurface, marginBottom: 14 },
  hintBox: { backgroundColor: colors.surfaceLow, borderRadius: 12, padding: 14, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: colors.primary },
  hintText: { fontFamily: typography.family.regular, fontSize: 13, color: colors.onSurfaceVariant, lineHeight: 20, fontStyle: 'italic' },
  opt: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surfaceLowest, borderRadius: 14, borderWidth: 1.5, borderColor: 'rgba(195,198,215,0.2)', padding: 16, marginBottom: 10 },
  optSelected: { borderColor: colors.primary, backgroundColor: '#eff6ff' },
  optLetter: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.surfaceHigh, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  optLetterSelected: { backgroundColor: colors.primary },
  optLetterText: { fontFamily: typography.family.bold, fontSize: 14, color: colors.onSurfaceVariant },
  optText: { fontFamily: typography.family.regular, fontSize: 14, color: colors.onSurface, flex: 1 },
  scratchArea: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.outlineVariant, borderRadius: 12, padding: 24, alignItems: 'center', marginTop: 14, marginBottom: 14 },
  scratchLabel: { fontFamily: typography.family.semibold, fontSize: 13, color: colors.outline },
  scratchSub: { fontFamily: typography.family.regular, fontSize: 11, color: colors.outline, marginTop: 4 },
  tipBox: { flexDirection: 'row', gap: 10, backgroundColor: '#fef3c7', borderRadius: 12, padding: 14, borderLeftWidth: 3, borderLeftColor: '#f59e0b' },
  tipIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fde68a', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  tipTitle: { fontFamily: typography.family.bold, fontSize: 12, color: '#92400e', marginBottom: 3 },
  tipText: { fontFamily: typography.family.regular, fontSize: 12, color: '#92400e', lineHeight: 18 },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: 12, paddingBottom: 28, backgroundColor: 'rgba(255,255,255,0.95)', borderTopWidth: 1, borderTopColor: 'rgba(195,198,215,0.15)' },
  navBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.surfaceLow, alignItems: 'center', justifyContent: 'center' },
  navBtnText: { fontSize: 18 },
  nextBtn: { backgroundColor: colors.primary, borderRadius: radius.full, paddingHorizontal: 28, paddingVertical: 12 },
  nextBtnText: { fontFamily: typography.family.bold, fontSize: 15, color: '#fff' },
})
