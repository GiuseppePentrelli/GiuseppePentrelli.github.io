import { useCallback, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createToonGradient, createCraterTexture } from './planetTextures'
import { useRandomInterval } from '../hooks/useRandomInterval'

// gruppetto di detriti che attraversa la scena ogni tanto (stessa filosofia di
// ShootingStar: useRandomInterval decide *quando*, un componente a sé per ogni
// passaggio se ne occupa e si smonta da solo alla fine - niente due passaggi mai
// identici, perché ad ogni mount tutto viene risorteggiato da zero)
const MIN_INTERVAL_MS = 25000
const MAX_INTERVAL_MS = 50000
const COUNT = 8
const GEOMETRY_VARIANTS = 4
const GROUP_Z = -8.5 // vicino ai wanderer (z ~-6/-6.3), più avanti dei pianeti: sembrano grandi
// raggio (ellittico) del cerchio di punti di ingresso/uscita attorno al centro scena:
// abbastanza largo da restare fuori dalla vista in qualunque direzione di passaggio
const PASS_RADIUS_X = 24
const PASS_RADIUS_Y = 11
const PASS_LATERAL_JITTER = 5 // scarto laterale dal centro: non attraversa sempre lo stesso punto
const PASS_Z_JITTER = 2
// durata del passaggio scelta direttamente (non derivata da distanza/velocità): la
// distanza tra ingresso e uscita varia parecchio con l'angolo (da 2×RADIUS_Y a
// 2×RADIUS_X), una velocità fissa avrebbe reso alcuni passaggi troppo brevi per fare in
// tempo a crescere e stabilizzarsi prima di rimpicciolire di nuovo (stessa tecnica di
// ShootingStar/randomComet: distanza e durata indipendenti, la velocità si ricava dopo)
const LIFETIME_RANGE = [9, 17]
const TRANSITION_TIME_S = 3.5 // durata (secondi) di comparsa/scomparsa graduale a inizio/fine passaggio
const RECESSION_DEPTH = 10 // quanto extra si allontanano in z durante la comparsa/scomparsa
const CLUSTER_SPREAD = { x: 5.5, y: 3, z: 3 } // offset massimo di ogni sasso dal centro:
// abbastanza largo da non far toccare i contorni cartoon tra un sasso e l'altro
// un colore diverso per ogni sasso (COUNT===length): niente ripetizioni, si distinguono
// anche quando si sovrappongono in profondità
const ROCK_COLORS = ['#9c8465', '#5f5850', '#b39a72', '#443f3a', '#8a6f56', '#6e6558', '#a68a5c', '#8c7f6a']

function randRange(min, max) {
  return min + Math.random() * (max - min)
}

// easing 0→1 invece di una rampa lineare: la comparsa/scomparsa parte e finisce dolce
function smoothstep(t) {
  const c = THREE.MathUtils.clamp(t, 0, 1)
  return c * c * (3 - 2 * c)
}

// schiarisce (percent > 0) o scurisce (percent < 0) un colore esadecimale - serve per
// derivare le macchie dei crateri dal colore base di ogni sasso
function shade(hex, percent) {
  const num = parseInt(hex.slice(1), 16)
  const amt = Math.round(2.55 * percent)
  const clamp = (c) => Math.min(255, Math.max(0, c))
  const r = clamp((num >> 16) + amt)
  const g = clamp(((num >> 8) & 0x00ff) + amt)
  const b = clamp((num & 0x0000ff) + amt)
  return `rgb(${r},${g},${b})`
}

// PRNG deterministico (mulberry32): stesso seed = stessa geometria, serve per
// generare un piccolo pool di sassi diversi una sola volta e riusarli sulle 8 istanze
function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// icosaedro deformato sommando qualche onda sinusoidale lungo direzioni casuali (niente
// libreria di noise): ogni vertice si sposta lungo la propria normale, il risultato è un
// sasso bitorzoluto invece della sfera di partenza. toNonIndexed() prima di ricalcolare
// le normali = ogni faccia ha vertici propri = shading piatto a sfaccettature (stile
// "rock" low-poly, coerente con la resa cartoon dei pianeti)
function createRockGeometry(seed) {
  const rng = mulberry32(seed)
  const base = new THREE.IcosahedronGeometry(1, 1)
  // dalla r150 circa PolyhedronGeometry (icosaedro incluso) è già non indicizzata:
  // toNonIndexed() su una geometria già tale è una no-op ma stampa un warning
  const geometry = base.index ? base.toNonIndexed() : base
  const pos = geometry.attributes.position
  const bumps = Array.from({ length: 4 }, () => ({
    axis: new THREE.Vector3(rng() * 2 - 1, rng() * 2 - 1, rng() * 2 - 1).normalize(),
    freq: 1.5 + rng() * 2.5,
    phase: rng() * Math.PI * 2,
    amp: 0.12 + rng() * 0.18,
  }))

  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize()
    let offset = 1
    bumps.forEach(({ axis, freq, phase, amp }) => {
      offset += Math.sin(v.dot(axis) * freq * Math.PI + phase) * amp
    })
    v.multiplyScalar(Math.max(0.55, offset))
    pos.setXYZ(i, v.x, v.y, v.z)
  }
  geometry.computeVertexNormals()
  return geometry
}

// identità di un sasso: geometria e colore/craterMap (texture crateri, stessa tecnica
// dei pianeti). Rigenerata ad ogni passaggio insieme al resto - costa solo 8 canvas e
// qualche deformazione di geometria ogni 25-50s, trascurabile
function createRockIdentity(index) {
  const color = ROCK_COLORS[index % ROCK_COLORS.length]
  return {
    geometryIndex: index % GEOMETRY_VARIANTS,
    craterMap: createCraterTexture(color, [shade(color, -20), shade(color, 14)]),
  }
}

