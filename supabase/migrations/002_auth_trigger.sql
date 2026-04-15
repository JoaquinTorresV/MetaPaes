-- ============================================================
-- Migration 002: Trigger que crea user en tabla pública al registrarse
-- Ejecutar DESPUÉS de 001_init_schema.sql
-- ============================================================

-- Función que se ejecuta cuando se crea un nuevo usuario en auth.users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, plan, onboarding_done)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'free',
    false
  )
  ON CONFLICT (id) DO NOTHING;  -- seguro si se ejecuta dos veces
  RETURN NEW;
END;
$$;

-- Asociar el trigger al evento de creación de usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- Seed: Carreras más populares de universidades chilenas
-- Datos de puntajes de corte basados en procesos 2024/2025
-- ============================================================

INSERT INTO careers (id, name, university, cut_scores, required_subjects, optional_subjects, ponderations) VALUES

('11111111-1111-1111-1111-111111111101',
 'Medicina', 'Pontificia Universidad Católica',
 '{"2024": 875, "2023": 870, "2022": 865}',
 ARRAY['competencia_lectora','m1']::subject_code[],
 ARRAY['m2','biologia']::subject_code[],
 '{"competencia_lectora": 0.20, "m1": 0.30, "m2": 0.20, "biologia": 0.30}'::jsonb),

('11111111-1111-1111-1111-111111111102',
 'Medicina', 'Universidad de Chile',
 '{"2024": 850, "2023": 845, "2022": 840}',
 ARRAY['competencia_lectora','m1']::subject_code[],
 ARRAY['m2','biologia']::subject_code[],
 '{"competencia_lectora": 0.20, "m1": 0.20, "m2": 0.20, "biologia": 0.40}'::jsonb),

('11111111-1111-1111-1111-111111111103',
 'Ingeniería Civil', 'Universidad de Chile',
 '{"2024": 760, "2023": 755, "2022": 750}',
 ARRAY['competencia_lectora','m1']::subject_code[],
 ARRAY['m2','fisica']::subject_code[],
 '{"competencia_lectora": 0.10, "m1": 0.30, "m2": 0.35, "fisica": 0.25}'::jsonb),

('11111111-1111-1111-1111-111111111104',
 'Ingeniería Civil', 'Pontificia Universidad Católica',
 '{"2024": 780, "2023": 775, "2022": 770}',
 ARRAY['competencia_lectora','m1']::subject_code[],
 ARRAY['m2','fisica']::subject_code[],
 '{"competencia_lectora": 0.10, "m1": 0.30, "m2": 0.35, "fisica": 0.25}'::jsonb),

('11111111-1111-1111-1111-111111111105',
 'Derecho', 'Universidad de Chile',
 '{"2024": 720, "2023": 715, "2022": 710}',
 ARRAY['competencia_lectora','m1']::subject_code[],
 ARRAY['historia']::subject_code[],
 '{"competencia_lectora": 0.40, "m1": 0.20, "historia": 0.40}'::jsonb),

('11111111-1111-1111-1111-111111111106',
 'Derecho', 'Pontificia Universidad Católica',
 '{"2024": 745, "2023": 740, "2022": 735}',
 ARRAY['competencia_lectora','m1']::subject_code[],
 ARRAY['historia']::subject_code[],
 '{"competencia_lectora": 0.40, "m1": 0.20, "historia": 0.40}'::jsonb),

('11111111-1111-1111-1111-111111111107',
 'Psicología', 'Universidad de Chile',
 '{"2024": 650, "2023": 645, "2022": 640}',
 ARRAY['competencia_lectora','m1']::subject_code[],
 ARRAY['historia','biologia']::subject_code[],
 '{"competencia_lectora": 0.40, "m1": 0.20, "historia": 0.20, "biologia": 0.20}'::jsonb),

('11111111-1111-1111-1111-111111111108',
 'Arquitectura', 'Pontificia Universidad Católica',
 '{"2024": 665, "2023": 660, "2022": 655}',
 ARRAY['competencia_lectora','m1']::subject_code[],
 ARRAY['m2']::subject_code[],
 '{"competencia_lectora": 0.25, "m1": 0.40, "m2": 0.35}'::jsonb),

('11111111-1111-1111-1111-111111111109',
 'Odontología', 'Universidad de Chile',
 '{"2024": 795, "2023": 790, "2022": 785}',
 ARRAY['competencia_lectora','m1']::subject_code[],
 ARRAY['biologia','quimica']::subject_code[],
 '{"competencia_lectora": 0.20, "m1": 0.20, "biologia": 0.30, "quimica": 0.30}'::jsonb),

('11111111-1111-1111-1111-111111111110',
 'Ingeniería Comercial', 'Universidad de Chile',
 '{"2024": 735, "2023": 730, "2022": 725}',
 ARRAY['competencia_lectora','m1']::subject_code[],
 ARRAY['m2','historia']::subject_code[],
 '{"competencia_lectora": 0.20, "m1": 0.30, "m2": 0.30, "historia": 0.20}'::jsonb),

('11111111-1111-1111-1111-111111111111',
 'Ingeniería Comercial', 'Pontificia Universidad Católica',
 '{"2024": 755, "2023": 750, "2022": 745}',
 ARRAY['competencia_lectora','m1']::subject_code[],
 ARRAY['m2']::subject_code[],
 '{"competencia_lectora": 0.20, "m1": 0.35, "m2": 0.45}'::jsonb),

('11111111-1111-1111-1111-111111111112',
 'Pedagogía Básica', 'Universidad de Chile',
 '{"2024": 560, "2023": 555, "2022": 550}',
 ARRAY['competencia_lectora','m1']::subject_code[],
 ARRAY['historia']::subject_code[],
 '{"competencia_lectora": 0.40, "m1": 0.30, "historia": 0.30}'::jsonb),

('11111111-1111-1111-1111-111111111113',
 'Enfermería', 'Pontificia Universidad Católica',
 '{"2024": 680, "2023": 675, "2022": 670}',
 ARRAY['competencia_lectora','m1']::subject_code[],
 ARRAY['biologia','quimica']::subject_code[],
 '{"competencia_lectora": 0.20, "m1": 0.20, "biologia": 0.35, "quimica": 0.25}'::jsonb),

('11111111-1111-1111-1111-111111111114',
 'Trabajo Social', 'Universidad de Chile',
 '{"2024": 590, "2023": 585, "2022": 580}',
 ARRAY['competencia_lectora','m1']::subject_code[],
 ARRAY['historia']::subject_code[],
 '{"competencia_lectora": 0.40, "m1": 0.20, "historia": 0.40}'::jsonb),

('11111111-1111-1111-1111-111111111115',
 'Bioquímica', 'Universidad de Chile',
 '{"2024": 770, "2023": 765, "2022": 760}',
 ARRAY['competencia_lectora','m1']::subject_code[],
 ARRAY['biologia','quimica','m2']::subject_code[],
 '{"competencia_lectora": 0.15, "m1": 0.20, "m2": 0.20, "biologia": 0.25, "quimica": 0.20}'::jsonb)

ON CONFLICT (id) DO NOTHING;
