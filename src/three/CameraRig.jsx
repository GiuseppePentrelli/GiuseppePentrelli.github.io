import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { LOOK_AT_Z } from './layout'

// quanto in fretta la camera raggiunge il mouse: damp usa il delta del frame, così la
// velocità è la stessa a 60 Hz e a 120 Hz (un lerp fisso per frame andava al doppio a 120 Hz)
const FOLLOW_SPEED = 1.8

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

  useFrame((state, delta) => {
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

    state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, x * 0.8, FOLLOW_SPEED, delta)
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, -y * 0.8, FOLLOW_SPEED, delta)
    state.camera.lookAt(0, 0, LOOK_AT_Z)
  })

  return null
}
