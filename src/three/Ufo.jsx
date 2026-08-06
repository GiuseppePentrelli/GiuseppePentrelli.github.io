import { useCallback, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useTexture, Billboard } from '@react-three/drei'
import { Vector3 } from 'three'
import { useRandomInterval } from '../hooks/useRandomInterval'

// profondità fissa: molto più vicina alla camera (z=1, mai animata sull'asse z, vedi
// CameraRig.jsx) dei tre SpaceWanderer (z=-6/-6.3/-5.7). Distanza on-axis 3.5 invece di 7:
// il parallasse generato dal movimento xy della camera è ~2x più marcato, che è ciò che fa
// "sentire" l'UFO vicino — non serve ingrandirlo, basta dimezzare la distanza. Margine di
// 3.4 unità dal near clip (~0.9): nessun rischio di clipping anche a camera tutta spostata.
const Z = -2.5
const PIXEL_SIZE = 200 // molto più prominente dei 56-60px dei wanderer, coerente con l'effetto ravvicinato

const T_ENTER = 0.9 // risalita da sotto lo schermo fino all'hover
const T_OSCILLATE = 2.0 // hover con oscillazione sx/dx + micro-bob verticale
const ENTRY_MARGIN = 0.5 // quanto oltre il bordo inferiore parte, stessa idea di RESPAWN_MARGIN in SpaceWanderer.jsx
const OFFSCREEN_MARGIN = 0.15 // margine NDC oltre cui il boost si considera "uscito", come in ShootingStar.jsx
const MAX_LIFETIME_S = 6 // tetto di sicurezza assoluto se per qualche motivo non esce mai dall'inquadratura

const MIN_INTERVAL_MS = 35000
const MAX_INTERVAL_MS = 50000

function randFloat(min, max) {
  return min + Math.random() * (max - min)
}

