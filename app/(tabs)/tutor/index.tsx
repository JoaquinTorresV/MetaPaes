import { useState, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native'
import { router } from 'expo-router'
import { colors, radius, spacing, typography } from '@/config/theme'

interface Message {
  id: string
  role: 'user' | 'ai'
  content: string
  ts: string
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1', role: 'ai',
    content: '¡Hola! Estoy listo para ayudarte con tu preparación para la PAES. Hoy podemos revisar **Cinemática** o practicar **Comprensión Lectora**. ¿Por dónde te gustaría empezar?',
    ts: '09:15 AM'
  },
  {
    id: '2', role: 'user',
    content: 'Hola, ¿podrías explicarme de nuevo la diferencia entre rapidez y velocidad media? Me confundo con los vectores.',
    ts: '09:16 AM'
  },
  {
    id: '3', role: 'ai',
    content: 'concept:rapidez_velocidad',
    ts: '09:17 AM'
  },
]

function AIMessage({ content }: { content: string }) {
  if (content === 'concept:rapidez_velocidad') {
    return (
      <View style={m.aiBubble}>
        <Text style={m.aiText}>Es una duda muy común. Aquí está la distinción clave:</Text>
        <View style={m.conceptCard}>
          <Text style={m.conceptTitle}>RAPIDEZ MEDIA</Text>
          <Text style={m.conceptSub}>Escalar. Solo magnitud.</Text>
          <Text style={m.conceptBody}>Distancia total recorrida dividida por el tiempo.</Text>
        </View>
        <View style={[m.conceptCard, { borderLeftColor: '#7c3aed', backgroundColor: '#faf8ff' }]}>
          <Text style={[m.conceptTitle, { color: '#7c3aed' }]}>VELOCIDAD MEDIA</Text>
          <Text style={m.conceptSub}>Vectorial. Magnitud y sentido.</Text>
          <Text style={m.conceptBody}>Desplazamiento (vector) dividido por el tiempo.</Text>
        </View>
        <TouchableOpacity style={m.animBtn}>
          <Text style={m.animBtnText}>▶ Ver animación</Text>
        </TouchableOpacity>
        <Text style={[m.aiText, { marginTop: 10 }]}>¿Te gustaría que hagamos un ejercicio rápido para aplicar esto?</Text>
      </View>
    )
  }
  return (
    <View style={m.aiBubble}>
      <Text style={m.aiText}>{content}</Text>
    </View>
  )
}

