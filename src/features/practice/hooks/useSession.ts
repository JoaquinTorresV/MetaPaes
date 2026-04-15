/**
 * Hook que gestiona una sesión de práctica completa
 * Carga preguntas, recibe respuestas, actualiza DB
 */
import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { fetchAdaptiveQuestions } from '../services/questionService'
import { saveAnswer } from '../services/answerService'
import type { SubjectCode, Question } from '@/services/supabase/types'

interface SessionConfig {
  subject: SubjectCode
  count?: number
  axis?: string
  difficulty?: 1 | 2 | 3
}

interface AnsweredQuestion {
  questionId: string
  selectedKey: string
  isCorrect: boolean
  timeSeconds: number
}

export function useSession(config: SessionConfig) {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answered, setAnswered] = useState<AnsweredQuestion[]>([])
  const [sessionStartTime] = useState(Date.now())
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())

  // Cargar preguntas
  const {
    data: questions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['practice-questions', config.subject, config.axis, config.difficulty, user?.id],
    queryFn: () =>
      fetchAdaptiveQuestions({
        userId: user!.id,
        subject: config.subject,
        count: config.count ?? 10,
        difficulty: config.difficulty ?? undefined,
        axis: config.axis ?? undefined,
      }),
    enabled: !!user?.id,
    staleTime: 0, // siempre fresco para no repetir preguntas
  })

  // Guardar respuesta
  const { mutateAsync: submitAnswer, isPending: isSaving } = useMutation({
    mutationFn: (params: { selectedKey: string }) => {
      const q = questions[currentIndex]!
      const timeSeconds = Math.round((Date.now() - questionStartTime) / 1000)
      return saveAnswer({
        userId: user!.id,
        questionId: q.id,
        selectedKey: params.selectedKey,
        correctKey: q.correct_key,
        timeSeconds,
        subject: q.subject,
        axis: q.axis,
        context: 'daily',
        learningObjectiveId: q.learning_objective_id ?? undefined,
      })
    },
    onSuccess: (result, variables) => {
      const q = questions[currentIndex]!
      setAnswered((prev) => [
        ...prev,
        {
          questionId: q.id,
          selectedKey: variables.selectedKey,
          isCorrect: result.isCorrect ?? false,
          timeSeconds: Math.round((Date.now() - questionStartTime) / 1000),
        },
      ])
      // Invalidar dashboard para que se refresque el puntaje
      queryClient.invalidateQueries({ queryKey: ['dashboard', user?.id] })
    },
  })

  const currentQuestion: Question | undefined = questions[currentIndex]
  const isLastQuestion = currentIndex >= questions.length - 1
  const sessionAccuracy =
    answered.length > 0
      ? answered.filter((a) => a.isCorrect).length / answered.length
      : 0

  const goNext = useCallback(() => {
    setCurrentIndex((i) => i + 1)
    setQuestionStartTime(Date.now())
  }, [])

  const sessionDurationSeconds = Math.round((Date.now() - sessionStartTime) / 1000)

  return {
    currentQuestion,
    currentIndex,
    total: questions.length,
    isLoading,
    error,
    isSaving,
    answered,
    isLastQuestion,
    sessionAccuracy,
    sessionDurationSeconds,
    submitAnswer,
    goNext,
  }
}
