-- ============================================================
-- MetaPAES — Migration 001: Schema inicial
-- ============================================================
-- Ejecutar en Supabase SQL Editor o con supabase db push
-- ============================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";          -- pgvector para embeddings RAG

-- ─── TIPOS ENUM ───────────────────────────────────────────────────────────────

CREATE TYPE plan_type AS ENUM ('free', 'premium');
CREATE TYPE subject_code AS ENUM (
  'competencia_lectora', 'm1', 'm2',
  'historia', 'biologia', 'fisica', 'quimica'
);
CREATE TYPE source_type AS ENUM ('pdf', 'youtube', 'url', 'image');
CREATE TYPE material_status AS ENUM ('processing', 'ready', 'error');
CREATE TYPE exam_mode AS ENUM ('timed', 'practice', 'tutor_gen');
CREATE TYPE question_source AS ENUM ('demre', 'ai_gen', 'curated');
CREATE TYPE answer_context AS ENUM ('daily', 'exam', 'tutor');

-- ─── USERS ───────────────────────────────────────────────────────────────────

CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name       TEXT NOT NULL,
  email           TEXT UNIQUE NOT NULL,
  avatar_url      TEXT,
  plan            plan_type NOT NULL DEFAULT 'free',
  paes_year       INTEGER NOT NULL DEFAULT 2027,
  onboarding_done BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: cada usuario solo lee/escribe sus propios datos
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users: own row" ON users
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ─── CAREERS ─────────────────────────────────────────────────────────────────

CREATE TABLE careers (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                TEXT NOT NULL,
  university          TEXT NOT NULL,
  cut_scores          JSONB NOT NULL DEFAULT '{}',     -- {"2024": 870, "2023": 855}
  required_subjects   subject_code[] NOT NULL DEFAULT '{}',
  optional_subjects   subject_code[] NOT NULL DEFAULT '{}',
  ponderations        JSONB NOT NULL DEFAULT '{}'      -- {"m1": 0.4, "bio": 0.3}
);

-- Careers son públicas (lectura)
ALTER TABLE careers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "careers: read all" ON careers FOR SELECT USING (true);

CREATE TABLE user_careers (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  career_id         UUID NOT NULL REFERENCES careers(id),
  priority          TEXT NOT NULL DEFAULT 'primary' CHECK (priority IN ('primary', 'secondary')),
  target_score      INTEGER NOT NULL,
  selected_subjects subject_code[] NOT NULL DEFAULT '{}',
  exam_date         DATE NOT NULL DEFAULT '2026-11-28'
);

ALTER TABLE user_careers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_careers: own" ON user_careers
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── LEARNING OBJECTIVES ─────────────────────────────────────────────────────

CREATE TABLE learning_objectives (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject          subject_code NOT NULL,
  axis             TEXT NOT NULL,
  objective_code   TEXT UNIQUE NOT NULL,    -- ej: 'M1-GEO-01'
  description      TEXT NOT NULL,
  weight_in_paes   DECIMAL(4,3) NOT NULL,   -- proporción 0-1
  prerequisite_ids UUID[] NOT NULL DEFAULT '{}'
);

ALTER TABLE learning_objectives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "learning_objectives: read all" ON learning_objectives FOR SELECT USING (true);

CREATE INDEX idx_lo_subject ON learning_objectives(subject);
CREATE INDEX idx_lo_axis ON learning_objectives(subject, axis);

-- ─── QUESTIONS ───────────────────────────────────────────────────────────────

