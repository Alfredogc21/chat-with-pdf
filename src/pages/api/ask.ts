import { type APIRoute } from "astro"
import { readFile } from 'node:fs/promises'
import { responseSSE } from '../../utils/sse'

import { GoogleGenerativeAI } from '@google/generative-ai'

const AI_PROVIDER = (import.meta.env.AI_PROVIDER ?? 'gemini').toLowerCase()
const AI_MODEL = import.meta.env.AI_MODEL ?? 'gemini-2.5-flash'
const NVIDIA_BASE_URL = import.meta.env.NVIDIA_BASE_URL ?? 'https://integrate.api.nvidia.com/v1'
const GEMINI_KEY = import.meta.env.GEMINI_KEY
const NVIDIA_API_KEY = import.meta.env.NVIDIA_API_KEY

async function streamNvidiaCompletion(
  prompt: string,
  systemInstruction: string,
  sendEvent: (text: string) => void,
) {
  if (!NVIDIA_API_KEY) {
    throw new Error('Missing NVIDIA_API_KEY env var')
  }

  const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${NVIDIA_API_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      stream: true,
      temperature: 1,
      top_p: 1,
      max_tokens: 16384,
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt },
      ],
    }),
  })

  if (!response.ok || !response.body) {
    const errorText = await response.text()
    throw new Error(`NVIDIA request failed (${response.status}): ${errorText}`)
  }

  const decoder = new TextDecoder()
  let buffer = ''

  for await (const chunk of response.body) {
    buffer += decoder.decode(chunk, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      const trimmed = line.trim()

      if (!trimmed.startsWith('data:')) {
        continue
      }

      const data = trimmed.slice(5).trim()

      if (!data || data === '[DONE]') {
        continue
      }

      const parsed = JSON.parse(data)
      const text = parsed?.choices?.[0]?.delta?.content

      if (text) {
        sendEvent(text)
      }
    }
  }
}

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  const question = url.searchParams.get('question')

  if (!id) {
    return new Response('Missing id', { status: 400 })
  }

  if (!question) {
    return new Response('Missing question', { status: 400 })
  }

  const txt = await readFile(`public/text/${id}.txt`, 'utf-8')

  return responseSSE({ request }, async (sendEvent) => {
    const systemInstruction = 'Eres un investigador español experimentado, experto en interpretar y responder preguntas basadas en las fuentes proporcionadas. Utilizando el contexto proporcionado entre las etiquetas <context></context>, genera una respuesta concisa para una pregunta rodeada con las etiquetas <question></question>. Debes usar únicamente información del contexto. Usa un tono imparcial y periodístico. No repitas texto. Si no hay nada en el contexto relevante para la pregunta en cuestión, simplemente di "No lo sé". No intentes inventar una respuesta. Cualquier cosa entre los siguientes bloques html context se recupera de un banco de conocimientos, no es parte de la conversación con el usuario.'

    const prompt = `${systemInstruction}\n\n<context>${txt}</context><question>${question}</question>`

    if (AI_PROVIDER === 'nvidia') {
      await streamNvidiaCompletion(prompt, systemInstruction, sendEvent)
    } else {
      if (!GEMINI_KEY) {
        throw new Error('Missing GEMINI_KEY env var')
      }

      const genAI = new GoogleGenerativeAI(GEMINI_KEY)
      const model = genAI.getGenerativeModel({ model: AI_MODEL })
      const result = await model.generateContentStream(prompt)

      for await (const chunk of result.stream) {
        const text = chunk.text()
        if (text) {
          sendEvent(text)
        }
      }
    }

    sendEvent('__END__')
  })
}