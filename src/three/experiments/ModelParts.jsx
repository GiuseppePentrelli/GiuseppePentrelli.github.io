import { createContext, useContext, useEffect, useMemo } from 'react'
import { useTexture } from '@react-three/drei'
import { BackSide, DoubleSide, MeshBasicMaterial, MeshToonMaterial, Quaternion, Vector3 } from 'three'
import { createToonGradient } from '../planetTextures'
import { palette } from '../palette'

const ModelContext = createContext(null)
const colors = { ...palette, solar: '#205d8c', rock: '#9c8465', darkRock: '#6e6558' }

export function ModelMaterials({ children }) {
  const resources = useMemo(() => {
    const gradient = createToonGradient(4)
    const materials = Object.fromEntries(Object.entries(colors).map(([name, color]) => [name, new MeshToonMaterial({ color, gradientMap: gradient })]))
    const outline = new MeshBasicMaterial({ color: palette.outline, side: BackSide })
    const dish = new MeshToonMaterial({ color: palette.cream, gradientMap: gradient, side: DoubleSide })
    return { materials, outline, dish, gradient }
  }, [])

  useEffect(() => () => {
    Object.values(resources.materials).forEach((material) => material.dispose())
    resources.outline.dispose()
    resources.dish.dispose()
    resources.gradient.dispose()
  }, [resources])

  return <ModelContext.Provider value={resources}>{children}</ModelContext.Provider>
}

export function ToonMesh({ color = 'cream', outlined = true, geometry, children, ...props }) {
  const { materials, outline } = useContext(ModelContext)
  return (
    <group {...props}>
      <mesh geometry={geometry} material={materials[color]}>{children}</mesh>
      {outlined && <mesh geometry={geometry} material={outline} scale={1.045}>{children}</mesh>}
    </group>
  )
}

export function Strut({ from, to, radius = 0.05, color = 'consoleGray' }) {
  const { materials } = useContext(ModelContext)
  const [fromX, fromY, fromZ] = from
  const [toX, toY, toZ] = to
  const { position, rotation, length } = useMemo(() => {
    const start = new Vector3(fromX, fromY, fromZ)
    const end = new Vector3(toX, toY, toZ)
    const direction = end.clone().sub(start)
    return {
      position: start.add(end).multiplyScalar(0.5),
      rotation: new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction.clone().normalize()),
      length: direction.length(),
    }
  }, [fromX, fromY, fromZ, toX, toY, toZ])

  return <mesh position={position} quaternion={rotation} material={materials[color]}><cylinderGeometry args={[radius, radius, length, 8]} /></mesh>
}

export function SolarPanel({ width = 1.5, height = 1, columns = 3, rows = 2, ...props }) {
  const { materials } = useContext(ModelContext)
  const gap = 0.035
  const cellWidth = (width - 0.12 - gap * (columns - 1)) / columns
  const cellHeight = (height - 0.12 - gap * (rows - 1)) / rows

  return (
    <group {...props}>
      <ToonMesh color="consoleGray"><boxGeometry args={[width, height, 0.075]} /></ToonMesh>
      {Array.from({ length: columns * rows }, (_, i) => (
        <mesh key={i} material={materials.solar} position={[(i % columns - (columns - 1) / 2) * (cellWidth + gap), (Math.floor(i / columns) - (rows - 1) / 2) * (cellHeight + gap), 0.045]}>
          <boxGeometry args={[cellWidth, cellHeight, 0.025]} />
        </mesh>
      ))}
      <mesh position={[0, height / 2 - 0.025, 0.05]}><boxGeometry args={[width - 0.04, 0.025, 0.025]} /><meshBasicMaterial color={palette.ice} /></mesh>
    </group>
  )
}

export function NovenixBadge({ radius = 0.18, ...props }) {
  const texture = useTexture('/icon/favicon-v2-96.png')
  return (
    <group {...props}>
      <mesh><circleGeometry args={[radius, 24]} /><meshBasicMaterial color={palette.spaceBlue} /></mesh>
      <mesh position={[0, 0, 0.005]}><torusGeometry args={[radius, radius * 0.08, 6, 24]} /><meshBasicMaterial color={palette.orange} /></mesh>
      <mesh position={[0, 0, 0.012]}><planeGeometry args={[radius * 1.55, radius * 1.55]} /><meshBasicMaterial map={texture} transparent alphaTest={0.01} toneMapped={false} /></mesh>
    </group>
  )
}

export function Dish({ radius = 0.58, ...props }) {
  const { dish } = useContext(ModelContext)
  return (
    <group {...props}>
      <mesh material={dish}><sphereGeometry args={[radius, 24, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} /></mesh>
      <ToonMesh color="orange" rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[radius, 0.025, 6, 24]} /></ToonMesh>
      <Strut from={[0, -radius, 0]} to={[0, radius * 0.35, 0]} radius={0.025} color="orange" />
      <mesh position={[0, radius * 0.35, 0]}><sphereGeometry args={[0.065, 12, 8]} /><meshBasicMaterial color={palette.cyan} /></mesh>
    </group>
  )
}