CREATE TABLE questions (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject                subject_code NOT NULL,
  axis                   TEXT NOT NULL,
  learning_objective_id  UUID REFERENCES learning_objectives(id),
  difficulty             SMALLINT NOT NULL CHECK (difficulty BETWEEN 1 AND 3),
  skill                  TEXT NOT NULL,
  statement              TEXT NOT NULL,
  context                TEXT,              -- texto de lectura, experimento, etc.
  options                JSONB NOT NULL,    -- [{"key": "A", "text": "..."}]
  correct_key            TEXT NOT NULL CHECK (correct_key IN ('A','B','C','D','E')),
  explanation            TEXT NOT NULL,
  wrong_explanations     JSONB NOT NULL DEFAULT '{}',
  source                 question_source NOT NULL DEFAULT 'ai_gen',
  times_answered         INTEGER NOT NULL DEFAULT 0,
  global_accuracy        DECIMAL(4,3) NOT NULL DEFAULT 0,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "questions: read all" ON questions FOR SELECT USING (true);

CREATE INDEX idx_q_subject ON questions(subject);
CREATE INDEX idx_q_subject_axis ON questions(subject, axis);
CREATE INDEX idx_q_difficulty ON questions(difficulty);
CREATE INDEX idx_q_lo ON questions(learning_objective_id);

-- ─── USER ANSWERS ─────────────────────────────────────────────────────────────

CREATE TABLE user_answers (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id      UUID NOT NULL REFERENCES questions(id),
  selected_key     TEXT NOT NULL,
  is_correct       BOOLEAN NOT NULL,
  time_seconds     INTEGER NOT NULL DEFAULT 0,
  context          answer_context NOT NULL DEFAULT 'daily',
  answered_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- SM-2 spaced repetition
  next_review_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  review_interval  INTEGER NOT NULL DEFAULT 1,
  easiness_factor  DECIMAL(4,2) NOT NULL DEFAULT 2.50
);

ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_answers: own" ON user_answers
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_ua_user ON user_answers(user_id);
CREATE INDEX idx_ua_review ON user_answers(user_id, next_review_at);
CREATE INDEX idx_ua_user_q ON user_answers(user_id, question_id);

-- ─── SUBJECT PROGRESS ─────────────────────────────────────────────────────────

CREATE TABLE subject_progress (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject           subject_code NOT NULL,
  estimated_score   INTEGER NOT NULL DEFAULT 150,
  accuracy_by_axis  JSONB NOT NULL DEFAULT '{}',   -- {"geometria": 0.65, "algebra": 0.8}
  questions_seen    INTEGER NOT NULL DEFAULT 0,
  weak_axes         TEXT[] NOT NULL DEFAULT '{}',
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, subject)
);

ALTER TABLE subject_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subject_progress: own" ON subject_progress
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── STREAKS + DAILY ACTIVITY ────────────────────────────────────────────────

CREATE TABLE user_streaks (
  user_id              UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_streak       INTEGER NOT NULL DEFAULT 0,
  longest_streak       INTEGER NOT NULL DEFAULT 0,
  last_activity_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  freeze_used_at       DATE
);

ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_streaks: own" ON user_streaks
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE daily_activity (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  questions_answered INTEGER NOT NULL DEFAULT 0,
  correct_answers    INTEGER NOT NULL DEFAULT 0,
  minutes_studied    INTEGER NOT NULL DEFAULT 0,
  tutor_messages     INTEGER NOT NULL DEFAULT 0,
  daily_goal_met     BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(user_id, activity_date)
);

ALTER TABLE daily_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "daily_activity: own" ON daily_activity
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── EXAMS ───────────────────────────────────────────────────────────────────

CREATE TABLE exams (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mode               exam_mode NOT NULL,
  subjects           subject_code[] NOT NULL DEFAULT '{}',
  question_ids       UUID[] NOT NULL DEFAULT '{}',
  score              INTEGER,
  accuracy           DECIMAL(4,3),
  duration_seconds   INTEGER,
  score_by_subject   JSONB,
  started_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at        TIMESTAMPTZ
);

ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exams: own" ON exams
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── TUTOR MATERIAL ──────────────────────────────────────────────────────────

