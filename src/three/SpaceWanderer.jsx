import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture, Billboard } from '@react-three/drei'
import { Vector3 } from 'three'

// componente generico: fa "vagare" un'immagine per lo schermo con velocità e
// rotazione random, come se si vedesse lo spazio attraverso un oblò — quando
// esce dall'inquadratura rientra da un lato casuale, non rimbalza sui bordi.
// Non sa nulla di astronauti o alieni: riusabile per qualunque sprite decorativo
// che debba muoversi così (stesso spirito di useRandomInterval per ShootingStar).
//
// Billboard: la camera si muove (parallasse in CameraRig), quindi un piano fisso
// sull'asse Z si vedrebbe "di taglio" appena la camera si sposta. Billboard ruota
// il piano per farlo puntare sempre verso la camera; lo spin (rotation.z) resta
// separato e si applica nel sistema di riferimento locale del billboard, quindi
// i due movimenti (guardare la camera + ruotare su se stesso) non interferiscono.
//
// `avoid`: array di ref { current: {x,y} } di altri SpaceWanderer da cui tenersi
// alla larga. L'antisovrapposizione agisce SOLO sulla direzione di marcia (mai
// sulla posizione direttamente): la posizione avanza sempre di `speed * delta`,
// quindi lo spostamento per frame resta piccolo e costante, senza scatti.
// `positionRef`: ref { current: {x,y} } dove questa istanza scrive la propria
// posizione a ogni frame, così altri SpaceWanderer possono evitarla.

const RESPAWN_RETRIES = 5
const RESPAWN_MARGIN = 0.5 // quanto oltre il proprio bordo appare/scompare l'oggetto
const EDGE_SPREAD_DEG = 50 // variazione random attorno alla direzione "verso il centro" al rientro

function randRange(min, max) {
  return min + Math.random() * (max - min)
}

// normalizza un angolo qualsiasi nell'intervallo (-PI, PI]
function wrapAngle(angle) {
  return Math.atan2(Math.sin(angle), Math.cos(angle))
}

// interpola da `from` verso `to` (radianti) sempre lungo il verso più breve,
// così non si vedono mai scatti di quasi 360° quando gli angoli attraversano ±180°
function lerpAngle(from, to, t) {
  return from + wrapAngle(to - from) * Math.min(t, 1)
}

// genera un punto di ingresso su uno dei 4 bordi del viewport (bounds = {cx, cy, halfW,
// halfH, halfSize}, il vero rettangolo visibile a questa profondità), con direzione verso l'interno
function randomEdgeSpawn(bounds) {
  const { cx, cy, halfW, halfH, halfSize } = bounds
  const edge = Math.floor(Math.random() * 4) // 0 sx, 1 dx, 2 sopra, 3 sotto
  let x, y, baseAngle
  switch (edge) {
    case 0:
      x = cx - halfW - halfSize - RESPAWN_MARGIN
      y = randRange(cy - halfH, cy + halfH)
      baseAngle = 0
      break
    case 1:
      x = cx + halfW + halfSize + RESPAWN_MARGIN
      y = randRange(cy - halfH, cy + halfH)
      baseAngle = 180
      break
    case 2:
      x = randRange(cx - halfW, cx + halfW)
      y = cy + halfH + halfSize + RESPAWN_MARGIN
      baseAngle = -90
      break
    default:
      x = randRange(cx - halfW, cx + halfW)
      y = cy - halfH - halfSize - RESPAWN_MARGIN
      baseAngle = 90
  }
  const angle = ((baseAngle + randRange(-EDGE_SPREAD_DEG, EDGE_SPREAD_DEG)) * Math.PI) / 180
  return { x, y, angle }
}

