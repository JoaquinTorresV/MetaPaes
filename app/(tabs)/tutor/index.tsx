import { useState, useRef, useCallback } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/services/supabase/client'
import { sendTutorMessage, saveConversation, type TutorMessage } from '@/features/tutor/services/tutorService'
import type { SubjectCode } from '@/services/supabase/types'
import { colors, radius, spacing, typography } from '@/config/theme'

// ─── Fetch student context for tutor ──────────────────────────────────────────

function useStudentContext(userId: string) {
  return useQuery({
    queryKey: ['student-context', userId],
    queryFn: async () => {
      const [careerRes, progressRes, masteryRes, streakRes] = await Promise.all([
        supabase.from('user_careers').select('target_score, careers(name)').eq('user_id', userId).eq('priority', 'primary').maybeSingle(),
        supabase.from('subject_progress').select('subject, estimated_score, weak_axes').eq('user_id', userId),
        supabase.from('user_objective_mastery').select('mastery_level, learning_objectives(objective_code)').eq('user_id', userId).eq('needs_reinforcement', true).limit(10),
        supabase.from('user_streaks').select('current_streak').eq('user_id', userId).maybeSingle(),
      ])

      const career = careerRes.data as any
      const progress = (progressRes.data ?? []) as Array<{ subject: string; estimated_score: number }>
      const mastery = (masteryRes.data ?? []) as unknown as Array<{ mastery_level: number; learning_objectives: { objective_code: string } | null }>
      const streak = streakRes.data as any

      const scores = progress.map((p) => p.estimated_score)
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 150

      const allWeakAxes = [...new Set(
        (progress as unknown as Array<{ subject: string; estimated_score: number; weak_axes: string[] }>)
          .flatMap((p) => (p as unknown as { weak_axes: string[] }).weak_axes ?? [])
      )]

      const masteryJson: Record<string, number> = {}
      mastery.forEach((m) => {
        if (m.learning_objectives?.objective_code) {
          masteryJson[m.learning_objectives.objective_code] = m.mastery_level
        }
      })

      const examDate = new Date('2026-11-28')
      const daysRemaining = Math.max(0, Math.ceil((examDate.getTime() - Date.now()) / 86400000))

      return {
        name: 'Estudiante',
        career: career?.careers?.name ?? 'Tu carrera',
        targetScore: career?.target_score ?? 700,
        currentScore: avgScore,
        daysRemaining,
        weakAxes: allWeakAxes.slice(0, 5),
        masteryJson,
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  })
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function Bubble({ msg, isStreaming }: { msg: TutorMessage; isStreaming?: boolean }) {
  if (msg.role === 'user') {
    return (
      <View style={b.userRow}>
        <View style={b.userBubble}>
          <Text style={b.userText}>{msg.content}</Text>
        </View>
        <Text style={b.ts}>{msg.ts}</Text>
      </View>
    )
  }
  return (
    <View style={b.aiRow}>
      <View style={b.aiBadge}><Text style={b.aiBadgeText}>A</Text></View>
      <View style={{ flex: 1 }}>
        <Text style={b.aiName}>Tutor PAES</Text>
        <View style={b.aiBubble}>
          <Text style={b.aiText}>{msg.content}</Text>
          {isStreaming && <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 8 }} />}
        </View>
        <Text style={b.ts}>{msg.ts}</Text>
      </View>
    </View>
  )
}

const b = StyleSheet.create({
  userRow: { alignItems: 'flex-end', marginBottom: 10 },
  userBubble: { backgroundColor: colors.primary, borderRadius: 18, borderTopRightRadius: 4, padding: 14, maxWidth: '85%', shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 3 },
  userText: { fontFamily: typography.family.regular, fontSize: 14, color: '#fff', lineHeight: 21 },
  aiRow: { flexDirection: 'row', gap: 8, marginBottom: 10, alignItems: 'flex-start' },
  aiBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 18 },
  aiBadgeText: { color: '#fff', fontFamily: typography.family.bold, fontSize: 11 },
  aiName: { fontFamily: typography.family.bold, fontSize: 12, color: colors.onSurface, marginBottom: 4 },
  aiBubble: { backgroundColor: colors.surfaceLowest, borderRadius: 18, borderTopLeftRadius: 4, padding: 14, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 },
  aiText: { fontFamily: typography.family.regular, fontSize: 14, color: colors.onSurface, lineHeight: 22 },
  ts: { fontFamily: typography.family.regular, fontSize: 10, color: colors.outline, marginTop: 3 },
})

