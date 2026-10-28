<script lang="ts">
  import { onDestroy, tick } from 'svelte'
  import { appStatusInfo, setAppStatusError } from '../store'
  import {
    buildPdfPreviewImages,
    streamAskAnswer,
    type PdfPreviewImage,
  } from '../utils/chat'
  import { renderMarkdown } from '../utils/markdown'
  import PdfPreviewGallery from './chat/PdfPreviewGallery.svelte'
  import PdfPreviewModal from './chat/PdfPreviewModal.svelte'
  import ChatLoadingIndicator from './chat/ChatLoadingIndicator.svelte'

  let answer = ''
  let question = ''
  let loading = false

  let messagesEl: HTMLDivElement | null = null

  $: answerHtml = renderMarkdown(answer)

  // Follow the streamed answer only while the user hasn't scrolled up to read
  const isMessagesNearBottom = () => {
    if (!messagesEl) {
      return true
    }

    const distanceToBottom =
      messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight

    return distanceToBottom < 48
  }

  const scrollMessagesToBottom = async () => {
    await tick()
    messagesEl?.scrollTo({ top: messagesEl.scrollHeight })
  }

  let previewIndex = 0
  let selectedPreview: PdfPreviewImage | null = null
  let isPreviewModalOpen = false

  let stopStreaming: (() => void) | null = null

  $: chatInfo = $appStatusInfo
  $: previewImages = buildPdfPreviewImages({
    pdfUrl: chatInfo.url,
    pages: chatInfo.pages,
    maxPages: chatInfo.pages,
  })

  const openPreviewModal = (payload: { image: PdfPreviewImage; index: number }) => {
    selectedPreview = payload.image
    previewIndex = payload.index
    isPreviewModalOpen = true
  }

  const closePreviewModal = () => {
    isPreviewModalOpen = false
    selectedPreview = null
  }

  const goToPreviousPreview = () => {
    if (previewIndex <= 0) {
      return
    }

    previewIndex -= 1
    selectedPreview = previewImages[previewIndex] ?? null
  }

  const goToNextPreview = () => {
    if (previewIndex >= previewImages.length - 1) {
      return
    }

    previewIndex += 1
    selectedPreview = previewImages[previewIndex] ?? null
  }

  const stopAnswerStreaming = () => {
    stopStreaming?.()
    stopStreaming = null
  }

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault()

    if (loading) {
      return
    }

    const cleanQuestion = question.trim()

    if (!cleanQuestion) {
      return
    }

    answer = ''
    loading = true

    stopAnswerStreaming()

    stopStreaming = streamAskAnswer({
      id: chatInfo.id,
      question: cleanQuestion,
      onChunk: (chunk) => {
        const shouldFollow = isMessagesNearBottom()
        answer += chunk

        if (shouldFollow) {
          scrollMessagesToBottom()
        }
      },
      onComplete: () => {
        loading = false
        stopStreaming = null
      },
      onError: () => {
        loading = false
        stopStreaming = null
        setAppStatusError()
      },
    })
  }

  onDestroy(() => {
    stopAnswerStreaming()
  })
</script>

