<script lang="ts">
  export let showText = true
  export let text = 'Buscando respuesta...'
</script>

<div class="chat-loading" role="status" aria-live="polite" aria-label={text}>
  <span class="chat-loading__ring" aria-hidden="true"></span>

  {#if showText}
    <span class="chat-loading__text">{text}</span>
  {/if}
</div>

<style>
  .chat-loading {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    padding: 0.38rem 0.75rem;
    border-radius: 9999px;
    border: 1px solid rgba(139, 92, 246, 0.3);
    background: rgba(139, 92, 246, 0.08);
    min-height: 2rem;
  }

  .chat-loading__ring {
    width: 0.8rem;
    height: 0.8rem;
    border-radius: 50%;
    border: 2px solid rgba(139, 92, 246, 0.16);
    border-top-color: rgb(139, 92, 246);
    animation: ring-spin 0.85s linear infinite;
  }

  .chat-loading__text {
    font-size: 0.74rem;
    font-weight: 500;
    color: #a78bfa;
    letter-spacing: 0.01em;
  }

  @keyframes ring-spin {
    from {
      transform: rotate(0deg);
    }

    to {
      transform: rotate(360deg);
    }
  }
</style>
