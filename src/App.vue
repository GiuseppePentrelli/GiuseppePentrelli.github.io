<template>
  <div class="min-h-screen">
    <a href="#main-content" class="skip-link">Salta al contenuto principale</a>

    <AppNavbar />
    <AppSidebar />
    <HelperPanel />

    <main id="main-content" tabindex="-1">
      <RouterView />
    </main>

    <AppFooter />
  </div>
</template>

<script setup>
import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import HelperPanel from '@/components/ui/HelperPanel.vue'
</script>
