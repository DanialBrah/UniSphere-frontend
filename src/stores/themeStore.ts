import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeStore {
  isDark: boolean
  toggle: () => void
}

function applyTheme(isDark: boolean) {
  document.documentElement.classList.toggle('dark', isDark)
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      isDark: false,
      toggle: () => {
        const next = !get().isDark
        applyTheme(next)
        set({ isDark: next })
      },
    }),
    {
      name: 'unisphere-theme',
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.isDark)
      },
    }
  )
)
