import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { colors, radius, spacing, typography } from '@/config/theme'

const SUBJECTS = [
  { key: 'm1', label: 'Matemática M1', emoji: '🔢' },
  { key: 'competencia_lectora', label: 'Comp. Lectora', emoji: '📖' },
  { key: 'historia', label: 'Historia', emoji: '🌍' },
  { key: 'biologia', label: 'Biología', emoji: '🔬' },
]

const DURATIONS = [30, 60, 90, 120]
const QUESTION_COUNTS = [15, 30, 50, 80]

export default function ExamSetupScreen() {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['m1', 'competencia_lectora'])
  const [duration, setDuration] = useState(60)
  const [questionCount, setQuestionCount] = useState(30)

  function toggleSubject(key: string) {
    setSelectedSubjects(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
  }

  return (
    <SafeAreaView style={s.container}>
      <View style={s.topbar}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backArrow}>←</Text>
          <Text style={s.backLabel}>Configurar ensayo</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        <Text style={s.title}>Ensayo Cronometrado</Text>
        <Text style={s.desc}>Configura tu simulacro al estilo PAES real.</Text>

        <Text style={s.sectionTitle}>Asignaturas</Text>
        <View style={s.subjectsGrid}>
          {SUBJECTS.map(sub => (
            <TouchableOpacity
              key={sub.key}
              style={[s.subjectChip, selectedSubjects.includes(sub.key) && s.subjectChipActive]}
              onPress={() => toggleSubject(sub.key)}
            >
              <Text style={{ fontSize: 20 }}>{sub.emoji}</Text>
              <Text style={[s.subjectChipText, selectedSubjects.includes(sub.key) && { color: colors.primary }]}>{sub.label}</Text>
              {selectedSubjects.includes(sub.key) && <Text style={s.checkMark}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.sectionTitle}>Duración</Text>
        <View style={s.optionRow}>
          {DURATIONS.map(d => (
            <TouchableOpacity key={d} style={[s.optionChip, duration === d && s.optionChipActive]} onPress={() => setDuration(d)}>
              <Text style={[s.optionText, duration === d && { color: '#fff' }]}>{d} min</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={s.sectionTitle}>Número de preguntas</Text>
        <View style={s.optionRow}>
          {QUESTION_COUNTS.map(q => (
            <TouchableOpacity key={q} style={[s.optionChip, questionCount === q && s.optionChipActive]} onPress={() => setQuestionCount(q)}>
              <Text style={[s.optionText, questionCount === q && { color: '#fff' }]}>{q}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary */}
        <View style={s.summaryCard}>
          <Text style={s.summaryTitle}>Resumen del ensayo</Text>
          <View style={s.summaryRow}><Text style={s.summaryKey}>Asignaturas</Text><Text style={s.summaryVal}>{selectedSubjects.length} seleccionadas</Text></View>
          <View style={s.summaryRow}><Text style={s.summaryKey}>Duración</Text><Text style={s.summaryVal}>{duration} minutos</Text></View>
          <View style={s.summaryRow}><Text style={s.summaryKey}>Preguntas</Text><Text style={s.summaryVal}>{questionCount} preguntas</Text></View>
          <View style={s.summaryRow}><Text style={s.summaryKey}>Tiempo por pregunta</Text><Text style={s.summaryVal}>~{Math.round((duration*60)/questionCount)} seg</Text></View>
        </View>

        <TouchableOpacity
          style={[s.startBtn, selectedSubjects.length === 0 && s.startBtnDisabled]}
          onPress={() => selectedSubjects.length > 0 && router.push('/exam/exam-1')}
          activeOpacity={0.85}
        >
          <Text style={s.startBtnText}>⏱ Iniciar ensayo</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  topbar: { paddingHorizontal: spacing.xl, paddingVertical: 12 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backArrow: { fontFamily: typography.family.bold, fontSize: 22, color: colors.onSurface },
  backLabel: { fontFamily: typography.family.bold, fontSize: 16, color: colors.onSurface },
  scroll: { padding: spacing.xl, paddingBottom: 40 },
  title: { fontFamily: typography.family.extrabold, fontSize: 26, letterSpacing: -0.02, color: colors.onSurface, marginBottom: 6 },
  desc: { fontFamily: typography.family.regular, fontSize: 14, color: colors.onSurfaceVariant, marginBottom: 28 },
  sectionTitle: { fontFamily: typography.family.bold, fontSize: 13, color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 12, marginTop: 8 },
  subjectsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  subjectChip: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surfaceLowest, borderRadius: 12, borderWidth: 1.5, borderColor: colors.outlineVariant, paddingHorizontal: 14, paddingVertical: 12, minWidth: '45%' },
  subjectChipActive: { borderColor: colors.primary, backgroundColor: '#eff6ff' },
  subjectChipText: { fontFamily: typography.family.semibold, fontSize: 13, color: colors.onSurface, flex: 1 },
  checkMark: { fontFamily: typography.family.bold, fontSize: 13, color: colors.primary },
  optionRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  optionChip: { flex: 1, alignItems: 'center', paddingVertical: 12, backgroundColor: colors.surfaceLowest, borderRadius: 12, borderWidth: 1.5, borderColor: colors.outlineVariant },
  optionChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionText: { fontFamily: typography.family.bold, fontSize: 14, color: colors.onSurface },
  summaryCard: { backgroundColor: colors.surfaceLowest, borderRadius: radius.xl, padding: 20, marginBottom: 24, shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.06, shadowRadius: 20, elevation: 3 },
  summaryTitle: { fontFamily: typography.family.bold, fontSize: 14, color: colors.onSurface, marginBottom: 14 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(195,198,215,0.1)' },
  summaryKey: { fontFamily: typography.family.regular, fontSize: 13, color: colors.onSurfaceVariant },
  summaryVal: { fontFamily: typography.family.bold, fontSize: 13, color: colors.onSurface },
  startBtn: { backgroundColor: colors.primary, borderRadius: radius.full, paddingVertical: 16, alignItems: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 4 },
  startBtnDisabled: { opacity: 0.5 },
  startBtnText: { fontFamily: typography.family.bold, fontSize: 15, color: '#fff' },
})
