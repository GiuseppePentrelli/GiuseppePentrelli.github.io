<template>
  <section
    id="about"
    class="about-section relative py-40 max-sm:py-16 overflow-hidden isolate"
    aria-labelledby="about-title"
  >
    <div class="w-full max-w-[1400px] mx-auto px-4 sm:px-8 lg:pl-28">
      <div class="flex flex-wrap items-start gap-8 lg:flex-nowrap">

        <!-- Foto con orbite -->
        <div class="w-full lg:w-1/2 flex justify-center">
          <div class="astro-frame">
            <img
              :src="isChristmas ? '/christmas/christmasMedia/fotoProfilo-christmas.avif' : '/media/fotoProfilo.avif'"
              alt="Foto di Giuseppe Pentrelli, sviluppatore web"
              class="w-full h-full rounded-full block z-[2] relative"
              loading="lazy"
            />
            <div class="orbit-decor planet" aria-hidden="true"></div>
            <div class="orbit-decor planet2" aria-hidden="true"></div>
            <div class="orbit-decor satellite" aria-hidden="true"></div>
            <div class="orbit-decor satellite2" aria-hidden="true"></div>
            <div class="orbit-decor star" aria-hidden="true"></div>
            <div class="orbit-decor star2" aria-hidden="true"></div>
          </div>
        </div>

        <!-- Console -->
        <div class="w-full lg:w-1/2 spaceship-console">

          <!-- Schermo typewriter -->
          <div class="viewport-screen">
            <h2 id="about-title" class="console-title">{{ t('log') }}</h2>
            <p class="console-text">
              <span v-html="typewriterOutput"></span><span class="cursor">|</span>
            </p>
          </div>

          <!-- Pannello controllo -->
          <div class="control-panel">
            <div class="mission-card">
              <h3 class="mission-title" v-html="t('mission_title')" />
              <ul class="mission-list">
                <li class="mission-item" v-html="t('role')" />
                <li class="mission-item" v-html="t('primary_objective')" />
                <li class="mission-item" v-html="t('location')" />
              </ul>
            </div>

            <div class="btn-center">
              <a
                href="/Pentrelli_Giuseppe_Curriculum_Vitae.pdf"
                download
                class="command-button"
                :aria-label="t('download_button_aria')"
              >
                {{ t('download_button_text') }}
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useLocale } from '@/composables/useLocale'
import { useTheme } from '@/composables/useTheme'
import { useTypewriter } from '@/composables/useTypewriter'

const { t, locale } = useLocale()
const { isChristmas } = useTheme()
const { output: typewriterOutput, start } = useTypewriter()

function startTypewriter() {
  start(t('fullText'))
}

onMounted(startTypewriter)
watch(locale, startTypewriter)
</script>

<style scoped>
.about-section {
  color: var(--white);
  background-color: var(--blue);
}
.about-section::after {
  content: "";
  position: absolute; top:0; left:0;
  width:100%; height:100%;
  background-image: url('/media/bgUniverso.avif');
  background-size: cover; background-repeat: no-repeat; background-position: center;
  z-index: -2; opacity: 0.8;
}
.about-section::before {
  content: "";
  position: absolute; top:0; left:0;
  width:100%; height:100%; z-index: -1;
  background: linear-gradient(to bottom, var(--blue) 0%, rgba(8,25,41,0) 20%, rgba(8,25,41,0) 80%, var(--blue) 100%);
}

