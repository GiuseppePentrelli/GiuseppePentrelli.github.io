import { ref, onUnmounted } from 'vue'

export function useTypewriter() {
  const output = ref('')
  let timeoutId = null
  let running = false

  function stop() {
    if (timeoutId) clearTimeout(timeoutId)
    running = false
  }

  function start(fullText) {
    stop()
    output.value = ''
    running = true

    let i = 0
    let isTag = false
    let tagBuffer = ''
    let html = ''

    function tick() {
      if (!running || i >= fullText.length) {
        running = false
        return
      }

      const char = fullText[i]

      if (char === '<') {
        isTag = true
        tagBuffer = char
      } else if (char === '>') {
        tagBuffer += char
        html += tagBuffer
        tagBuffer = ''
        isTag = false
      } else if (isTag) {
        tagBuffer += char
      } else {
        html += char
      }

      output.value = html
      i++
      timeoutId = setTimeout(tick, 25)
    }

    tick()
  }

  onUnmounted(stop)

  return { output, start, stop }
}
