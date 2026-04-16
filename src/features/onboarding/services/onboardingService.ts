/**
 * Servicio de onboarding — guarda carrera, asignaturas y marca onboarding_done
 *
 * Nota: Usamos `as unknown as never` para compatibilidad con supabase-js v2
 * mientras se genera el schema con `supabase gen types typescript`.
 * Reemplazar con tipos generados automáticamente al conectar el CLI.
 */
import { supabase } from '@/services/supabase/client'
import type { SubjectCode } from '@/services/supabase/types'

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface OnboardingData {
  userId: string
  fullName: string
  careerId: string
  targetScore: number
  selectedSubjects: SubjectCode[]
  examDate: string
}

export async function completeOnboarding(data: OnboardingData) {
  // 1. Actualizar nombre y marcar onboarding_done
  const { error: userErr } = await supabase
    .from('users')
    .update({ full_name: data.fullName, onboarding_done: true } as any)
    .eq('id', data.userId)
  if (userErr) return { error: userErr.message }

  // 2. Reemplazar user_career sin depender de una restricción única extra
  const careerPayload = {
    user_id: data.userId,
    career_id: data.careerId,
    priority: 'primary',
    target_score: data.targetScore,
    selected_subjects: data.selectedSubjects,
    exam_date: data.examDate,
  }

  const { error: careerDeleteErr } = await supabase
    .from('user_careers')
    .delete()
    .eq('user_id', data.userId)
  if (careerDeleteErr) return { error: careerDeleteErr.message }

  const { error: careerErr } = await supabase
    .from('user_careers')
    .insert(careerPayload as any)
  if (careerErr) return { error: careerErr.message }

  // 3. Inicializar subject_progress para cada asignatura
  const progressRows = data.selectedSubjects.map((subject) => ({
    user_id: data.userId,
    subject,
    estimated_score: 150,
    accuracy_by_axis: {},
    questions_seen: 0,
    weak_axes: [],
  }))
  await supabase
    .from('subject_progress')
    .upsert(progressRows as any, { onConflict: 'user_id,subject' })

  // 4. Inicializar streak
  await supabase
    .from('user_streaks')
    .upsert({
      user_id: data.userId,
      current_streak: 0,
      longest_streak: 0,
      last_activity_date: new Date().toISOString().split('T')[0] as string,
    } as any, { onConflict: 'user_id' })

  return { error: null }
}

export interface CareerSearchResult {
  id: string
  name: string
  university: string
  cut_scores: Record<string, number>
  required_subjects: SubjectCode[]
  optional_subjects: SubjectCode[]
}

export async function getPopularCareers(): Promise<{ data: CareerSearchResult[]; error: string | null }> {
  const { data, error } = await supabase
    .from('careers')
    .select('id, name, university, cut_scores, required_subjects, optional_subjects')
    .order('name')
  return { data: (data ?? []) as CareerSearchResult[], error: error?.message ?? null }
}
