<template>
  <!-- Trigger -->
  <div
    id="menuHelper"
    class="menu-helper"
    :class="{ 'menu-helper--visible': scrolled }"
    role="region"
    aria-label="Apri pannello di controllo"
    tabindex="0"
    :aria-expanded="isOpen"
    @click.stop="toggle"
    @keydown.enter="toggle"
  >
    <p class="m-0 text-sm font-['Anta'] text-(--light-yellow)">{{ t('menu') }}</p>
    <img src="/media/imgMenuHelper.avif" alt="Apri il menu di aiuto" loading="lazy" />
  </div>

  <!-- Overlay -->
  <div
    v-if="isOpen"
    class="fixed inset-0 z-[38] bg-(--blue)/70 backdrop-blur-sm"
    @click="close"
    aria-hidden="true"
  />

  <!-- Pannello floating -->
  <div
    id="helperMenuPanel"
    class="helper-panel"
    :class="{ 'helper-panel--open': isOpen }"
    role="region"
    aria-label="Pannello di controllo interattivo"
  >
    <h3 class="panel-title">{{ t('control_pannel') }}</h3>
    <hr class="section-divider" aria-hidden="true" />

    <!-- Impostazioni -->
    <div class="section-label">{{ t('settings') }}</div>

    <!-- Lingua -->
    <div class="custom-select-wrap">
      <label>{{ t('language') }}</label>
      <div class="custom-select" :class="{ open: openDropdown === 'lang' }" @click.stop="toggleDropdown('lang')">
        <div class="custom-select__trigger">
          <span>{{ locale === 'it' ? 'Italiano' : 'English' }}</span>
          <span class="custom-select__arrow">▾</span>
        </div>
        <ul class="custom-select__options" role="listbox">
          <li
            v-for="opt in langOptions"
            :key="opt.value"
            role="option"
            :class="{ active: locale === opt.value }"
            @click.stop="selectLocale(opt.value)"
          >{{ opt.label }}</li>
        </ul>
      </div>
    </div>

    <!-- Tema -->
    <div class="custom-select-wrap" style="margin-top:1rem">
      <label>🎅 Tema</label>
      <div class="custom-select" :class="{ open: openDropdown === 'theme' }" @click.stop="toggleDropdown('theme')">
        <div class="custom-select__trigger">
          <span>{{ theme === 'christmas' ? '🎅 Natale' : 'Tema Standard' }}</span>
          <span class="custom-select__arrow">▾</span>
        </div>
        <ul class="custom-select__options" role="listbox">
          <li
            v-for="opt in themeOptions"
            :key="opt.value"
            role="option"
            :class="{ active: theme === opt.value }"
            @click.stop="selectTheme(opt.value)"
          >{{ opt.label }}</li>
        </ul>
      </div>
    </div>

    <hr class="section-divider" aria-hidden="true" />

    <!-- Stato sistema -->
    <div class="section-label" aria-hidden="true">{{ t('system_status') }}</div>
    <div class="status-indicators" aria-hidden="true">
      <span class="led led--green" title="Sistema attivo"></span>
      <span class="led led--yellow" title="Attenzione"></span>
      <span class="led led--red" title="Errore"></span>
    </div>

    <div class="panel-header" aria-hidden="true">{{ t('system_online') }}</div>
    <div class="section-label" aria-hidden="true">🔋 <span>75%</span></div>
    <div class="section-label" aria-hidden="true">{{ t('signal') }}</div>
    <div class="section-label" aria-hidden="true">{{ t('cpu_temp') }} <span>{{ cpuTemp }}°C</span></div>

    <div class="system-log" aria-hidden="true" v-html="t('systemLogContent')" />

    <hr class="section-divider" aria-hidden="true" />

    <!-- Dati di volo -->
    <div class="section-label" aria-hidden="true">{{ t('flight_data') }}</div>
    <div class="mini-display" aria-hidden="true">{{ speedText }}</div>

    <div class="radar" aria-hidden="true">
      <div class="radar-sweep"></div>
      <div class="radar-dot"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useScroll } from '@/composables/useScroll'
import { useLocale } from '@/composables/useLocale'
import { useTheme } from '@/composables/useTheme'

const { scrolled } = useScroll()
const { t, locale, setLocale } = useLocale()
const { theme, setTheme } = useTheme()

const isOpen = ref(false)
const openDropdown = ref(null)
const speed = ref(1245)
const cpuTemp = ref(45)

