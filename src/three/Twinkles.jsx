import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { placeAt, useAspect } from './layout'
import { palette } from './palette'
import { mulberry32 } from './utils'

// stelle cartoon che scintillano, sopra al tappeto di puntini di Starfield: scintille a quattro
// punte come le stelle dei progetti nell'originale, ognuna con il suo ritmo
const COUNT = 140
const DISTANCE_RANGE = [40, 200]
const SIZE_RANGE = [7, 16] // pixel CSS al massimo dello scintillio
const SPEED_RANGE = [0.6, 1.8] // rad/s: un ciclo dura fra 3.5 e 10 secondi
// un po' oltre i bordi dello schermo: quando la camera insegue il mouse si scopre altro cielo
const SPREAD = 1.4

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aSize;
  attribute float aPhase;
  attribute float aSpeed;
  attribute vec3 aColor;
  varying vec3 vColor;

  void main() {
    vColor = aColor;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    // la dimensione pulsa, e per un tratto del ciclo la stella si spegne del tutto
    float pulse = smoothstep(-0.3, 1.0, sin(uTime * aSpeed + aPhase));
    gl_PointSize = aSize * uPixelRatio * pulse;
  }
`

const fragmentShader = /* glsl */ `
  varying vec3 vColor;

  void main() {
    vec2 p = abs(gl_PointCoord * 2.0 - 1.0);
    // stella a quattro punte dai lati concavi (un astroide), con il bordo netto
    if (sqrt(p.x) + sqrt(p.y) > 1.0) discard;
    gl_FragColor = vec4(vColor, 1.0);
  }
`

const COLORS = [
  [0.7, palette.cream],
  [0.9, palette.lightYellow],
  [1, palette.ice],
].map(([upTo, hex]) => [upTo, new THREE.Color(hex)])

function createGeometry(aspect) {
  const rng = mulberry32(21)
  const positions = new Float32Array(COUNT * 3)
  const colors = new Float32Array(COUNT * 3)
  const sizes = new Float32Array(COUNT)
  const phases = new Float32Array(COUNT)
  const speeds = new Float32Array(COUNT)

  for (let i = 0; i < COUNT; i++) {
    const distance = DISTANCE_RANGE[0] + rng() * (DISTANCE_RANGE[1] - DISTANCE_RANGE[0])
    const anchor = [(rng() * 2 - 1) * SPREAD, (rng() * 2 - 1) * SPREAD]
    positions.set(placeAt(anchor, distance, aspect), i * 3)
    const pick = rng()
    const [, color] = COLORS.find(([upTo]) => pick <= upTo)
    colors.set([color.r, color.g, color.b], i * 3)
    sizes[i] = SIZE_RANGE[0] + rng() * (SIZE_RANGE[1] - SIZE_RANGE[0])
    phases[i] = rng() * Math.PI * 2
    speeds[i] = SPEED_RANGE[0] + rng() * (SPEED_RANGE[1] - SPEED_RANGE[0])
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))
  geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
  return geometry
}

export default function Twinkles({ reduced }) {
  const aspect = useAspect()
  const dpr = useThree((state) => state.viewport.dpr)
  const geometry = useMemo(() => createGeometry(aspect), [aspect])
  const uniforms = useRef({ uTime: { value: 0 }, uPixelRatio: { value: dpr } })
  uniforms.current.uPixelRatio.value = dpr

  useEffect(() => () => geometry.dispose(), [geometry])

  // reduced motion: il tempo si ferma e ogni stella resta com'era, senza scintillare
  useFrame((_, delta) => {
    if (!reduced) uniforms.current.uTime.value += delta
  })

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms.current} />
    </points>
  )
}