CREATE TABLE study_materials (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  source_type source_type NOT NULL,
  subject     subject_code NOT NULL,
  file_url    TEXT,
  raw_text    TEXT,
  chunk_count INTEGER NOT NULL DEFAULT 0,
  status      material_status NOT NULL DEFAULT 'processing',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE study_materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "study_materials: own" ON study_materials
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE material_chunks (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  material_id  UUID NOT NULL REFERENCES study_materials(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject      subject_code NOT NULL,
  chunk_index  INTEGER NOT NULL,
  chunk_text   TEXT NOT NULL,
  embedding    vector(1536),    -- pgvector — compatible con OpenAI text-embedding-3-small
  metadata     JSONB NOT NULL DEFAULT '{}'
);

ALTER TABLE material_chunks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "material_chunks: own" ON material_chunks
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Índice HNSW para búsqueda vectorial eficiente
CREATE INDEX idx_chunks_embedding ON material_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

CREATE INDEX idx_chunks_user_subject ON material_chunks(user_id, subject);

-- Full-text search index para búsqueda híbrida
ALTER TABLE material_chunks ADD COLUMN IF NOT EXISTS fts_vector tsvector
  GENERATED ALWAYS AS (to_tsvector('spanish', chunk_text)) STORED;
CREATE INDEX idx_chunks_fts ON material_chunks USING gin(fts_vector);

-- ─── TUTOR CONVERSATIONS ─────────────────────────────────────────────────────

CREATE TABLE tutor_conversations (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject             subject_code NOT NULL,
  material_ids        UUID[] NOT NULL DEFAULT '{}',
  messages            JSONB NOT NULL DEFAULT '[]',
  topics_covered      TEXT[] NOT NULL DEFAULT '{}',
  questions_generated INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE tutor_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tutor_conversations: own" ON tutor_conversations
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── USER OBJECTIVE MASTERY ──────────────────────────────────────────────────

CREATE TABLE user_objective_mastery (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  objective_id         UUID NOT NULL REFERENCES learning_objectives(id),
  mastery_level        DECIMAL(4,3) NOT NULL DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 1),
  attempts             INTEGER NOT NULL DEFAULT 0,
  correct_attempts     INTEGER NOT NULL DEFAULT 0,
  last_attempted_at    TIMESTAMPTZ,
  needs_reinforcement  BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(user_id, objective_id)
);

ALTER TABLE user_objective_mastery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_objective_mastery: own" ON user_objective_mastery
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_mastery_user ON user_objective_mastery(user_id);
CREATE INDEX idx_mastery_weak ON user_objective_mastery(user_id, mastery_level)
  WHERE needs_reinforcement = true;

-- ─── DAILY PLANS ─────────────────────────────────────────────────────────────

CREATE TABLE daily_plans (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_date              DATE NOT NULL DEFAULT CURRENT_DATE,
  questions_by_subject   JSONB NOT NULL DEFAULT '{}',
  focus_objectives       UUID[] NOT NULL DEFAULT '{}',
  generated_reason       TEXT NOT NULL DEFAULT '',
  completed              BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(user_id, plan_date)
);

ALTER TABLE daily_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "daily_plans: own" ON daily_plans
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ─── FUNCIÓN: actualizar racha diaria ────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_streak(p_user_id UUID)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  v_last DATE;
  v_current INTEGER;
BEGIN
  SELECT last_activity_date, current_streak
    INTO v_last, v_current
    FROM user_streaks WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date)
    VALUES (p_user_id, 1, 1, CURRENT_DATE);
    RETURN;
  END IF;

  IF v_last = CURRENT_DATE THEN RETURN; END IF;  -- ya actualizado hoy

  IF v_last = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Día consecutivo
    UPDATE user_streaks SET
      current_streak = current_streak + 1,
      longest_streak = GREATEST(longest_streak, current_streak + 1),
      last_activity_date = CURRENT_DATE
    WHERE user_id = p_user_id;
  ELSE
    -- Racha rota
    UPDATE user_streaks SET
      current_streak = 1,
      last_activity_date = CURRENT_DATE
    WHERE user_id = p_user_id;
  END IF;
END;
$$;

-- ─── FUNCIÓN: recalcular mastery de un OA ─────────────────────────────────────

CREATE OR REPLACE FUNCTION recalculate_mastery(p_user_id UUID, p_objective_id UUID)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  v_total   INTEGER;
  v_correct INTEGER;
  v_mastery DECIMAL;
BEGIN
  SELECT COUNT(*), COUNT(*) FILTER (WHERE ua.is_correct)
    INTO v_total, v_correct
    FROM user_answers ua
    JOIN questions q ON ua.question_id = q.id
    WHERE ua.user_id = p_user_id AND q.learning_objective_id = p_objective_id;

  IF v_total = 0 THEN RETURN; END IF;

  v_mastery := LEAST(1.0, v_correct::DECIMAL / v_total);

  INSERT INTO user_objective_mastery (user_id, objective_id, mastery_level, attempts, correct_attempts, last_attempted_at, needs_reinforcement)
  VALUES (p_user_id, p_objective_id, v_mastery, v_total, v_correct, now(), v_mastery < 0.6)
  ON CONFLICT (user_id, objective_id) DO UPDATE SET
    mastery_level = EXCLUDED.mastery_level,
    attempts = EXCLUDED.attempts,
    correct_attempts = EXCLUDED.correct_attempts,
    last_attempted_at = EXCLUDED.last_attempted_at,
    needs_reinforcement = EXCLUDED.needs_reinforcement;
END;
$$;
