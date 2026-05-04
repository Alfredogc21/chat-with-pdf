<script lang="ts">
  import { onDestroy } from 'svelte'
  import { tick } from 'svelte'
  import { createEventDispatcher } from 'svelte'
  import type { PdfPreviewImage } from '../../utils/chat'

  export let isOpen = false
  export let image: PdfPreviewImage | null = null
  export let canGoPrev = false
  export let canGoNext = false

  const dispatch = createEventDispatcher<{
    close: null
    prev: null
    next: null
  }>()

  const ZOOM_STEP = 0.2
  const MIN_ZOOM = 0.6
  const MAX_ZOOM = 2.6

  let zoom = 1
  let fitWidth = 900
  let isDragging = false

  let dragStartX = 0
  let dragStartY = 0
  let dragScrollLeft = 0
  let dragScrollTop = 0

  let viewportEl: HTMLDivElement | null = null

  const portal = (node: HTMLElement) => {
    if (typeof document === 'undefined') {
      return {}
    }

    document.body.appendChild(node)

    return {
      destroy() {
        if (node.parentNode === document.body) {
          document.body.removeChild(node)
        }
      },
    }
  }

  const updateFitWidth = () => {
    if (!viewportEl) {
      return
    }

    const horizontalPadding = 28
    fitWidth = Math.max(320, Math.floor(viewportEl.clientWidth - horizontalPadding))
  }

  const syncViewportDimensions = async () => {
    await tick()
    updateFitWidth()
  }

  $: if (isOpen && image) {
    syncViewportDimensions()
  }

  $: if (typeof document !== 'undefined') {
    document.body.style.overflow = isOpen ? 'hidden' : ''
  }

  const registerWheelZoom = (node: HTMLElement) => {
    const handleWheel = (event: WheelEvent) => {
      if (!(event.ctrlKey || event.metaKey)) {
        return
      }

      event.preventDefault()

      if (event.deltaY < 0) {
        zoomIn()
      } else {
        zoomOut()
      }
    }

    node.addEventListener('wheel', handleWheel, { passive: false })

    return {
      destroy() {
        node.removeEventListener('wheel', handleWheel)
      },
    }
  }

  const close = () => {
    isDragging = false
    zoom = 1
    dispatch('close', null)
  }

  const goPrev = () => {
    if (!canGoPrev) {
      return
    }

    zoom = 1
    dispatch('prev', null)
  }

  const goNext = () => {
    if (!canGoNext) {
      return
    }

    zoom = 1
    dispatch('next', null)
  }

  const zoomIn = () => {
    zoom = Math.min(MAX_ZOOM, Number((zoom + ZOOM_STEP).toFixed(2)))
  }

  const zoomOut = () => {
    zoom = Math.max(MIN_ZOOM, Number((zoom - ZOOM_STEP).toFixed(2)))
  }

  const resetZoom = () => {
    zoom = 1
  }

  const handleBackdropClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement

    if (target.classList.contains('preview-modal')) {
      close()
    }
  }

  const handleKeydown = (event: KeyboardEvent) => {
    if (!isOpen) {
      return
    }

    if (event.key === 'Escape') {
      close()
      return
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      goPrev()
      return
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      goNext()
      return
    }

    if (event.key === '0' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      resetZoom()
      return
    }

    if ((event.key === '+' || event.key === '=') && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      zoomIn()
    }

    if (event.key === '-' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      zoomOut()
    }
  }

  const handleResize = () => {
    if (!isOpen) {
      return
    }

    updateFitWidth()
  }

  const handleDragStart = (event: MouseEvent) => {
    if (!viewportEl || zoom <= 1 || event.button !== 0) {
      return
    }

    isDragging = true
    dragStartX = event.clientX
    dragStartY = event.clientY
    dragScrollLeft = viewportEl.scrollLeft
    dragScrollTop = viewportEl.scrollTop
  }

  const handleDragMove = (event: MouseEvent) => {
    if (!viewportEl || !isDragging) {
      return
    }

    event.preventDefault()

    const deltaX = event.clientX - dragStartX
    const deltaY = event.clientY - dragStartY

    viewportEl.scrollLeft = dragScrollLeft - deltaX
    viewportEl.scrollTop = dragScrollTop - deltaY
  }

  const handleDragEnd = () => {
    if (!isDragging) {
      return
    }

    isDragging = false
  }

  onDestroy(() => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = ''
    }
  })
</script>

<svelte:window
  on:keydown={handleKeydown}
  on:resize={handleResize}
  on:mousemove={handleDragMove}
  on:mouseup={handleDragEnd}
/>

