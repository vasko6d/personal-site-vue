import { defineStore } from 'pinia'

export type Theme = 'light' | 'dark' | 'blue' | 'pink'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: 'light' as Theme,
  }),
  getters: {
    themeMatches: (state) => (matchTheme: Theme) => state.theme === matchTheme,
  },
  actions: {
    setTheme(theme: Theme) {
      localStorage.theme = theme
      this.theme = theme
    },
  },
})
