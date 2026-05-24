<template>
  <section
    id="skills"
    class="relative overflow-hidden py-20 pl-[60px]"
    aria-labelledby="skills-title"
    ref="sectionRef"
  >
    <!-- Canvas stelle + layer astronauta -->
    <canvas id="starsCanvas" class="absolute top-0 left-0 pointer-events-none z-0" aria-hidden="true" ref="starsCanvasRef" />
    <div class="astronaut-layer absolute top-0 left-0 w-full h-full pointer-events-none z-[var(--z-third)]" ref="astronautLayerRef" aria-hidden="true" />

    <!-- Slider servizi -->
    <div id="hero-section" class="w-full bg-(--blue) text-(--white) font-['Anta'] relative overflow-hidden pt-10">
      <div class="slider-container w-full flex justify-center items-center relative">
        <div class="slider-box relative h-[400px] w-[900px] max-w-full">
          <div
            v-for="(slide, i) in slides"
            :key="slide.titleKey"
            class="absolute inset-0 flex flex-col justify-center items-center text-center transition-opacity duration-500"
            :class="currentSlide === i ? 'opacity-100 pointer-events-auto z-[1]' : 'opacity-0 pointer-events-none'"
            :aria-hidden="currentSlide !== i"
            :tabindex="currentSlide === i ? 0 : -1"
          >
            <div class="flex items-center gap-4 mb-2">
              <div class="h-px w-16 bg-(--orange)"></div>
              <span class="text-base uppercase tracking-widest text-(--light-white)">{{ t(slide.tagKey) }}</span>
              <div class="h-px w-16 bg-(--orange)"></div>
            </div>
            <h2 class="slider-headline text-(--yellow) uppercase text-center font-bold" style="font-size:clamp(35px,8vw,110px);letter-spacing:clamp(3px,1.5vw,25px);line-height:1.2;text-shadow:2px 2px 5px rgba(0,0,0,.7),0 0 20px rgba(255,72,0,.8),0 0 40px rgba(255,72,0,.5)">
              {{ t(slide.titleKey) }}
            </h2>
            <p class="text-[clamp(16px,1.8vw,24px)] max-w-[700px] mt-8 mb-5">{{ t(slide.textKey) }}</p>
          </div>
        </div>

        <!-- Bottoni sotto, centrati come nell'originale -->
        <div class="slider-controls-bottom">
          <div class="btn-wrapper">
            <button class="slider-btn" @click="prev" :aria-label="t('prev_btn')">{{ t('prev_btn') }}</button>
          </div>
          <div class="btn-wrapper">
            <img src="/media/alienSleeping.avif" alt="Alieno che dorme" loading="lazy" class="alien-sleeping" aria-hidden="true" />
            <button class="slider-btn" @click="next" :aria-label="t('next_btn')">{{ t('next_btn') }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Titolo sezione + card in container centrato -->
    <div class="container px-4 mt-16">
      <div class="text-center">
        <h2 id="skills-title" class="main-title space-title uppercase">{{ t('intro_skill') }}</h2>
      </div>

      <div class="skills-grid mt-4" role="list" :aria-label="t('intro_skill')">
        <SkillCard v-for="(skill, i) in mainSkills" :key="skill.id" :skill="skill" :align="cardAlign(i, mainSkills.length)" />
      </div>

      <div class="my-16 text-center">
        <h3 class="skills-section-title uppercase text-(--green)">{{ t('framework_title') }}</h3>
      </div>

      <div class="skills-grid" role="list">
        <SkillCard v-for="(skill, i) in frameworkSkills" :key="skill.id" :skill="skill" :align="cardAlign(i, frameworkSkills.length)" />
      </div>

      <div class="my-16 text-center">
        <h3 class="skills-section-title uppercase text-(--green)">{{ t('learning_title') }}</h3>
      </div>

      <div class="skills-grid" role="list">
        <SkillCard v-for="(skill, i) in learningSkills" :key="skill.id" :skill="skill" :learning="true" :align="cardAlign(i, learningSkills.length)" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useLocale } from '@/composables/useLocale'
import { useParticles } from '@/composables/useParticles'
import SkillCard from '@/components/ui/SkillCard.vue'
import { mainSkills, frameworkSkills, learningSkills } from '@/data/skills.js'

const { t } = useLocale()

function cardAlign(i, total) {
  if (i === 0) return 'left'
  if (i === total - 1) return 'right'
  return 'center'
}
const { createParticleSystem } = useParticles()

const sectionRef = ref(null)
const starsCanvasRef = ref(null)
const astronautLayerRef = ref(null)
const currentSlide = ref(0)

const slides = [
  { tagKey: 's1_tag', titleKey: 's1_title', textKey: 's1_text' },
  { tagKey: 's2_tag', titleKey: 's2_title', textKey: 's2_text' },
  { tagKey: 's3_tag', titleKey: 's3_title', textKey: 's3_text' },
  { tagKey: 's4_tag', titleKey: 's4_title', textKey: 's4_text' },
  { tagKey: 's5_tag', titleKey: 's5_title', textKey: 's5_text' },
  { tagKey: 's6_tag', titleKey: 's6_title', textKey: 's6_text' },
]

