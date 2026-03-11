<script>
  import { appStatusInfo, setAppStatusError } from "../store"
  const { url, pages, id } = $appStatusInfo

  let answer = ""
  let loading = false

  const numOfImagesToShow = Math.min(pages, 4)
  const images = Array.from({ length: numOfImagesToShow }, (_, i) => {
    const page = i + 1
    return url
      .replace("/upload/", `/upload/w_400,h_540,c_fill,pg_${page}/`)
      .replace(".pdf", ".jpg")
  })

  const handleSubmit = async (event) => {
    event.preventDefault()

    loading = true
    answer = ""
    const question = event.target.question.value

    const searchParams = new URLSearchParams()
    searchParams.append("id", id)
    searchParams.append("question", question)

    try {
      const eventSource = new EventSource(`/api/ask?${searchParams.toString()}`)

      eventSource.onmessage = (event) => {
        loading = false
        const incomingData = JSON.parse(event.data)

        if (incomingData === "__END__") {
          eventSource.close()
          return
        }

        answer += incomingData
      }
    } catch (e) {
      setAppStatusError()
    } finally {
      loading = false
    }
  }
</script>

<!-- BEM: chat -->
<div class="chat">
  <!-- Preview section -->
  <div class="chat__preview">
    <div class="chat__preview-header">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
      </svg>
      <span>Vista previa del documento</span>
    </div>
    <div class="chat__thumbnails">
      {#each images as image, i}
        <div class="chat__thumb" style="animation-delay: {i * 0.1}s">
          <img
            class="chat__thumb-img"
            src={image}
            alt="PDF page {i + 1}"
          />
          <div class="chat__thumb-badge">
            <span>{i + 1}</span>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Question form -->
  <form class="chat__form" on:submit={handleSubmit}>
    <label class="chat__label" for="question">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
      <span>Hazle una pregunta a tu PDF</span>
    </label>
    <div class="chat__input-wrap">
      <input
        id="question"
        name="question"
        class="input chat__input"
        required
        placeholder="¿De qué trata este documento?"
        autocomplete="off"
      />
      <button
        type="submit"
        class="chat__submit"
        disabled={loading}
        aria-label="Enviar pregunta"
      >
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
      </button>
    </div>
  </form>

  <!-- Loading indicator -->
  {#if loading}
    <div class="chat__loading">
      <div class="chat__loading-pill">
        <div class="chat__loading-dots">
          <span class="chat__loading-dot" style="animation-delay: 0s;"></span>
          <span class="chat__loading-dot" style="animation-delay: 0.15s;"></span>
          <span class="chat__loading-dot" style="animation-delay: 0.3s;"></span>
        </div>
        <span class="chat__loading-text">Pensando...</span>
      </div>
    </div>
  {/if}

  <!-- Answer -->
  {#if answer}
    <div class="chat__answer">
      <div class="chat__answer-avatar">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
        </svg>
      </div>
      <div class="chat__answer-body">
        <p class="chat__answer-label">Respuesta IA</p>
        <p class="chat__answer-text">{answer}</p>
      </div>
    </div>
  {/if}
</div>

<style>
  /* BEM: chat */
  .chat {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /* chat__preview */
  .chat__preview {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .chat__preview-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .chat__preview-header svg {
    width: 1rem;
    height: 1rem;
    color: rgb(var(--app__accent, 139, 92, 246));
  }
  .chat__preview-header span {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--app__text-muted, #64748b);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* chat__thumbnails */
  .chat__thumbnails {
    display: flex;
    gap: 0.75rem;
  }
  .chat__thumb {
    position: relative;
    flex: 1;
    border-radius: var(--app__radius-md, 0.75rem);
    overflow: hidden;
    border: 1px solid var(--app__border, rgba(139, 92, 246, 0.15));
    transition: all var(--app__transition, 0.3s ease);
    animation: fade-in-up 0.5s ease-out forwards;
    opacity: 0;
  }
  .chat__thumb:hover {
    border-color: var(--app__border-hover, rgba(139, 92, 246, 0.4));
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(var(--app__accent, 139, 92, 246), 0.12);
  }
  .chat__thumb-img {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 400/540;
    object-fit: cover;
    border-radius: inherit;
  }
  .chat__thumb-badge {
    position: absolute;
    bottom: 0.5rem;
    right: 0.5rem;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 0.375rem;
    background: var(--app__badge-bg, rgba(0, 0, 0, 0.6));
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.625rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
  }

  /* chat__form */
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
    padding: 0.5rem;
    border-radius: 0.5rem;
    background: linear-gradient(135deg, #8b5cf6, #6366f1);
    color: white;
    border: none;
    cursor: pointer;
    transition: all var(--app__transition, 0.3s ease);
    box-shadow: 0 2px 8px rgba(var(--app__accent, 139, 92, 246), 0.3);
  }
  .chat__submit:hover {
    box-shadow: 0 4px 16px rgba(var(--app__accent, 139, 92, 246), 0.4);
    transform: scale(1.05);
  }
  .chat__submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  .chat__submit svg {
    width: 1rem;
    height: 1rem;
  }

  /* chat__loading */
  .chat__loading {
    display: flex;
    justify-content: center;
  }
  .chat__loading-pill {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border-radius: 9999px;
    background: var(--app__accent-soft, rgba(139, 92, 246, 0.1));
    border: 1px solid rgba(139, 92, 246, 0.2);
  }
  .chat__loading-dots {
    display: flex;
    gap: 0.25rem;
  }
  .chat__loading-dot {
    width: 0.375rem;
    height: 0.375rem;
    border-radius: 50%;
    background: rgb(var(--app__accent, 139, 92, 246));
    animation: bounce 1s ease-in-out infinite;
  }
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }
  .chat__loading-text {
    font-size: 0.75rem;
    font-weight: 500;
    color: #a78bfa;
  }

  /* chat__answer */
  .chat__answer {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1.25rem;
    background: var(--app__accent-muted, rgba(139, 92, 246, 0.05));
    border: 1px solid var(--app__border, rgba(139, 92, 246, 0.12));
    border-radius: var(--app__radius-lg, 1rem);
    animation: fade-in-up 0.4s ease-out forwards;
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
    gap: 0.375rem;
  }
  .chat__answer-label {
    font-size: 0.75rem;
    font-weight: 500;
    color: rgb(var(--app__accent, 139, 92, 246));
    margin: 0;
  }
  .chat__answer-text {
    font-size: 0.875rem;
    color: var(--app__text-secondary, #94a3b8);
    line-height: 1.6;
    margin: 0;
  }
</style>
