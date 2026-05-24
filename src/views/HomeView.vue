<template>
  <div>
    <HeroSection />

    <div class="container mx-auto px-4 overflow-x-hidden" aria-labelledby="intro-title">
      <h2
        id="intro-title"
        class="main-title text-center"
        :class="introReady ? 'opacity-100 visible' : 'opacity-0 invisible'"
        style="transition: opacity 0.5s linear; min-height: 120px; line-height: 1.2;"
      >
        {{ t('intro_title') }}
      </h2>
    </div>

    <AboutSection />
    <SkillsSection />
    <WorkSection />
    <ContactSection />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useLocale } from '@/composables/useLocale'
import HeroSection from '@/components/sections/HeroSection.vue'
import AboutSection from '@/components/sections/AboutSection.vue'
import SkillsSection from '@/components/sections/SkillsSection.vue'
import WorkSection from '@/components/sections/WorkSection.vue'
import ContactSection from '@/components/sections/ContactSection.vue'

const { t } = useLocale()
const introReady = ref(false)

onMounted(() => {
  setTimeout(() => { introReady.value = true }, 100)
})
</script>
