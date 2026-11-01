import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { isPortrait, placeAt, useAspect } from './layout'
import StellarBody from './StellarBody'

const START_PHASE = -0.65
const ORBIT_RADIUS = 4.2

export default function Eclipse({ reduced }) {
  const moon = useRef()
  const phase = useRef(START_PHASE)
  const aspect = useAspect()
  const portrait = isPortrait(aspect)

  useFrame((_, delta) => {
    if (reduced) return
    phase.current += Math.min(delta, 0.1) * Math.PI * 2 / 90
    moon.current.position.set(
      Math.sin(phase.current) * ORBIT_RADIUS,
      0,
      Math.cos(phase.current) * ORBIT_RADIUS,
    )
  })

  return (
    <group position={placeAt(portrait ? [-0.58, -0.58] : [-0.68, -0.43], 90, aspect)} scale={portrait ? 0.65 : 1}>
      <StellarBody radius={1.05} color="#ffad43" reduced={reduced} />
      <mesh ref={moon} position={[Math.sin(START_PHASE) * ORBIT_RADIUS, 0, Math.cos(START_PHASE) * ORBIT_RADIUS]}>
        <sphereGeometry args={[1.12, 32, 24]} />
        <meshStandardMaterial color="#182232" roughness={0.95} metalness={0} fog={false} />
      </mesh>
    </group>
  )
}
