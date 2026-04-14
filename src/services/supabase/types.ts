/**
 * Database types — generados por Supabase CLI
 * 
 * Para regenerar: npx supabase gen types typescript --project-id YOUR_ID > src/services/supabase/types.ts
 * 
 * Por ahora: tipos manuales basados en el schema diseñado.
 * Reemplazar con tipos generados automáticamente al conectar Supabase.
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

// ─── USERS ───────────────────────────────────────────────────────────────────

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

// ─── CAREERS ─────────────────────────────────────────────────────────────────

export interface Career {
  id: string
  name: string
  university: string
  cut_scores: Record<string, number>     // { "2024": 870, "2023": 855 }
  required_subjects: SubjectCode[]
  optional_subjects: SubjectCode[]
  ponderations: Record<SubjectCode, number>  // { "m1": 0.4, "bio": 0.3 }
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

// ─── QUESTIONS ───────────────────────────────────────────────────────────────

export interface QuestionOption {
  key: 'A' | 'B' | 'C' | 'D' | 'E'
  text: string
}

export interface Question {
  id: string
  subject: SubjectCode
  axis: string
  learning_objective_id: string
  difficulty: 1 | 2 | 3
  skill: string
  statement: string
  context: string | null        // texto de lectura, enunciado experimental, etc.
  options: QuestionOption[]
  correct_key: 'A' | 'B' | 'C' | 'D' | 'E'
  explanation: string           // por qué la correcta ES correcta
  wrong_explanations: Record<string, string>  // por qué cada distractor es incorrecto
  source: QuestionSource
  times_answered: number
  global_accuracy: number
  created_at: string
}

// ─── USER PROGRESS ───────────────────────────────────────────────────────────

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

// ─── EXAMS ───────────────────────────────────────────────────────────────────

export interface Exam {
  id: string
  user_id: string
  mode: ExamMode
  subjects: SubjectCode[]
  question_ids: string[]
  score: number | null
  accuracy: number | null
  duration_seconds: number | null
  score_by_subject: Record<SubjectCode, number> | null
  started_at: string
  finished_at: string | null
}

// ─── TUTOR / MATERIAL ────────────────────────────────────────────────────────

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
  embedding: number[] | null    // vector(1536) — pgvector
  metadata: {
    page?: number
    timestamp?: string
    source_type: SourceType
  }
}

export interface TutorConversation {
  id: string
  user_id: string
  subject: SubjectCode
  material_ids: string[]
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
    ts: string
  }>
  topics_covered: string[]
  questions_generated: number
  created_at: string
}

// ─── LEARNING OBJECTIVES ─────────────────────────────────────────────────────

export interface LearningObjective {
  id: string
  subject: SubjectCode
  axis: string
  objective_code: string
  description: string
  weight_in_paes: number
  prerequisite_ids: string[]
}

export interface UserObjectiveMastery {
  id: string
  user_id: string
  objective_id: string
  mastery_level: number   // 0.0 – 1.0
  attempts: number
  correct_attempts: number
  last_attempted_at: string
  needs_reinforcement: boolean
}

export interface DailyPlan {
  id: string
  user_id: string
  plan_date: string
  questions_by_subject: Record<SubjectCode, number>
  focus_objectives: string[]
  generated_reason: string
  completed: boolean
}

// ─── DATABASE TYPE ────────────────────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      users: { Row: User; Insert: Partial<User>; Update: Partial<User> }
      careers: { Row: Career; Insert: Partial<Career>; Update: Partial<Career> }
      user_careers: { Row: UserCareer; Insert: Partial<UserCareer>; Update: Partial<UserCareer> }
      questions: { Row: Question; Insert: Partial<Question>; Update: Partial<Question> }
      user_answers: { Row: UserAnswer; Insert: Partial<UserAnswer>; Update: Partial<UserAnswer> }
      subject_progress: { Row: SubjectProgress; Insert: Partial<SubjectProgress>; Update: Partial<SubjectProgress> }
      user_streaks: { Row: UserStreak; Insert: Partial<UserStreak>; Update: Partial<UserStreak> }
      daily_activity: { Row: DailyActivity; Insert: Partial<DailyActivity>; Update: Partial<DailyActivity> }
      exams: { Row: Exam; Insert: Partial<Exam>; Update: Partial<Exam> }
      study_materials: { Row: StudyMaterial; Insert: Partial<StudyMaterial>; Update: Partial<StudyMaterial> }
      material_chunks: { Row: MaterialChunk; Insert: Partial<MaterialChunk>; Update: Partial<MaterialChunk> }
      tutor_conversations: { Row: TutorConversation; Insert: Partial<TutorConversation>; Update: Partial<TutorConversation> }
      learning_objectives: { Row: LearningObjective; Insert: Partial<LearningObjective>; Update: Partial<LearningObjective> }
      user_objective_mastery: { Row: UserObjectiveMastery; Insert: Partial<UserObjectiveMastery>; Update: Partial<UserObjectiveMastery> }
      daily_plans: { Row: DailyPlan; Insert: Partial<DailyPlan>; Update: Partial<DailyPlan> }
    }
  }
}
