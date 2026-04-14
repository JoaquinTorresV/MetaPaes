/**
 * Edge Function: generate-questions
 * Genera preguntas estilo PAES usando Claude Haiku (batch API para seed masivo)
 * 
 * Deploy: supabase functions deploy generate-questions
 */

import Anthropic from 'npm:@anthropic-ai/sdk@0.24.3'
import { createClient } from 'npm:@supabase/supabase-js@2'

const anthropic = new Anthropic({ apiKey: Deno.env.get('CLAUDE_API_KEY') })
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

interface GenerateRequest {
  objectiveCode: string
  difficulty: 1 | 2 | 3
  count: number
  secretKey: string   // proteger el endpoint
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  const body: GenerateRequest = await req.json()
  
  // Verificar secret key (para uso interno/admin)
  if (body.secretKey !== Deno.env.get('ADMIN_SECRET_KEY')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  // Obtener OA de la DB
  const { data: objective } = await supabase
    .from('learning_objectives')
    .select('*')
    .eq('objective_code', body.objectiveCode)
    .single()

  if (!objective) {
    return new Response(JSON.stringify({ error: 'Objective not found' }), { status: 404 })
  }

  const SYSTEM_PROMPT = `Eres un experto en evaluación educativa con 20 años elaborando ítems para el DEMRE.
Tu función es generar preguntas originales estilo PAES 2027.
RESPONDE SOLO CON JSON VÁLIDO. Sin markdown, sin texto previo.

Formato obligatorio:
{
  "subject": "string",
  "axis": "string", 
  "objective_code": "string",
  "difficulty": 1|2|3,
  "skill": "string",
  "statement": "string",
  "context": "string|null",
  "options": [{"key":"A","text":"string"},{"key":"B","text":"string"},{"key":"C","text":"string"},{"key":"D","text":"string"}],
  "correct_key": "A"|"B"|"C"|"D",
  "explanation": "string",
  "wrong_explanations": {"A":"string","B":"string","C":"string","D":"string"}
}`

  const userPrompt = `Genera ${body.count} pregunta(s) para:
- Asignatura: ${objective.subject}
- Eje: ${objective.axis}
- Objetivo: ${objective.objective_code} — ${objective.description}
- Dificultad: ${body.difficulty}/3
- Contexto: Los enunciados siempre describen situaciones reales cotidianas o experimentales.
- Los distractores son errores conceptuales plausibles que un estudiante típico cometería.

Responde con un array JSON: [{ pregunta1 }, { pregunta2 }, ...]`

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const text = response.content[0]?.type === 'text' ? response.content[0].text : ''
  
  let questions: unknown[]
  try {
    questions = JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch {
    return new Response(JSON.stringify({ error: 'Parse error', raw: text }), { status: 500 })
  }

  // Insertar en DB
  const toInsert = (questions as Array<Record<string, unknown>>).map((q) => ({
    subject: objective.subject,
    axis: objective.axis,
    learning_objective_id: objective.id,
    difficulty: body.difficulty,
    skill: q['skill'],
    statement: q['statement'],
    context: q['context'] ?? null,
    options: q['options'],
    correct_key: q['correct_key'],
    explanation: q['explanation'],
    wrong_explanations: q['wrong_explanations'],
    source: 'ai_gen',
  }))

  const { data, error } = await supabase.from('questions').insert(toInsert).select('id')

  return new Response(
    JSON.stringify({ inserted: data?.length ?? 0, error }),
    { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
  )
})
