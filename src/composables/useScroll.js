import { ref, onMounted, onUnmounted } from 'vue'

const SCROLL_THRESHOLD = 50

export function useScroll() {
  const scrolled = ref(false)
  let ticking = false

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        scrolled.value = window.scrollY > SCROLL_THRESHOLD
        ticking = false
      })
      ticking = true
    }
  }

  onMounted(() => {
    window.addEventListener('scroll', onScroll, { passive: true })
    scrolled.value = window.scrollY > SCROLL_THRESHOLD
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
  })

  return { scrolled }
}
