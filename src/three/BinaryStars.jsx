import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { isPortrait, placeAt, useAspect } from './layout'
import StellarBody from './StellarBody'

export default function BinaryStars({ reduced }) {
  const orbit = useRef()
  const phase = useRef(0.55)
  const aspect = useAspect()
  const portrait = isPortrait(aspect)

  useFrame((_, delta) => {
    if (reduced) return
    phase.current += Math.min(delta, 0.1) * Math.PI * 2 / 48
    orbit.current.rotation.z = phase.current
  })

  return (
    <group position={placeAt(portrait ? [0.62, 0.28] : [0.77, 0.15], 105, aspect)} scale={portrait ? 0.65 : 1}>
      <group rotation={[0.7, 0.3, 0]}>
        <group ref={orbit} rotation={[0, 0, 0.55]}>
          <group position={[-1.45, 0, 0]}>
            <StellarBody radius={1.2} color="#ff943d" reduced={reduced} />
          </group>
          <group position={[2.35, 0, 0]}>
            <StellarBody radius={0.85} color="#73caff" reduced={reduced} />
          </group>
        </group>
      </group>
    </group>
  )
}
