import { useCallback, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { useRandomInterval } from '../hooks/useRandomInterval'
import { halfViewAt, placeAt, useAspect } from './layout'
import { createGlowTexture, createToonGradient } from './planetTextures'
import { palette } from './palette'
import { randFloat } from './utils'

// la cometa "vera": a metà strada fra le stelle cadenti (veloci, ogni 10-20 s) e la nova
// (rara, un lampo). Lenta, lontana, con la chioma e una coda lunga: attraversa il cielo in
// 22-30 secondi, abbastanza da accorgersene e seguirla con lo sguardo
const MIN_INTERVAL_MS = 60000
const MAX_INTERVAL_MS = 110000
const DISTANCE_RANGE = [95, 140]
const DURATION_RANGE = [22, 30]
const HEAD_RATIO = 0.025 // raggio del nucleo in frazione della metà altezza visibile
const TAIL_RATIO = 0.5 // lunghezza della coda, idem
const EDGE = 1.3 // parte e finisce un po' oltre il bordo dello schermo

// coda cartoon: tre fasce piatte una dentro l'altra (alone ghiaccio, corpo crema, filo
// bianco), arrotondate attorno al nucleo e appuntite in fondo. Disegnata orizzontale, lunga
// e stretta: il nucleo sta a sinistra, al centro dell'arrotondamento più largo
const TAIL_W = 1024
const TAIL_H = 256
const TAIL_CAP = TAIL_H * 0.43
const TAIL_HEAD_OFFSET = TAIL_CAP / TAIL_W // dove sta il nucleo, in frazione della lunghezza

let tailTextureCache = null
function getTailTexture() {
  if (tailTextureCache) return tailTextureCache
  const canvas = document.createElement('canvas')
  canvas.width = TAIL_W
  canvas.height = TAIL_H
  const ctx = canvas.getContext('2d')
  const mid = TAIL_H / 2

  const band = (halfWidth, tipX, color, alpha) => {
    const bend = TAIL_CAP + (tipX - TAIL_CAP) * 0.45
    ctx.globalAlpha = alpha
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(TAIL_CAP, mid - halfWidth)
    ctx.quadraticCurveTo(bend, mid - halfWidth * 0.9, tipX, mid)
    ctx.quadraticCurveTo(bend, mid + halfWidth * 0.9, TAIL_CAP, mid + halfWidth)
    ctx.arc(TAIL_CAP, mid, halfWidth, Math.PI / 2, -Math.PI / 2)
    ctx.fill()
  }
  band(TAIL_H * 0.42, TAIL_W, palette.ice, 0.3)
  band(TAIL_H * 0.26, TAIL_W * 0.8, palette.cream, 0.55)
  band(TAIL_H * 0.1, TAIL_W * 0.55, '#ffffff', 0.85)

  tailTextureCache = new THREE.CanvasTexture(canvas)
  return tailTextureCache
}

function randomPass(aspect) {
  const side = Math.random() < 0.5 ? -1 : 1
  const distance = randFloat(...DISTANCE_RANGE)
  const startY = randFloat(-0.1, 0.65)
  return {
    distance,
    start: placeAt([-EDGE * side, startY], distance, aspect),
    end: placeAt([EDGE * side, startY + randFloat(-0.5, 0.05)], distance, aspect),
    duration: randFloat(...DURATION_RANGE),
    halfH: halfViewAt(distance, aspect).halfH,
  }
}

function CometActor({ start, end, duration, halfH, reduced, onDone }) {
  const groupRef = useRef()
  const elapsed = useRef(0)
  const done = useRef(false)
  const gradientMap = useMemo(() => createToonGradient(4), [])
  const glowMap = useMemo(() => createGlowTexture(palette.ice, [[1, 0.18], [0.72, 0.32]]), [])

  const head = halfH * HEAD_RATIO
  const tail = halfH * TAIL_RATIO
  // la coda punta dalla parte opposta a dove va il nucleo
  const tailAngle = Math.atan2(end[1] - start[1], end[0] - start[0]) + Math.PI

  useFrame((_, delta) => {
    if (done.current) return
    if (reduced || elapsed.current >= duration) {
      done.current = true
      onDone()
      return
    }
    elapsed.current += delta
    const t = elapsed.current / duration
    groupRef.current.position.set(
      THREE.MathUtils.lerp(start[0], end[0], t),
      THREE.MathUtils.lerp(start[1], end[1], t),
      start[2]
    )
  })

  return (
    <group ref={groupRef} position={start}>
      <group rotation={[0, 0, tailAngle]}>
        <mesh position={[tail * (0.5 - TAIL_HEAD_OFFSET), 0, -0.01]} scale={[tail, head * 6, 1]}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={getTailTexture()} transparent depthWrite={false} toneMapped={false} fog={false} />
        </mesh>
      </group>
      <Billboard>
        <mesh scale={head * 5}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={glowMap} transparent depthWrite={false} toneMapped={false} fog={false} />
        </mesh>
      </Billboard>
      <mesh>
        <sphereGeometry args={[head, 24, 24]} />
        <meshToonMaterial color={palette.ice} gradientMap={gradientMap} fog={false} />
      </mesh>
      {/* contorno cartoon, come i pianeti */}
      <mesh scale={1.15}>
        <sphereGeometry args={[head, 24, 24]} />
        <meshBasicMaterial color={palette.outline} side={THREE.BackSide} fog={false} />
      </mesh>
    </group>
  )
}

// orchestratore: stesso schema di ShootingStar/Ufo/Nova. Una cometa per volta
export default function GreatComet({ reduced }) {
  const aspect = useAspect()
  const [comets, setComets] = useState([])
  const nextId = useRef(0)

  useRandomInterval(
    () => {
      setComets((prev) => (prev.length > 0 ? prev : [{ id: nextId.current++, ...randomPass(aspect) }]))
    },
    MIN_INTERVAL_MS,
    MAX_INTERVAL_MS,
    { enabled: !reduced, name: 'cometa' }
  )

  const handleDone = useCallback((id) => {
    setComets((prev) => prev.filter((c) => c.id !== id))
  }, [])

  return comets.map(({ id, ...pass }) => (
    <CometActor key={id} {...pass} reduced={reduced} onDone={() => handleDone(id)} />
  ))
}
