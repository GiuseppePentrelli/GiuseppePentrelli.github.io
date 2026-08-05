import { useEffect, useRef } from 'react'

// richiama `callback` a intervalli casuali (tra minMs e maxMs) finché il
// componente resta montato. Non sa nulla di stelle o animazioni: generico,
// riusabile per qualsiasi evento "ogni tanto" (es. altre animazioni ambientali future).
export function useRandomInterval(callback, minMs, maxMs, { enabled = true } = {}) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    if (!enabled) return

    let timeoutId
    const schedule = () => {
      const delay = minMs + Math.random() * (maxMs - minMs)
      timeoutId = setTimeout(() => {
        callbackRef.current()
        schedule()
      }, delay)
    }
    schedule()

    return () => clearTimeout(timeoutId)
  }, [minMs, maxMs, enabled])
}
