import { useMemo } from 'react'
import { Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { createSoftGlowTexture } from './planetTextures'
import { placeAt, useAspect } from './layout'
import { palette } from './palette'

// nuvole di sfondo, statiche: un bagliore morbido, molto grande e lontano. È l'unica eccezione
// voluta alla regola "effetti a fasce" dello stile cartoon: la versione a nuvolette piatte
// era peggio. Billboard per evitare lo stesso problema avuto con l'anello di Urano (un piano
// non billboard, visto da una posizione/angolo sbagliato, può apparire schiacciato/di taglio
// invece che come una nuvola morbida)
const CLOUDS = [
  { color: palette.violet, anchor: [-0.47, 0.37], distance: 191, scale: 80, opacity: 0.55 },
  { color: palette.teal, anchor: [0.37, -0.37], distance: 223, scale: 68, opacity: 0.5 },
]

export default function Nebula() {
  const aspect = useAspect()
  const textures = useMemo(() => CLOUDS.map((cloud) => createSoftGlowTexture(cloud.color)), [])

  return (
    <>
      {CLOUDS.map((cloud, i) => (
        <Billboard key={cloud.color} position={placeAt(cloud.anchor, cloud.distance, aspect)}>
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
