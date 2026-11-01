import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Dish, ModelMaterials, NovenixBadge, SolarPanel, Strut, ToonMesh } from './ModelParts'
import { palette } from '../palette'

export default function SpaceProbe({ reduced = false }) {
  const bodyRef = useRef(null)
  const dishRef = useRef(null)
  const elapsed = useRef(0)

  useFrame((_, delta) => {
    if (reduced) return
    elapsed.current += Math.min(delta, 0.1)
    bodyRef.current.position.y = Math.sin(elapsed.current * 0.7) * 0.1
    bodyRef.current.rotation.y = -0.35 + Math.sin(elapsed.current * 0.18) * 0.25
    bodyRef.current.rotation.z = 0.1 + Math.sin(elapsed.current * 0.35) * 0.035
    dishRef.current.rotation.y = Math.sin(elapsed.current * 0.35) * 0.3
  })

  return (
    <ModelMaterials>
      <group ref={bodyRef} rotation={[0.1, -0.35, 0.1]}>
        <ToonMesh color="yellow"><cylinderGeometry args={[0.52, 0.52, 0.85, 6]} /></ToonMesh>
        <ToonMesh position={[0, 0.43, 0]}><cylinderGeometry args={[0.56, 0.56, 0.12, 6]} /></ToonMesh>
        <ToonMesh color="orange" position={[0, -0.43, 0]}><cylinderGeometry args={[0.55, 0.55, 0.1, 6]} /></ToonMesh>
        <NovenixBadge position={[0, 0, 0.54]} radius={0.2} />
        {[-1, 1].map((side) => (
          <group key={side}>
            <Strut from={[side * 0.45, 0, 0]} to={[side * 1.65, 0, 0]} radius={0.06} />
            <SolarPanel position={[side * 1.65, 0, 0]} rotation={[0, side * -0.15, 0]} width={1.55} height={1.15} />
          </group>
        ))}
        <Strut from={[0, 0.45, 0]} to={[0, 0.8, 0]} radius={0.08} />
        <group ref={dishRef} position={[0, 1.1, 0]}>
          <Dish rotation={[0.8, 0, 0]} />
        </group>
        <Strut from={[0.28, 0.4, 0]} to={[0.75, 1.55, -0.15]} radius={0.025} />
        <mesh position={[0.75, 1.55, -0.15]}><sphereGeometry args={[0.055, 12, 8]} /><meshBasicMaterial color={palette.cyan} /></mesh>
        {[-1, 1].map((side) => (
          <ToonMesh key={side} color="consoleGray" position={[side * 0.25, -0.63, 0]}><cylinderGeometry args={[0.1, 0.16, 0.25, 10]} /></ToonMesh>
        ))}
      </group>
    </ModelMaterials>
  )
}