// ─── Main tutor screen ────────────────────────────────────────────────────────

const WELCOME_MSG: TutorMessage = {
  role: 'assistant',
  content: '¡Hola! Soy tu Tutor IA para la PAES 2027. Puedo explicarte cualquier tema del temario DEMRE, generar preguntas de práctica y revisar tu material de estudio. ¿Por dónde empezamos?',
  ts: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
}

const QUICK_ACTIONS = [
  { label: '💡 Explicar más simple', prompt: 'Explica lo mismo de forma más simple con una analogía cotidiana.' },
  { label: '📝 Generar test', prompt: 'Genera 3 preguntas de práctica tipo PAES sobre este tema (una de cada nivel).' },
  { label: '📊 Resumir', prompt: 'Haz un resumen del tema en formato de tarjeta de repaso: concepto clave, regla principal, error típico a evitar.' },
]

export default function TutorScreen() {
  const { user } = useAuthStore()
  const { data: studentContext } = useStudentContext(user?.id ?? '')

  const [messages, setMessages] = useState<TutorMessage[]>([WELCOME_MSG])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [activeSubject, setActiveSubject] = useState<SubjectCode>('m1')
  const scrollRef = useRef<ScrollView>(null)
  const streamingTextRef = useRef('')

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)
  }, [])

  async function send(messageText?: string) {
    const text = (messageText ?? input).trim()
    if (!text || isStreaming || !user) return

    setInput('')
    const userMsg: TutorMessage = {
      role: 'user', content: text,
      ts: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
    }

    const updatedHistory = [...messages, userMsg]
    setMessages(updatedHistory)
    scrollToBottom()

    // Placeholder para la respuesta streaming
    const aiPlaceholder: TutorMessage = {
      role: 'assistant', content: '',
      ts: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages([...updatedHistory, aiPlaceholder])
    setIsStreaming(true)
    streamingTextRef.current = ''

    await sendTutorMessage({
      userId: user.id,
      message: text,
      subject: activeSubject,
      conversationHistory: messages.filter((m) => m.role !== 'assistant' || m.content !== ''),
      studentContext: studentContext ?? {
        name: user.full_name ?? 'Estudiante',
        career: 'Tu carrera', targetScore: 700, currentScore: 150,
        daysRemaining: 365, weakAxes: [], masteryJson: {},
      },
      onChunk: (chunk) => {
        streamingTextRef.current += chunk
        setMessages((prev) => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last && last.role === 'assistant') {
            updated[updated.length - 1] = { ...last, content: streamingTextRef.current }
          }
          return updated
        })
        scrollToBottom()
      },
      onDone: () => {
        setIsStreaming(false)
        // Guardar conversación en Supabase (async, sin bloquear UI)
        const finalMessages = [...updatedHistory, {
          role: 'assistant' as const,
          content: streamingTextRef.current,
          ts: new Date().toISOString(),
        }]
        saveConversation(user.id, activeSubject, finalMessages).catch(() => {})
      },
      onError: (err) => {
        setIsStreaming(false)
        setMessages((prev) => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last?.role === 'assistant' && last.content === '') {
            updated[updated.length - 1] = {
              ...last,
              content: `❌ Error: ${err}. Intenta de nuevo.`,
            }
          }
          return updated
        })
      },
    })
  }

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>

        {/* Topbar */}
        <View style={s.topbar}>
          <View style={s.topbarLeft}>
            <View style={s.aiAvatar}><Text style={s.aiAvatarText}>A</Text></View>
            <View>
              <Text style={s.topbarTitle}>Tutor PAES</Text>
              <Text style={s.topbarSub}>{isStreaming ? 'ESCRIBIENDO...' : 'EN LÍNEA'}</Text>
            </View>
          </View>
          <TouchableOpacity style={s.topbarBtn} onPress={() => router.push('/(tabs)/profile')}>
            <Text style={{ fontSize: 16 }}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Subject selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.subjectBar} contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: 8, paddingVertical: 8 }}>
          {(['m1', 'm2', 'competencia_lectora', 'historia', 'biologia', 'fisica', 'quimica'] as SubjectCode[]).map((sub) => (
            <TouchableOpacity
              key={sub}
              style={[s.subChip, activeSubject === sub && s.subChipActive]}
              onPress={() => setActiveSubject(sub)}
            >
              <Text style={[s.subChipText, activeSubject === sub && { color: '#fff' }]}>
                {sub === 'competencia_lectora' ? 'Lenguaje' : sub === 'm1' ? 'Mat M1' : sub === 'm2' ? 'Mat M2' : sub.charAt(0).toUpperCase() + sub.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={s.messagesScroll}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
        >
          <Text style={s.dateLabel}>HOY</Text>
          {messages.map((msg, i) => (
            <Bubble
              key={i}
              msg={msg}
              isStreaming={isStreaming && i === messages.length - 1 && msg.role === 'assistant'}
            />
          ))}
        </ScrollView>

        {/* Quick actions */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.quickRow} contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: 8, paddingVertical: 6 }}>
          {QUICK_ACTIONS.map((qa) => (
            <TouchableOpacity key={qa.label} style={s.quickChip} onPress={() => send(qa.prompt)} disabled={isStreaming}>
              <Text style={s.quickText}>{qa.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Input */}
        <View style={s.inputBar}>
          <TextInput
            style={s.input}
            value={input}
            onChangeText={setInput}
            placeholder="Escribe tu duda aquí…"
            placeholderTextColor={colors.outline}
            multiline
            editable={!isStreaming}
          />
          <TouchableOpacity style={[s.sendBtn, (isStreaming || !input.trim()) && s.sendBtnDisabled]} onPress={() => send()} disabled={isStreaming || !input.trim()}>
            {isStreaming
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={{ color: '#fff', fontSize: 18, fontFamily: typography.family.bold }}>↑</Text>
            }
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.9)' },
  topbarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  aiAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  aiAvatarText: { color: '#fff', fontFamily: typography.family.extrabold, fontSize: 16 },
  topbarTitle: { fontFamily: typography.family.extrabold, fontSize: 15, color: colors.primary },
  topbarSub: { fontFamily: typography.family.bold, fontSize: 9, color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.05 },
  topbarBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceLow, alignItems: 'center', justifyContent: 'center' },
  subjectBar: { flexShrink: 0, borderBottomWidth: 1, borderBottomColor: 'rgba(195,198,215,0.15)' },
  subChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: colors.surfaceLow, borderWidth: 1.5, borderColor: colors.outlineVariant },
  subChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  subChipText: { fontFamily: typography.family.semibold, fontSize: 12, color: colors.onSurface },
  messagesScroll: { padding: spacing.xl, paddingBottom: 8 },
  dateLabel: { textAlign: 'center', fontFamily: typography.family.bold, fontSize: 10, color: colors.outline, textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 14 },
  quickRow: { flexShrink: 0, borderTopWidth: 1, borderTopColor: 'rgba(195,198,215,0.12)' },
  quickChip: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.surfaceLowest, borderWidth: 1.5, borderColor: colors.outlineVariant, borderRadius: 999 },
  quickText: { fontFamily: typography.family.semibold, fontSize: 12, color: colors.onSurface },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingVertical: 10, paddingBottom: 20, backgroundColor: 'rgba(255,255,255,0.95)', gap: 8 },
  input: { flex: 1, backgroundColor: colors.surfaceHigh, borderRadius: 22, paddingHorizontal: 18, paddingVertical: 12, fontFamily: typography.family.regular, fontSize: 14, color: colors.onSurface, maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 3 },
  sendBtnDisabled: { opacity: 0.5 },
})