// singolo passaggio dell'UFO: sale da sotto lo schermo vicino alla camera, fluttua un attimo
// "guardando" l'utente (il Billboard lo fa gratis, nessun lookAt da scrivere) oscillando un
// po' a destra e sinistra, poi scappa a razzo e sparisce. Fasi scandite da un solo
// elapsed.current dentro useFrame, stesso spirito di Comet in ShootingStar.jsx ma con più fasi.
function UfoActor({ src, reduced, onDone }) {
  const texture = useTexture(src)
  const billboardRef = useRef()
  const spinRef = useRef()
  const { camera } = useThree()

  const elapsed = useRef(0)
  const done = useRef(false)
  const forwardRef = useRef(new Vector3())
  const ndc = useRef(new Vector3())

  const paramsRef = useRef(null) // generati una sola volta al primo frame con bound attendibili
  const lastPosRef = useRef({ x: 0, y: 0 }) // ultima posizione calcolata, serve da partenza al boost
  // popolato solo alla transizione verso la fase boost: da quel momento il moto è balistico
  // in world space, non insegue più il centro schermo (un razzo in fuga non fa parallasse)
  const boostRef = useRef(null)

  useFrame((state, rawDelta) => {
    if (done.current) return

    if (reduced || elapsed.current >= MAX_LIFETIME_S) {
      done.current = true
      onDone()
      return
    }

    const delta = Math.min(rawDelta, 0.1)
    elapsed.current += delta
    if (!billboardRef.current) return

    // stesso calcolo di SpaceWanderer.jsx: bordi reali del viewport a questa z, corretti per
    // il parallasse (la camera non resta sul proprio asse, si sposta in xy inseguendo il mouse)
    const { width, height } = state.viewport.getCurrentViewport(camera, [0, 0, Z])
    const halfW = width / 2
    const halfH = height / 2
    const pixelsPerUnit = state.size.height / height
    const size = PIXEL_SIZE / pixelsPerUnit
    const halfSize = size / 2

    if (halfW < 0.5 || halfH < 0.5) return // canvas non ancora dimensionato, aspetta il prossimo frame

    camera.getWorldDirection(forwardRef.current)
    const planeDist = (Z - camera.position.z) / forwardRef.current.z
    const cx = camera.position.x + forwardRef.current.x * planeDist
    const cy = camera.position.y + forwardRef.current.y * planeDist

    if (!paramsRef.current) {
      paramsRef.current = {
        hoverOffsetX: randFloat(-0.3 * halfW, 0.3 * halfW), // resta in una fascia centrale
        hoverOffsetY: randFloat(-0.1 * halfH, 0.35 * halfH), // leggero sbilanciamento verso l'alto
        oscAmplitude: Math.min(0.25 * halfW, 1.4),
        bobAmplitude: 0.06 * halfH,
        boostAngleDeg: randFloat(60, 120), // quasi verticale, con variazione laterale
      }
    }
    const { hoverOffsetX, hoverOffsetY, oscAmplitude, bobAmplitude, boostAngleDeg } = paramsRef.current

    let x
    let y

    if (elapsed.current <= T_ENTER) {
      // ease-out cubico: entra veloce e rallenta arrivando in hover, nessuno scatto in arrivo
      const t = elapsed.current / T_ENTER
      const eased = 1 - (1 - t) ** 3
      const startY = cy - halfH - halfSize - ENTRY_MARGIN
      x = cx + hoverOffsetX
      y = startY + (cy + hoverOffsetY - startY) * eased
    } else if (elapsed.current <= T_ENTER + T_OSCILLATE) {
      const tOsc = elapsed.current - T_ENTER
      // frequenze diverse apposta: se coincidessero, oscillazione laterale e bob verticale
      // resterebbero sempre in fase e sembrerebbero un unico movimento meccanico
      const omegaOsc = 2 * Math.PI * (2.5 / T_OSCILLATE)
      const omegaBob = 2 * Math.PI * (1.5 / T_OSCILLATE)
      x = cx + hoverOffsetX + oscAmplitude * Math.sin(omegaOsc * tOsc)
      y = cy + hoverOffsetY + bobAmplitude * Math.sin(omegaBob * tOsc)
    } else {
      if (!boostRef.current) {
        // cattura la posizione dell'ultimo frame in hover come partenza del razzo: da qui il
        // moto è in world space puro, esce dal tracking di cx/cy (stesso principio di Comet
        // in ShootingStar.jsx, che calcola position = start + velocity * elapsed)
        const distance = randFloat(10, 14)
        const duration = randFloat(0.35, 0.5)
        const speed = distance / duration
        const rad = (boostAngleDeg * Math.PI) / 180
        boostRef.current = {
          startX: lastPosRef.current.x,
          startY: lastPosRef.current.y,
          startT: elapsed.current,
          vx: Math.cos(rad) * speed,
          vy: Math.sin(rad) * speed,
        }
      }
      const b = boostRef.current
      const tBoost = elapsed.current - b.startT
      x = b.startX + b.vx * tBoost
      y = b.startY + b.vy * tBoost

      // fine fase decisa dall'uscita reale dall'inquadratura (proiezione NDC, come in
      // ShootingStar.jsx), non da un timer fisso: garantisce che il razzo sparisca davvero
      // fuori schermo, qualunque sia la direzione random scelta
      ndc.current.set(x, y, Z).project(camera)
      if (Math.abs(ndc.current.x) > 1 + OFFSCREEN_MARGIN || Math.abs(ndc.current.y) > 1 + OFFSCREEN_MARGIN) {
        done.current = true
        onDone()
        return
      }
    }

    lastPosRef.current.x = x
    lastPosRef.current.y = y

    billboardRef.current.position.set(x, y, Z)
    if (spinRef.current) {
      spinRef.current.scale.setScalar(size)
      // parte invisibile (vedi JSX) per evitare un flash al centro schermo se il primissimo
      // useFrame utile esce prima di arrivare qui (canvas non ancora dimensionato)
      spinRef.current.visible = true
    }
  })

  return (
    <Billboard ref={billboardRef} position={[0, 0, Z]}>
      <mesh ref={spinRef} visible={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={texture} transparent toneMapped={false} />
      </mesh>
    </Billboard>
  )
}

// orchestratore: usa useRandomInterval per decidere *quando* far apparire l'UFO (molto più
// raro delle stelle cadenti: è un evento vistoso, non deve stancare) e monta un UfoActor a sé
// stante per ogni apparizione, rimuovendolo quando l'attore segnala di aver finito. Cap a un
// solo UFO attivo per volta: con questi intervalli è già impossibile per costruzione, ma resta
// esplicito per sicurezza.
export default function Ufo({ src, reduced }) {
  const [ufos, setUfos] = useState([])
  const nextId = useRef(0)

  useRandomInterval(
    () => {
      setUfos((prev) => (prev.length > 0 ? prev : [...prev, { id: nextId.current++ }]))
    },
    MIN_INTERVAL_MS,
    MAX_INTERVAL_MS,
    { enabled: !reduced }
  )

  const handleDone = useCallback((id) => {
    setUfos((prev) => prev.filter((u) => u.id !== id))
  }, [])

  return ufos.map(({ id }) => (
    <UfoActor key={id} src={src} reduced={reduced} onDone={() => handleDone(id)} />
  ))
}
