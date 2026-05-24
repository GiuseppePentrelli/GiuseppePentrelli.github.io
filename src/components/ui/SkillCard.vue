<template>
  <article
    class="skills-card relative rounded-[1rem] border-2 overflow-hidden cursor-pointer"
    :class="[
      learning ? 'border-gray-500 opacity-70' : 'border-(--green)',
      showOverlay ? 'overlay-open' : '',
      `align-${align}`
    ]"
    role="listitem"
    :aria-labelledby="`skill-${skill.id}`"
    @mouseenter="!isMobile && (showOverlay = true)"
    @mouseleave="!isMobile && (showOverlay = false)"
    @click="isMobile && (showOverlay = !showOverlay)"
  >
    <!-- Stars pattern -->
    <div class="absolute w-[200%] h-[200%] -top-1/2 -left-1/2 [animation:rotateStars_10s_linear_infinite] opacity-20 pointer-events-none"
         style="background:radial-gradient(circle,white 1px,transparent 1px);background-size:20px 20px;" aria-hidden="true" />
    <!-- Shimmer -->
    <div class="absolute inset-0 pointer-events-none [animation:twinkle_3s_infinite_linear]"
         style="background:radial-gradient(circle,rgba(255,255,255,.1) 0%,transparent 70%);" aria-hidden="true" />

    <h3 :id="`skill-${skill.id}`" class="card-title relative z-20 font-bold uppercase text-(--blue) p-2"
        style="-webkit-text-stroke:1px var(--orange);">
      {{ skill.label }}
    </h3>

    <picture class="card-image flex justify-center items-center z-[4] relative">
      <img
        class="skill-img transition-transform duration-500"
        :src="`/${skill.img}`"
        :alt="skill.alt"
        loading="lazy"
      />
    </picture>

    <!-- Overlay -->
    <div class="skill-overlay absolute inset-0 flex items-center justify-center p-3 z-[5]" aria-hidden="true">
      <p class="overlay-text font-mono text-center text-(--light-white) text-sm m-0">
        {{ t(skill.descKey) }}
      </p>
    </div>
  </article>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useLocale } from '@/composables/useLocale'

const props = defineProps({
  skill: { type: Object, required: true },
  learning: { type: Boolean, default: false },
  align: { type: String, default: 'center' }
})

const { t } = useLocale()
const showOverlay = ref(false)
const isMobile = computed(() => window.innerWidth < 1092)
</script>

<style scoped>
.skills-card {
  width: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  background-color: var(--white);
  color: var(--blue);
  padding: 10px;
  box-sizing: border-box;
  box-shadow: 0 0 6px rgba(0,255,255,0.2);
  transition: box-shadow 0.5s ease-out, border-color 0.5s;
}

.card-image {
  flex: 1;
  min-height: 0;
}

.card-title { font-size: clamp(0.9rem, 1.6vw, 1.4rem); }

.align-left  .card-title { text-align: left; }
.align-center .card-title { text-align: center; }
.align-right .card-title { text-align: right; }

.skill-img { width: 80%; max-height: 200px; object-fit: contain; }

.skills-card:hover,
.skills-card.overlay-open {
  animation: titleSpaceLift 520ms forwards;
  border: 4px solid var(--cyan);
  box-shadow: 0 0 30px cyan, 0 0 50px var(--green);
}

.skills-card:hover .skill-img,
.skills-card.overlay-open .skill-img {
  transform: scale(1.1) rotate(-5deg) translateY(-10px);
  transition: transform 0.5s ease-out;
}

.skills-card:hover h3,
.skills-card.overlay-open h3 { animation: titleSpaceLift 520ms forwards; }

.skill-overlay {
  background-color: rgba(8,25,41,.85);
  transform: translateY(100%);
  opacity: 0;
  transition: transform 0.5s ease, opacity 0.4s ease;
  pointer-events: none;
}

.skills-card:hover .skill-overlay,
.skills-card.overlay-open .skill-overlay {
  transform: translateY(0);
  opacity: 1;
  pointer-events: auto;
}

.overlay-text {
  transform: translateY(30px);
  opacity: 0;
  transition: transform 0.4s ease, opacity 0.4s ease;
}

.skills-card:hover .overlay-text,
.skills-card.overlay-open .overlay-text {
  transform: translateY(0);
  opacity: 1;
  transition-delay: 0.2s;
}

@media (max-width: 599px) {
  .skills-card .card-title { font-size: 0.8rem; text-align: center !important; }
  .skill-img { max-height: 100px; }
}
</style>
