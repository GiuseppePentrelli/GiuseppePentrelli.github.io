import { useCallback, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Outlines } from '@react-three/drei'
import * as THREE from 'three'
import { useRandomInterval } from '../hooks/useRandomInterval'
import { halfViewAt, placeAt, useAspect } from './layout'
import { createToonGradient } from './planetTextures'
import { palette } from './palette'
import { randFloat } from './utils'

// il razzo dell'originale (quello del menu), rifatto in 3D con forme semplici: ogni tanto
// attraversa la scena girando su se stesso, così si vede che è un oggetto vero e non un
// adesivo. Stile cartoon come i pianeti: materiale toon, contorno scuro, colori della palette
const MIN_INTERVAL_MS = 55000
const MAX_INTERVAL_MS = 85000
const DISTANCE_RANGE = [26, 34] // davanti ai pianeti, dietro agli asteroidi più vicini
const DURATION_RANGE = [6, 9]
const HEIGHT_RATIO = 0.12 // altezza del razzo in frazione della metà altezza visibile
const EDGE = 1.25
const ROLL_SPEED = 1.4 // rad/s: il giro attorno al proprio asse
const OUTLINE = 0.035

// profili per LatheGeometry: (raggio, altezza) dal basso verso l'alto, ruotati attorno all'asse y
const BODY_PROFILE = [
  [0, -0.9], [0.28, -0.9], [0.4, -0.55], [0.44, 0], [0.4, 0.45], [0.3, 0.78], [0, 0.78],
].map(([x, y]) => new THREE.Vector2(x, y))
const NOSE_PROFILE = [
  [0, 0.76], [0.3, 0.76], [0.25, 0.98], [0.14, 1.16], [0, 1.26],
].map(([x, y]) => new THREE.Vector2(x, y))

// pinna: un profilo piatto estruso, attaccato al fianco del razzo
function createFinGeometry() {
  const shape = new THREE.Shape()
  shape.moveTo(0, 0)
  shape.quadraticCurveTo(0.42, -0.2, 0.5, -0.62)
  shape.lineTo(0.12, -0.5)
  shape.lineTo(0, -0.42)
  shape.closePath()
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.07, bevelEnabled: false })
  geometry.translate(0, 0, -0.035)
  return geometry
}

function RocketModel({ flameRef }) {
  const gradientMap = useMemo(() => createToonGradient(4), [])
  const body = useMemo(() => new THREE.LatheGeometry(BODY_PROFILE, 32), [])
  const nose = useMemo(() => new THREE.LatheGeometry(NOSE_PROFILE, 32), [])
  const fin = useMemo(() => createFinGeometry(), [])

  return (
    <group>
      <mesh geometry={body}>
        <meshToonMaterial color={palette.cream} gradientMap={gradientMap} />
        <Outlines thickness={OUTLINE} color={palette.outline} />
      </mesh>
      <mesh geometry={nose}>
        <meshToonMaterial color={palette.red} gradientMap={gradientMap} />
        <Outlines thickness={OUTLINE} color={palette.outline} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <group key={i} rotation={[0, (i * Math.PI * 2) / 3, 0]}>
          <mesh geometry={fin} position={[0.34, -0.42, 0]}>
            <meshToonMaterial color={palette.red} gradientMap={gradientMap} />
            <Outlines thickness={OUTLINE} color={palette.outline} />
          </mesh>
        </group>
      ))}
      {/* oblò: cornice grigia e vetro ghiaccio, sul davanti */}
      <mesh position={[0, 0.25, 0.4]}>
        <torusGeometry args={[0.15, 0.045, 12, 32]} />
        <meshToonMaterial color={palette.consoleGray} gradientMap={gradientMap} />
      </mesh>
      <mesh position={[0, 0.25, 0.39]} scale={[1, 1, 0.35]}>
        <sphereGeometry args={[0.14, 20, 20]} />
        <meshToonMaterial color={palette.ice} gradientMap={gradientMap} />
      </mesh>
      {/* ugello */}
      <mesh position={[0, -0.97, 0]}>
        <cylinderGeometry args={[0.2, 0.27, 0.16, 24]} />
        <meshToonMaterial color={palette.consoleGray} gradientMap={gradientMap} />
        <Outlines thickness={OUTLINE} color={palette.outline} />
      </mesh>
      {/* fiamma: due coni senza luce (sempre accesi) che tremolano, quello giallo dentro quello arancio */}
      <group ref={flameRef} position={[0, -1.05, 0]}>
        <mesh position={[0, -0.32, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.22, 0.64, 20]} />
          <meshBasicMaterial color={palette.hotOrange} toneMapped={false} />
        </mesh>
        <mesh position={[0, -0.22, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.12, 0.44, 20]} />
          <meshBasicMaterial color={palette.lightYellow} toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
}

