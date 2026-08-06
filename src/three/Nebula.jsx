import { useMemo } from 'react'
import { Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { createGlowTexture } from './planetTextures'

// nuvole di sfondo, statiche: stessa tecnica dell'alone dei pianeti (createGlowTexture),
// solo molto più grandi e lontane. Billboard per evitare lo stesso problema avuto con
// l'anello di Urano (un piano non billboard, visto da una posizione/angolo sbagliato,
// può apparire schiacciato/di taglio invece che come una nuvola morbida)
const CLOUDS = [
  { color: '#6a3fd9', position: [-52, 26, -90], scale: 80, opacity: 0.55 },
  { color: '#2696a3', position: [48, -30, -105], scale: 68, opacity: 0.5 },
]

export default function Nebula() {
  const textures = useMemo(() => CLOUDS.map((cloud) => createGlowTexture(cloud.color)), [])

  return (
    <>
      {CLOUDS.map((cloud, i) => (
        <Billboard key={cloud.color} position={cloud.position}>
          <mesh scale={cloud.scale}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
              map={textures[i]}
              transparent
              opacity={cloud.opacity}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
              fog={false}
            />
          </mesh>
        </Billboard>
      ))}
    </>
  )
}
