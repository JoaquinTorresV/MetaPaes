/**
 * Database types para MetaPAES
 * Definidos manualmente hasta conectar supabase gen types
 */

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type SubjectCode =
  | 'competencia_lectora' | 'm1' | 'm2'
  | 'historia' | 'biologia' | 'fisica' | 'quimica'

export type Plan = 'free' | 'premium'
export type SourceType = 'pdf' | 'youtube' | 'url' | 'image'
export type MaterialStatus = 'processing' | 'ready' | 'error'
export type ExamMode = 'timed' | 'practice' | 'tutor_gen'
export type QuestionSource = 'demre' | 'ai_gen' | 'curated'
export type AnswerContext = 'daily' | 'exam' | 'tutor'

// ─── Row types (lo que devuelve SELECT) ───────────────────────────────────────

export interface User {
  id: string
  full_name: string
  email: string
  avatar_url: string | null
  plan: Plan
  paes_year: number
  onboarding_done: boolean
  created_at: string
  last_seen_at: string
}

export interface Career {
  id: string
  name: string
  university: string
  cut_scores: Record<string, number>
  required_subjects: SubjectCode[]
  optional_subjects: SubjectCode[]
  ponderations: Record<string, number>
}

export interface UserCareer {
  id: string
  user_id: string
  career_id: string
  priority: 'primary' | 'secondary'
  target_score: number
  selected_subjects: SubjectCode[]
  exam_date: string
}

export interface LearningObjective {
  id: string
  subject: SubjectCode
  axis: string
  objective_code: string
  description: string
  weight_in_paes: number
  prerequisite_ids: string[]
}

export interface QuestionOption {
  key: 'A' | 'B' | 'C' | 'D' | 'E'
  text: string
}

export interface Question {
  id: string
  subject: SubjectCode
  axis: string
  learning_objective_id: string | null
  difficulty: 1 | 2 | 3
  skill: string
  statement: string
  context: string | null
  options: QuestionOption[]
  correct_key: string
  explanation: string
  wrong_explanations: Record<string, string>
  source: QuestionSource
  times_answered: number
  global_accuracy: number
  created_at: string
}

export interface UserAnswer {
  id: string
  user_id: string
  question_id: string
  selected_key: string
  is_correct: boolean
  time_seconds: number
  context: AnswerContext
  answered_at: string
  next_review_at: string
  review_interval: number
  easiness_factor: number
}

export interface SubjectProgress {
  id: string
  user_id: string
  subject: SubjectCode
  estimated_score: number
  accuracy_by_axis: Record<string, number>
  questions_seen: number
  weak_axes: string[]
  updated_at: string
}

export interface UserStreak {
  user_id: string
  current_streak: number
  longest_streak: number
  last_activity_date: string
  freeze_used_at: string | null
}

export interface DailyActivity {
  id: string
  user_id: string
  activity_date: string
  questions_answered: number
  correct_answers: number
  minutes_studied: number
  tutor_messages: number
  daily_goal_met: boolean
}

export interface Exam {
  id: string
  user_id: string
  mode: ExamMode
  subjects: SubjectCode[]
  question_ids: string[]
  score: number | null
  accuracy: number | null
  duration_seconds: number | null
  score_by_subject: Record<string, number> | null
  started_at: string
  finished_at: string | null
}

export interface StudyMaterial {
  id: string
  user_id: string
  title: string
  source_type: SourceType
  subject: SubjectCode
  file_url: string | null
  raw_text: string | null
  chunk_count: number
  status: MaterialStatus
  created_at: string
}

export interface MaterialChunk {
  id: string
  material_id: string
  user_id: string
  subject: SubjectCode
  chunk_index: number
  chunk_text: string
  embedding: number[] | null
  metadata: Json
}

export interface TutorConversation {
  id: string
  user_id: string
  subject: SubjectCode
  material_ids: string[]
  messages: Json
  topics_covered: string[]
  questions_generated: number
  created_at: string
}

export interface UserObjectiveMastery {
  id: string
  user_id: string
  objective_id: string
  mastery_level: number
  attempts: number
  correct_attempts: number
  last_attempted_at: string | null
  needs_reinforcement: boolean
}

export interface DailyPlan {
  id: string
  user_id: string
  plan_date: string
  questions_by_subject: Record<string, number>
  focus_objectives: string[]
  generated_reason: string
  completed: boolean
}

// ─── Database interface para Supabase client ──────────────────────────────────

type Insert<T> = Omit<Partial<T>, 'id'> & { [k: string]: unknown }
type Update<T> = Partial<T>

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Insert<User>
        Update: Update<User>
      }
      careers: {
        Row: Career
        Insert: Insert<Career>
        Update: Update<Career>
      }
      user_careers: {
        Row: UserCareer
        Insert: Insert<UserCareer>
        Update: Update<UserCareer>
      }
      questions: {
        Row: Question
        Insert: Insert<Question>
        Update: Update<Question>
      }
      user_answers: {
        Row: UserAnswer
        Insert: Insert<UserAnswer>
        Update: Update<UserAnswer>
      }
      subject_progress: {
        Row: SubjectProgress
        Insert: Insert<SubjectProgress>
        Update: Update<SubjectProgress>
      }
      user_streaks: {
        Row: UserStreak
        Insert: Insert<UserStreak>
        Update: Update<UserStreak>
      }
      daily_activity: {
        Row: DailyActivity
        Insert: Insert<DailyActivity>
        Update: Update<DailyActivity>
      }
      exams: {
        Row: Exam
        Insert: Insert<Exam>
        Update: Update<Exam>
      }
      study_materials: {
        Row: StudyMaterial
        Insert: Insert<StudyMaterial>
        Update: Update<StudyMaterial>
      }
      material_chunks: {
        Row: MaterialChunk
        Insert: Insert<MaterialChunk>
        Update: Update<MaterialChunk>
      }
      tutor_conversations: {
        Row: TutorConversation
        Insert: Insert<TutorConversation>
        Update: Update<TutorConversation>
      }
      learning_objectives: {
        Row: LearningObjective
        Insert: Insert<LearningObjective>
        Update: Update<LearningObjective>
      }
      user_objective_mastery: {
        Row: UserObjectiveMastery
        Insert: Insert<UserObjectiveMastery>
        Update: Update<UserObjectiveMastery>
      }
      daily_plans: {
        Row: DailyPlan
        Insert: Insert<DailyPlan>
        Update: Update<DailyPlan>
      }
    }
  }
}
