<template>
  <aside
    id="sidebar"
    role="complementary"
    aria-label="Barra laterale di navigazione per desktop"
    class="sidebar"
    :class="{ 'sidebar--visible': scrolled }"
  >
    <img
      class="sidebar__ship"
      src="/media/NavicellaSidebarDesktop.avif"
      alt="Navicella spaziale decorativa"
      aria-hidden="true"
    />

    <nav role="navigation" aria-label="Menu principale desktop">
      <ul class="sidebar__list" role="menubar">
        <li v-for="link in links" :key="link.href" role="none">
          <a
            :href="link.href"
            class="sidebar__link"
            role="menuitem"
            :title="`Vai alla sezione ${link.label}`"
          >{{ link.label }}</a>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useScroll } from '@/composables/useScroll'
import { useLocale } from '@/composables/useLocale'

const { scrolled } = useScroll()
const { t } = useLocale()

const links = computed(() => [
  { href: '#home',           label: t('home') },
  { href: '#about',          label: t('about') },
  { href: '#skills',         label: t('skills') },
  { href: '#work',           label: t('work') },
  { href: '#contact-nebula', label: t('contact') },
])
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  bottom: 0;
  width: var(--sidebar-width);
  height: 100vh;
  z-index: 10;
  overflow: visible;
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(to top, var(--light-yellow) 0%, var(--yellow) 40%, var(--orange) 80%, #ff4800 100%);
  color: var(--blue);
  font-family: 'Anta', sans-serif;
  font-weight: 900;
  font-size: var(--link-navbar-mobile);
  border-top-right-radius: 33%;
  border-top-left-radius: 33%;
  transform: translateY(130%);
  transition: transform 0.7s ease, height 0.7s ease;
  animation: glowPulse 2.5s ease-in-out infinite;
}

@media (min-width: 1025px) {
  .sidebar { display: flex; }
}

.sidebar--visible {
  transform: translateY(0);
  height: 89vh;
}

.sidebar__ship {
  position: absolute;
  top: -3.5rem;
  left: 50%;
  transform: translateX(-50%) scale(1.1);
  transform-origin: top center;
  max-width: none;
  width: 130%;
  height: auto;
  pointer-events: none;
}

.sidebar__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  margin-top: 5rem;
}

.sidebar__link {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  color: var(--blue);
  margin: 0.5rem 5px;
  padding: 4px;
  display: block;
  text-decoration: none;
  font-family: 'Anta', sans-serif;
  font-weight: 800;
  font-size: 1rem;
  transition: transform 0.3s ease-out, text-shadow 0.3s ease-out;
}

.sidebar__link:hover {
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
  transform: rotate(180deg) translateX(0.3rem);
}

@media (prefers-reduced-motion: reduce) {
  .sidebar { animation: none; transition: none; }
}
</style>
