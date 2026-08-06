import { Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import Starfield from './Starfield'
import CameraRig from './CameraRig'
import ShootingStar from './ShootingStar'
import Planets from './Planets'
import SpaceWanderer from './SpaceWanderer'
import Nebula from './Nebula'
import Asteroids from './Asteroids'

export default function Universe({ reducedMotion }) {
  // posizioni condivise tra i tre wanderer: ognuno scrive la propria qui
  // e legge quella degli altri per tenersi alla larga (vedi `avoid` in SpaceWanderer)
  const astronautPos = useRef({ x: 0, y: 0 })
  const alienPos = useRef({ x: 0, y: 0 })
  const satellitePos = useRef({ x: 0, y: 0 })

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
        {/* luci: ambientale bassa apposta, altrimenti il lato in ombra dei pianeti non si scurisce
            mai abbastanza e ruotando non si vede la differenza tra lato illuminato e lato in ombra */}
        <ambientLight intensity={0.12} color="#22456b" />
        <directionalLight position={[10, 10, 10]} intensity={1.8} color="#ffd9a0" />
        <directionalLight position={[-10, -4, -6]} intensity={0.15} color="#3f6ea5" />
        <CameraRig reduced={reducedMotion} />
        {/* più lontana di tutto il resto (z ~-95/-100): sfondo statico dietro le stelle */}
        <Nebula />
        <Starfield reduced={reducedMotion} />
        <ShootingStar reduced={reducedMotion} />
        <Planets reduced={reducedMotion} />
        {/* Suspense: useTexture sospende il render finché l'immagine non è caricata */}
        <Suspense fallback={null}>
          {/* layer di detriti tra i wanderer e i pianeti: rinforza la parallasse */}
          <Asteroids reduced={reducedMotion} />
          {/* astronauta, alieno e il satellite: stessa animazione (SpaceWanderer), profondità
              leggermente diverse (evita z-fighting), ognuno evita gli altri due tramite i ref
              incrociati in `avoid`. Non seguono `reducedMotion`: quel bottone blocca camera e
              stelle, ma questi devono continuare a vagare */}
          <SpaceWanderer
            src="/media/lostInTheSpace.webp"
            z={-6}
            positionRef={astronautPos}
            avoid={[alienPos, satellitePos]}
          />
          <SpaceWanderer
            src="/media/alien.avif"
            z={-6.3}
            positionRef={alienPos}
            avoid={[astronautPos, satellitePos]}
          />
          <SpaceWanderer
            src="/media/satellite.avif"
            pixelSize={56}
            z={-5.7}
            positionRef={satellitePos}
            avoid={[astronautPos, alienPos]}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}