{#if isOpen && image}
  <div class="preview-modal" role="dialog" aria-modal="true" aria-label={`Vista ampliada de la página ${image.page}`} on:click={handleBackdropClick} use:portal>
    <div class="preview-modal__dialog" use:registerWheelZoom>
      <header class="preview-modal__header">
        <div class="preview-modal__title-wrap">
          <p class="preview-modal__title">Página {image.page}</p>
          <p class="preview-modal__subtitle">Arrastra para mover, usa ← → para navegar y Ctrl/Cmd + rueda para zoom</p>
        </div>

        <div class="preview-modal__actions">
          <button
            type="button"
            class="preview-modal__btn"
            on:click={goPrev}
            disabled={!canGoPrev}
            aria-label="Página anterior"
          >
            ←
          </button>
          <button
            type="button"
            class="preview-modal__btn"
            on:click={zoomOut}
            disabled={zoom <= MIN_ZOOM}
            aria-label="Alejar"
          >
            -
          </button>
          <button
            type="button"
            class="preview-modal__btn"
            on:click={resetZoom}
            aria-label="Restablecer zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            type="button"
            class="preview-modal__btn"
            on:click={zoomIn}
            disabled={zoom >= MAX_ZOOM}
            aria-label="Acercar"
          >
            +
          </button>
          <button
            type="button"
            class="preview-modal__btn"
            on:click={goNext}
            disabled={!canGoNext}
            aria-label="Página siguiente"
          >
            →
          </button>
          <button
            type="button"
            class="preview-modal__close"
            on:click={close}
            aria-label="Cerrar vista previa"
          >
            ✕
          </button>
        </div>
      </header>

      <div
        class="preview-modal__body"
        class:preview-modal__body--draggable={zoom > 1}
        class:preview-modal__body--dragging={isDragging}
        bind:this={viewportEl}
        on:mousedown={handleDragStart}
        on:mouseleave={handleDragEnd}
      >
        <div class="preview-modal__canvas">
          <img
            src={image.previewUrl}
            alt={image.alt}
            class="preview-modal__image"
            draggable="false"
            style={`width: ${Math.round(fitWidth * zoom)}px;`}
          />
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .preview-modal {
    position: fixed;
    inset: 0;
    z-index: 60;
    background: rgba(6, 8, 16, 0.78);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    animation: modal-backdrop-in 0.2s ease;
  }

  .preview-modal__dialog {
    width: min(1240px, 100%);
    max-height: 92vh;
    display: flex;
    flex-direction: column;
    border-radius: 1rem;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: rgba(10, 12, 22, 0.92);
    overflow: hidden;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.45);
    animation: modal-dialog-in 0.24s ease;
  }

  .preview-modal__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(16, 20, 36, 0.85);
  }

  .preview-modal__title-wrap {
    min-width: 0;
  }

  .preview-modal__title {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
    color: rgba(235, 236, 241, 0.95);
  }

  .preview-modal__subtitle {
    margin: 0.15rem 0 0;
    font-size: 0.75rem;
    color: rgba(180, 187, 201, 0.82);
  }

  .preview-modal__actions {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex-shrink: 0;
  }

  .preview-modal__btn,
  .preview-modal__close {
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 0.45rem;
    min-width: 2rem;
    height: 2rem;
    background: rgba(255, 255, 255, 0.05);
    color: rgba(244, 246, 253, 0.95);
    font-size: 0.82rem;
    line-height: 1;
    cursor: pointer;
    transition: background 0.2s ease, border-color 0.2s ease;
  }

  .preview-modal__btn:hover,
  .preview-modal__close:hover {
    background: rgba(139, 92, 246, 0.18);
    border-color: rgba(139, 92, 246, 0.45);
  }

  .preview-modal__btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .preview-modal__close {
    font-size: 1rem;
  }

  .preview-modal__body {
    display: block;
    padding: 0.7rem;
    overflow: auto;
    overscroll-behavior: contain;
    background: radial-gradient(circle at center, rgba(255, 255, 255, 0.06), rgba(5, 7, 12, 0.95));
  }

  .preview-modal__body--draggable {
    cursor: grab;
  }

  .preview-modal__body--dragging {
    cursor: grabbing;
    user-select: none;
  }

  .preview-modal__canvas {
    width: max-content;
    min-width: 100%;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 0.4rem;
  }

  .preview-modal__image {
    width: 1120px;
    height: auto;
    max-width: none;
    transition: width 0.14s ease;
    border-radius: 0.75rem;
    box-shadow: 0 16px 38px rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.18);
    user-select: none;
    -webkit-user-drag: none;
    pointer-events: none;
  }

  @media (max-width: 680px) {
    .preview-modal {
      padding: 0.5rem;
    }

    .preview-modal__dialog {
      max-height: 95vh;
    }

    .preview-modal__header {
      align-items: flex-start;
      flex-direction: column;
    }

    .preview-modal__actions {
      width: 100%;
      justify-content: flex-end;
    }
  }

  @keyframes modal-backdrop-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes modal-dialog-in {
    from {
      opacity: 0;
      transform: translateY(8px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
</style>
