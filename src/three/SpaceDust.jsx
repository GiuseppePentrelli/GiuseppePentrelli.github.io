import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { halfViewAt, zAt, useAspect } from './layout'
import { palette } from './palette'
import { mulberry32 } from './utils'

// polvere spaziale vicinissima alla camera: puntini che scivolano piano tutti nella stessa
// direzione, come se la navicella avanzasse. Essendo così vicini, quando la camera insegue il
// mouse si spostano molto più di tutto il resto, ed è questo che fa sentire la profondità
const COUNT = 170
const DISTANCE_RANGE = [3, 26]
const SIZE_RANGE = [1.2, 2.6] // pixel CSS
const DRIFT = new THREE.Vector2(-0.8, -0.45).normalize() // verso cui scivola la polvere
const SPEED_RANGE = [0.08, 0.3] // unità mondo al secondo
const MARGIN = 1.3 // il riquadro in cui si muove è un po' più grande dello schermo

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aSize;
  attribute vec2 aVelocity;
  attribute vec2 aBounds;

  void main() {
    // ogni puntino scivola e, uscito dal suo riquadro, rientra dal lato opposto (mod)
    vec2 xy = mod(position.xy + aVelocity * uTime + aBounds, 2.0 * aBounds) - aBounds;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(xy, position.z, 1.0);
    gl_PointSize = aSize * uPixelRatio;
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;

  void main() {
    // puntino tondo con il bordo netto
    if (length(gl_PointCoord - 0.5) > 0.5) discard;
    gl_FragColor = vec4(uColor, 0.45);
  }
`

function createGeometry(aspect) {
  const rng = mulberry32(5)
  const positions = new Float32Array(COUNT * 3)
  const sizes = new Float32Array(COUNT)
  const velocities = new Float32Array(COUNT * 2)
  const bounds = new Float32Array(COUNT * 2)

  for (let i = 0; i < COUNT; i++) {
    const distance = DISTANCE_RANGE[0] + rng() * (DISTANCE_RANGE[1] - DISTANCE_RANGE[0])
    const { halfW, halfH } = halfViewAt(distance, aspect)
    const bx = halfW * MARGIN
    const by = halfH * MARGIN
    positions.set([(rng() * 2 - 1) * bx, (rng() * 2 - 1) * by, zAt(distance)], i * 3)
    bounds.set([bx, by], i * 2)
    // la stessa direzione per tutti, con un po' di variazione: un flusso, non uno sciame
    const speed = SPEED_RANGE[0] + rng() * (SPEED_RANGE[1] - SPEED_RANGE[0])
    const angle = Math.atan2(DRIFT.y, DRIFT.x) + (rng() - 0.5) * 0.5
    velocities.set([Math.cos(angle) * speed, Math.sin(angle) * speed], i * 2)
    sizes[i] = SIZE_RANGE[0] + rng() * (SIZE_RANGE[1] - SIZE_RANGE[0])
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
  geometry.setAttribute('aVelocity', new THREE.BufferAttribute(velocities, 2))
  geometry.setAttribute('aBounds', new THREE.BufferAttribute(bounds, 2))
  return geometry
}

export default function SpaceDust({ reduced }) {
  const aspect = useAspect()
  const dpr = useThree((state) => state.viewport.dpr)
  const geometry = useMemo(() => createGeometry(aspect), [aspect])
  const uniforms = useRef({
    uTime: { value: 0 },
    uPixelRatio: { value: dpr },
    uColor: { value: new THREE.Color(palette.cream) },
  })
  uniforms.current.uPixelRatio.value = dpr

  useEffect(() => () => geometry.dispose(), [geometry])

  // reduced motion: la polvere si ferma, come la camera
  useFrame((_, delta) => {
    if (!reduced) uniforms.current.uTime.value += delta
  })

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms.current}
        transparent
        depthWrite={false}
      />
    </points>
  )
}