<div class="chat">
  <div class="chat__document">
    <PdfPreviewGallery
      images={previewImages}
      on:openPreview={(event) => openPreviewModal(event.detail)}
    />
  </div>

  <div class="chat__conversation">
    <form class="chat__form" on:submit={handleSubmit}>
      <label class="chat__label" for="question">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
        <span>Hazle una pregunta a tu PDF</span>
      </label>

      <div class="chat__input-wrap">
        <input
          id="question"
          name="question"
          class="input chat__input"
          bind:value={question}
          required
          placeholder="¿Qué parte del documento quieres analizar?"
          autocomplete="off"
          disabled={loading}
        />

        <button
          type="submit"
          class="chat__submit"
          disabled={loading || !question.trim()}
          aria-label="Enviar pregunta"
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </div>
    </form>

    {#if loading || answer}
      <div class="chat__messages">
        <div class="chat__messages-scroll" bind:this={messagesEl}>
          {#if answer}
            <div class="chat__answer">
              <div class="chat__answer-avatar" aria-hidden="true">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
              </div>
              <div class="chat__answer-body">
                <p class="chat__answer-label">Respuesta IA</p>
                <!-- answerHtml is sanitized with DOMPurify in renderMarkdown -->
                <div class="chat__answer-text">{@html answerHtml}</div>
              </div>
            </div>
          {/if}

          {#if loading}
            <div class="chat__loading">
              <ChatLoadingIndicator text="La IA está buscando tu respuesta..." />
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>

<PdfPreviewModal
  isOpen={isPreviewModalOpen}
  image={selectedPreview}
  canGoPrev={previewIndex > 0}
  canGoNext={previewIndex < previewImages.length - 1}
  on:close={closePreviewModal}
  on:prev={goToPreviousPreview}
  on:next={goToNextPreview}
/>

<style>
  /* Widen the page card only while the chat (two-column) view is shown */
  :global(.card:has(.chat)) {
    max-width: 72rem;
  }

  .chat {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 1.5rem;
  }

  .chat__document {
    min-width: 0;
  }

  .chat__conversation {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /*
   * The answer area has a fixed height and scrolls internally, so long
   * answers don't make the card grow. The inner element is absolutely
   * positioned so its content never affects the layout height.
   */
  .chat__messages {
    position: relative;
    height: min(60vh, 28rem);
  }

  .chat__messages-scroll {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding-right: 0.35rem;
    scrollbar-gutter: stable;
    scrollbar-width: thin;
    scrollbar-color: var(--app__scrollbar-thumb, rgba(139, 92, 246, 0.3)) transparent;
  }

  @media (min-width: 960px) {
    .chat {
      grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
      gap: 2rem;
    }

    .chat__conversation {
      padding-left: 2rem;
      border-left: 1px solid var(--app__border, rgba(139, 92, 246, 0.15));
    }

    /* Fill the rest of the column, which is as tall as the PDF gallery */
    .chat__messages {
      flex: 1 1 0;
      height: auto;
      min-height: 18rem;
    }
  }

  .chat__form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .chat__label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .chat__label svg {
    width: 1rem;
    height: 1rem;
    color: rgb(var(--app__accent, 139, 92, 246));
  }

  .chat__label span {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--app__text-secondary, #94a3b8);
  }

  .chat__input-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }

  .chat__input {
    padding-right: 3rem;
  }

  .chat__submit {
    position: absolute;
    right: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 0.55rem;
    background: linear-gradient(135deg, #8b5cf6, #6366f1);
    color: white;
    border: none;
    cursor: pointer;
    transition: transform var(--app__transition, 0.3s ease),
      box-shadow var(--app__transition, 0.3s ease),
      opacity var(--app__transition, 0.3s ease);
    box-shadow: 0 2px 8px rgba(var(--app__accent, 139, 92, 246), 0.28);
  }

  .chat__submit:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 15px rgba(var(--app__accent, 139, 92, 246), 0.38);
  }

  .chat__submit:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
  }

  .chat__submit svg {
    width: 1rem;
    height: 1rem;
  }

  .chat__loading {
    flex-shrink: 0;
    display: flex;
    justify-content: flex-start;
  }

  .chat__answer {
    flex-shrink: 0;
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1.25rem;
    background: var(--app__accent-muted, rgba(139, 92, 246, 0.05));
    border: 1px solid var(--app__border, rgba(139, 92, 246, 0.12));
    border-radius: var(--app__radius-lg, 1rem);
    animation: answer-fade-up 0.3s ease-out forwards;
  }

  .chat__answer-avatar {
    flex-shrink: 0;
    width: 2rem;
    height: 2rem;
    border-radius: 0.5rem;
    background: linear-gradient(135deg, #8b5cf6, #6366f1);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .chat__answer-avatar svg {
    width: 1rem;
    height: 1rem;
    color: white;
  }

  .chat__answer-body {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .chat__answer-label {
    margin: 0;
    font-size: 0.75rem;
    font-weight: 600;
    color: rgb(var(--app__accent, 139, 92, 246));
  }

  .chat__answer-text {
    font-size: 0.92rem;
    line-height: 1.62;
    color: var(--app__text-secondary, #94a3b8);
    overflow-wrap: anywhere;
  }

  /* ----- Markdown content (rendered with {@html}) ----- */
  .chat__answer-text :global(p),
  .chat__answer-text :global(ul),
  .chat__answer-text :global(ol),
  .chat__answer-text :global(pre),
  .chat__answer-text :global(blockquote),
  .chat__answer-text :global(table) {
    margin: 0 0 0.75rem;
  }

  .chat__answer-text :global(h1),
  .chat__answer-text :global(h2),
  .chat__answer-text :global(h3),
  .chat__answer-text :global(h4),
  .chat__answer-text :global(h5),
  .chat__answer-text :global(h6) {
    margin: 1.1rem 0 0.5rem;
    font-weight: 600;
    line-height: 1.35;
    color: var(--app__text-primary, #e2e8f0);
  }

  .chat__answer-text :global(h1) { font-size: 1.15rem; }
  .chat__answer-text :global(h2) { font-size: 1.05rem; }
  .chat__answer-text :global(h3) { font-size: 1rem; }
  .chat__answer-text :global(h4),
  .chat__answer-text :global(h5),
  .chat__answer-text :global(h6) { font-size: 0.95rem; }

  .chat__answer-text :global(:first-child) {
    margin-top: 0;
  }

  .chat__answer-text :global(:last-child) {
    margin-bottom: 0;
  }

  .chat__answer-text :global(strong) {
    font-weight: 600;
    color: var(--app__text-primary, #e2e8f0);
  }

  .chat__answer-text :global(ul),
  .chat__answer-text :global(ol) {
    padding-left: 1.25rem;
  }

  .chat__answer-text :global(li) {
    margin: 0.35rem 0;
  }

  .chat__answer-text :global(li > p) {
    margin-bottom: 0.4rem;
  }

  .chat__answer-text :global(li::marker) {
    color: rgb(var(--app__accent, 139, 92, 246));
  }

  .chat__answer-text :global(li ul),
  .chat__answer-text :global(li ol) {
    margin: 0.35rem 0 0;
  }

  .chat__answer-text :global(a) {
    color: rgb(var(--app__accent, 139, 92, 246));
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .chat__answer-text :global(code) {
    font-family: ui-monospace, SFMono-Regular, Consolas, 'Liberation Mono', monospace;
    font-size: 0.85em;
    padding: 0.1rem 0.35rem;
    border-radius: 0.35rem;
    background: var(--app__accent-soft, rgba(139, 92, 246, 0.1));
    color: var(--app__text-primary, #e2e8f0);
  }

  .chat__answer-text :global(pre) {
    padding: 0.75rem 1rem;
    border-radius: var(--app__radius-md, 0.75rem);
    border: 1px solid var(--app__border, rgba(139, 92, 246, 0.15));
    background: var(--app__bg-input, rgba(15, 15, 25, 0.8));
    overflow-x: auto;
  }

  .chat__answer-text :global(pre code) {
    padding: 0;
    background: none;
    font-size: 0.82rem;
    line-height: 1.55;
    white-space: pre;
    overflow-wrap: normal;
  }

  .chat__answer-text :global(blockquote) {
    padding-left: 0.85rem;
    border-left: 3px solid rgba(var(--app__accent, 139, 92, 246), 0.4);
    color: var(--app__text-muted, #64748b);
  }

  .chat__answer-text :global(hr) {
    margin: 1rem 0;
    border: none;
    border-top: 1px solid var(--app__border, rgba(139, 92, 246, 0.15));
  }

  .chat__answer-text :global(table) {
    display: block;
    max-width: 100%;
    overflow-x: auto;
    border-collapse: collapse;
    font-size: 0.85rem;
  }

  .chat__answer-text :global(th),
  .chat__answer-text :global(td) {
    padding: 0.4rem 0.65rem;
    border: 1px solid var(--app__border, rgba(139, 92, 246, 0.15));
    text-align: left;
    overflow-wrap: normal;
  }

  .chat__answer-text :global(th) {
    font-weight: 600;
    color: var(--app__text-primary, #e2e8f0);
    background: var(--app__accent-soft, rgba(139, 92, 246, 0.1));
  }

  @keyframes answer-fade-up {
    from {
      opacity: 0;
      transform: translateY(8px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
