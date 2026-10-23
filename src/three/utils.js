import { MathUtils } from 'three'

export function randFloat(min, max) {
  return min + Math.random() * (max - min)
}

// easing 0→1 invece di una rampa lineare: comparse e scomparse partono e finiscono dolci
export function smoothstep(t) {
  const c = MathUtils.clamp(t, 0, 1)
  return c * c * (3 - 2 * c)
}

// PRNG deterministico (mulberry32): stesso seed = stessa sequenza, serve quando una forma
// "casuale" deve restare uguale a ogni caricamento (sassi, nuvole)
export function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// centro di ciò che la camera vede alla profondità z: non è l'origine, perché la camera si
// sposta in xy inseguendo il mouse (CameraRig). `forward` è un Vector3 riusato dal chiamante
export function viewCenterAt(camera, z, forward) {
  camera.getWorldDirection(forward)
  const planeDist = (z - camera.position.z) / forward.z
  return {
    x: camera.position.x + forward.x * planeDist,
    y: camera.position.y + forward.y * planeDist,
  }
}

// canvas quadrato per le texture generate a runtime
export function createCanvas(size) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  return { canvas, ctx: canvas.getContext('2d') }
}
