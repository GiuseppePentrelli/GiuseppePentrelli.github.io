import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import { AdditiveBlending, Color } from 'three'

const noise = `
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float noise3(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
      mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
      mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float turbulence(vec3 p) {
    float value = 0.0;
    float weight = 0.5;
    for (int i = 0; i < 4; i++) {
      value += weight * noise3(p);
      p = p * 2.03 + 13.7;
      weight *= 0.5;
    }
    return value;
  }
`

const surfaceVertex = `
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vPosition;
  void main() {
    vec4 view = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = -view.xyz;
    vPosition = position;
    gl_Position = projectionMatrix * view;
  }
`

const surfaceFragment = `
  uniform vec3 uColor;
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vPosition;
  ${noise}
  void main() {
    float facing = max(dot(normalize(vNormal), normalize(vView)), 0.0);
    vec3 p = normalize(vPosition);
    vec3 drift = vec3(uTime * 0.025, -uTime * 0.012, 0.0);
    float flow = turbulence(p * 4.0 + drift);
    float cells = turbulence(p * 12.0 + flow * 2.0 + drift);
    float patches = smoothstep(0.35, 0.64, cells);
    float bands = floor(patches * 3.0 + 0.5) / 3.0;
    vec3 warm = mix(uColor, vec3(1.0, 0.96, 0.84), 0.2);
    vec3 hot = mix(uColor, vec3(1.0), 0.68);
    vec3 color = mix(warm, hot, bands);
    float light = dot(normalize(vNormal), normalize(vec3(0.6, 0.7, 1.0)));
    float shade = floor(clamp(light * 0.5 + 0.5, 0.0, 1.0) * 3.0) / 3.0;
    color *= 0.82 + 0.18 * shade;
    color = mix(color, hot, pow(facing, 2.0) * 0.2);
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`

const coronaVertex = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const coronaFragment = `
  uniform vec3 uColor;
  uniform float uTime;
  varying vec2 vUv;
  ${noise}
  void main() {
    vec2 p = (vUv - 0.5) * 10.0;
    float r = length(p);
    float angle = atan(p.y, p.x);
    vec3 direction = vec3(cos(angle), sin(angle), uTime * 0.025);
    float stream = turbulence(direction * 9.0 + vec3(0.0, 0.0, r * 0.65));
    float rays = pow(stream, 2.0) * 2.8;
    float rim = exp(-abs(r - 1.015) * 24.0) * 0.85;
    float plasma = exp(-max(r - 1.0, 0.0) * 2.0) * rays;
    float haze = exp(-max(r - 1.0, 0.0) * 0.95) * 0.16;
    float halo = (rim + plasma + haze) * smoothstep(0.96, 1.025, r);
    halo *= 1.0 - smoothstep(3.8, 5.0, r);
    vec3 light = mix(uColor, vec3(1.0), exp(-abs(r - 1.0) * 8.0) * 0.75);
    gl_FragColor = vec4(light, halo);
    #include <colorspace_fragment>
  }
`

export default function StellarBody({ radius = 1, color = '#ffad43', reduced }) {
  const body = useRef()
  const uniforms = useMemo(() => ({
    uColor: { value: new Color(color) },
    uTime: { value: 0 },
  }), [color])

  useFrame((_, delta) => {
    if (reduced) return
    const step = Math.min(delta, 0.1)
    uniforms.uTime.value += step
    body.current.rotation.y += step * 0.035
  })

  return (
    <group>
      <mesh ref={body}>
        <sphereGeometry args={[radius, 64, 48]} />
        <shaderMaterial uniforms={uniforms} vertexShader={surfaceVertex} fragmentShader={surfaceFragment} toneMapped={false} />
      </mesh>
      <Billboard>
        <mesh>
          <planeGeometry args={[radius * 10, radius * 10]} />
          <shaderMaterial uniforms={uniforms} vertexShader={coronaVertex} fragmentShader={coronaFragment}
            transparent depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
        </mesh>
      </Billboard>
    </group>
  )
}
