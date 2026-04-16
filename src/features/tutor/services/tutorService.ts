import { supabase } from '@/services/supabase/client'
import type { SubjectCode } from '@/services/supabase/types'

export interface TutorMessage {
  role: 'user' | 'assistant'
  content: string
  ts: string
}

export interface StudentContext {
  name: string
  career: string
  targetScore: number
  currentScore: number
  daysRemaining: number
  weakAxes: string[]
  masteryJson: Record<string, number>
}

export interface TutorRequest {
  userId: string
  message: string
  subject: SubjectCode
  conversationHistory: TutorMessage[]
  studentContext: StudentContext
  onChunk: (text: string) => void
  onDone: () => void
  onError: (err: string) => void
}

export async function sendTutorMessage(req: TutorRequest): Promise<void> {
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token
  if (!token) { req.onError('No autenticado'); return }

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl) { req.onError('SUPABASE_URL no configurado'); return }
  if (!supabaseAnonKey) { req.onError('SUPABASE_ANON_KEY no configurado'); return }

  const edgeFunctionUrl = `${supabaseUrl}/functions/v1/tutor-chat`

  try {
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: req.userId,
        message: req.message,
        subject: req.subject,
        conversationHistory: req.conversationHistory.slice(-10),
        studentContext: req.studentContext,
      }),
    })

    if (!response.ok) {
      req.onError(`Error del servidor: ${response.status}`)
      return
    }

    const reader = response.body?.getReader()
    if (!reader) { req.onError('No se pudo leer la respuesta'); return }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6).trim()
        if (data === '[DONE]') { req.onDone(); return }
        try {
          const parsed = JSON.parse(data) as { type: string; text?: string }
          if (parsed.type === 'text' && parsed.text) req.onChunk(parsed.text)
        } catch { /* ignorar líneas malformadas */ }
      }
    }
    req.onDone()
  } catch (err) {
    req.onError(err instanceof Error ? err.message : 'Error de conexión')
  }
}

export async function saveConversation(userId: string, subject: SubjectCode, messages: TutorMessage[]) {
  const today = new Date().toISOString().split('T')[0] as string
  await Promise.all([
    supabase.from('tutor_conversations').insert({ user_id: userId, subject, messages, topics_covered: [], questions_generated: 0 } as never),
    supabase.from('daily_activity').upsert({ user_id: userId, activity_date: today, tutor_messages: messages.filter((m) => m.role === 'user').length } as never, { onConflict: 'user_id,activity_date' }),
  ])
}
