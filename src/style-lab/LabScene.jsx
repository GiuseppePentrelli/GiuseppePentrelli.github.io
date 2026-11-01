import { Suspense } from 'react'
import { PerspectiveCamera } from '@react-three/drei'
import { Vector3 } from 'three'
import Planet from '../three/Planet'
import Starfield from '../three/Starfield'
import Twinkles from '../three/Twinkles'
import SpaceDust from '../three/SpaceDust'
import Nebula from '../three/Nebula'
import CameraRig from '../three/CameraRig'
import BlackHole from '../three/BlackHole'
import BinaryStars from '../three/BinaryStars'
import Eclipse from '../three/Eclipse'
import StellarBody from '../three/StellarBody'
import SpaceWanderer from '../three/SpaceWanderer'
import { NovaActor } from '../three/Nova'
import { AsteroidPass } from '../three/Asteroids'
import { Comet } from '../three/ShootingStar'
import { CometActor } from '../three/GreatComet'
import { RocketActor } from '../three/Rocket'
import { UfoActor } from '../three/Ufo'
import SceneLighting from '../three/SceneLighting'
import SpaceStation from '../three/experiments/SpaceStation'
import AsteroidRover from '../three/experiments/AsteroidRover'
import SpaceProbe from '../three/experiments/SpaceProbe'
import { CAMERA_Z, FOV, halfViewAt, isPortrait, placeAt, useAspect, zAt } from '../three/layout'

function Centered({ anchor, portraitAnchor = anchor, distance, scale = 1, children }) {
  const aspect = useAspect()
  const center = placeAt(isPortrait(aspect) ? portraitAnchor : anchor, distance, aspect)
  return <group position={[-center[0] * scale, -center[1] * scale, center[2] * (1 - scale)]} scale={scale}>{children}</group>
}

function Specimen({ item, reduced, onDone }) {
  const aspect = useAspect()
  const { halfW, halfH } = halfViewAt(20, aspect)

  switch (item.kind) {
    case 'planet':
      return <Planet {...item.planet} size={(item.planet.ring ? 0.95 : 1.4) * Math.min(1, aspect)} orbitCenter={[0, 0, zAt(6)]} orbitRadius={0} reduced={reduced} />
    case 'twinkles': return <Twinkles reduced={reduced} />
    case 'dust': return <SpaceDust reduced={reduced} />
    case 'nebula': return <Nebula />
    case 'camera': return <CameraRig reduced={reduced} />
    case 'blackhole':
      return <Centered anchor={[0.32, 0.3]} portraitAnchor={[-0.42, 0.86]} distance={145} scale={3}><BlackHole reduced={reduced} /></Centered>
    case 'binary':
      return <Centered anchor={[0.77, 0.15]} portraitAnchor={[0.62, 0.28]} distance={105} scale={4}><BinaryStars reduced={reduced} /></Centered>
    case 'eclipse':
      return <Centered anchor={[-0.68, -0.43]} portraitAnchor={[-0.58, -0.58]} distance={90} scale={3}><Eclipse reduced={reduced} /></Centered>
    case 'warm-star':
    case 'blue-star':
      return <group position={[0, 0, zAt(10)]}><StellarBody radius={Math.min(1, aspect)} color={item.kind === 'blue-star' ? '#73caff' : '#ff943d'} reduced={reduced} /></group>
    case 'wanderer':
      return <SpaceWanderer src={`/media/${item.asset}`} z={zAt(14.8)} pixelSize={item.id === 'satellite' ? 56 : 60} initialAnchor={[0, 0]} reduced={reduced} />
    case 'nova': return <NovaActor reduced={false} onDone={onDone} />
    case 'ufo': return <UfoActor src="/media/ufo.avif" reduced={false} onDone={onDone} />
    case 'asteroids':
      return <AsteroidPass start={new Vector3(-halfW * 0.85, 0, zAt(20))} end={new Vector3(halfW * 1.25, 0, zAt(20))} lifetime={12} reduced={false} onDone={onDone} />
    case 'shooting': {
      const view = halfViewAt(40, aspect)
      return <Comet start={[-view.halfW * 0.8, view.halfH * 0.6, zAt(40)]} velocity={[view.halfW * 2.2, -view.halfH * 1.5, 0]} reduced={false} onDone={onDone} />
    }
    case 'comet': {
      const view = halfViewAt(110, aspect)
      return <CometActor start={[-view.halfW * 0.7, view.halfH * 0.1, zAt(110)]} end={[view.halfW * 1.4, -view.halfH * 0.15, zAt(110)]} duration={18} halfH={view.halfH} reduced={false} onDone={onDone} />
    }
    case 'rocket':
      return <RocketActor start={[-halfW * 0.8, -halfH * 0.15, zAt(20)]} end={[halfW * 1.3, halfH * 0.2, zAt(20)]} arc={halfH * 0.1} duration={8} scale={halfH * 0.22} reduced={false} onDone={onDone} />
    case 'station':
      return <group position={[0, 0, zAt(10)]} scale={Math.min(1, aspect * 0.8)}><SpaceStation reduced={reduced} /></group>
    case 'rover':
      return <group position={[0, 0.25, zAt(11)]} scale={Math.min(1, aspect)}><AsteroidRover reduced={reduced} /></group>
    case 'probe':
      return <group position={[0, -0.2, zAt(9)]} scale={Math.min(1, aspect)}><SpaceProbe reduced={reduced} /></group>
    default: return null
  }
}

export default function LabScene({ item, reduced, manual, finished, onDone }) {
  const showSpecimen = !item.event || (!finished && (manual || (!reduced && item.id !== 'nova')))

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, CAMERA_Z]} fov={FOV} />
      <color attach="background" args={['#081929']} />
      <SceneLighting />
      <Starfield reduced={reduced} />
      <Suspense fallback={null}>
        {showSpecimen && <Specimen item={item} reduced={reduced} onDone={onDone} />}
      </Suspense>
    </>
  )
}
