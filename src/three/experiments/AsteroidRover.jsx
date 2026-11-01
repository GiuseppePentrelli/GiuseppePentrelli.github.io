import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { IcosahedronGeometry } from 'three'
import { ModelMaterials, NovenixBadge, SolarPanel, Strut, ToonMesh } from './ModelParts'
import { palette } from '../palette'

const WHEEL_RADIUS = 0.24
const SURFACE_HEIGHT = 0.45 * 1.25

export default function AsteroidRover({ reduced = false }) {
  const wheelsRef = useRef([])
  const bodyRef = useRef(null)
  const headRef = useRef(null)
  const elapsed = useRef(0)
  const asteroid = useMemo(() => {
    const geometry = new IcosahedronGeometry(1, 1)
    const positions = geometry.attributes.position
    for (let i = 0; i < positions.count; i++) positions.setY(i, Math.min(0.45, positions.getY(i)))
    geometry.computeVertexNormals()
    return geometry
  }, [])

  useEffect(() => () => asteroid.dispose(), [asteroid])

  useFrame((_, delta) => {
    if (reduced) return
    elapsed.current += Math.min(delta, 0.1)
    const distance = Math.sin(elapsed.current * 0.24) * 0.28
    bodyRef.current.position.x = distance
    headRef.current.rotation.y = Math.sin(elapsed.current * 0.5) * 0.3
    wheelsRef.current.forEach((wheel) => { if (wheel) wheel.rotation.z = -distance / WHEEL_RADIUS })
  })

  return (
    <ModelMaterials>
      <group rotation={[0.12, -0.4, -0.08]} position={[0, -0.55, 0]}>
        <ToonMesh geometry={asteroid} color="rock" scale={[2.2, 1.25, 1.65]} />
        {[[1.55, -0.15, 0.7], [-1.5, -0.15, 0.7], [0.8, -0.65, 0.7], [-0.7, -0.65, -0.7]].map((position, i) => (
          <ToonMesh key={i} color={i % 2 ? 'darkRock' : 'rock'} position={position} scale={[0.3, 0.25, 0.3]}><icosahedronGeometry args={[1, 0]} /></ToonMesh>
        ))}
        <group ref={bodyRef} position={[0, SURFACE_HEIGHT + WHEEL_RADIUS - 0.04, 0]}>
          <ToonMesh color="orange" position={[0, 0.4, 0]}><boxGeometry args={[1.45, 0.38, 0.8]} /></ToonMesh>
          <ToonMesh color="cream" position={[0, 0.19, 0]}><boxGeometry args={[1.35, 0.08, 0.75]} /></ToonMesh>
          {[-1, 1].flatMap((side, sideIndex) => [-0.65, 0, 0.65].map((x, index) => (
            <group key={`${side}-${index}`} position={[x, 0.04, side * 0.55]}>
              <Strut from={[0, 0, 0]} to={[0, 0.25, -side * 0.2]} radius={0.04} />
              <group ref={(node) => { wheelsRef.current[sideIndex * 3 + index] = node }}>
                <ToonMesh color="outline" outlined={false} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[WHEEL_RADIUS, WHEEL_RADIUS, 0.18, 12]} /></ToonMesh>
                <ToonMesh color="consoleGray" outlined={false} position={[0, 0, side * 0.1]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.15, 0.15, 0.025, 8]} /></ToonMesh>
                <ToonMesh color="orange" outlined={false} position={[0, 0, side * 0.12]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.07, 0.07, 0.03, 8]} /></ToonMesh>
              </group>
            </group>
          )))}
          <SolarPanel width={0.9} height={0.62} position={[-0.25, 0.63, 0]} rotation={[-Math.PI / 2, 0, 0]} />
          <Strut from={[0.45, 0.58, 0]} to={[0.45, 1.12, 0]} radius={0.055} color="cream" />
          <group ref={headRef} position={[0.45, 1.24, 0]}>
            <ToonMesh color="cream"><boxGeometry args={[0.3, 0.22, 0.4]} /></ToonMesh>
            {[-1, 1].map((side) => (
              <group key={side} position={[0.17, 0, side * 0.1]} rotation={[0, 0, Math.PI / 2]}>
                <ToonMesh color="outline"><cylinderGeometry args={[0.075, 0.075, 0.05, 12]} /></ToonMesh>
                <mesh position={[0, -0.03, 0]}><cylinderGeometry args={[0.05, 0.05, 0.015, 12]} /><meshBasicMaterial color={palette.cyan} /></mesh>
              </group>
            ))}
          </group>
          <NovenixBadge radius={0.12} position={[0.15, 0.4, 0.415]} />
          <Strut from={[-0.6, 0.55, 0]} to={[-0.8, 1.05, 0]} radius={0.025} />
          <mesh position={[-0.8, 1.05, 0]}><sphereGeometry args={[0.05, 12, 8]} /><meshBasicMaterial color={palette.lightYellow} /></mesh>
        </group>
      </group>
    </ModelMaterials>
  )
}