function randomFlight(aspect) {
  const side = Math.random() < 0.5 ? -1 : 1
  const distance = randFloat(...DISTANCE_RANGE)
  const startY = randFloat(-0.55, 0.45)
  const { halfH } = halfViewAt(distance, aspect)
  return {
    start: placeAt([-EDGE * side, startY], distance, aspect),
    end: placeAt([EDGE * side, startY + randFloat(-0.3, 0.3)], distance, aspect),
    arc: randFloat(-0.15, 0.15) * halfH, // la traiettoria si incurva un po' a metà
    duration: randFloat(...DURATION_RANGE),
    scale: (halfH * HEIGHT_RATIO * 2) / 2.3, // il modello è alto circa 2.3 unità
  }
}

function RocketActor({ start, end, arc, duration, scale, reduced, onDone }) {
  const groupRef = useRef()
  const rollRef = useRef()
  const flameRef = useRef()
  const elapsed = useRef(0)
  const done = useRef(false)
  const heading = Math.atan2(end[1] - start[1], end[0] - start[0])

  useFrame((_, rawDelta) => {
    if (done.current) return
    if (reduced || elapsed.current >= duration) {
      done.current = true
      onDone()
      return
    }
    const delta = Math.min(rawDelta, 0.1)
    elapsed.current += delta
    const time = elapsed.current
    const t = time / duration

    // l'arco: uno spostamento perpendicolare che vale zero agli estremi e `arc` a metà strada
    const bend = Math.sin(t * Math.PI) * arc
    groupRef.current.position.set(
      THREE.MathUtils.lerp(start[0], end[0], t) - Math.sin(heading) * bend,
      THREE.MathUtils.lerp(start[1], end[1], t) + Math.cos(heading) * bend,
      start[2]
    )
    // il muso (asse y del modello) segue la direzione, con un leggero ondeggiare
    groupRef.current.rotation.z = heading - Math.PI / 2 + Math.sin(time * 3) * 0.06
    rollRef.current.rotation.y = time * ROLL_SPEED
    flameRef.current.scale.y = 1 + Math.sin(time * 31) * 0.2 + Math.sin(time * 17) * 0.12
  })

  return (
    <group ref={groupRef} position={start} scale={scale}>
      <group ref={rollRef}>
        <RocketModel flameRef={flameRef} />
      </group>
    </group>
  )
}

// orchestratore: stesso schema degli altri eventi. Un razzo per volta
export default function Rocket({ reduced }) {
  const aspect = useAspect()
  const [flights, setFlights] = useState([])
  const nextId = useRef(0)

  useRandomInterval(
    () => {
      setFlights((prev) => (prev.length > 0 ? prev : [{ id: nextId.current++, ...randomFlight(aspect) }]))
    },
    MIN_INTERVAL_MS,
    MAX_INTERVAL_MS,
    { enabled: !reduced, name: 'razzo' }
  )

  const handleDone = useCallback((id) => {
    setFlights((prev) => prev.filter((f) => f.id !== id))
  }, [])

  return flights.map(({ id, ...flight }) => (
    <RocketActor key={id} {...flight} reduced={reduced} onDone={() => handleDone(id)} />
  ))
}