function goTo(i) { currentSlide.value = i }
function next() { currentSlide.value = (currentSlide.value + 1) % slides.length }
function prev() { currentSlide.value = (currentSlide.value - 1 + slides.length) % slides.length }

let starSystem = null
let animFrameId = null
let ax, ay, angle = 0, aSpeedX, aSpeedY, rotSpeed
let astronautEl = null
let isVisible = false

function animateAstronaut() {
  ax += aSpeedX; ay += aSpeedY; angle += rotSpeed
  const canvas = starsCanvasRef.value
  const cw = canvas?.width ?? window.innerWidth
  const ch = canvas?.height ?? window.innerHeight
  if (ax > cw) ax = 0; if (ax < 0) ax = cw
  if (ay > ch) ay = 0; if (ay < 0) ay = ch
  if (astronautEl) astronautEl.style.transform = `translate3d(${ax}px,${ay}px,0) rotate(${angle}deg)`
  if (isVisible) animFrameId = requestAnimationFrame(animateAstronaut)
}

onMounted(() => {
  starSystem = createParticleSystem(starsCanvasRef.value, 150, 'rgba(255,255,255,0.6)')

  if (astronautLayerRef.value) {
    astronautEl = document.createElement('img')
    astronautEl.src = '/media/lostInTheSpace.webp'
    astronautEl.alt = 'Astronauta decorativo'
    astronautEl.style.cssText = 'position:absolute;width:60px;height:60px;will-change:transform;'
    astronautLayerRef.value.appendChild(astronautEl)
    const canvas = starsCanvasRef.value
    const w = canvas?.width ?? window.innerWidth
    const h = canvas?.height ?? window.innerHeight
    ax = Math.random() * w; ay = Math.random() * h
    aSpeedX = (Math.random() - 0.5); aSpeedY = (Math.random() - 0.5)
    rotSpeed = (Math.random() - 0.5) * 2
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting
      if (isVisible) {
        starSystem?.start()
        if (!animFrameId) animateAstronaut()
      } else {
        starSystem?.stop()
        if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null }
      }
    })
  }, { threshold: 0.1 })

  if (sectionRef.value) observer.observe(sectionRef.value)
})

onUnmounted(() => {
  if (animFrameId) cancelAnimationFrame(animFrameId)
})
</script>

<style scoped>
#skills { content-visibility: auto; contain-intrinsic-size: 800px; }

/* ── Slider ── */
.slider-container { padding: 60px 40px 180px; }

.slider-box { margin: 0 auto; }

.slider-btn {
  background: none;
  border: 1px solid var(--light-white);
  color: var(--light-white);
  padding: 10px 20px;
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 2px;
  text-transform: uppercase;
  transition: all 0.3s ease;
  cursor: pointer;
}
.slider-btn:hover {
  background-color: var(--light-white);
  color: var(--blue);
  box-shadow: 0 0 15px rgba(78,138,172,.6);
}

.slider-controls-bottom {
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  display: flex;
  gap: 30px;
  z-index: 20;
  width: 300px;
  justify-content: space-between;
}

.btn-wrapper {
  position: relative;
  display: inline-block;
}

.alien-sleeping {
  position: absolute;
  top: -70px;
  left: 40%;
  transform: translateX(-20%);
  width: 70px;
  pointer-events: none;
}

/* ── Grid card ── */
.skills-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
/* Card sola nell'ultima riga → centrata */
.skills-grid :deep(article:last-child:nth-child(2n+1)) {
  grid-column: 1 / -1;
  justify-self: center;
  width: 50%;
}
@media (min-width: 600px) {
  .skills-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .skills-grid :deep(article:last-child:nth-child(2n+1)) { grid-column: unset; justify-self: unset; width: 100%; }
  .skills-grid :deep(article:last-child:nth-child(3n+1)) { grid-column: 1 / -1; justify-self: center; width: 33%; }
}
@media (min-width: 900px) {
  .skills-grid { grid-template-columns: repeat(4, 1fr); gap: 20px; }
  .skills-grid :deep(article:last-child:nth-child(3n+1)) { grid-column: unset; justify-self: unset; width: 100%; }
  .skills-grid :deep(article:last-child:nth-child(4n+1)) { grid-column: 1 / -1; justify-self: center; width: 25%; }
}

/* ── Titoli sezione skills ── */
.skills-section-title {
  font-weight: 900;
  letter-spacing: 3px;
  text-shadow: 2px 2px 0 var(--blue), 4px 4px 0 var(--blue), 6px 6px 12px rgba(0,255,255,.3);
  padding-top: 50px;
}

@media (max-width: 900px) {
  .slider-container { padding: 40px 20px 90px; }
  .slider-controls-bottom { width: 240px; }
}
@media (max-width: 767px) {
  #skills { padding-left: 10px; padding-right: 10px; }
}
</style>
