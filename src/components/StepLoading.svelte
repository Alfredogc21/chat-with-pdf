<script>
</script>

<div class="loader">
  <div class="loader__spinner">
    <div class="loader__ring"></div>
    <div class="loader__ring loader__ring--mid"></div>
    <div class="loader__ring loader__ring--inner"></div>
    <svg class="loader__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  </div>
  <div class="loader__text">
    <p class="loader__title">Procesando documento</p>
    <p class="loader__desc">Subiendo el archivo y extrayendo el texto...</p>
  </div>
  <div class="loader__shimmer"></div>
</div>

<style>
  /* BEM: loader */
  .loader {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
    padding: 2rem 0;
  }

  .loader__spinner {
    position: relative;
    width: 5rem;
    height: 5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .loader__ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid transparent;
    border-top-color: rgba(var(--app__accent, 139, 92, 246), 0.6);
    animation: spin 1.2s linear infinite;
  }
  .loader__ring--mid {
    inset: 6px;
    border-top-color: rgba(129, 140, 248, 0.4);
    animation-duration: 1.8s;
    animation-direction: reverse;
  }
  .loader__ring--inner {
    inset: 12px;
    border-top-color: rgba(167, 139, 250, 0.3);
    animation-duration: 2.4s;
  }

  .loader__icon {
    width: 1.5rem;
    height: 1.5rem;
    color: rgba(167, 139, 250, 0.7);
    animation: pulse-glow 2s ease-in-out infinite;
  }

  .loader__text {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    text-align: center;
  }
  .loader__title {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--app__text-primary, #e2e8f0);
    margin: 0;
  }
  .loader__desc {
    font-size: 0.75rem;
    color: var(--app__text-muted, #64748b);
    margin: 0;
  }

  .loader__shimmer {
    width: 12rem;
    height: 3px;
    border-radius: 9999px;
    background: linear-gradient(90deg, transparent, rgba(var(--app__accent, 139, 92, 246), 0.5), transparent);
    background-size: 200% 100%;
    animation: shimmer 1.5s ease-in-out infinite;
  }
</style>
