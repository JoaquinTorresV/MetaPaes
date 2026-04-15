/**
 * Servicio de preguntas — fetch adaptativo desde Supabase
 * Prioriza: 1) preguntas vencidas SM-2  2) ejes débiles  3) nuevas por dificultad
 */
import { supabase } from '@/services/supabase/client'
import type { SubjectCode, Question } from '@/services/supabase/types'

export interface FetchQuestionsParams {
  userId: string
  subject: SubjectCode
  count?: number
  difficulty?: 1 | 2 | 3 | undefined
  axis?: string | undefined
}

export async function fetchAdaptiveQuestions(params: FetchQuestionsParams): Promise<Question[]> {
  const { userId, subject, count = 10, difficulty, axis } = params
  const now = new Date().toISOString()

  // ── 1. Preguntas vencidas según SM-2 (máx. 40% del lote) ──────────────────
  const reviewCount = Math.floor(count * 0.4)
  const { data: reviewIds } = await supabase
    .from('user_answers')
    .select('question_id')
    .eq('user_id', userId)
    .lte('next_review_at', now)
    .order('next_review_at', { ascending: true })
    .limit(reviewCount) as { data: Array<{ question_id: string }> | null }

  const reviewQuestionIds = (reviewIds ?? []).map((r) => r.question_id)

  // ── 2. Preguntas nuevas (no respondidas nunca) ─────────────────────────────
  const { data: answeredIds } = await supabase
    .from('user_answers')
    .select('question_id')
    .eq('user_id', userId) as { data: Array<{ question_id: string }> | null }

  const allAnsweredIds = (answeredIds ?? []).map((a) => a.question_id)

  let query = supabase
    .from('questions')
    .select('*')
    .eq('subject', subject)

  if (axis) query = query.eq('axis', axis)
  if (difficulty) query = query.eq('difficulty', difficulty)

  // Excluir ya respondidas (excepto las de SM-2)
  const excludeIds = allAnsweredIds.filter((id) => !reviewQuestionIds.includes(id))
  if (excludeIds.length > 0) {
    query = query.not('id', 'in', `(${excludeIds.map((id) => `"${id}"`).join(',')})`)
  }

  const newCount = count - reviewQuestionIds.length
  const { data: newQuestions } = await query.limit(newCount) as { data: Question[] | null }

  // ── 3. Si no hay suficientes nuevas, repetir de las ya vistas ──────────────
  let finalQuestions = newQuestions ?? []
  if (finalQuestions.length < newCount && allAnsweredIds.length > 0) {
    const { data: repeatQ } = await supabase
      .from('questions')
      .select('*')
      .eq('subject', subject)
      .in('id', allAnsweredIds.slice(0, 20))
      .order('global_accuracy', { ascending: true }) // las más difíciles primero
      .limit(newCount - finalQuestions.length) as { data: Question[] | null }
    finalQuestions = [...finalQuestions, ...(repeatQ ?? [])]
  }

  // ── 4. Mezclar review + nuevas ─────────────────────────────────────────────
  if (reviewQuestionIds.length > 0) {
    const { data: reviewQ } = await supabase
      .from('questions')
      .select('*')
      .in('id', reviewQuestionIds) as { data: Question[] | null }
    finalQuestions = [...(reviewQ ?? []), ...finalQuestions]
  }

  // Mezcla aleatoria
  return finalQuestions.sort(() => Math.random() - 0.5).slice(0, count)
}

export async function fetchQuestionsByObjective(
  objectiveCode: string,
  difficulty?: 1 | 2 | 3,
  limit = 5
): Promise<Question[]> {
  let q = supabase
    .from('questions')
    .select('*, learning_objectives!inner(objective_code)')
    .eq('learning_objectives.objective_code', objectiveCode)
  if (difficulty) q = q.eq('difficulty', difficulty)
  const { data } = await q.limit(limit) as { data: Question[] | null }
  return data ?? []
}
