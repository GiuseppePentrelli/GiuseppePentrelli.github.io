import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'novenix-reduced-motion'

// parte dalla preferenza di sistema, ma se l'utente la cambia dal sito
// quella scelta manuale vince sempre, anche dopo un refresh
export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved !== null) return saved === 'true'
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY) !== null) return // scelta manuale già fatta, ignora il sistema
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (e) => setReduced(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const toggle = useCallback(() => {
    setReduced((prev) => {
      const next = !prev
      localStorage.setItem(STORAGE_KEY, String(next))
      return next
    })
  }, [])

  return [reduced, toggle]
}
