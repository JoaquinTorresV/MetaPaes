/**
 * Catálogo de asignaturas PAES 2027
 * Basado en temarios DEMRE — proceso de admisión 2027
 */

export type SubjectCode = 
  | 'competencia_lectora'
  | 'm1'
  | 'm2'
  | 'historia'
  | 'biologia'
  | 'fisica'
  | 'quimica'

export interface Subject {
  code: SubjectCode
  name: string
  shortName: string
  type: 'obligatoria' | 'electiva'
  questions: number        // preguntas totales en la prueba
  scoredQuestions: number  // preguntas que puntúan
  durationMinutes: number
  color: string            // para la UI
  icon: string             // nombre del ícono
}

export const SUBJECTS: Record<SubjectCode, Subject> = {
  competencia_lectora: {
    code: 'competencia_lectora',
    name: 'Competencia Lectora',
    shortName: 'Lenguaje',
    type: 'obligatoria',
    questions: 65,
    scoredQuestions: 60,
    durationMinutes: 150,
    color: '#7c3aed',
    icon: 'book-open',
  },
  m1: {
    code: 'm1',
    name: 'Competencia Matemática 1',
    shortName: 'Mat M1',
    type: 'obligatoria',
    questions: 65,
    scoredQuestions: 60,
    durationMinutes: 140,
    color: '#1d4ed8',
    icon: 'calculator',
  },
  m2: {
    code: 'm2',
    name: 'Competencia Matemática 2',
    shortName: 'Mat M2',
    type: 'electiva',
    questions: 55,
    scoredQuestions: 50,
    durationMinutes: 140,
    color: '#0891b2',
    icon: 'function',
  },
  historia: {
    code: 'historia',
    name: 'Historia y Ciencias Sociales',
    shortName: 'Historia',
    type: 'electiva',
    questions: 65,
    scoredQuestions: 60,
    durationMinutes: 120,
    color: '#16a34a',
    icon: 'globe',
  },
  biologia: {
    code: 'biologia',
    name: 'Ciencias — Biología',
    shortName: 'Biología',
    type: 'electiva',
    questions: 80,
    scoredQuestions: 75,
    durationMinutes: 160,
    color: '#15803d',
    icon: 'dna',
  },
  fisica: {
    code: 'fisica',
    name: 'Ciencias — Física',
    shortName: 'Física',
    type: 'electiva',
    questions: 80,
    scoredQuestions: 75,
    durationMinutes: 160,
    color: '#d97706',
    icon: 'zap',
  },
  quimica: {
    code: 'quimica',
    name: 'Ciencias — Química',
    shortName: 'Química',
    type: 'electiva',
    questions: 80,
    scoredQuestions: 75,
    durationMinutes: 160,
    color: '#dc2626',
    icon: 'flask',
  },
}

// Asignaturas obligatorias para TODOS
export const MANDATORY_SUBJECTS: SubjectCode[] = ['competencia_lectora', 'm1']

// Mapa de Ciencias: el módulo común incluye los 3 ejes
export const SCIENCE_SUBJECTS: SubjectCode[] = ['biologia', 'fisica', 'quimica']

export function getSubjectsByCareer(
  requiredSubjects: string[],
  optionalSubjects: string[]
): { required: Subject[]; optional: Subject[] } {
  const required = requiredSubjects
    .filter((s): s is SubjectCode => s in SUBJECTS)
    .map((s) => SUBJECTS[s])
  
  const optional = optionalSubjects
    .filter((s): s is SubjectCode => s in SUBJECTS)
    .map((s) => SUBJECTS[s])
  
  return { required, optional }
}
