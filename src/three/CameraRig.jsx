import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// il canvas ha pointer-events-none, quindi non riceve mai eventi mouse:
// il tracking va fatto ascoltando window, non il canvas
export default function CameraRig({ reduced }) {
  const pointer = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useFrame((state) => {
    // reduced motion: niente inseguimento del mouse, la camera resta ferma al centro
    let { x, y } = reduced ? { x: 0, y: 0 } : pointer.current

    // il mouse si muove in un rettangolo, ma senza questo limite il percorso
    // della camera diventa "quadrato" (raggiunge di più negli angoli che ai lati).
    // clampando la lunghezza del vettore a 1 il bordo raggiungibile diventa un cerchio
    const len = Math.hypot(x, y)
    if (len > 1) {
      x /= len
      y /= len
    }

    // lerp = movimento morbido verso il target, non uno scatto secco
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, x * 0.8, 0.03)
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, -y * 0.8, 0.03)
    state.camera.lookAt(0, 0, 0)
  })

  return null
}