// come randomEdgeSpawn, ma riprova finché il punto non è abbastanza lontano dagli
// `avoid` — usata sia al primo spawn che al rientro dopo un'uscita di scena, così
// non si rientra mai già "in rotta di collisione" con un altro wanderer
function pickSafeSpawn(bounds, avoid, avoidDistance) {
  let spawn = randomEdgeSpawn(bounds)
  for (let i = 0; i < RESPAWN_RETRIES; i++) {
    const tooClose = avoid.some((ref) => {
      const other = ref.current
      return other && Math.hypot(spawn.x - other.x, spawn.y - other.y) < avoidDistance
    })
    if (!tooClose) break
    spawn = randomEdgeSpawn(bounds)
  }
  return spawn
}

export default function SpaceWanderer({
  src,
  pixelSize = 60, // dimensione desiderata in pixel CSS sullo schermo (come i 60px fissi dell'originale),
  // ricalcolata ogni frame in unità mondo così resta uguale in pixel su qualunque device/aspect ratio
  z = -6,
  speed = 0.6, // unità mondo/secondo
  rotationSpeed = 40, // gradi/secondo, spin visivo indipendente dalla direzione di moto
  positionRef,
  avoid = [],
  avoidDistance = 2.8, // sotto questa distanza punta decisamente in verso opposto
  steerDistance = 4.5, // sotto questa distanza inizia a virare gradualmente
  turnRate = 3, // quanto in fretta (rad/s circa) la virata morbida raggiunge la direzione desiderata
}) {
  const texture = useTexture(src)
  const billboardRef = useRef()
  const spinRef = useRef()
  const posRef = useRef(null) // { x, y }
  const headingRef = useRef(0) // direzione di moto, radianti
  const rotSpeedRef = useRef(0)
  const spinAngleRef = useRef(0) // spin visivo, gradi
  const forwardRef = useRef(new Vector3()) // riusato ogni frame, evita di allocare
  const hasEnteredRef = useRef(false) // true solo dopo essere stato completamente visibile almeno una volta dallo spawn

  useFrame((state, rawDelta) => {
    if (!billboardRef.current) return

    // difesa contro delta anomali: al primo frame utile dopo un caricamento a freddo
    // (asset da scaricare, canvas che si sta ancora dimensionando) il delta può essere
    // molto più grande del normale ~16ms — senza questo tetto, speed/rotationSpeed
    // moltiplicati per un delta enorme producono uno scatto enorme in un solo frame
    const delta = Math.min(rawDelta, 0.1)

    const camera = state.camera
    const { width, height } = state.viewport.getCurrentViewport(camera, [0, 0, z])
    const halfW = width / 2
    const halfH = height / 2
    // quanti pixel CSS occupa un'unità mondo verticalmente a questa profondità: è lo stesso
    // fattore sia in orizzontale che in verticale (nessuna distorsione), quindi basta questo
    // per convertire "voglio pixelSize px sullo schermo" nella dimensione mondo corrispondente
    const pixelsPerUnit = state.size.height / height
    const size = pixelSize / pixelsPerUnit
    const halfSize = size / 2

    // il canvas non è ancora dimensionato correttamente: aspetta il prossimo frame
    // invece di calcolare bound/spawn su un viewport ancora inattendibile
    if (halfW < 0.5 || halfH < 0.5) return

    // CameraRig sposta la camera per il parallasse: il "centro" di ciò che si vede a
    // questa profondità NON è l'origine del mondo, è dove punta realmente la camera in
    // questo momento. Lo trovo intersecando la direzione di sguardo col piano z = questa
    // profondità — senza questo, i bordi calcolati non seguono ciò che si vede davvero,
    // e gli sprite vengono dichiarati dentro/fuori schermo nel punto sbagliato.
    // Assume che la camera resti sempre più vicina a z=0 dello sprite (forwardRef.z < 0,
    // mai zero): vero con l'attuale CameraRig, che parte a z=1 e guarda sempre l'origine.
    // Se in futuro la camera cambiasse comportamento (dolly, target diverso), va riverificato.
    camera.getWorldDirection(forwardRef.current)
    const planeDist = (z - camera.position.z) / forwardRef.current.z
    const cx = camera.position.x + forwardRef.current.x * planeDist
    const cy = camera.position.y + forwardRef.current.y * planeDist
    const bounds = { cx, cy, halfW, halfH, halfSize }

    if (!posRef.current) {
      const spawn = pickSafeSpawn(bounds, avoid, avoidDistance)
      posRef.current = { x: spawn.x, y: spawn.y }
      headingRef.current = spawn.angle
      rotSpeedRef.current = (Math.random() < 0.5 ? -1 : 1) * rotationSpeed
      hasEnteredRef.current = false
    }

    const pos = posRef.current

    // direzione "via dall'altro" pesata per vicinanza: la somma di tutti gli `avoid`
    // nel raggio di virata, e la distanza minima tra tutti (decide quanto è urgente)
    let awayX = 0
    let awayY = 0
    let minDist = Infinity
    for (const ref of avoid) {
      const other = ref.current
      if (!other) continue
      const dx = pos.x - other.x
      const dy = pos.y - other.y
      const dist = Math.hypot(dx, dy)
      if (dist < minDist) minDist = dist
      if (dist > 0 && dist < steerDistance) {
        const strength = (steerDistance - dist) / steerDistance
        awayX += (dx / dist) * strength
        awayY += (dy / dist) * strength
      }
    }

    if (awayX !== 0 || awayY !== 0) {
      const desiredHeading = Math.atan2(awayY, awayX)
      // troppo vicino: punta decisamente in verso opposto invece di virare piano piano
      const t = minDist < avoidDistance ? 1 : turnRate * delta
      headingRef.current = lerpAngle(headingRef.current, desiredHeading, t)
    }

    // la posizione avanza sempre della stessa quantità (speed * delta): l'antisovrapposizione
    // cambia solo verso quale direzione, mai "di scatto" quanto ci si sposta
    pos.x += Math.cos(headingRef.current) * speed * delta
    pos.y += Math.sin(headingRef.current) * speed * delta
    spinAngleRef.current += rotSpeedRef.current * delta

    // lo spawn nasce apposta appena fuori dai bordi (per "entrare da fuori"), quindi il
    // controllo di uscita si attiva solo dopo che è stato visto completamente dentro
    // l'inquadratura almeno una volta — altrimenti si becca "fuori" il frame subito dopo
    // essere nato e fa subito un altro respawn, all'infinito, senza mai entrare in scena
    const fullyInside =
      pos.x - halfSize > cx - halfW &&
      pos.x + halfSize < cx + halfW &&
      pos.y - halfSize > cy - halfH &&
      pos.y + halfSize < cy + halfH
    if (fullyInside) hasEnteredRef.current = true

    const fullyOutside =
      pos.x + halfSize < cx - halfW ||
      pos.x - halfSize > cx + halfW ||
      pos.y + halfSize < cy - halfH ||
      pos.y - halfSize > cy + halfH

    // completamente fuori dall'inquadratura (dopo esserci stato dentro): esce "dall'oblò"
    // e rientra da un lato casuale
    if (hasEnteredRef.current && fullyOutside) {
      const spawn = pickSafeSpawn(bounds, avoid, avoidDistance)
      pos.x = spawn.x
      pos.y = spawn.y
      headingRef.current = spawn.angle
      rotSpeedRef.current = (Math.random() < 0.5 ? -1 : 1) * rotationSpeed
      hasEnteredRef.current = false
    }

    if (positionRef) {
      positionRef.current.x = pos.x
      positionRef.current.y = pos.y
    }

    billboardRef.current.position.set(pos.x, pos.y, z)
    if (spinRef.current) {
      spinRef.current.rotation.z = (spinAngleRef.current * Math.PI) / 180
      spinRef.current.scale.setScalar(size)
      // il mesh parte invisibile (vedi JSX) per evitare un flash al centro schermo se il
      // primissimo useFrame utile esce prima di arrivare qui (canvas non ancora dimensionato)
      spinRef.current.visible = true
    }
  })

  return (
    <Billboard ref={billboardRef} position={[0, 0, z]}>
      <mesh ref={spinRef} visible={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={texture} transparent toneMapped={false} />
      </mesh>
    </Billboard>
  )
}
