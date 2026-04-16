/**
 * Edge Function: tutor-chat
 * Recibe mensaje del usuario → busca contexto RAG → llama a Claude → devuelve respuesta
 * 
 * Deploy: supabase functions deploy tutor-chat
 */

import Anthropic from 'npm:@anthropic-ai/sdk@0.24.3'

const anthropic = new Anthropic({ apiKey: Deno.env.get('CLAUDE_API_KEY') })

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface RequestBody {
  userId: string
  message: string
  conversationId?: string
  subject: string
  // Contexto del estudiante inyectado desde el cliente
  studentContext: {
    name: string
    career: string
    targetScore: number
    currentScore: number
    daysRemaining: number
    weakAxes: string[]
    masteryJson: Record<string, number>
  }
  // Chunks RAG ya recuperados por el cliente (o vacío)
  ragChunks?: Array<{ text: string; source: string }>
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const body: RequestBody = await req.json()
    const { studentContext, ragChunks = [], message, subject } = body

    // Construir contexto RAG
    const ragContext = ragChunks.length > 0
      ? `\nMATERIAL DE ESTUDIO DEL ESTUDIANTE:\n${ragChunks.map((c, i) => `[${i+1}] (${c.source})\n${c.text}`).join('\n\n')}`
      : ''

    const weakAxesText = studentContext.weakAxes.length > 0
      ? studentContext.weakAxes.map(a => `- ${a}`).join('\n')
      : '- Sin ejes débiles identificados aún'

    const masteryText = Object.entries(studentContext.masteryJson)
      .map(([code, level]) => `  ${code}: ${Math.round(level * 100)}%`)
      .join('\n')

    const systemPrompt = `Eres el Tutor IA personalizado de ${studentContext.name} en Atelier PAES, una plataforma de preparación para la PAES Chile 2027.

PERFIL DEL ESTUDIANTE:
- Carrera objetivo: ${studentContext.career}
- Puntaje meta: ${studentContext.targetScore} puntos
- Puntaje estimado actual: ${studentContext.currentScore} puntos
- Brecha: ${studentContext.targetScore - studentContext.currentScore} puntos
- Días para la PAES: ${studentContext.daysRemaining}
- Asignatura actual: ${subject}

DOMINIO POR OBJETIVO DE APRENDIZAJE:
${masteryText}

OBJETIVOS QUE REQUIEREN REFUERZO URGENTE (mastery < 50%):
${weakAxesText}
${ragContext}

REGLAS:
1. Si hay material de estudio del estudiante, úsalo como primera fuente y cita la referencia.
2. Adapta la explicación al nivel de dominio detectado:
   - mastery < 50% → Modo REFUERZO: explica desde lo básico con analogías
   - mastery 50-80% → Modo CONSOLIDACIÓN: apunta excepciones y casos PAES
   - mastery > 80% → Modo DESAFÍO: propone pregunta de dificultad 3
3. Respuestas conversacionales: máx 150 palabras. Explicaciones: hasta 300.
4. Para generar preguntas de práctica, usa el formato:
   📝 Pregunta práctica [OA-CODE] — Dificultad [1/2/3]
   [Enunciado]
   A) ... B) ... C) ... D) ...
5. Termina siempre ofreciendo un siguiente paso concreto.
6. Habla en español, tono académico pero cercano.`

    // Stream la respuesta
    const stream = await anthropic.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: message }],
    })

    // Devolver como Server-Sent Events para streaming en el cliente
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            const data = JSON.stringify({ type: 'text', text: chunk.delta.text })
            controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`))
          }
        }
        controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
        controller.close()
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        ...corsHeaders,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})
