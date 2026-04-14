import { create } from 'zustand'
import type { UserCareer, Career, SubjectCode, DailyPlan } from '@/services/supabase/types'

interface UserState {
  userCareer: UserCareer | null
  career: Career | null
  activeSubjects: SubjectCode[]
  todayPlan: DailyPlan | null
  daysToExam: number

  // Actions
  setUserCareer: (uc: UserCareer, career: Career) => void
  setTodayPlan: (plan: DailyPlan) => void
  setDaysToExam: (days: number) => void
  reset: () => void
}

export const useUserStore = create<UserState>((set) => ({
  userCareer: null,
  career: null,
  activeSubjects: [],
  todayPlan: null,
  daysToExam: 0,

  setUserCareer: (userCareer, career) =>
    set({ userCareer, career, activeSubjects: userCareer.selected_subjects }),

  setTodayPlan: (todayPlan) => set({ todayPlan }),

  setDaysToExam: (daysToExam) => set({ daysToExam }),

  reset: () => set({ userCareer: null, career: null, activeSubjects: [], todayPlan: null }),
}))
