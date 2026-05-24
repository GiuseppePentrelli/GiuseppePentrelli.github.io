<template>
  <nav
    id="navbar"
    role="navigation"
    aria-label="Menu principale su mobile"
    class="navbar fixed top-0 left-0 z-[var(--z-first)] h-[4.5rem] w-[80%] flex-row justify-start items-center invisible hidden transition-transform duration-700"
    :class="{ 'navScrolled': scrolled }"
  >
    <div class="logo-container shadow ml-2">
      <img class="img-logo" src="/media/Logo.avif" width="64" height="64" alt="Logo Novenix" />
    </div>

    <ul class="flex flex-row gap-3 ml-4 list-none p-0 items-center">
      <li>
        <a class="nav-link p-[10px] text-[var(--blue)] no-underline" href="#home">
          {{ t('home') }}
        </a>
      </li>
      <li class="relative" ref="dropdownParentRef">
        <a
          class="nav-link p-[10px] text-[var(--blue)] font-bold no-underline cursor-pointer"
          role="button"
          :aria-expanded="dropdownOpen"
          aria-haspopup="true"
          @click.stop="toggleDropdown"
        >
          Menu
        </a>
        <ul
          v-show="dropdownOpen"
          class="absolute top-full left-1/2 -translate-x-1/2 z-[1000] bg-(--white) list-none m-0 p-2 min-w-[10rem] rounded-lg"
          role="menu"
        >
          <li role="none"><a class="dropdown-item block px-4 py-2 rounded" href="#about" role="menuitem">{{ t('about') }}</a></li>
          <li role="none"><a class="dropdown-item block px-4 py-2 rounded" href="#skills" role="menuitem">{{ t('skills') }}</a></li>
          <li role="none"><hr class="border-[var(--color-dark-border)] my-1" /></li>
          <li role="none"><a class="dropdown-item block px-4 py-2 rounded" href="#work" role="menuitem">{{ t('work') }}</a></li>
          <li role="none"><a class="dropdown-item block px-4 py-2 rounded" href="#contact-nebula" role="menuitem">{{ t('contact') }}</a></li>
        </ul>
      </li>
    </ul>

    <picture class="flex items-center justify-center">
      <img class="img-scroll-nav" src="/media/NavicellaNavbarMobile.avif" alt="Navicella spaziale decorativa" />
    </picture>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useScroll } from '@/composables/useScroll'
import { useLocale } from '@/composables/useLocale'
import { onMounted, onUnmounted } from 'vue'

const { scrolled } = useScroll()
const { t } = useLocale()

const dropdownOpen = ref(false)
const dropdownParentRef = ref(null)

function toggleDropdown(e) {
  e.stopPropagation()
  dropdownOpen.value = !dropdownOpen.value
}

function closeDropdown(e) {
  if (dropdownParentRef.value && !dropdownParentRef.value.contains(e.target)) {
    dropdownOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', closeDropdown))
onUnmounted(() => document.removeEventListener('click', closeDropdown))
</script>

<style scoped>
.navbar {
  background: linear-gradient(to right, var(--light-yellow) 0%, var(--yellow) 35%, var(--orange) 75%, #ff4800 100%);
  animation: glowPulse 2.8s ease-in-out infinite;
  color: var(--blue);
  font-size: var(--link-navbar-mobile);
  font-weight: 600;
  font-family: 'Anta', sans-serif;
  box-shadow: 0 0 10px rgba(255, 72, 0, 0.4);
  border-bottom-right-radius: 60px;
  border-top-right-radius: 60px;
  transform: translateX(-120%);
}

@media (max-width: 1024px) {
  .navbar { display: flex !important; visibility: visible !important; }
}

.navScrolled { transform: translateX(0); }

.logo-container, .img-logo {
  height: 3rem; width: 3rem;
  border-radius: 50%;
  object-fit: cover;
}

.img-scroll-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: -1rem;
  height: 9vh;
  width: auto;
  filter: drop-shadow(0 0 8px rgba(255, 120, 0, 0.6));
  transition: transform 0.3s ease;
  z-index: var(--z-second);
}

.navbar:hover .img-scroll-nav { transform: translateY(-50%) scale(1.05); }

.nav-link {
  font-weight: 700;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.4);
}

.dropdown-item {
  display: block;
  color: var(--blue);
  font-weight: 700;
  text-decoration: none;
  transition: background-color 0.2s, color 0.2s;
}
.dropdown-item:hover {
  background-color: var(--blue);
  color: var(--white);
}

@media (prefers-reduced-motion: reduce) { .navbar { animation: none; } }
</style>
