/**
 * Hook que agrega todos los datos del home en una sola llamada paralela
 */
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/services/supabase/client'
import { useAuthStore } from '@/store/authStore'
import type { SubjectCode } from '@/services/supabase/types'
import { SUBJECTS } from '@/config/subjects'

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface DashboardData {
  totalScore: number
  targetScore: number
  progressPct: number
  gap: number
  currentStreak: number
  daysToExam: number
  todayPlan: Array<{ subject: SubjectCode; count: number; axis: string }>
  careerName: string
  universityName: string
  scoresBySubject: Partial<Record<SubjectCode, number>>
}

async function fetchDashboard(userId: string): Promise<DashboardData> {
  const today = new Date().toISOString().split('T')[0] as string

  const [careerRes, progressRes, streakRes, planRes] = await Promise.all([
    supabase
      .from('user_careers')
      .select('target_score, selected_subjects, exam_date, careers(name, university)')
      .eq('user_id', userId)
      .eq('priority', 'primary')
      .maybeSingle(),

    supabase
      .from('subject_progress')
      .select('subject, estimated_score')
      .eq('user_id', userId),

    supabase
      .from('user_streaks')
      .select('current_streak')
      .eq('user_id', userId)
      .maybeSingle(),

    supabase
      .from('daily_plans')
      .select('questions_by_subject, focus_objectives')
      .eq('user_id', userId)
      .eq('plan_date', today)
      .maybeSingle(),
  ])

  // Carrera
  const career = careerRes.data as any
  const targetScore: number = career?.target_score ?? 700
  const careerName: string = career?.careers?.name ?? 'Tu carrera'
  const universityName: string = career?.careers?.university ?? ''
  const examDateStr: string = career?.exam_date ?? '2026-11-28'
  const examDate = new Date(examDateStr)
  const daysToExam = Math.max(0, Math.ceil((examDate.getTime() - Date.now()) / 86400000))

  // Puntajes por asignatura
  const scoresBySubject: Partial<Record<SubjectCode, number>> = {}
  const progressRows = (progressRes.data ?? []) as Array<{ subject: string; estimated_score: number }>
  progressRows.forEach((p) => {
    scoresBySubject[p.subject as SubjectCode] = p.estimated_score
  })

  const scores = Object.values(scoresBySubject) as number[]
  const totalScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 150
  const progressPct = Math.min(100, Math.round((totalScore / targetScore) * 100))
  const gap = Math.max(0, targetScore - totalScore)

  // Streak
  const streakData = streakRes.data as any
  const currentStreak: number = streakData?.current_streak ?? 0

  // Plan del día
  const planData = planRes.data as any
  const planBySubject: Record<string, number> = planData?.questions_by_subject ?? {}
  const selectedSubjects = ((career?.selected_subjects ?? ['competencia_lectora', 'm1']) as SubjectCode[])

  const todayPlan = selectedSubjects.map((sub) => ({
    subject: sub,
    count: planBySubject[sub] ?? 5,
    axis: SUBJECTS[sub]?.name ?? sub,
  }))

  return {
    totalScore, targetScore, progressPct, gap,
    currentStreak, daysToExam,
    todayPlan, careerName, universityName, scoresBySubject,
  }
}

export function useDashboard() {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: ['dashboard', user?.id],
    queryFn: () => fetchDashboard(user!.id),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2,
  })
}
