<script>
  import { APP_STATUS, appStatus } from "../store.ts"
  import StepUpload from "./StepUpload.svelte"
  import StepLoading from "./StepLoading.svelte"
  import StepChat from "./StepChat.svelte"
</script>

{#if $appStatus === APP_STATUS.INIT}
  <StepUpload />
{:else if $appStatus === APP_STATUS.LOADING}
  <StepLoading />
{:else if $appStatus === APP_STATUS.ERROR}
  <div class="alert alert--error">
    <svg class="alert__icon alert__icon--error" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
    <div>
      <p class="alert__title alert__title--error">¡Algo malo ha pasado!</p>
      <p class="alert__desc">Hay un error en la aplicación. Recarga la página para intentarlo de nuevo.</p>
    </div>
  </div>
{:else if $appStatus === APP_STATUS.CHAT_MODE}
  <StepChat />
{:else}
  <div class="alert alert--warning">
    <svg class="alert__icon alert__icon--warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
    <div>
      <p class="alert__title alert__title--warning">Acción no reconocida</p>
      <p class="alert__desc">Este estado de la aplicación no está reconocido.</p>
    </div>
  </div>
{/if}