// stato di un sasso per questo passaggio: offset dal centro del gruppo (la formazione è
// rigida per tutto il passaggio), scala, asse/velocità di spin
function createRockInstance() {
  return {
    offset: new THREE.Vector3(
      randRange(-CLUSTER_SPREAD.x, CLUSTER_SPREAD.x),
      randRange(-CLUSTER_SPREAD.y, CLUSTER_SPREAD.y),
      randRange(-CLUSTER_SPREAD.z, CLUSTER_SPREAD.z)
    ),
    scale: new THREE.Vector3(randRange(0.4, 0.75), randRange(0.35, 0.6), randRange(0.4, 0.7)),
    spinAxis: new THREE.Vector3(randRange(-1, 1), randRange(-1, 1), randRange(-1, 1)).normalize(),
    spinSpeed: randRange(0.3, 0.9) * (Math.random() < 0.5 ? -1 : 1),
    spinAngle: randRange(0, Math.PI * 2),
  }
}

// genera un passaggio: punto di ingresso e di uscita presi da lati opposti di
// un'ellisse attorno al centro scena, con angolo e scarto laterale casuali - ogni
// volta entra/esce da un punto diverso, mai lo stesso percorso rettilineo
function randomPass() {
  const angle = randRange(0, Math.PI * 2)
  const dirX = Math.cos(angle)
  const dirY = Math.sin(angle)
  const perpX = -dirY
  const perpY = dirX
  const lateral = randRange(-PASS_LATERAL_JITTER, PASS_LATERAL_JITTER)
  const z = GROUP_Z + randRange(-PASS_Z_JITTER, PASS_Z_JITTER)

  const start = new THREE.Vector3(
    -dirX * PASS_RADIUS_X + perpX * lateral,
    -dirY * PASS_RADIUS_Y + perpY * lateral,
    z
  )
  const end = new THREE.Vector3(dirX * PASS_RADIUS_X - perpX * lateral, dirY * PASS_RADIUS_Y - perpY * lateral, z)
  const lifetime = randRange(...LIFETIME_RANGE)

  return { start, end, lifetime }
}

// un singolo passaggio del gruppetto: viaggia in linea retta da `start` a `end` in
// `lifetime` secondi, comparendo/scomparendo gradualmente ai due estremi (stesso
// principio della dissolvenza in profondità già usato prima), poi si smonta da sé
function AsteroidPass({ start, end, lifetime, reduced, onDone }) {
  const rockRefs = useRef([])
  const identities = useMemo(() => Array.from({ length: COUNT }, (_, i) => createRockIdentity(i)), [])
  const geometries = useMemo(
    () => Array.from({ length: GEOMETRY_VARIANTS }, (_, i) => createRockGeometry(i * 97 + 13)),
    []
  )
  const gradientMap = useMemo(() => createToonGradient(4), [])
  const instances = useMemo(() => Array.from({ length: COUNT }, createRockInstance), [])
  const elapsed = useRef(0)
  const done = useRef(false)

  useFrame((_, delta) => {
    if (done.current) return

    if (!reduced) elapsed.current += delta
    if (elapsed.current >= lifetime) {
      done.current = true
      onDone()
      return
    }

    const t = elapsed.current / lifetime
    const envelope = smoothstep(Math.min(elapsed.current, lifetime - elapsed.current) / TRANSITION_TIME_S)
    const recession = (1 - envelope) * RECESSION_DEPTH
    const centerX = THREE.MathUtils.lerp(start.x, end.x, t)
    const centerY = THREE.MathUtils.lerp(start.y, end.y, t)
    const centerZ = THREE.MathUtils.lerp(start.z, end.z, t)

    instances.forEach((instance, i) => {
      const rockGroup = rockRefs.current[i]
      if (!rockGroup) return
      if (!reduced) instance.spinAngle += instance.spinSpeed * delta

      rockGroup.position.set(
        centerX + instance.offset.x,
        centerY + instance.offset.y,
        centerZ + instance.offset.z - recession
      )
      rockGroup.scale.set(instance.scale.x * envelope, instance.scale.y * envelope, instance.scale.z * envelope)
      rockGroup.setRotationFromAxisAngle(instance.spinAxis, instance.spinAngle)
    })
  })

  return identities.map((identity, i) => (
    <group key={i} ref={(el) => (rockRefs.current[i] = el)}>
      <mesh geometry={geometries[identity.geometryIndex]}>
        <meshToonMaterial map={identity.craterMap} gradientMap={gradientMap} />
      </mesh>
      {/* contorno cartoon: stessa geometria vista da dentro (BackSide) e leggermente
          più grande, coperta al centro dal sasso vero - come su Planet.jsx */}
      <mesh geometry={geometries[identity.geometryIndex]} scale={1.08}>
        <meshBasicMaterial color="#050912" side={THREE.BackSide} />
      </mesh>
    </group>
  ))
}

// orchestratore: decide *quando* far partire un passaggio (useRandomInterval), ne
// genera i parametri random e monta un <AsteroidPass> a sé - identico a ShootingStar
export default function Asteroids({ reduced }) {
  const [passes, setPasses] = useState([])
  const nextId = useRef(0)

  useRandomInterval(
    () => {
      const id = nextId.current++
      setPasses((prev) => [...prev, { id, ...randomPass() }])
    },
    MIN_INTERVAL_MS,
    MAX_INTERVAL_MS,
    { enabled: !reduced }
  )

  const handleDone = useCallback((id) => {
    setPasses((prev) => prev.filter((p) => p.id !== id))
  }, [])

  return passes.map(({ id, ...params }) => (
    <AsteroidPass key={id} {...params} reduced={reduced} onDone={() => handleDone(id)} />
  ))
}
