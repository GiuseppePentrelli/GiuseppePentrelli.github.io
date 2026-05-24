<template>
  <div class="min-h-screen flex flex-col items-center justify-center text-center px-4">
    <h1 class="text-6xl font-bold text-(--orange) mb-4">404</h1>
    <p class="text-(--white) text-xl mb-8">Sembra che ti sia perso nello spazio... 🚀</p>
    <a href="#/" class="command-button">
      [ TORNA ALLA BASE ]
    </a>
  </div>
</template>

<style scoped>
.command-button {
  text-decoration: none;
  display: inline-block;
  background-color: var(--color-dark-secondary);
  color: var(--color-neon-green);
  text-transform: uppercase;
  font-weight: 900;
  letter-spacing: 2px;
  padding: 15px 30px;
  border-left: 5px solid var(--color-neon-cyan);
  border-right: 5px solid var(--color-neon-aqua);
  border-top: 2px solid var(--color-dark-border);
  border-bottom: 2px solid var(--color-dark-active);
  cursor: pointer;
  transition: all 0.2s ease-out;
}
.command-button:hover {
  background-color: var(--color-dark-hover);
  color: var(--color-neon-blue);
  transform: translateY(2px);
}
</style>
