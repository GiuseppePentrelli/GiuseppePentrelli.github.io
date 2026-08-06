import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import * as THREE from 'three'

// landmark fisso, non un evento one-shot come Ufo/Nova: sta in un angolo di cielo libero da
// pianeti (che occupano z -20/-52 in un raggio di ~40 unità dall'origine) e nuvole di nebulosa
// (agli angoli estremi, z -90/-105)
const POSITION = [27, 16, -68]
const DISK_SCALE = 22
// il buco della texture (vedi createAccretionDiskTexture) è completamente trasparente fino a
// frazione 0.121 del mezzo-piano, poi sfuma gradualmente fino a 0.22 dove torna colorata.
// CORE_SIZE cade a metà di quella sfumatura (frazione 0.17 * DISK_SCALE/2): abbastanza per
// coprire la parte trasparente, abbastanza dentro la sfumatura da fondersi senza un bordo netto
const CORE_SIZE = DISK_SCALE * 0.085
const SPIN_SPEED = 0.15 // rad/s

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

  useFrame((_, delta) => {
    if (reduced || !diskRef.current) return
    diskRef.current.rotation.z += delta * SPIN_SPEED
  })

  return (
    <group position={POSITION}>
      {/* vuoto vero: sfera opaca, occlude davvero quel che sta dietro. fog={false}: a questa
          profondità il fog della scena la tingerebbe di blu, uscendo dal "vuoto assoluto"
          che deve comunicare */}
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
      </Billboard>
    </group>
  )
}
