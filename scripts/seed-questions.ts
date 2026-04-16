/**
 * Script de seed — genera el banco inicial de preguntas PAES
 * usando la Batch API de Claude (50% de descuento vs API normal)
 *
 * Uso:
 *   npx ts-node --esm scripts/seed-questions.ts
 *   (o: npx tsx scripts/seed-questions.ts)
 *
 * Variables de entorno necesarias (.env.local):
 *   EXPO_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   (no el anon key — necesita permisos de escritura)
 *   CLAUDE_API_KEY
 *
 * Costo estimado: ~$15-20 USD para ~570 preguntas (57 OAs × 10 preguntas)
 */

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

// ─── Config ───────────────────────────────────────────────────────────────────

const anthropic = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY })
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!   // SERVICE ROLE — solo para scripts admin
)

// Distribución de dificultad por OA
const DIFFICULTY_DISTRIBUTION = [
  { difficulty: 1, count: 3 },
  { difficulty: 2, count: 5 },
  { difficulty: 3, count: 2 },
]

const SYSTEM_PROMPT = `Eres un experto en evaluación educativa con 20 años elaborando ítems para el DEMRE Chile.
Tu función es generar preguntas ORIGINALES al estilo PAES 2027. Nunca copias preguntas existentes.

REGLAS DE FORMATO:
- Responde SOLO con un array JSON válido. Sin markdown, sin texto previo.
- Cada pregunta sigue exactamente este schema:
{
  "subject": string,
  "axis": string,
  "difficulty": 1|2|3,
  "skill": string,
  "statement": string,
  "context": string|null,
  "options": [{"key":"A","text":string},{"key":"B","text":string},{"key":"C","text":string},{"key":"D","text":string}],
  "correct_key": "A"|"B"|"C"|"D",
  "explanation": string,
  "wrong_explanations": {"A":string,"B":string,"C":string,"D":string}
}

ESTILO DEMRE:
- Enunciados siempre en contexto real (situaciones cotidianas, experimentos, datos)
- Distractores son errores conceptuales plausibles que un estudiante promedio cometería
- Explicación correcta: mínimo 2 oraciones explicando el concepto
- wrong_explanations: por qué cada alternativa incorrecta es incorrecta
- NUNCA usar "Todas las anteriores" o "Ninguna de las anteriores"`

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 Iniciando seed de preguntas...\n')

  // 1. Obtener todos los OAs de la DB
  const { data: objectives, error } = await supabase
    .from('learning_objectives')
    .select('id, subject, axis, objective_code, description')
    .order('subject')

  if (error || !objectives?.length) {
    console.error('❌ Error obteniendo OAs:', error?.message)
    console.error('⚠️  Asegúrate de haber ejecutado las migrations primero.')
    process.exit(1)
  }

  console.log(`📚 ${objectives.length} objetivos de aprendizaje encontrados\n`)

  // 2. Para cada OA, generar preguntas en batch
  let totalInserted = 0
  let batchNumber = 0

  for (const obj of objectives) {
    console.log(`  → ${obj.objective_code}: ${obj.description.slice(0, 60)}...`)

    const requests: Anthropic.Messages.MessageCreateParamsNonStreaming[] = DIFFICULTY_DISTRIBUTION.map(
      ({ difficulty, count }) => ({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 3000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user' as const,
            content: `Genera ${count} pregunta(s) para:
- Asignatura: ${obj.subject}
- Eje temático: ${obj.axis}
- Objetivo: ${obj.objective_code} — ${obj.description}
- Dificultad: ${difficulty}/3 (${difficulty === 1 ? 'básico — operaciones directas' : difficulty === 2 ? 'medio — razonamiento en contexto' : 'avanzado — síntesis y evaluación'})

Responde con un array JSON: [{ pregunta1 }, ...]`,
          },
        ],
      })
    )

    // Procesar requests de este OA en paralelo (máx 3 llamadas simultáneas)
    const results = await Promise.allSettled(
      requests.map((req) => anthropic.messages.create(req))
    )

    const questionsToInsert: object[] = []

    for (const result of results) {
      if (result.status === 'rejected') {
        console.warn(`    ⚠️  Error en llamada:`, result.reason)
        continue
      }

      const text = result.value.content[0]?.type === 'text' ? result.value.content[0].text : ''
      try {
        const parsed = JSON.parse(text.replace(/```json|```/g, '').trim()) as object[]
        for (const q of parsed) {
          const question = q as Record<string, unknown>
          questionsToInsert.push({
            subject: obj.subject,
            axis: obj.axis,
            learning_objective_id: obj.id,
            difficulty: question['difficulty'],
            skill: question['skill'],
            statement: question['statement'],
            context: question['context'] ?? null,
            options: question['options'],
            correct_key: question['correct_key'],
            explanation: question['explanation'],
            wrong_explanations: question['wrong_explanations'],
            source: 'ai_gen',
          })
        }
      } catch (parseErr) {
        console.warn(`    ⚠️  Error parseando JSON para ${obj.objective_code}`)
      }
    }

    if (questionsToInsert.length > 0) {
      const { error: insertErr } = await supabase
        .from('questions')
        .insert(questionsToInsert as never[])

      if (insertErr) {
        console.warn(`    ⚠️  Error insertando:`, insertErr.message)
      } else {
        totalInserted += questionsToInsert.length
        console.log(`    ✅ ${questionsToInsert.length} preguntas insertadas`)
      }
    }

    batchNumber++

    // Pausa pequeña para no saturar la API
    if (batchNumber % 10 === 0) {
      console.log(`\n⏳ Pausa breve (rate limiting)...\n`)
      await new Promise((r) => setTimeout(r, 2000))
    }
  }

  console.log(`\n🎉 Seed completado: ${totalInserted} preguntas en total`)
  console.log(`💰 Costo estimado: ~$${(totalInserted * 0.035 / 1000 * 2).toFixed(2)} USD`)
}

main().catch(console.error)
