<script>
  import {
    setAppStatusLoading,
    setAppStatusError,
    setAppStatusChatMode,
  } from "../store.ts"
  import Dropzone from "svelte-file-dropzone"

  let files = {
    accepted: [],
    rejected: [],
  }

  let isDragging = false

  async function handleFilesSelect(e) {
    const { acceptedFiles, fileRejections } = e.detail
    isDragging = false

    files.accepted = [...files.accepted, ...acceptedFiles]
    files.rejected = [...files.rejected, ...fileRejections]

    if (acceptedFiles.length > 0) {
      setAppStatusLoading()

      const formData = new FormData()
      formData.append("file", acceptedFiles[0])

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        setAppStatusError()
        return
      }

      const { id, url, pages } = await res.json()
      setAppStatusChatMode({ id, url, pages })
    }
  }
</script>

{#if files.accepted.length === 0}
  <div class="upload" class:upload--dragging={isDragging}>
    <Dropzone
      accept="application/pdf"
      multiple={false}
      on:drop={handleFilesSelect}
      on:dragenter={() => isDragging = true}
      on:dragleave={() => isDragging = false}
      containerClasses="upload__dropzone"
    >
      <div class="upload__content">
        <div class="upload__icon">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>
        <div class="upload__text">
          <p class="upload__title">Arrastra y suelta aquí tu PDF</p>
          <p class="upload__hint">o haz clic para seleccionar un archivo</p>
        </div>
        <div class="upload__badge">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <span>Solo PDF</span>
        </div>
      </div>
    </Dropzone>
  </div>
{:else}
  <div class="upload__success">
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <span>{files.accepted[0].name}</span>
  </div>
{/if}

<style>
  /* BEM: upload */
  .upload {
    transition: all var(--app__transition, 0.3s ease);
  }

  .upload :global(.upload__dropzone) {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px dashed var(--app__border, rgba(139, 92, 246, 0.25));
    border-radius: var(--app__radius-lg, 1rem);
    background: var(--app__accent-muted, rgba(139, 92, 246, 0.03));
    padding: 2rem 1.5rem;
    cursor: pointer;
    transition: all var(--app__transition, 0.3s ease);
    text-align: center;
  }

  .upload :global(.upload__dropzone:hover) {
    border-color: var(--app__border-hover, rgba(139, 92, 246, 0.5));
    background: var(--app__bg-hover, rgba(139, 92, 246, 0.06));
  }

  .upload--dragging :global(.upload__dropzone) {
    border-color: rgba(139, 92, 246, 0.7);
    background: rgba(139, 92, 246, 0.1);
    box-shadow: 0 0 30px rgba(139, 92, 246, 0.12);
  }

  .upload__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 1rem 0;
  }

  .upload__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 4rem;
    height: 4rem;
    border-radius: var(--app__radius-lg, 1rem);
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(99, 102, 241, 0.1));
    border: 1px solid rgba(139, 92, 246, 0.2);
    animation: float 6s ease-in-out infinite;
  }
  .upload__icon svg {
    width: 2.25rem;
    height: 2.25rem;
    color: rgb(var(--app__accent, 139, 92, 246));
  }

  .upload__text {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }
  .upload__title {
    font-size: 1rem;
    font-weight: 500;
    color: var(--app__text-primary, #e2e8f0);
    margin: 0;
  }
  .upload__hint {
    font-size: 0.875rem;
    color: var(--app__text-muted, #64748b);
    margin: 0;
  }

  .upload__badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.75rem;
    border-radius: 9999px;
    background: var(--app__accent-soft, rgba(139, 92, 246, 0.1));
    border: 1px solid rgba(139, 92, 246, 0.2);
  }
  .upload__badge svg {
    width: 0.875rem;
    height: 0.875rem;
    color: rgb(var(--app__accent, 139, 92, 246));
  }
  .upload__badge span {
    font-size: 0.75rem;
    font-weight: 500;
    color: #a78bfa;
  }

  .upload__success {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem;
    border-radius: var(--app__radius-md, 0.75rem);
    background: var(--app__accent-soft, rgba(139, 92, 246, 0.1));
    border: 1px solid rgba(139, 92, 246, 0.2);
  }
  .upload__success svg {
    width: 1.25rem;
    height: 1.25rem;
    flex-shrink: 0;
    color: rgb(var(--app__accent, 139, 92, 246));
  }
  .upload__success span {
    font-size: 0.875rem;
    color: var(--app__text-secondary, #94a3b8);
  }
</style>
