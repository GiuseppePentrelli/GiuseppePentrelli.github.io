import { onUnmounted } from 'vue'

export function useParticles() {
  const systems = []

  function createParticleSystem(canvasEl, particleCount, color) {
    if (!canvasEl) return null

    const ctx = canvasEl.getContext('2d', { willReadFrequently: false })
    let width, height, particles = [], animationFrameId = null
    let resizePending = false

    function initParticles() {
      const parent = canvasEl.parentElement
      width = parent ? parent.offsetWidth : window.innerWidth
      height = parent ? parent.offsetHeight : window.innerHeight
      canvasEl.width = width
      canvasEl.height = height
      particles = []
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() * 2 + 0.5,
          dx: (Math.random() - 0.5) * 0.2,
          dy: (Math.random() - 0.5) * 0.2
        })
      }
    }

    function animate() {
      ctx.clearRect(0, 0, width, height)
      particles.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
        p.x += p.dx
        p.y += p.dy
        if (p.x > width)  p.x = 0
        if (p.x < 0)      p.x = width
        if (p.y > height) p.y = 0
        if (p.y < 0)      p.y = height
      })
      animationFrameId = requestAnimationFrame(animate)
    }

    function onResize() {
      if (!resizePending) {
        resizePending = true
        requestAnimationFrame(() => { initParticles(); resizePending = false })
      }
    }

    initParticles()
    window.addEventListener('resize', onResize)

    const system = {
      start: animate,
      stop() {
        if (animationFrameId) cancelAnimationFrame(animationFrameId)
        animationFrameId = null
      },
      destroy() {
        this.stop()
        window.removeEventListener('resize', onResize)
      }
    }

    systems.push(system)
    return system
  }

  onUnmounted(() => {
    systems.forEach(s => s.destroy())
  })

  return { createParticleSystem }
}
