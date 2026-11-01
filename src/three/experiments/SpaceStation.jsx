import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ModelMaterials, NovenixBadge, SolarPanel, Strut, ToonMesh } from './ModelParts'
import { palette } from '../palette'

export default function SpaceStation({ reduced = false }) {
  const bodyRef = useRef(null)
  const ringRef = useRef(null)
  const elapsed = useRef(0)

  useFrame((_, delta) => {
    if (reduced) return
    elapsed.current += Math.min(delta, 0.1)
    bodyRef.current.position.y = Math.sin(elapsed.current * 0.6) * 0.06
    bodyRef.current.rotation.y = -0.35 + Math.sin(elapsed.current * 0.16) * 0.12
    ringRef.current.rotation.z = elapsed.current * 0.18
  })

  return (
    <ModelMaterials>
      <group ref={bodyRef} rotation={[0.35, -0.35, -0.12]}>
        <group ref={ringRef}>
          <ToonMesh><torusGeometry args={[1.65, 0.19, 10, 64]} /></ToonMesh>
          <ToonMesh color="orange" position={[0, 0, 0.13]}><torusGeometry args={[1.65, 0.055, 6, 64]} /></ToonMesh>
          {[0, 1, 2, 3].map((i) => {
            const angle = i * Math.PI / 2
            return <Strut key={i} from={[Math.cos(angle) * 0.3, Math.sin(angle) * 0.3, -0.08]} to={[Math.cos(angle) * 1.65, Math.sin(angle) * 1.65, -0.08]} radius={0.065} />
          })}
          {Array.from({ length: 6 }, (_, i) => {
            const angle = i * Math.PI / 3
            return (
              <group key={i} position={[Math.cos(angle) * 1.65, Math.sin(angle) * 1.65, 0]} rotation={[0, 0, angle]}>
                <ToonMesh><boxGeometry args={[0.42, 0.5, 0.45]} /></ToonMesh>
                <ToonMesh color="spaceBlue" position={[0, 0, 0.24]}><boxGeometry args={[0.26, 0.3, 0.025]} /></ToonMesh>
                <mesh position={[0, 0, 0.26]}><boxGeometry args={[0.16, 0.18, 0.025]} /><meshBasicMaterial color={palette.cyan} /></mesh>
              </group>
            )
          })}
        </group>
        <ToonMesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.4, 0.4, 1.6, 16]} /></ToonMesh>
        <ToonMesh color="orange" position={[0, 0, 0.7]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.45, 0.45, 0.12, 16]} /></ToonMesh>
        <NovenixBadge radius={0.25} position={[0, 0, 0.815]} />
        {[-1, 1].map((side) => (
          <group key={side}>
            <Strut from={[side * 0.35, 0, -0.35]} to={[side * 2.6, 0, -0.35]} radius={0.08} />
            <SolarPanel width={1.15} height={2.3} columns={2} rows={4} position={[side * 2.65, 0, -0.35]} rotation={[0, side * 0.15, 0]} />
          </group>
        ))}
        <Strut from={[0, 0.38, 0.3]} to={[0, 0.95, 0.3]} radius={0.035} />
        <mesh position={[0, 0.98, 0.3]}><sphereGeometry args={[0.07, 12, 8]} /><meshBasicMaterial color={palette.lightYellow} /></mesh>
      </group>
    </ModelMaterials>
  )
}
