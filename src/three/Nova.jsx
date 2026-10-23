import { useCallback, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import { CanvasTexture, Vector3 } from 'three'
import { useRandomInterval } from '../hooks/useRandomInterval'
import { zAt } from './layout'
import { palette } from './palette'
import { createCanvas, randFloat, viewCenterAt } from './utils'

// fascia di profondità tra i pianeti e la nebulosa di sfondo: la nova si vede stagliarsi
// sul fondo senza essere confusa con l'uno o l'altra
const Z_MIN = zAt(118)
const Z_MAX = zAt(181)

const T_FLASH_IN = 0.15 // lampo iniziale, quasi istantaneo
const T_HOLD = 0.4 // resta al massimo un attimo
const T_END = 2.6 // durata totale: da qui la stella è spenta e l'onda d'urto svanita
const BURST_SPIN = 0.5 // rad/s: la stella gira piano mentre si spegne, come in un fumetto

const MIN_INTERVAL_MS = 90000
const MAX_INTERVAL_MS = 180000

// stella a punte da fumetto: un poligono con le punte alternate lunghe e corte, a strati di
// colore piatto e con il contorno scuro, al posto del bagliore sfumato. Generata una sola
// volta (cache di modulo) e riusata da tutte le nova
let burstTextureCache = null
function getBurstTexture() {
  if (burstTextureCache) return burstTextureCache
  const size = 256
  const { canvas, ctx } = createCanvas(size)
  const c = size / 2

  const drawBurst = (outer, inner, points, color) => {
    ctx.beginPath()
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outer : inner
      const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2
      ctx.lineTo(c + Math.cos(a) * r, c + Math.sin(a) * r)
    }
    ctx.closePath()
    ctx.fillStyle = color
    ctx.fill()
    return ctx
  }

  ctx.lineJoin = 'round'
  ctx.strokeStyle = palette.outline
  ctx.lineWidth = 6
  drawBurst(size * 0.46, size * 0.22, 10, palette.lightYellow).stroke()
  drawBurst(size * 0.3, size * 0.15, 10, palette.cream)
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(c, c, size * 0.1, 0, Math.PI * 2)
  ctx.fill()

  burstTextureCache = new CanvasTexture(canvas)
  return burstTextureCache
}

// onda d'urto: un anello netto con il contorno, non una fascia sfumata
let ringTextureCache = null
function getRingTexture() {
  if (ringTextureCache) return ringTextureCache
  const size = 256
  const { canvas, ctx } = createCanvas(size)
  const c = size / 2

  ctx.strokeStyle = palette.outline
  ctx.lineWidth = 14
  ctx.beginPath()
  ctx.arc(c, c, size * 0.44, 0, Math.PI * 2)
  ctx.stroke()
  ctx.strokeStyle = palette.ice
  ctx.lineWidth = 8
  ctx.stroke()

  ringTextureCache = new CanvasTexture(canvas)
  return ringTextureCache
}

// evento fisso nel mondo (non si muove): la stella esplode in un istante, resta accesa un
// attimo, poi si spegne girando piano mentre un'onda d'urto si allarga e svanisce
function NovaActor({ reduced, onDone }) {
  const billboardRef = useRef()
  const burstRef = useRef()
  const ringRef = useRef()
  const { camera } = useThree()

  const elapsed = useRef(0)
  const done = useRef(false)
  const forwardRef = useRef(new Vector3())
  const paramsRef = useRef(null) // { burstScale, ringMaxScale }, generati una sola volta

  useFrame((state, rawDelta) => {
    if (done.current) return

    // il lampo è un evento fotosensibile: reduced motion lo salta del tutto, non solo lo accorcia
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

      const { x: cx, y: cy } = viewCenterAt(camera, z, forwardRef.current)
      billboardRef.current.position.set(
        cx + randFloat(-0.7 * halfW, 0.7 * halfW),
        cy + randFloat(-0.7 * halfH, 0.7 * halfH),
        z
      )
      paramsRef.current = {
        burstScale: halfH * 0.22,
        ringMaxScale: halfH * 0.9,
      }
    }

    const { burstScale, ringMaxScale } = paramsRef.current
    const t = elapsed.current

    let burstOpacity
    let burstMul
    if (t <= T_FLASH_IN) {
      const p = t / T_FLASH_IN
      burstOpacity = p
      burstMul = 0.2 + p * 0.8
    } else if (t <= T_HOLD) {
      burstOpacity = 1
      burstMul = 1
    } else {
      const p = (t - T_HOLD) / (T_END - T_HOLD)
      burstOpacity = 1 - p
      burstMul = 1 - p * 0.6 // si richiude mentre si spegne
    }

    // l'onda d'urto parte insieme al lampo e impiega tutta la vita dell'evento per allargarsi
    const tRing = Math.min(Math.max((t - T_FLASH_IN) / (T_END - T_FLASH_IN), 0), 1)
    const ringEase = 1 - (1 - tRing) ** 3

    burstRef.current.scale.setScalar(burstScale * burstMul)
    burstRef.current.rotation.z += delta * BURST_SPIN
    burstRef.current.material.opacity = burstOpacity
    ringRef.current.scale.setScalar(ringMaxScale * (0.2 + ringEase * 0.8))
    ringRef.current.material.opacity = (1 - tRing) * 0.8
  })

  return (
    <Billboard ref={billboardRef} position={[0, 0, 0]}>
      <mesh ref={ringRef}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={getRingTexture()} transparent opacity={0} toneMapped={false} depthWrite={false} fog={false} />
      </mesh>
      <mesh ref={burstRef} position={[0, 0, 0.01]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={getBurstTexture()} transparent opacity={0} toneMapped={false} depthWrite={false} fog={false} />
      </mesh>
    </Billboard>
  )
}

// orchestratore: stesso schema di ShootingStar/Ufo. Evento molto più raro di entrambi (90-180s):
// deve restare una sorpresa, non diventare un tormentone. Una nova attiva per volta
export default function Nova({ reduced }) {
  const [novas, setNovas] = useState([])
  const nextId = useRef(0)

  useRandomInterval(
    () => {
      setNovas((prev) => (prev.length > 0 ? prev : [...prev, { id: nextId.current++ }]))
    },
    MIN_INTERVAL_MS,
    MAX_INTERVAL_MS,
    { enabled: !reduced, name: 'nova' }
  )

  const handleDone = useCallback((id) => {
    setNovas((prev) => prev.filter((n) => n.id !== id))
  }, [])

  return novas.map(({ id }) => (
    <NovaActor key={id} reduced={reduced} onDone={() => handleDone(id)} />
  ))
}
