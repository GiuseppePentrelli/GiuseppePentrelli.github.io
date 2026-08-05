import { useCallback, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Trail } from '@react-three/drei'
import { Vector3 } from 'three'
import { useRandomInterval } from '../hooks/useRandomInterval'

const MIN_INTERVAL_MS = 10000
const MAX_INTERVAL_MS = 20000
const MIN_DURATION_S = 0.6
const MAX_DURATION_S = 1
// oltre questo margine (in coordinate schermo normalizzate, ±1 = bordo) la consideriamo uscita
const OFFSCREEN_MARGIN = 0.15
// tetto di sicurezza: se per qualche motivo non esce mai dallo schermo, la fermiamo comunque
const MAX_LIFETIME_S = 5

function randFloat(min, max) {
  return min + Math.random() * (max - min)
}

// genera posizione di partenza, direzione e velocità random per un singolo passaggio.
// MIN/MAX_DURATION_S non sono più il tempo di vita reale (quello lo decide l'uscita
// dallo schermo in Comet): servono solo per calcolare quanto deve essere veloce,
// dato che deve percorrere `distance` in quel lasso di tempo
function randomComet() {
  const angle = randFloat(210, 330) // gradi: sempre in "caduta" diagonale, mai orizzontale
  const rad = (angle * Math.PI) / 180
  const distance = randFloat(14, 22)
  const speed = distance / randFloat(MIN_DURATION_S, MAX_DURATION_S)

  return {
    start: [randFloat(-16, 16), randFloat(4, 10), randFloat(-28, -12)],
    velocity: [Math.cos(rad) * speed, Math.sin(rad) * speed, 0],
  }
}

// una singola stella cadente: appare al punto `start` e si muove lungo `velocity`
// lasciando una scia (Trail di drei), finché non esce dall'inquadratura della camera
// (non dopo un tempo fisso: così la scia arriva sempre davvero fuori dallo schermo)
function Comet({ start, velocity, reduced, onDone }) {
  const meshRef = useRef()
  const elapsed = useRef(0)
  const done = useRef(false)
  const { camera } = useThree()
  const ndc = useRef(new Vector3())

  useFrame((_, delta) => {
    if (done.current) return

    if (reduced || elapsed.current >= MAX_LIFETIME_S) {
      done.current = true
      onDone()
      return
    }

    elapsed.current += delta
    if (!meshRef.current) return

    meshRef.current.position.set(
      start[0] + velocity[0] * elapsed.current,
      start[1] + velocity[1] * elapsed.current,
      start[2]
    )

    // proietta la posizione in coordinate schermo (-1..1): oltre il margine, è fuori vista
    ndc.current.copy(meshRef.current.position).project(camera)
    if (Math.abs(ndc.current.x) > 1 + OFFSCREEN_MARGIN || Math.abs(ndc.current.y) > 1 + OFFSCREEN_MARGIN) {
      done.current = true
      onDone()
    }
  })

  return (
    <Trail width={2} length={5} color="#fff6df" attenuation={(t) => t * t}>
      <mesh ref={meshRef} position={start}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#fff6df" toneMapped={false} />
      </mesh>
    </Trail>
  )
}

// orchestratore: usa useRandomInterval per decidere *quando* far partire una stella
// cadente, ne genera i parametri random e monta un <Comet> a sé stante per ognuna.
// Montare/smontare (invece di riusare mesh e Trail) evita che la scia della cometa
// precedente lasci residui quando la posizione salta al nuovo punto di partenza.
export default function ShootingStar({ reduced }) {
  const [comets, setComets] = useState([])
  const nextId = useRef(0)

  useRandomInterval(
    () => {
      const id = nextId.current++
      setComets((prev) => [...prev, { id, ...randomComet() }])
    },
    MIN_INTERVAL_MS,
    MAX_INTERVAL_MS,
    { enabled: !reduced }
  )

  const handleDone = useCallback((id) => {
    setComets((prev) => prev.filter((c) => c.id !== id))
  }, [])

  return comets.map(({ id, ...params }) => (
    <Comet key={id} {...params} reduced={reduced} onDone={() => handleDone(id)} />
  ))
}
