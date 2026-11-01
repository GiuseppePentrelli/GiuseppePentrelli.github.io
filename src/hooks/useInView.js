import { useEffect, useRef, useState } from 'react'

// true dal momento in cui l'elemento entra nello schermo, e resta true: serve per le
// animazioni che devono partire quando qualcuno ci arriva scorrendo, non al caricamento
export function useInView({ threshold = 0.3 } = {}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element || visible) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { threshold }
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold, visible])

  return [ref, visible]
}
