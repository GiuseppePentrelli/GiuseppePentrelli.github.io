import { Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import Starfield from './Starfield'
import CameraRig from './CameraRig'
import SpaceWanderer from './SpaceWanderer'

export default function Universe({ reducedMotion }) {
  // posizioni condivise tra astronauta e alieno: ognuno scrive la propria qui
  // e legge quella dell'altro per tenersi alla larga (vedi `avoid` in SpaceWanderer)
  const astronautPos = useRef({ x: 0, y: 0 })
  const alienPos = useRef({ x: 0, y: 0 })

  return (
    // fixed = resta fermo mentre il resto scrolla, è il fondale.
    // pointer-events-none è fondamentale: senza, il canvas ruberebbe
    // click e scroll al contenuto che ci mettiamo sopra.
    <div className="fixed inset-0 z-0 pointer-events-none">
      {/* dpr limitato a 2x: sugli schermi ad altissima densità (tipo i telefoni recenti)
          renderizzare a 3x manderebbe in fumo le prestazioni senza benefici visibili */}
      <Canvas camera={{ position: [0, 0, 1] }} dpr={[1, 2]}>
        {/* fog: le stelle lontane sfumano nel blu invece di restare tutte nitide - dà profondità */}
        <fog attach="fog" args={['#081929', 8, 120]} />
        <CameraRig reduced={reducedMotion} />
        <Starfield reduced={reducedMotion} />
        {/* Suspense: useTexture sospende il render finché l'immagine non è caricata */}
        <Suspense fallback={null}>
          {/* astronauta e alieno: stessa animazione (SpaceWanderer), stessa profondità
              (uno spostamento minimo su z evita z-fighting), ognuno evita l'altro tramite
              i ref incrociati astronautPos/alienPos. Non seguono `reducedMotion`: quel
              bottone blocca camera e stelle, ma questi devono continuare a vagare */}
          <SpaceWanderer
            src="/media/lostInTheSpace.webp"
            z={-6}
            positionRef={astronautPos}
            avoid={[alienPos]}
          />
          <SpaceWanderer
            src="/media/alien.avif"
            z={-6.3}
            positionRef={alienPos}
            avoid={[astronautPos]}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
