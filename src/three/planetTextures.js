import * as THREE from 'three'

// texture generate a runtime con canvas 2D: niente immagini esterne da scaricare/licenziare

// bande orizzontali tipo Giove, con una "macchia" colorata come occhiolino - richiamo all'originale
export function createBandedTexture(colors, spotColor) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext('2d')

  const bandHeight = canvas.height / colors.length
  colors.forEach((color, i) => {
    ctx.fillStyle = color
    ctx.fillRect(0, i * bandHeight, canvas.width, bandHeight + 1)
  })

  if (spotColor) {
    ctx.fillStyle = spotColor
    ctx.beginPath()
    ctx.ellipse(canvas.width * 0.62, canvas.height * 0.55, 34, 20, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  return new THREE.CanvasTexture(canvas)
}

// gradiente a pochi gradini per il toon shading: senza, meshToonMaterial non ha da dove leggere le fasce di luce
export function createToonGradient(steps = 4) {
  const canvas = document.createElement('canvas')
  canvas.width = steps
  canvas.height = 1
  const ctx = canvas.getContext('2d')

  for (let i = 0; i < steps; i++) {
    const v = Math.round((i / (steps - 1)) * 255)
    ctx.fillStyle = `rgb(${v},${v},${v})`
    ctx.fillRect(i, 0, 1, 1)
  }

  const texture = new THREE.CanvasTexture(canvas)
  // niente sfumatura tra i pixel, altrimenti le fasce nette diventano un gradiente morbido
  texture.minFilter = THREE.NearestFilter
  texture.magFilter = THREE.NearestFilter
  texture.generateMipmaps = false
  return texture
}

// macchie colorate sparse tipo Luna cartoon (non crateri grigi realistici: proprio come nell'originale)
export function createCraterTexture(base, spots) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = base
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let i = 0; i < 14; i++) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const r = 14 + Math.random() * 26
    ctx.fillStyle = spots[i % spots.length]
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  return new THREE.CanvasTexture(canvas)
}

// disco con un buco al centro (dove sta il pianeta) e fasce concentriche colorate - per l'anello tipo Saturno.
// non uso ringGeometry perché le sue UV di default non sono radiali, verrebbero fasce storte
export function createRingTexture(colors, holeRatio = 0.5) {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const c = size / 2
  const maxR = size / 2

  colors.forEach((color, i) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(c, c, maxR * (1 - i / colors.length), 0, Math.PI * 2)
    ctx.fill()
  })

  ctx.globalCompositeOperation = 'destination-out'
  ctx.beginPath()
  ctx.arc(c, c, maxR * holeRatio, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalCompositeOperation = 'source-over'

  return new THREE.CanvasTexture(canvas)
}

// alone morbido per il bagliore/atmosfera attorno al pianeta
export function createGlowTexture(color) {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')

  const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  grad.addColorStop(0, color)
  grad.addColorStop(1, 'transparent')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  return new THREE.CanvasTexture(canvas)
}
