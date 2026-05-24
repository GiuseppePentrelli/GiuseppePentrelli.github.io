<template>
  <header
    id="home"
    role="banner"
    aria-label="Sezione iniziale del sito"
    class="relative w-full min-h-screen flex justify-center items-center overflow-hidden"
  >
    <div class="header-content flex flex-col items-center justify-center min-h-screen pt-[8vh] perspective-[800px]">
      <h1 v-html="t('welcome')" />

      <div class="image-wrapper flex-grow flex justify-center items-center max-h-[70%] w-full">
        <img
          :src="isChristmas ? '/christmas/christmasMedia/welcomeMe-christmas.avif' : '/mediaMobile/welcomeMe-mobile.avif'"
          :srcset="isChristmas
            ? '/christmas/christmasMedia/welcomeMe-christmas.avif 300w, /christmas/christmasMedia/welcomeMe-christmas.avif 500w'
            : '/mediaMobile/welcomeMe-mobile.avif 300w, /media/welcomeMe.avif 500w'"
          sizes="(max-width: 600px) 280px, 500px"
          alt="Ritratto di me che dà il benvenuto"
          fetchpriority="high"
          decoding="async"
          class="welcome-image max-w-full max-h-full object-contain"
        />
      </div>

      <a href="#about" class="scroll-down-wrapper flex justify-center items-start gap-[25px] no-underline mt-10 cursor-pointer">
        <div v-for="col in 2" :key="col" class="arrow-column flex flex-col items-center w-10">
          <span class="arrow-tip tip-1">&gt;</span>
          <span class="arrow-tip tip-2">&gt;</span>
          <span class="arrow-tip tip-3">&gt;</span>
        </div>
      </a>
    </div>
  </header>
</template>

<script setup>
import { useLocale } from '@/composables/useLocale'
import { useTheme } from '@/composables/useTheme'

const { t } = useLocale()
const { isChristmas } = useTheme()
</script>

<style scoped>
header {
  background: url('/media/welcomeImg.avif') center/cover no-repeat;
  background-attachment: fixed;
  height: 110vh;
}

header::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0;
  width: 100%; height: 250px;
  background: linear-gradient(to bottom, rgba(8,25,41,0) 0%, rgba(8,25,41,0.3) 40%, var(--blue) 100%);
}

h1 {
  color: var(--yellow);
  font-size: clamp(40px, 6vw, 100px);
  animation: flickerFast 3s 2s infinite;
  text-align: center;
  padding: 20px clamp(16px, 4vw, 60px);
  margin: 0 0 10px;
  font-weight: bold;
  letter-spacing: clamp(4px, 1.8vw, 20px);
  line-height: 1.5;
  text-transform: uppercase;
  width: 100%;
  word-break: break-word;
  text-shadow:
    2px 2px 5px rgba(0,0,0,.7),
    0 0 20px rgba(255,72,0,.8),
    0 0 40px rgba(255,72,0,.5);
}

.welcome-image { height: min(480px, 45vh); width: min(480px, 45vh); }

@media (max-width: 767px) {
  .welcome-image { height: min(300px, 38vh); width: min(300px, 38vh); }
}

.arrow-tip {
  font-size: 2.8rem;
  color: var(--cyan);
  opacity: 0.2;
  transform: rotate(90deg) translateX(-10px);
  animation: fadeDown 1.5s infinite ease-in-out;
}
.tip-1 { animation-delay: 0s; }
.tip-2 { animation-delay: 0.2s; }
.tip-3 { animation-delay: 0.4s; }

.scroll-down-wrapper:hover .arrow-tip {
  color: #6ff;
  opacity: 0.6;
}

@keyframes fadeDown {
  0%   { opacity: 0; transform: rotate(90deg) translateX(-10px); }
  50%  { opacity: 1; transform: rotate(90deg) translateX(0); }
  100% { opacity: 0; transform: rotate(90deg) translateX(10px); }
}
</style>
