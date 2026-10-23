import { useEffect, useRef } from 'react'

// solo in sviluppo: con ?evento=<nome> nell'indirizzo (es. localhost:5173/?evento=nova)
// quell'evento parte ogni 2-4 secondi invece di aspettare minuti, per vederlo e provarlo.
// In produzione import.meta.env.DEV è false e questo codice sparisce dalla build
const PREVIEW_EVENT = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('evento') : null
const PREVIEW_MIN_MS = 2000
const PREVIEW_MAX_MS = 4000

// richiama `callback` a intervalli casuali (tra minMs e maxMs) finché il
// componente resta montato. Non sa nulla di stelle o animazioni: generico,
// riusabile per qualsiasi evento "ogni tanto" (es. altre animazioni ambientali future).
// `name` serve solo all'anteprima in sviluppo descritta sopra
export function useRandomInterval(callback, minMs, maxMs, { enabled = true, name } = {}) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  const preview = name !== undefined && name === PREVIEW_EVENT
  const min = preview ? PREVIEW_MIN_MS : minMs
  const max = preview ? PREVIEW_MAX_MS : maxMs

  useEffect(() => {
    if (!enabled) return

    let timeoutId
    const schedule = () => {
      const delay = min + Math.random() * (max - min)
      timeoutId = setTimeout(() => {
        callbackRef.current()
        schedule()
      }, delay)
    }
    schedule()

    return () => clearTimeout(timeoutId)
  }, [min, max, enabled])
}
