import { useThree } from '@react-three/fiber'
import { MathUtils } from 'three'

// camera e inquadratura condivise da tutta la scena.
// fov 40 invece dei 75 di default: con un campo così largo le sfere vicino ai bordi
// diventavano ovali (la proiezione prospettica stira tutto quello che è lontano dal centro)
export const CAMERA_Z = 1
export const FOV = 40
// il punto che la camera guarda mentre insegue il mouse (CameraRig): più è vicino, più la
// camera ruota. A 2.1 unità la scena si sposta sullo schermo quanto si spostava con fov 75
export const LOOK_AT_Z = CAMERA_Z - 2.1
const TAN_HALF_FOV = Math.tan(MathUtils.degToRad(FOV / 2))

export function zAt(distance) {
  return CAMERA_Z - distance
}

// metà altezza/larghezza visibili a una certa distanza, con la camera ferma al centro
export function halfViewAt(distance, aspect) {
  const halfH = distance * TAN_HALF_FOV
  return { halfW: halfH * aspect, halfH }
}

// sotto questo rapporto larghezza/altezza la scena usa la disposizione "telefono in verticale"
export function isPortrait(aspect) {
  return aspect < 0.9
}

// da un'ancora in coordinate schermo (-1..1, 0 = centro) a una posizione nel mondo:
// la stessa ancora resta nello stesso punto dello schermo su qualunque aspect ratio
export function placeAt([nx, ny], distance, aspect) {
  const { halfW, halfH } = halfViewAt(distance, aspect)
  return [nx * halfW, ny * halfH, zAt(distance)]
}

export function useAspect() {
  return useThree((state) => state.size.width / state.size.height)
}
