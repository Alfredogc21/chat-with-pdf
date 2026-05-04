export type PdfPreviewImage = {
  page: number
  thumbnailUrl: string
  previewUrl: string
  alt: string
}

type BuildPreviewImagesParams = {
  pdfUrl: string
  pages: number
  maxPages?: number
}

type StreamAskAnswerParams = {
  id: string
  question: string
  onStart?: () => void
  onChunk: (chunk: string) => void
  onComplete?: () => void
  onError?: (error: Error) => void
}

const THUMBNAIL_TRANSFORMATION = 'w_400,h_540,c_fill'
const PREVIEW_TRANSFORMATION = 'w_1400,h_1980,c_fit,q_auto,f_auto'

const parseSsePayload = (rawPayload: string) => {
  try {
    return JSON.parse(rawPayload)
  } catch {
    return rawPayload
  }
}

const buildCloudinaryPdfPageImage = (
  pdfUrl: string,
  page: number,
  transformation: string,
) => {
  return pdfUrl
    .replace('/upload/', `/upload/${transformation},pg_${page}/`)
    .replace('.pdf', '.jpg')
}

export const buildPdfPreviewImages = ({
  pdfUrl,
  pages,
  maxPages = 4,
}: BuildPreviewImagesParams): PdfPreviewImage[] => {
  const safePages = Number.isFinite(pages) ? Math.max(0, pages) : 0
  const numOfImages = Math.min(maxPages, safePages)

  return Array.from({ length: numOfImages }, (_, index) => {
    const page = index + 1

    return {
      page,
      thumbnailUrl: buildCloudinaryPdfPageImage(
        pdfUrl,
        page,
        THUMBNAIL_TRANSFORMATION,
      ),
      previewUrl: buildCloudinaryPdfPageImage(
        pdfUrl,
        page,
        PREVIEW_TRANSFORMATION,
      ),
      alt: `Página ${page} del PDF`,
    }
  })
}

export const streamAskAnswer = ({
  id,
  question,
  onStart,
  onChunk,
  onComplete,
  onError,
}: StreamAskAnswerParams) => {
  const searchParams = new URLSearchParams({ id, question })
  const eventSource = new EventSource(`/api/ask?${searchParams.toString()}`)

  onStart?.()

  eventSource.onmessage = (event) => {
    const payload = parseSsePayload(event.data)

    if (payload === '__END__') {
      eventSource.close()
      onComplete?.()
      return
    }

    if (typeof payload === 'string' && payload.length > 0) {
      onChunk(payload)
    }
  }

  eventSource.onerror = () => {
    eventSource.close()
    onError?.(new Error('Error durante el streaming de respuesta IA'))
  }

  return () => {
    eventSource.close()
  }
}
