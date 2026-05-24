import { ref, shallowRef } from 'vue'
import it from '@/locales/it.json'
import en from '@/locales/en.json'

const locales = { it, en }
export const SUPPORTED_LOCALES = ['it', 'en']

const locale = ref(
  (() => { try { return localStorage.getItem('novenix-locale') || 'it' } catch { return 'it' } })()
)

const messages = shallowRef(locales[locale.value])

document.documentElement.setAttribute('lang', locale.value)

export function useLocale() {
  function setLocale(val) {
    if (!SUPPORTED_LOCALES.includes(val)) return
    locale.value = val
    messages.value = locales[val]
    document.documentElement.setAttribute('lang', val)
    try { localStorage.setItem('novenix-locale', val) } catch {}
  }

  function t(key) {
    return messages.value?.[key] ?? key
  }

  return { locale, setLocale, t, SUPPORTED_LOCALES }
}
