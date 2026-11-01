import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'

const frameBounds = () => [55, 59]

export default function RenderBudget() {
  const get = useThree((state) => state.get)
  const setDpr = useThree((state) => state.setDpr)
  const setFrameloop = useThree((state) => state.setFrameloop)

  useEffect(() => {
    const update = () => {
      const elapsed = get().clock.elapsedTime
      setFrameloop(document.hidden ? 'never' : 'always')
      get().clock.elapsedTime = elapsed
    }
    document.addEventListener('visibilitychange', update)
    update()
    return () => document.removeEventListener('visibilitychange', update)
  }, [get, setFrameloop])

  return (
    <PerformanceMonitor
      ms={500}
      iterations={6}
      bounds={frameBounds}
      onDecline={() => {
        const current = get().viewport.dpr
        const next = Math.max(1, current - 0.25)
        if (next !== current) setDpr(next)
      }}
      onIncline={() => {
        const { dpr, initialDpr } = get().viewport
        const next = Math.min(initialDpr, dpr + 0.25)
        if (next !== dpr) setDpr(next)
      }}
    />
  )
}
