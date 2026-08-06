import { useCallback, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import { AdditiveBlending, CanvasTexture, Vector3 } from 'three'
import { useRandomInterval } from '../hooks/useRandomInterval'

// fascia di profondità tra i pianeti (~-20/-40) e la nebulosa di sfondo (~-90/-105):
// la nova si vede stagliarsi sul fondo senza essere confusa con l'uno o l'altra
const Z_MIN = -55
const Z_MAX = -85

const T_FLASH_IN = 0.15 // lampo iniziale, quasi istantaneo
const T_HOLD = 0.4 // resta al massimo un attimo
const T_END = 2.6 // durata totale: da qui il nucleo è spento e l'onda d'urto svanita

const MIN_INTERVAL_MS = 90000
const MAX_INTERVAL_MS = 180000

function randFloat(min, max) {
  return min + Math.random() * (max - min)
}

// texture generate una sola volta (cache di modulo, non per istanza) e riusate da tutte le
// nova: un cerchio pieno con bordo netto si legge come "forma", un gradiente radiale che sfuma
// a zero si legge come "luce". Stesso trucco per l'onda d'urto: invece di un anello disegnato
// (bordi netti), una fascia luminosa sfumata su entrambi i lati.
let glowTextureCache = null
function getGlowTexture() {
  if (glowTextureCache) return glowTextureCache
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  // molti stop ravvicinati invece di un salto netto 0→1: una curva a campana morbida invece
  // di un disco pieno con un bordo (anche sfumato) troppo definito
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.2, 'rgba(255,255,255,0.7)')
  gradient.addColorStop(0.4, 'rgba(255,255,255,0.42)')
  gradient.addColorStop(0.6, 'rgba(255,255,255,0.22)')
  gradient.addColorStop(0.8, 'rgba(255,255,255,0.08)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  glowTextureCache = new CanvasTexture(canvas)
  return glowTextureCache
}

let ringTextureCache = null
function getRingTexture() {
  if (ringTextureCache) return ringTextureCache
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  // stessa idea del bagliore: niente tratto "pieno" costante, un unico picco morbido con
  // discesa graduale sui due lati, altrimenti si rivede una linea disegnata invece di un'onda
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255,255,255,0)')
  gradient.addColorStop(0.5, 'rgba(255,255,255,0)')
  gradient.addColorStop(0.62, 'rgba(255,255,255,0.25)')
  gradient.addColorStop(0.7, 'rgba(255,255,255,0.5)')
  gradient.addColorStop(0.78, 'rgba(255,255,255,0.25)')
  gradient.addColorStop(0.92, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  ringTextureCache = new CanvasTexture(canvas)
  return ringTextureCache
}

// evento fisso in world space (non si muove): un lampo che sale in un istante, resta acceso
// un attimo, poi si spegne mentre un'onda d'urto si espande e sfuma. Texture generate al volo
// (getGlowTexture/getRingTexture), non caricate da file: niente useTexture/Suspense, zero
// asset richiesti.
function NovaActor({ reduced, onDone }) {
  const billboardRef = useRef()
  const glowRef = useRef()
  const coreRef = useRef()
  const ringRef = useRef()
  const { camera } = useThree()

  const elapsed = useRef(0)
  const done = useRef(false)
  const forwardRef = useRef(new Vector3())
  const paramsRef = useRef(null) // { coreScale, glowScale, ringMaxScale }, generati una sola volta

  useFrame((state, rawDelta) => {
    if (done.current) return

    // il flash è un evento fotosensibile: reduced motion lo salta del tutto, non solo lo accorcia
    if (reduced || elapsed.current >= T_END) {
      done.current = true
      onDone()
      return
    }

    const delta = Math.min(rawDelta, 0.1)
    elapsed.current += delta
    if (!billboardRef.current) return

    if (!paramsRef.current) {
      const z = randFloat(Z_MIN, Z_MAX)
      const { width, height } = state.viewport.getCurrentViewport(camera, [0, 0, z])
      const halfW = width / 2
      const halfH = height / 2
      if (halfW < 0.5 || halfH < 0.5) return // canvas non ancora dimensionato

      // stesso calcolo di parallasse di SpaceWanderer/Ufo: il centro di ciò che si vede a
      // questa z non è l'origine, è dove punta davvero la camera in questo momento
      camera.getWorldDirection(forwardRef.current)
      const planeDist = (z - camera.position.z) / forwardRef.current.z
      const cx = camera.position.x + forwardRef.current.x * planeDist
      const cy = camera.position.y + forwardRef.current.y * planeDist

      billboardRef.current.position.set(
        cx + randFloat(-0.7 * halfW, 0.7 * halfW),
        cy + randFloat(-0.7 * halfH, 0.7 * halfH),
        z
      )
      paramsRef.current = {
        coreScale: halfH * 0.12,
        glowScale: halfH * 0.4,
        ringMaxScale: halfH * 1.0,
      }
    }

    const { coreScale, glowScale, ringMaxScale } = paramsRef.current
    const t = elapsed.current

    let coreOpacity
    let coreMul
    if (t <= T_FLASH_IN) {
      const p = t / T_FLASH_IN
      coreOpacity = p
      coreMul = 0.15 + p * 0.85
    } else if (t <= T_HOLD) {
      coreOpacity = 1
      coreMul = 1
    } else {
      const p = (t - T_HOLD) / (T_END - T_HOLD)
      coreOpacity = 1 - p
      coreMul = 1 + p * 0.5 // continua a "espandersi" leggermente mentre si spegne
    }

    // l'onda d'urto parte insieme al lampo e impiega tutta la vita dell'evento per espandersi
    const tRing = Math.min(Math.max((t - T_FLASH_IN) / (T_END - T_FLASH_IN), 0), 1)
    const ringEase = 1 - (1 - tRing) ** 3
    const ringOpacity = (1 - tRing) * 0.6

    coreRef.current.scale.setScalar(coreScale * coreMul)
    coreRef.current.material.opacity = coreOpacity
    glowRef.current.scale.setScalar(glowScale * coreMul)
    glowRef.current.material.opacity = coreOpacity * 0.6
    ringRef.current.scale.setScalar(ringMaxScale * (0.25 + ringEase * 0.75))
    ringRef.current.material.opacity = ringOpacity
  })

  return (
    <Billboard ref={billboardRef} position={[0, 0, 0]}>
      <mesh ref={glowRef}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={getGlowTexture()}
          color="#9fd8ff"
          transparent
          opacity={0}
          toneMapped={false}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={coreRef}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={getGlowTexture()}
          color="#ffffff"
          transparent
          opacity={0}
          toneMapped={false}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={ringRef}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={getRingTexture()}
          color="#bfe9ff"
          transparent
          opacity={0}
          toneMapped={false}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </Billboard>
  )
}

// orchestratore: stesso schema di ShootingStar/Ufo. Evento molto più raro di entrambi (90-180s):
// deve restare una sorpresa "wow", non diventare un tormentone. Cap a una nova attiva per volta.
export default function Nova({ reduced }) {
  const [novas, setNovas] = useState([])
  const nextId = useRef(0)

  useRandomInterval(
    () => {
      setNovas((prev) => (prev.length > 0 ? prev : [...prev, { id: nextId.current++ }]))
    },
    MIN_INTERVAL_MS,
    MAX_INTERVAL_MS,
    { enabled: !reduced }
  )

  const handleDone = useCallback((id) => {
    setNovas((prev) => prev.filter((n) => n.id !== id))
  }, [])

  return novas.map(({ id }) => (
    <NovaActor key={id} reduced={reduced} onDone={() => handleDone(id)} />
  ))
}