const langOptions  = [{ value: 'it', label: 'Italiano' }, { value: 'en', label: 'English' }]
const themeOptions = [{ value: 'default', label: 'Tema Standard' }, { value: 'christmas', label: '🎅 Natale' }]

function toggle() { isOpen.value = !isOpen.value; openDropdown.value = null }
function close()  { isOpen.value = false; openDropdown.value = null }

function toggleDropdown(name) {
  openDropdown.value = openDropdown.value === name ? null : name
}

function selectLocale(val) { setLocale(val); openDropdown.value = null }
function selectTheme(val)  { setTheme(val);  openDropdown.value = null }

function onOutsideClick() { openDropdown.value = null }

const speedText = computed(() => `${t('speedText')}${speed.value}${t('speedUnit')}`)

let speedInterval
onMounted(() => {
  speedInterval = setInterval(() => { speed.value += Math.floor(Math.random() * 10 - 5) }, 2000)
  document.addEventListener('click', onOutsideClick)
})
onUnmounted(() => {
  clearInterval(speedInterval)
  document.removeEventListener('click', onOutsideClick)
})
</script>

<style scoped>
/* ── Trigger ── */
.menu-helper {
  position: fixed;
  right: 2%;
  bottom: 8%;
  height: 100px;
  width: auto;
  text-align: center;
  cursor: pointer;
  z-index: 40;
  transform: translateX(150px);
  transition: transform 0.5s ease;
}
.menu-helper img { height: 100px; width: auto; }
.menu-helper--visible { transform: translateX(0); }

/* ── Pannello floating ── */
.helper-panel {
  position: fixed;
  bottom: 8rem;
  right: 2rem;
  width: 360px;
  max-height: 70vh;
  padding: 1rem;
  background: rgba(50, 200, 255, 0.15);
  border: 1px solid rgba(100, 255, 255, 0.3);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  color: rgb(0, 255, 255);
  font-family: 'Space Mono', monospace;
  transform: scale(0);
  transform-origin: bottom right;
  transition: transform 0.4s ease;
  box-shadow: 0 0 20px rgba(100, 255, 255, 0.3);
  z-index: 39;
  overflow-y: auto;
  overflow-x: hidden;
}
.helper-panel::-webkit-scrollbar { display: none; }
.helper-panel--open {
  transform: scale(1);
  animation: panelBoot 0.6s ease;
}

/* ── Tipografia ── */
.panel-title {
  text-align: center;
  font-size: 0.9rem;
  color: var(--cyan);
  letter-spacing: 2px;
  text-transform: uppercase;
  text-shadow: 0 0 6px var(--cyan);
  margin: 0 0 8px;
}
.panel-header {
  text-align: center;
  font-size: 0.8rem;
  color: var(--cyan);
  margin: 6px 0;
  letter-spacing: 1px;
  text-shadow: 0 0 6px var(--cyan);
  position: relative;
}
.panel-header::after {
  content: '';
  position: absolute;
  bottom: -4px; left: 0;
  width: 100%; height: 2px;
  background: linear-gradient(90deg, transparent, var(--cyan), transparent);
  animation: scanline 2s linear infinite;
}
.section-label {
  font-size: 0.85rem;
  color: var(--cyan);
  text-shadow: 0 0 5px var(--cyan);
  margin: 8px 0 4px;
  letter-spacing: 0.5px;
}
.section-label::after {
  content: '•';
  margin-left: 6px;
  opacity: 0.7;
  animation: blinkDot 1s infinite alternate;
}
.section-divider {
  border: none;
  border-top: 1px solid rgba(0, 255, 255, 0.3);
  margin: 6px 0;
  box-shadow: 0 0 6px rgba(0, 255, 255, 0.2);
}

/* ── Custom select ── */
.custom-select-wrap { margin-bottom: 4px; }
.custom-select-wrap label {
  display: block;
  font-size: 0.78rem;
  color: var(--cyan);
  margin-bottom: 5px;
  letter-spacing: 0.5px;
}

.custom-select {
  position: relative;
  user-select: none;
}

.custom-select__trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7px 12px;
  background: rgba(0, 255, 255, 0.08);
  border: 1px solid rgba(0, 255, 255, 0.4);
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.85rem;
  color: var(--cyan);
  transition: all 0.2s ease;
  box-shadow: 0 0 6px rgba(0, 255, 255, 0.15);
}
.custom-select__trigger:hover,
.custom-select.open .custom-select__trigger {
  border-color: var(--cyan);
  box-shadow: 0 0 12px rgba(0, 255, 255, 0.4);
  background: rgba(0, 255, 255, 0.15);
}

