import { Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import Starfield from './Starfield'
import CameraRig from './CameraRig'
import ShootingStar from './ShootingStar'
import Planets from './Planets'
import SpaceWanderer from './SpaceWanderer'
import Ufo from './Ufo'
import Nebula from './Nebula'
import Asteroids from './Asteroids'
import Nova from './Nova'
import BlackHole from './BlackHole'
import Twinkles from './Twinkles'
import SpaceDust from './SpaceDust'
import GreatComet from './GreatComet'
import Rocket from './Rocket'
import BinaryStars from './BinaryStars'
import Eclipse from './Eclipse'
import RenderBudget from './RenderBudget'
import SceneLighting from './SceneLighting'
import SpaceStructures from './SpaceStructures'
import { CAMERA_Z, FOV, zAt } from './layout'

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
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
      {/* dpr limitato a 2x: sugli schermi ad altissima densità (tipo i telefoni recenti)
          renderizzare a 3x manderebbe in fumo le prestazioni senza benefici visibili */}
      <Canvas camera={{ position: [0, 0, CAMERA_Z], fov: FOV }} dpr={[1, 2]}>
        <RenderBudget />
        <SceneLighting />
        <CameraRig reduced={reducedMotion} />
        {/* più lontana di tutto il resto: sfondo statico dietro le stelle */}
        <Nebula />
        <Starfield reduced={reducedMotion} />
        <Twinkles reduced={reducedMotion} />
        <ShootingStar reduced={reducedMotion} />
        <Nova reduced={reducedMotion} />
        <GreatComet reduced={reducedMotion} />
        <Planets reduced={reducedMotion} />
        <BlackHole reduced={reducedMotion} />
        <Rocket reduced={reducedMotion} />
        <BinaryStars reduced={reducedMotion} />
        <Eclipse reduced={reducedMotion} />
        <Suspense fallback={null}>
          <SpaceStructures reduced={reducedMotion} />
        </Suspense>
        {/* la cosa più vicina alla camera dopo l'UFO: dà la profondità quando la camera si muove */}
        <SpaceDust reduced={reducedMotion} />
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
            z={zAt(14.8)}
            positionRef={astronautPos}
            avoid={[alienPos, satellitePos]}
          />
          <SpaceWanderer
            src="/media/alien.avif"
            z={zAt(15.4)}
            positionRef={alienPos}
            avoid={[astronautPos, satellitePos]}
          />
          <SpaceWanderer
            src="/media/satellite.avif"
            pixelSize={56}
            z={zAt(14.1)}
            positionRef={satellitePos}
            avoid={[astronautPos, alienPos]}
          />
        </Suspense>
        {/* Suspense dedicato e separato da quello sopra: se manca/fallisce l'asset dell'UFO
            non deve trascinare giù astronauta/alieno/satellite (nessun ErrorBoundary nel repo) */}
        <Suspense fallback={null}>
          <Ufo src="/media/ufo.avif" reduced={reducedMotion} />
        </Suspense>
      </Canvas>
    </div>
  )
}
