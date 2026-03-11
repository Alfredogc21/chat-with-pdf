import { writable } from 'svelte/store'

export const APP_STATUS = {
  INIT: 0,
  LOADING: 1,
  CHAT_MODE: 2,
  ERROR: -1
}

export const appStatus = writable(APP_STATUS.INIT)
export const appStatusInfo = writable({
  id: 'c1a098ffcb49079c8180b18c7b15229a',
  url: 'https://res.cloudinary.com/midudev/image/upload/v1706810969/pdf/khiice5vqnr1gcn1pmtq.pdf',
  pages: 4
})

export const setAppStatusLoading = () => {
  appStatus.set(APP_STATUS.LOADING)
}

export const setAppStatusError = () => {
  appStatus.set(APP_STATUS.ERROR)
}

export const setAppStatusChatMode = (
  { id, url, pages } :
  { id: string, url: string, pages: number }) => {
  appStatus.set(APP_STATUS.CHAT_MODE)
  appStatusInfo.set({ id, url, pages })
}

// Theme: 'light' | 'dark' | 'system'
export type ThemeMode = 'light' | 'dark' | 'system'
export const themeMode = writable<ThemeMode>('system')

export const setThemeMode = (mode: ThemeMode) => {
  themeMode.set(mode)
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('theme', mode)
  }
  applyTheme(mode)
}

export const applyTheme = (mode: ThemeMode) => {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (mode === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.classList.toggle('dark', prefersDark)
    root.classList.toggle('light', !prefersDark)
  } else {
    root.classList.toggle('dark', mode === 'dark')
    root.classList.toggle('light', mode === 'light')
  }
}

export const initTheme = () => {
  if (typeof localStorage === 'undefined') return
  const saved = localStorage.getItem('theme') as ThemeMode | null
  const mode = saved || 'system'
  themeMode.set(mode)
  applyTheme(mode)

  // Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const current = localStorage.getItem('theme') as ThemeMode | null
    if (!current || current === 'system') {
      applyTheme('system')
    }
  })
}