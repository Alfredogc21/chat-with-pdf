<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { PdfPreviewImage } from '../../utils/chat'

  export let images: PdfPreviewImage[] = []

  const dispatch = createEventDispatcher<{
    openPreview: { image: PdfPreviewImage; index: number }
  }>()

  const openPreview = (image: PdfPreviewImage, index: number) => {
    dispatch('openPreview', { image, index })
  }
</script>

<div class="preview-gallery">
  <div class="preview-gallery__header">
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
    </svg>
    <span>Vista previa del documento</span>
  </div>

  <div class="preview-gallery__grid">
    {#each images as image, index (image.page)}
      <button
        type="button"
        class="preview-gallery__thumb"
        style="animation-delay: {index * 0.08}s"
        on:click={() => openPreview(image, index)}
        aria-label={`Ver página ${image.page} en grande`}
      >
        <img
          class="preview-gallery__thumb-image"
          src={image.thumbnailUrl}
          alt={image.alt}
          loading="lazy"
        />

        <div class="preview-gallery__thumb-overlay" aria-hidden="true">
          <span class="preview-gallery__zoom-hint">Zoom</span>
        </div>

        <div class="preview-gallery__thumb-page" aria-hidden="true">
          <span>{image.page}</span>
        </div>
      </button>
    {/each}
  </div>
</div>

<style>
  .preview-gallery {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .preview-gallery__header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .preview-gallery__header svg {
    width: 1rem;
    height: 1rem;
    color: rgb(var(--app__accent, 139, 92, 246));
  }

  .preview-gallery__header span {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--app__text-muted, #64748b);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .preview-gallery__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
  }

  @media (min-width: 740px) {
    .preview-gallery__grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }

  .preview-gallery__thumb {
    position: relative;
    border: 1px solid var(--app__border, rgba(139, 92, 246, 0.15));
    border-radius: var(--app__radius-md, 0.75rem);
    overflow: hidden;
    padding: 0;
    background: transparent;
    cursor: zoom-in;
    transition: transform var(--app__transition, 0.3s ease),
      border-color var(--app__transition, 0.3s ease),
      box-shadow var(--app__transition, 0.3s ease);
    animation: gallery-fade-up 0.45s ease-out forwards;
    opacity: 0;
  }

  .preview-gallery__thumb:hover,
  .preview-gallery__thumb:focus-visible {
    transform: translateY(-2px);
    border-color: var(--app__border-hover, rgba(139, 92, 246, 0.35));
    box-shadow: 0 10px 20px rgba(var(--app__accent, 139, 92, 246), 0.15);
  }

  .preview-gallery__thumb:focus-visible {
    outline: 2px solid rgba(139, 92, 246, 0.7);
    outline-offset: 2px;
  }

  .preview-gallery__thumb-image {
    width: 100%;
    height: auto;
    aspect-ratio: 400 / 540;
    object-fit: cover;
    display: block;
  }

  .preview-gallery__thumb-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.05) 0%,
      rgba(0, 0, 0, 0.45) 100%
    );
    opacity: 0;
    transition: opacity var(--app__transition, 0.3s ease);
  }

  .preview-gallery__thumb:hover .preview-gallery__thumb-overlay,
  .preview-gallery__thumb:focus-visible .preview-gallery__thumb-overlay {
    opacity: 1;
  }

  .preview-gallery__zoom-hint {
    font-size: 0.75rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.88);
    border: 1px solid rgba(255, 255, 255, 0.35);
    border-radius: 9999px;
    padding: 0.2rem 0.5rem;
    backdrop-filter: blur(4px);
  }

  .preview-gallery__thumb-page {
    position: absolute;
    right: 0.45rem;
    bottom: 0.45rem;
    width: 1.55rem;
    height: 1.55rem;
    border-radius: 0.4rem;
    background: rgba(0, 0, 0, 0.6);
    color: rgba(255, 255, 255, 0.85);
    display: grid;
    place-items: center;
    font-size: 0.65rem;
    font-weight: 600;
  }

  @keyframes gallery-fade-up {
    from {
      opacity: 0;
      transform: translateY(6px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