.astro-frame {
  position: relative;
  display: inline-block;
  flex-shrink: 0;
  width: min(540px, 100%);
  aspect-ratio: 1;
  border-radius: 50%;
  /* Anello esterno */
  border: 4px solid var(--cyan);
  /* Spazio tra i due anelli */
  padding: 16px;
  background: radial-gradient(circle, rgba(0,255,255,0.5) 0%, rgba(0,255,255,0.12) 60%, transparent 100%);
  box-shadow:
    0 0 30px rgba(0,255,255,0.5),
    0 0 70px rgba(0,255,255,0.15),
    inset 0 0 20px rgba(0,255,255,0.12);
  overflow: visible;
}
/* Anello interno (secondo giro) */
.astro-frame::before {
  content: '';
  position: absolute;
  top: 6px; left: 6px; right: 6px; bottom: 6px;
  border-radius: 50%;
  border: 2px solid rgba(0,255,255,0.6);
  box-shadow: 0 0 10px rgba(0,255,255,0.3), inset 0 0 8px rgba(0,255,255,0.1);
  pointer-events: none;
  z-index: 1;
}
/* Riflesso luce (effetto vetro) */
.astro-frame::after {
  content: '';
  position: absolute;
  top: 12%; left: 12%;
  width: 76%; height: 76%;
  border-radius: 50%;
  border-top: 2px solid rgba(255,255,255,0.55);
  border-left: 1px solid rgba(255,255,255,0.25);
  transform: rotate(25deg);
  pointer-events: none;
  z-index: 1;
}

.orbit-decor {
  position: absolute; top:50%; left:50%;
  transform-origin: center center;
  background-size: contain; background-repeat: no-repeat; background-position: center;
  opacity: 0.9;
  z-index: 3;
}
.planet   { background-image:url('/media/planet1.avif');   width:104px; height:104px; margin:-52px;    --orbit-radius:250px; animation:orbitOscillate 18s linear infinite; }
.planet2  { background-image:url('/media/planet2.avif');   width:58px;  height:58px;  margin:-29px;    --orbit-radius:295px; animation:orbitOscillate 22s linear infinite reverse; opacity:.8; }
.satellite  { background-image:url('/media/satellite.avif');  width:80px; height:80px; margin:-40px;   --orbit-radius:275px; animation:orbitOscillate 20s linear infinite reverse; }
.satellite2 { background-image:url('/media/satellite2.avif'); width:46px; height:46px; margin:-23px;   --orbit-radius:310px; animation:orbitOscillate 24s linear infinite; opacity:.85; }
.star   { background-image:url('/media/star.avif');   width:70px; height:70px; margin:-35px;           --orbit-radius:300px; animation:orbitOscillate 14s linear infinite; }
.star2  { background-image:url('/media/star2.avif');  width:40px; height:40px; margin:-20px;           --orbit-radius:335px; animation:orbitOscillate 16s linear infinite reverse; opacity:.75; }

.spaceship-console {
  background-color: var(--color-dark-primary);
  border: 4px solid var(--color-dark-border);
  border-radius: 15px;
  padding: 20px;
  font-family: 'Space Mono', monospace;
  font-size: 16px;
  color: var(--color-neon-green);
  box-shadow: 0 0 30px var(--shadow-light), inset 0 0 15px var(--shadow-deep);
}