export default function TutorScreen() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<ScrollView>(null)

  async function send() {
    if (!input.trim()) return
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim(), ts: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    // TODO: llamar a Edge Function tutor-chat
    setTimeout(() => {
      const aiMsg: Message = { id: (Date.now()+1).toString(), role: 'ai', content: 'Excelente pregunta. Déjame explicarte...', ts: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) }
      setMessages(prev => [...prev, aiMsg])
      setLoading(false)
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)
    }, 1200)
  }

  return (
    <SafeAreaView style={s.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Topbar */}
        <View style={s.topbar}>
          <View style={s.topbarLeft}>
            <View style={s.aiAvatar}><Text style={{ color: '#fff', fontFamily: typography.family.extrabold, fontSize: 16 }}>A</Text></View>
            <View>
              <Text style={s.topbarTitle}>Atelier PAES</Text>
              <Text style={s.topbarSub}>TUTOR AI · EN LÍNEA</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={s.topbarBtn}><Text>🔍</Text></TouchableOpacity>
            <TouchableOpacity style={s.topbarBtn} onPress={() => router.push('/(tabs)/profile')}><Text>⚙️</Text></TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={s.messagesScroll}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          <Text style={s.dateLabel}>HOY</Text>

          {messages.map(msg => (
            <View key={msg.id} style={msg.role === 'user' ? s.userRow : s.aiRow}>
              {msg.role === 'ai' && (
                <View style={s.aiBadge}><Text style={{ color: '#fff', fontFamily: typography.family.bold, fontSize: 11 }}>A</Text></View>
              )}
              <View style={{ flex: 1 }}>
                {msg.role === 'ai' && <Text style={s.aiName}>Tutor PAES</Text>}
                {msg.role === 'ai' ? <AIMessage content={msg.content} /> : (
                  <View style={s.userBubble}><Text style={s.userText}>{msg.content}</Text></View>
                )}
                <Text style={[s.ts, msg.role === 'user' && { textAlign: 'right' }]}>{msg.ts}</Text>
              </View>
            </View>
          ))}

          {loading && (
            <View style={s.aiRow}>
              <View style={s.aiBadge}><Text style={{ color: '#fff', fontFamily: typography.family.bold, fontSize: 11 }}>A</Text></View>
              <View style={s.aiBubble}><Text style={s.aiText}>•••</Text></View>
            </View>
          )}
        </ScrollView>

        {/* Quick actions */}
        <View style={s.quickRow}>
          {['💡 Explicar más simple', '📝 Generar test', '📊 Resumir'].map(a => (
            <TouchableOpacity key={a} style={s.quickChip}>
              <Text style={s.quickText}>{a}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Input */}
        <View style={s.inputBar}>
          <TouchableOpacity style={s.attachBtn}><Text style={{ fontSize: 18 }}>📎</Text></TouchableOpacity>
          <TouchableOpacity style={s.attachBtn}><Text style={{ fontSize: 18 }}>🖼️</Text></TouchableOpacity>
          <TextInput
            style={s.input}
            value={input}
            onChangeText={setInput}
            placeholder="Escribe tu duda aquí…"
            placeholderTextColor={colors.outline}
            multiline
            onSubmitEditing={send}
          />
          <TouchableOpacity style={s.sendBtn} onPress={send}>
            <Text style={{ color: '#fff', fontSize: 16 }}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const m = StyleSheet.create({
  aiBubble: { backgroundColor: colors.surfaceLowest, borderRadius: 18, borderTopLeftRadius: 4, padding: 14, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2, maxWidth: '95%' },
  aiText: { fontFamily: typography.family.regular, fontSize: 14, color: colors.onSurface, lineHeight: 21 },
  conceptCard: { borderLeftWidth: 3, borderLeftColor: colors.primary, backgroundColor: '#f8faff', borderRadius: 10, padding: 12, marginVertical: 6 },
  conceptTitle: { fontFamily: typography.family.extrabold, fontSize: 11, color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.05, marginBottom: 3 },
  conceptSub: { fontFamily: typography.family.medium, fontSize: 12, color: colors.onSurfaceVariant, fontStyle: 'italic', marginBottom: 4 },
  conceptBody: { fontFamily: typography.family.regular, fontSize: 13, color: colors.onSurface },
  animBtn: { backgroundColor: '#1e293b', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 8 },
  animBtnText: { fontFamily: typography.family.semibold, fontSize: 13, color: '#94a3b8' },
})

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.9)' },
  topbarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  aiAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  topbarTitle: { fontFamily: typography.family.extrabold, fontSize: 15, color: colors.primary },
  topbarSub: { fontFamily: typography.family.bold, fontSize: 9, color: colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.04 },
  topbarBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceLow, alignItems: 'center', justifyContent: 'center' },
  messagesScroll: { padding: spacing.xl, paddingBottom: 20, gap: 2 },
  dateLabel: { textAlign: 'center', fontFamily: typography.family.bold, fontSize: 10, color: colors.outline, textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 14 },
  aiRow: { flexDirection: 'row', gap: 8, marginBottom: 4, alignItems: 'flex-start' },
  userRow: { marginBottom: 4, alignItems: 'flex-end' },
  aiBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 18 },
  aiName: { fontFamily: typography.family.bold, fontSize: 12, color: colors.onSurface, marginBottom: 4 },
  userBubble: { backgroundColor: colors.primary, borderRadius: 18, borderTopRightRadius: 4, padding: 14, maxWidth: '85%', alignSelf: 'flex-end', shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 3 },
  userText: { fontFamily: typography.family.regular, fontSize: 14, color: '#fff', lineHeight: 21 },
  ts: { fontFamily: typography.family.regular, fontSize: 10, color: colors.outline, marginTop: 4 },
  quickRow: { flexDirection: 'row', gap: 8, paddingHorizontal: spacing.xl, paddingVertical: 8, borderTopWidth: 1, borderTopColor: 'rgba(195,198,215,0.15)' },
  quickChip: { backgroundColor: colors.surfaceLowest, borderWidth: 1.5, borderColor: colors.outlineVariant, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  quickText: { fontFamily: typography.family.semibold, fontSize: 12, color: colors.onSurface },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingVertical: 10, paddingBottom: 20, backgroundColor: 'rgba(255,255,255,0.92)', gap: 8 },
  attachBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, backgroundColor: colors.surfaceHigh, borderRadius: 999, paddingHorizontal: 18, paddingVertical: 10, fontFamily: typography.family.regular, fontSize: 14, color: colors.onSurface, maxHeight: 100 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 3 },
})
