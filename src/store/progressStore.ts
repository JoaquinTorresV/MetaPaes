import { create } from 'zustand'
import type { SubjectProgress, UserStreak, SubjectCode } from '@/services/supabase/types'

interface ProgressState {
  progressBySubject: Partial<Record<SubjectCode, SubjectProgress>>
  streak: UserStreak | null
  totalEstimatedScore: number

  // Actions
  setSubjectProgress: (subject: SubjectCode, progress: SubjectProgress) => void
  setAllProgress: (progress: SubjectProgress[]) => void
  setStreak: (streak: UserStreak) => void
  updateTotalScore: () => void
  reset: () => void
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  progressBySubject: {},
  streak: null,
  totalEstimatedScore: 0,

  setSubjectProgress: (subject, progress) =>
    set((state) => ({
      progressBySubject: { ...state.progressBySubject, [subject]: progress },
    })),

  setAllProgress: (progressList) => {
    const bySubject: Partial<Record<SubjectCode, SubjectProgress>> = {}
    progressList.forEach((p) => {
      bySubject[p.subject as SubjectCode] = p
    })
    set({ progressBySubject: bySubject })
    get().updateTotalScore()
  },

  setStreak: (streak) => set({ streak }),

  updateTotalScore: () => {
    const scores = Object.values(get().progressBySubject).map((p) => p?.estimated_score ?? 0)
    if (scores.length === 0) return
    // Promedio ponderado simple para el score total visible en el home
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    set({ totalEstimatedScore: avg })
  },

  reset: () => set({ progressBySubject: {}, streak: null, totalEstimatedScore: 0 }),
}))
