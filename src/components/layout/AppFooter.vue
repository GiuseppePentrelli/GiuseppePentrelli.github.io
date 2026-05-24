<template>
  <footer class="site-footer relative pt-[200px] pb-8 overflow-x-hidden text-center" role="contentinfo">

    <div class="text-center my-3">
      <p class="text-[1.2rem] font-bold uppercase tracking-[2px] text-[var(--light-white)] mt-[20vh]">
        {{ t('thanks_for_Visiting') }}
      </p>
    </div>

    <div class="flex justify-center">
      <img
        :src="isChristmas ? '/christmas/christmasMedia/meAndNala-christmas.avif' : '/media/meAndNala.avif'"
        alt="Ritratto di me e il mio cane Nala"
        width="300" height="300"
        loading="lazy" decoding="async"
        class="w-[300px] h-[300px] mt-5 [animation:FloatUpDown_5s_ease-in-out_infinite] drop-shadow-lg"
      />
    </div>

    <div class="container mx-auto flex flex-col items-center justify-center px-6">
      <picture>
        <img class="logo-footer" src="/media/Logo.webp" alt="Logo NOVENIX" loading="lazy" />
      </picture>

      <nav aria-label="Navigazione footer">
        <ul class="flex gap-4 my-3 list-none p-0">
          <li><a :href="'#about'" class="hover:text-[var(--yellow)] transition-colors">{{ t('about') }}</a></li>
          <li><a :href="'#work'" class="hover:text-[var(--yellow)] transition-colors">{{ t('work') }}</a></li>
          <li><a :href="'#skills'" class="hover:text-[var(--yellow)] transition-colors">{{ t('skills') }}</a></li>
          <li><a :href="'#contact-nebula'" class="hover:text-[var(--yellow)] transition-colors">{{ t('contact') }}</a></li>
        </ul>
      </nav>

      <SocialLinks class="my-2" />

      <div class="my-2 flex gap-3 flex-wrap justify-center">
        <a href="https://www.iubenda.com/privacy-policy/22034714" class="iubenda-white iubenda-noiframe iubenda-embed" title="Privacy Policy">Privacy Policy</a>
        <a href="https://www.iubenda.com/privacy-policy/22034714/cookie-policy" class="iubenda-white iubenda-noiframe iubenda-embed" title="Cookie Policy">Cookie Policy</a>
      </div>
    </div>

    <hr class="border-[var(--color-dark-border)] mx-auto my-4 w-[80%]" />

    <div class="text-center px-4">
      <small class="text-[0.8rem] text-gray-400">
        &copy; 2025 NOVENIX
        <img style="height:20px;width:20px;display:inline;" src="/media/favicon.ico" alt="" />
        | {{ t('copyright') }}
      </small>
    </div>

    <div class="text-center px-4 mt-1">
      <small>
        <a style="color:var(--light-white);" href="https://www.facebook.com/profile.php?id=61580195180170">
          <address>POWERED BY GIUSEPPE PENTRELLI</address>
        </a>
      </small>
    </div>
  </footer>
</template>

<script setup>
import { useLocale } from '@/composables/useLocale'
import { useTheme } from '@/composables/useTheme'
import SocialLinks from '@/components/ui/SocialLinks.vue'

const { t } = useLocale()
const { isChristmas } = useTheme()
</script>

<style scoped>
.site-footer {
  background: url('/media/footerBG.avif');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  color: var(--light-white);
  font-family: "Anta";
}

.site-footer::after {
  content: "";
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 40%;
  background: linear-gradient(to bottom, var(--blue), rgba(0,0,0,0));
  z-index: 1;
  pointer-events: none;
}

.logo-footer {
  height: 15vh; width: 15vh;
  border-radius: 60%;
  border: 2px solid var(--light-white);
  box-shadow: 0 0 15px cyan;
  transition: transform 0.3s;
}
.logo-footer:hover { transform: scale(1.1); }
</style>