.custom-select__arrow {
  font-size: 0.9rem;
  transition: transform 0.3s ease;
}
.custom-select.open .custom-select__arrow {
  transform: rotate(180deg);
}

.custom-select__options {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  list-style: none;
  margin: 0;
  padding: 4px;
  background: rgba(8, 25, 41, 0.92);
  border: 1px solid rgba(0, 255, 255, 0.4);
  border-radius: 10px;
  backdrop-filter: blur(12px);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.25);
  z-index: 50;
  display: none;
}
.custom-select.open .custom-select__options { display: block; }

.custom-select__options li {
  padding: 8px 12px;
  font-size: 0.85rem;
  color: rgba(0, 255, 255, 0.7);
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.custom-select__options li:hover {
  background: rgba(0, 255, 255, 0.12);
  color: var(--cyan);
  text-shadow: 0 0 6px var(--cyan);
}
.custom-select__options li.active {
  color: var(--cyan);
  background: rgba(0, 255, 255, 0.1);
  text-shadow: 0 0 8px var(--cyan);
  font-weight: bold;
}

/* ── LED ── */
.status-indicators { display: flex; gap: 8px; margin: 10px 0; }
.led { width: 12px; height: 12px; border-radius: 50%; }
.led--green  { background: var(--green);       animation: blinkLed 1.5s infinite; }
.led--yellow { background: var(--light-yellow); animation: blinkLed 1.7s infinite; }
.led--red    { background: var(--orange);       animation: blinkLed 2s infinite; }

/* ── System log ── */
.system-log {
  background: rgba(0,255,255,0.05);
  border: 1px solid rgba(0,255,255,0.2);
  border-radius: 6px;
  padding: 5px;
  height: 60px;
  overflow-y: auto;
  font-size: 11px;
  color: var(--cyan);
  box-shadow: inset 0 0 6px rgba(0,255,255,0.2);
  margin: 4px 0;
}
.system-log::-webkit-scrollbar { width: 4px; }
.system-log::-webkit-scrollbar-thumb { background: var(--cyan); border-radius: 2px; }
:deep([data-log-type="OK"])    { color: limegreen; }
:deep([data-log-type="INFO"])  { color: var(--cyan); }
:deep([data-log-type="WARN"])  { color: yellow; }
:deep([data-log-type="ERROR"]) { color: orangered; }

/* ── Mini display ── */
.mini-display {
  background: rgba(0,255,255,0.05);
  padding: 6px 10px;
  margin: 8px 0;
  border-radius: 6px;
  text-align: center;
  font-size: 0.85rem;
  box-shadow: inset 0 0 3px rgba(0,255,255,0.2);
}

/* ── Radar ── */
.radar {
  position: relative;
  width: 80px; height: 80px;
  border: 2px solid #00fff0;
  border-radius: 50%;
  margin: 10px auto;
  overflow: hidden;
}
.radar-sweep {
  position: absolute;
  width: 100%; height: 100%;
  background: rgba(0,255,255,0.2);
  clip-path: polygon(50% 50%, 100% 0, 100% 100%);
  transform-origin: 50% 50%;
  animation: sweep 3s linear infinite;
}
.radar-dot {
  position: absolute;
  width: 6px; height: 6px;
  background: #00fff0;
  border-radius: 50%;
  top: 30%; left: 60%;
  animation: blinkDot 2s infinite;
}

/* ── Keyframes ── */
@keyframes panelBoot {
  0%   { opacity:0; transform:scale(0.8) rotate(-5deg); filter:blur(5px); }
  50%  { opacity:1; transform:scale(1.05) rotate(1deg);  filter:blur(0); }
  100% { transform:scale(1) rotate(0); }
}
@keyframes scanline {
  0%   { transform:translateX(-100%); opacity:0.2; }
  50%  { opacity:1; }
  100% { transform:translateX(100%);  opacity:0.2; }
}
@keyframes blinkDot {
  0%,100% { opacity:0.2; transform:scale(1); }
  50%     { opacity:1;   transform:scale(1.3); }
}
@keyframes blinkLed {
  0%,50%,100% { opacity:1; }
  25%,75%     { opacity:0.4; }
}
@keyframes sweep {
  from { transform:rotate(0deg); }
  to   { transform:rotate(360deg); }
}

@media (max-width: 767px) {
  .menu-helper { height: 60px; }
  .menu-helper img { height: 60px; width: 60px; }
  .helper-panel { width: 260px; right: 1rem; }
}
</style>
