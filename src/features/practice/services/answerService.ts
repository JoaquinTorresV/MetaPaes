/**
 * Servicio de respuestas — guarda answer + actualiza SM-2 + progress
 */
import { supabase } from '@/services/supabase/client'
import type { SubjectCode, AnswerContext } from '@/services/supabase/types'
import { calculateSM2, answerToQuality, nextReviewDate, SM2_INITIAL_STATE } from '../utils/sm2'

export interface SaveAnswerParams {
  userId: string
  questionId: string
  selectedKey: string
  correctKey: string
  timeSeconds: number
  subject: SubjectCode
  axis: string
  context: AnswerContext
  learningObjectiveId?: string | undefined
}

export async function saveAnswer(params: SaveAnswerParams) {
  const {
    userId, questionId, selectedKey, correctKey,
    timeSeconds, subject, axis, context, learningObjectiveId,
  } = params
  const isCorrect = selectedKey === correctKey

  // ── 1. Obtener estado SM-2 previo ──────────────────────────────────────────
  const { data: prev } = await supabase
    .from('user_answers')
    .select('review_interval, easiness_factor, review_interval')
    .eq('user_id', userId)
    .eq('question_id', questionId)
    .order('answered_at', { ascending: false })
    .limit(1)
    .maybeSingle() as { data: { review_interval: number; easiness_factor: number } | null }

  const prevState = prev
    ? { interval: prev.review_interval, easinessFactor: prev.easiness_factor, repetitions: 1 }
    : SM2_INITIAL_STATE

  const quality = answerToQuality(isCorrect, timeSeconds)
  const nextState = calculateSM2(prevState, quality)
  const nextReview = nextReviewDate(nextState.interval)

  // ── 2. Insertar respuesta ──────────────────────────────────────────────────
  const { error: answerError } = await supabase.from('user_answers').insert({
    user_id: userId,
    question_id: questionId,
    selected_key: selectedKey,
    is_correct: isCorrect,
    time_seconds: timeSeconds,
    context,
    next_review_at: nextReview.toISOString(),
    review_interval: nextState.interval,
    easiness_factor: nextState.easinessFactor,
  } as any)

  if (answerError) return { error: answerError.message }

  // ── 3. Actualizar global_accuracy de la pregunta (async, sin esperar) ──────
  if (learningObjectiveId) {
    // Fire-and-forget: recalculate mastery asynchronously
    supabase.rpc('recalculate_mastery', {
      p_user_id: userId,
      p_objective_id: learningObjectiveId,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    }).then(() => {})
  }

  // ── 4. Actualizar subject_progress.accuracy_by_axis ───────────────────────
  // Obtener accuracy actual del eje
  const { data: axisStats } = await supabase
    .from('user_answers')
    .select('is_correct, questions!inner(axis, subject)')
    .eq('user_id', userId)
    .eq('questions.subject', subject)
    .eq('questions.axis', axis) as { data: Array<{ is_correct: boolean }> | null }

  if (axisStats && axisStats.length > 0) {
    const total = axisStats.length
    const correct = axisStats.filter((a) => a.is_correct).length
    const axisAccuracy = correct / total

    // Leer progreso actual para no sobreescribir otros ejes
    const { data: currentProgress } = await supabase
      .from('subject_progress')
      .select('accuracy_by_axis, questions_seen')
      .eq('user_id', userId)
      .eq('subject', subject)
      .maybeSingle() as { data: { accuracy_by_axis: Record<string, number>; questions_seen: number } | null }

    const updatedAxes = {
      ...(currentProgress?.accuracy_by_axis ?? {}),
      [axis]: axisAccuracy,
    }

    // Calcular weak_axes
    const weakAxes = Object.entries(updatedAxes)
      .filter(([, acc]) => acc < 0.6)
      .map(([a]) => a)

    await supabase.from('subject_progress').upsert({
      user_id: userId,
      subject,
      accuracy_by_axis: updatedAxes,
      questions_seen: (currentProgress?.questions_seen ?? 0) + 1,
      weak_axes: weakAxes,
      updated_at: new Date().toISOString(),
    } as any, { onConflict: 'user_id,subject' })
  }

  // ── 5. Actualizar daily_activity ──────────────────────────────────────────
  const today = new Date().toISOString().split('T')[0] as string
  await supabase.from('daily_activity').upsert({
    user_id: userId,
    activity_date: today,
    questions_answered: 1,
    correct_answers: isCorrect ? 1 : 0,
  } as any, { onConflict: 'user_id,activity_date' })

  // ── 6. Actualizar racha ────────────────────────────────────────────────────
  await supabase.rpc('update_streak', { p_user_id: userId })

  return { error: null, isCorrect, nextReviewIn: nextState.interval }
}
