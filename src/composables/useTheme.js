import { ref, computed } from 'vue'

function detectInitial() {
  try {
    const saved = localStorage.getItem('novenix-theme')
    if (saved) return saved
    const isDecember = new Date().getMonth() === 11
    return isDecember ? 'christmas' : 'default'
  } catch { return 'default' }
}

const theme = ref(detectInitial())

document.documentElement.setAttribute('data-christmas', String(theme.value === 'christmas'))

export function useTheme() {
  const isChristmas = computed(() => theme.value === 'christmas')

  function setTheme(val) {
    theme.value = val
    document.documentElement.setAttribute('data-christmas', String(val === 'christmas'))
    try { localStorage.setItem('novenix-theme', val) } catch {}
  }

  return { theme, isChristmas, setTheme }
}
