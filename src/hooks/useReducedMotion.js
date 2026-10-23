import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'novenix-reduced-motion'

// con i dati del sito bloccati alcuni browser lanciano un errore appena si tocca localStorage:
// in quel caso la scelta semplicemente non si ricorda, ma il sito parte lo stesso
function readChoice() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function saveChoice(value) {
  try {
    localStorage.setItem(STORAGE_KEY, String(value))
  } catch {
    // niente da fare: vale solo per questa visita
  }
}

// parte dalla preferenza di sistema, ma se l'utente la cambia dal sito
// quella scelta manuale vince sempre, anche dopo un refresh
export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => {
    const saved = readChoice()
    if (saved !== null) return saved === 'true'
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    if (readChoice() !== null) return // scelta manuale già fatta, ignora il sistema
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (e) => setReduced(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const toggle = useCallback(() => {
    setReduced((prev) => {
      const next = !prev
      saveChoice(next)
      return next
    })
  }, [])

  return [reduced, toggle]
}