.viewport-screen {
  position: relative;
  background: linear-gradient(180deg, #001018 0%, #001a24 100%);
  border: 2px solid var(--color-neon-cyan);
  border-radius: 10px;
  height: 260px;
  padding: 15px;
  overflow-y: auto;
  box-shadow: 0 0 20px rgba(0,255,255,0.4);
  font-family: 'Space Mono', monospace;
  margin-bottom: 1.6rem;
}
.viewport-screen::before {
  content: "";
  position: absolute; inset: 0;
  background-image:
    linear-gradient(90deg, rgba(0,255,255,0.1) 1px, transparent 1px),
    linear-gradient(0deg, rgba(0,255,255,0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  animation: circuitMove 10s linear infinite;
  opacity: 0.3;
}
.viewport-screen::-webkit-scrollbar { display: none; }

.console-title, h2.console-title {
  color: var(--color-neon-blue) !important;
  font-family: 'Space Mono', monospace;
  text-transform: uppercase;
  border-bottom: 1px dashed rgba(0,229,255,0.5);
  padding-bottom: 5px;
  margin-bottom: 8px;
  font-size: 0.9em;
}
.console-text {
  color: var(--color-neon-green);
  font-family: 'Space Mono', monospace;
  font-size: 0.9em;
  line-height: 1.6;
}
.cursor { display:inline-block; margin-left:2px; color:var(--cyan); animation:blinkCursor .8s infinite; }

.mission-card {
  background-color: var(--color-dark-card);
  border: 1px solid var(--color-neon-aqua);
  border-radius: 5px;
  padding: 15px;
  margin-top: 1rem;
  box-shadow: 0 0 15px var(--color-neon-cyan), inset 0 0 10px rgba(0,188,212,.5);
  animation: pulseScreen 2.5s ease-in-out infinite alternate;
}
.mission-title, h3.mission-title {
  color: var(--color-neon-aqua) !important;
  font-family: 'Space Mono', monospace;
  font-size: 1.2em;
  margin-bottom: 10px;
}
.mission-list { list-style: none; padding: 0; }
.mission-item {
  color: var(--color-neon-data-list);
  font-size: 1em;
  margin-bottom: 8px;
  border-bottom: 1px dotted rgba(77,182,172,0.3);
  padding-bottom: 5px;
}
.mission-item:last-child { border-bottom: none; }
.mission-item :deep(strong) { color: var(--color-neon-green); }
.mission-item :deep(.icon) { margin-right: 6px; color: var(--cyan); }

.control-panel {
  margin-top: 0.5rem;
  background-color: #263238;
  border: 2px solid var(--color-dark-border);
  border-radius: 10px;
  padding: 16px;
  box-shadow: inset 0 0 12px rgba(0, 0, 0, 0.4);
}
.btn-center { display: flex; justify-content: center; margin-top: 2.8rem; margin-bottom: 1.2rem; }

.command-button {
  text-decoration: none;
  display: inline-block;
  background-color: var(--color-dark-secondary);
  color: var(--color-neon-green);
  text-transform: uppercase;
  font-weight: 900;
  letter-spacing: 2px;
  padding: 15px 30px;
  white-space: nowrap;
  border: none;
  border-left: 5px solid var(--color-neon-cyan);
  border-right: 5px solid var(--color-neon-aqua);
  border-top: 2px solid var(--color-dark-border);
  border-bottom: 2px solid var(--color-dark-active);
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(0,0,0,.5);
  transition: all 0.2s ease-out;
}
.command-button:hover {
  background-color: var(--color-dark-hover);
  color: var(--color-neon-blue);
  box-shadow: 0 2px 5px rgba(0,0,0,.5), inset 0 0 10px var(--shadow-button-hover);
  transform: translateY(2px);
}

@media (max-width: 767px) {
  .astro-frame { width: min(300px, 90%); }
  .planet   { width:45px;  height:45px;  margin:-22px;  --orbit-radius:150px; }
  .planet2  { width:28px;  height:28px;  margin:-14px;  --orbit-radius:175px; }
  .satellite  { width:36px; height:36px; margin:-18px;  --orbit-radius:165px; }
  .satellite2 { width:22px; height:22px; margin:-11px;  --orbit-radius:195px; }
  .star   { width:32px; height:32px; margin:-16px;      --orbit-radius:185px; }
  .star2  { width:20px; height:20px; margin:-10px;      --orbit-radius:210px; }
  .spaceship-console { width: 100%; margin: 0 auto; padding: 14px; font-size: 14px; }
  .viewport-screen { height: 200px; padding: 10px; }
  .control-panel { padding: 10px; }
  .mission-card { padding: 10px; }
  .command-button {
    white-space: normal;
    text-align: center;
    padding: 12px 16px;
    letter-spacing: 1px;
    font-size: 0.8em;
    width: 100%;
    box-sizing: border-box;
  }
  .btn-center { margin-top: 1.2rem; margin-bottom: 0.5rem; }
}
</style>
