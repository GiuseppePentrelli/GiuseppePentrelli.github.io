import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import * as THREE from 'three'

// landmark fisso, non un evento one-shot come Ufo/Nova: sta in un angolo di cielo libero da
// pianeti (che occupano z -20/-52 in un raggio di ~40 unità dall'origine) e nuvole di nebulosa
// (agli angoli estremi, z -90/-105)
const POSITION = [27, 16, -68]
const DISK_SCALE = 22
const CORE_FADE_SCALE = DISK_SCALE * 0.32 // piano col nucleo sfumato, vedi createCoreTexture
// la sfera vera serve solo per l'occlusione reale di quel che sta dietro: deve restare
// nascosta dentro il nucleo pieno (piccolissimo) della texture sfumata sopra di lei, quindi
// molto più piccola del raggio a cui quel nucleo pieno finisce (0.12 * CORE_FADE_SCALE/2)
const CORE_SIZE = CORE_FADE_SCALE * 0.06 * 0.5
const SPIN_SPEED = 0.15 // rad/s

// nucleo pieno piccolissimo che sfuma man mano verso il trasparente: una sfera 3D ha sempre
// un bordo netto (è geometria solida, non ha una sua sfumatura), quindi per un bordo morbido
// serve una texture a gradiente su un piano billboard, non (solo) una mesh sferica
function createCoreTexture() {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const c = size / 2

  const grad = ctx.createRadialGradient(c, c, 0, c, c, size * 0.5)
  grad.addColorStop(0, 'rgba(0,0,0,1)')
  grad.addColorStop(0.12, 'rgba(0,0,0,1)') // nucleo pieno piccolissimo
  grad.addColorStop(1, 'rgba(0,0,0,0)') // poi sfuma man mano fino a trasparente
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)

  return new THREE.CanvasTexture(canvas)
}

// ispirato alla foto EHT del buco nero M87: non un anello netto/simmetrico come un anello
// di Saturno, ma un vortice di plasma - gradiente continuo (mai fasce con bordi netti), più
// luminoso da un lato (effetto di beaming relativistico: il lato del disco che si avvicina
// appare più brillante di quello che si allontana) e un nucleo che sfuma nel nero invece di
// avere un contorno netto
function createAccretionDiskTexture() {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const c = size / 2

  // base: gradiente radiale continuo e volutamente tenue - deve fare da fondo al punto caldo,
  // non competere con lui (altrimenti l'anello resta uniforme invece che asimmetrico)
  const base = ctx.createRadialGradient(c, c, size * 0.06, c, c, size * 0.5)
  base.addColorStop(0, 'rgba(200,90,30,0.6)')
  base.addColorStop(0.3, 'rgba(180,50,15,0.55)')
  base.addColorStop(0.6, 'rgba(120,25,10,0.4)')
  base.addColorStop(0.85, 'rgba(80,15,10,0.15)')
  base.addColorStop(1, 'rgba(80,10,10,0)')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, size, size)

  // punto caldo molto spostato dal centro e ben più luminoso della base: è questo forte
  // contrasto (non solo un'offset leggero) a leggersi come l'asimmetria "a falce" della foto
  // di riferimento, invece dell'anello uniforme (troppo "disegnato/cartoon") della prima versione
  const hotX = c - size * 0.24
  const hotY = c + size * 0.18
  const hot = ctx.createRadialGradient(hotX, hotY, 0, hotX, hotY, size * 0.42)
  hot.addColorStop(0, 'rgba(255,252,230,1)')
  hot.addColorStop(0.25, 'rgba(255,210,110,0.95)')
  hot.addColorStop(0.55, 'rgba(255,150,50,0.6)')
  hot.addColorStop(1, 'rgba(255,120,40,0)')
  ctx.globalCompositeOperation = 'lighter'
  ctx.fillStyle = hot
  ctx.fillRect(0, 0, size, size)
  ctx.globalCompositeOperation = 'source-over'

  // filamenti curvi (archi, non linee dritte): danno la texture "mossa" del plasma e rendono
  // visibile lo spin quando il piano ruota, dato che un semplice gradiente radiale sarebbe
  // perfettamente simmetrico e ruotarlo non si vedrebbe alcun movimento
  for (let i = 0; i < 26; i++) {
    const startAngle = Math.random() * Math.PI * 2
    const radius = size * (0.14 + Math.random() * 0.3)
    const sweep = (0.3 + Math.random() * 0.6) * (Math.random() < 0.5 ? 1 : -1)
    const g = 210 + Math.floor(Math.random() * 40)
    const b = 140 + Math.floor(Math.random() * 60)
    ctx.strokeStyle = `rgba(255,${g},${b},${0.06 + Math.random() * 0.14})`
    ctx.lineWidth = 1.5 + Math.random() * 3
    ctx.beginPath()
    ctx.arc(c, c, radius, startAngle, startAngle + sweep)
    ctx.stroke()
  }

  // vuoto centrale: erosione sfumata (gradiente, non un cerchio a bordo netto) così il nero
  // si fonde morbido nel disco invece di lasciare un bordo disegnato
  const hole = ctx.createRadialGradient(c, c, 0, c, c, size * 0.22)
  hole.addColorStop(0, 'rgba(0,0,0,1)')
  hole.addColorStop(0.55, 'rgba(0,0,0,1)')
  hole.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.globalCompositeOperation = 'destination-out'
  ctx.fillStyle = hole
  ctx.fillRect(0, 0, size, size)
  ctx.globalCompositeOperation = 'source-over'

  // forza la trasparenza oltre un certo raggio, qualunque cosa sia stata disegnata finora:
  // altrimenti gli angoli del piano quadrato (fuori dal cerchio inscritto nei gradienti sopra)
  // restano visibili e si vede il bordo netto della geometria invece di una sfumatura naturale
  const mask = ctx.createRadialGradient(c, c, size * 0.32, c, c, size * 0.48)
  mask.addColorStop(0, 'rgba(0,0,0,1)')
  mask.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.globalCompositeOperation = 'destination-in'
  ctx.fillStyle = mask
  ctx.fillRect(0, 0, size, size)
  ctx.globalCompositeOperation = 'source-over'

  return new THREE.CanvasTexture(canvas)
}

