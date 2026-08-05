import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { createBandedTexture, createCraterTexture, createToonGradient, createGlowTexture, createRingTexture } from './planetTextures'

// variant "bands" -> colors è un array di colori (le fasce, tipo Giove), spotColor è l'occhiolino opzionale
// variant "craters" -> colors è [colore base, ...colori delle macchie] (tipo Luna cartoon)
// orbitRadius/orbitSpeed/orbitPhase -> il pianeta gira lentamente attorno a orbitCenter, oltre a girare su se stesso
export default function Planet({
  variant,
  colors,
  spotColor,
  glowColor,
  outlineColor = '#050912',
  size = 1,
  speed = 0.05,
  axialTilt = 0,
  orbitCenter = [0, 0, 0],
  orbitRadius = 0,
  orbitSpeed = 0,
  orbitPhase = 0,
  ring,
  reduced,
}) {
  const groupRef = useRef()
  const spinRef = useRef()
  const angleRef = useRef(orbitPhase)

  // le texture si generano una volta sola, non ad ogni render
  const surfaceMap = useMemo(
    () => (variant === 'bands' ? createBandedTexture(colors, spotColor) : createCraterTexture(colors[0], colors.slice(1))),
    [variant, colors, spotColor],
  )
  const gradientMap = useMemo(() => createToonGradient(4), [])
  const glowMap = useMemo(() => createGlowTexture(glowColor), [glowColor])
  const ringMap = useMemo(() => (ring ? createRingTexture(ring.colors) : null), [ring])

  // posizione di partenza sull'orbita (serve anche se reduced motion tiene tutto fermo)
  const startPosition = [
    orbitCenter[0] + Math.cos(orbitPhase) * orbitRadius,
    orbitCenter[1] + Math.sin(orbitPhase) * orbitRadius * 0.4,
    orbitCenter[2],
  ]

  useFrame((_, delta) => {
    if (reduced) return

    spinRef.current.rotation.y += delta * speed

    if (orbitRadius > 0) {
      angleRef.current += delta * orbitSpeed
      // orbita "schiacciata" sull'asse y: sembra vista un po' di lato, non un cerchio perfetto piatto
      groupRef.current.position.set(
        orbitCenter[0] + Math.cos(angleRef.current) * orbitRadius,
        orbitCenter[1] + Math.sin(angleRef.current) * orbitRadius * 0.4,
        orbitCenter[2],
      )
    }
  })

  return (
    <group ref={groupRef} position={startPosition}>
      {/* axialTilt fisso sull'asse x: le bande sono strisce di latitudine pure, senza
          un'inclinazione diversa per ognuno girerebbero su se stesse senza mai cambiare aspetto */}
      <mesh ref={spinRef} rotation={[axialTilt, 0, 0]}>
        <sphereGeometry args={[size, 48, 48]} />
        <meshToonMaterial map={surfaceMap} gradientMap={gradientMap} />
      </mesh>
      {/* contorno cartoon: sfera leggermente più grande vista "da dentro" (BackSide),
          coperta al centro dalla sfera vera, resta visibile solo il bordo esterno */}
      <mesh scale={1.06}>
        <sphereGeometry args={[size, 48, 48]} />
        <meshBasicMaterial color={outlineColor} side={THREE.BackSide} />
      </mesh>
      {ring && (
        <mesh rotation={[ring.tilt ?? -1.1, 0, 0]}>
          <planeGeometry args={[size * 4.2, size * 4.2]} />
          <meshBasicMaterial map={ringMap} transparent alphaTest={0.1} side={THREE.DoubleSide} />
        </mesh>
      )}
      {/* alone di atmosfera: sprite dietro alla sfera, visibile solo attorno al bordo */}
      <Billboard>
        <mesh scale={size * 2.4}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={glowMap} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      </Billboard>
    </group>
  )
}
