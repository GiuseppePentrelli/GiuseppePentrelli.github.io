<template>
  <section id="work">
    <div class="work-bg relative flex flex-col justify-center items-center text-center pb-20">
      <h2 class="main-title space-title uppercase mb-5">{{ t('project') }}</h2>

      <!-- Layer alieno -->
      <div class="alien-layer absolute inset-0 pointer-events-none overflow-hidden z-[var(--z-second)]" ref="alienLayerRef" aria-hidden="true" />

      <!-- Costellazione -->
      <div class="constellation-container relative w-full h-screen overflow-visible">
        <div
          v-for="proj in projects"
          :key="proj.id"
          class="project-star absolute text-center cursor-pointer flex flex-col justify-center items-center transition-all duration-300"
          :style="proj.style"
          @click="openModal(proj, true)"
        >
          <div class="star w-20 h-20 [animation:blink_3s_infinite]"
               style="background-image:url('/media/star.avif');background-size:contain;background-repeat:no-repeat;background-position:center;filter:brightness(1.5) drop-shadow(0 0 15px rgba(255,255,180,.8));"
          />
          <span class="project-title mt-2 text-[2rem] font-semibold text-white text-shadow-[0_0_6px_rgba(255,255,255,.6)]">
            {{ proj.title }}
          </span>
        </div>
      </div>

      <!-- Backdrop -->
      <Transition name="fade">
        <div
          v-show="activeProject"
          class="fixed inset-0 z-[999] bg-black/50"
          @click="closeModal"
          aria-hidden="true"
        />
      </Transition>

      <!-- Modale -->
      <Transition name="modal">
        <div
          v-show="activeProject"
          class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] text-center"
        >
          <img v-if="activeProject" :src="`/${activeProject.img}`" :alt="`Anteprima ${activeProject.title}`"
               loading="lazy" class="max-w-[90vw] max-h-[70vh] rounded-xl" />
          <p v-if="activeProject" class="text-(--light-white) text-base mt-3">{{ activeProject.desc }}</p>
          <button class="mt-3 px-4 py-2 border border-(--cyan) text-(--cyan) rounded hover:bg-(--cyan) hover:text-(--blue) transition-colors" @click="closeModal">
            Chiudi
          </button>
        </div>
      </Transition>

      <p class="star-code text-xl text-(--light-white) font-['Anta'] italic mt-8 px-4">
        {{ t('myUniverse') }}
      </p>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useLocale } from '@/composables/useLocale'
import { projects } from '@/data/projects.js'

const { t } = useLocale()

const activeProject = ref(null)
const alienLayerRef = ref(null)

let alienEl = null
let alienAx, alienAy, alienAngle = 0, alienSpeedX, alienSpeedY, alienRotSpeed
let alienW = 0, alienH = 0
let boundsW = 0, boundsH = 0
let animFrameId = null

function openModal(proj) { activeProject.value = proj }
function closeModal() { activeProject.value = null }

function animateAlien() {
  alienAx += alienSpeedX; alienAy += alienSpeedY; alienAngle += alienRotSpeed
  if (alienAx + alienW > boundsW) { alienAx = boundsW - alienW; alienSpeedX *= -1 }
  if (alienAx < 0) { alienAx = 0; alienSpeedX *= -1 }
  if (alienAy + alienH > boundsH) { alienAy = boundsH - alienH; alienSpeedY *= -1 }
  if (alienAy < 0) { alienAy = 0; alienSpeedY *= -1 }
  if (alienEl) alienEl.style.transform = `translate3d(${alienAx}px,${alienAy}px,0) rotate(${alienAngle}deg)`
  animFrameId = requestAnimationFrame(animateAlien)
}

onMounted(() => {
  if (!alienLayerRef.value) return
  const bounds = alienLayerRef.value.closest('.work-bg')
  if (bounds) { boundsW = bounds.clientWidth; boundsH = bounds.clientHeight }

  alienEl = document.createElement('img')
  alienEl.src = '/media/alien.avif'
  alienEl.alt = 'Alieno decorativo'
  alienEl.className = 'alien'
  alienEl.style.cssText = 'position:absolute;width:60px;height:auto;z-index:4;will-change:transform;'
  alienLayerRef.value.appendChild(alienEl)

  alienEl.addEventListener('load', () => {
    alienW = alienEl.offsetWidth; alienH = alienEl.offsetHeight
    alienAx = Math.random() * (boundsW - alienW)
    alienAy = Math.random() * (boundsH - alienH)
    alienSpeedX = (Math.random() - 0.5) * 1.5
    alienSpeedY = (Math.random() - 0.5) * 1.5
    alienRotSpeed = (Math.random() - 0.5) * 2
    animateAlien()
  })
})

onUnmounted(() => {
  if (animFrameId) cancelAnimationFrame(animFrameId)
})
</script>

<style scoped>
.work-bg {
  min-height: 100vh;
  width: 100%;
  background:
    linear-gradient(to bottom, rgba(8,25,41,1) 0%, rgba(8,25,41,.4) 20%, rgba(8,25,41,.4) 80%, rgba(8,25,41,1) 100%),
    url('/media/projectContentBg.avif') center/cover no-repeat;
}

.project-star { transform: translate(-50%, -50%); }

.project-title {
  margin-top: 8px;
  text-shadow: 0 0 6px rgba(255,255,255,.6);
}

@media (max-width: 767px) {
  .project-title { font-size: 1.2rem; }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.modal-enter-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.modal-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: translate(-50%, -48%) scale(0.95); }
</style>