export default function BlackHole({ reduced }) {
  const diskRef = useRef()
  const diskTexture = useMemo(() => createAccretionDiskTexture(), [])
  const coreTexture = useMemo(() => createCoreTexture(), [])

  useFrame((_, delta) => {
    if (reduced || !diskRef.current) return
    diskRef.current.rotation.z += delta * SPIN_SPEED
  })

  return (
    <group position={POSITION}>
      {/* vuoto vero: sfera opaca, occlude davvero quel che sta dietro. Resta nascosta dentro
          il nucleo pieno della texture sfumata qui sotto (CORE_SIZE è pensato apposta più
          piccolo). fog={false}: a questa profondità il fog della scena la tingerebbe di blu,
          uscendo dal "vuoto assoluto" che deve comunicare */}
      <mesh>
        <sphereGeometry args={[CORE_SIZE, 32, 32]} />
        <meshBasicMaterial color="#000000" fog={false} />
      </mesh>
      {/* billboard, non un piano inclinato: nella foto di riferimento il disco non è una
          semplice ellisse in prospettiva, è un anello asimmetrico "a falce" per un effetto
          relativistico - più semplice e più fedele tenerlo sempre di fronte alla camera e
          affidare l'asimmetria/i filamenti alla texture, con uno spin continuo */}
      <Billboard>
        <mesh ref={diskRef} scale={DISK_SCALE}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial
            map={diskTexture}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
            fog={false}
          />
        </mesh>
        {/* nucleo sfumato, disegnato sopra al disco (blending normale, non additivo: deve
            scurire quello che ha sotto, non sommarsi) - piccolo scostamento in z per garantire
            che venga renderizzato dopo il disco, essendo alla stessa profondità del gruppo */}
        <mesh position={[0, 0, 0.01]} scale={CORE_FADE_SCALE}>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial map={coreTexture} transparent depthWrite={false} toneMapped={false} fog={false} />
        </mesh>
      </Billboard>
    </group>
  )
}
