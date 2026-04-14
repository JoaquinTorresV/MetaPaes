import type { SubjectCode } from '@/services/supabase/types'

export interface OAMastery { objectiveCode: string; mastery: number; weightInPaes: number }
export const PAES_MIN = 150
export const PAES_MAX = 1000

export function calculateEstimatedScore(oaMasteries: OAMastery[]): number {
  if (oaMasteries.length === 0) return PAES_MIN
  const totalWeight = oaMasteries.reduce((s, oa) => s + oa.weightInPaes, 0)
  if (totalWeight === 0) return PAES_MIN
  const weighted = oaMasteries.reduce((s, oa) => s + oa.mastery*(oa.weightInPaes/totalWeight), 0)
  return Math.min(PAES_MAX, Math.max(PAES_MIN, Math.round(PAES_MIN + weighted * 850)))
}

export function calculateDailyGoal(
  currentScore: number, targetScore: number,
  daysRemaining: number, activeSubjects: SubjectCode[]
): Record<SubjectCode, number> {
  const gap = Math.max(0, targetScore - currentScore)
  const urgency = Math.min(1, gap / 200)
  const base = Math.round(3 + urgency * 7)
  const goals: Partial<Record<SubjectCode, number>> = {}
  activeSubjects.forEach((s) => { goals[s] = base })
  return goals as Record<SubjectCode, number>
}

export function detectWeakAxes(accuracyByAxis: Record<string, number>, threshold = 0.6): string[] {
  return Object.entries(accuracyByAxis)
    .filter(([, a]) => a < threshold)
    .sort(([, a], [, b]) => a - b)
    .map(([axis]) => axis)
}
