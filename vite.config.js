import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // sito utente giuseppepentrelli.github.io: servito dalla radice, BASE_PATH solo per build in sottocartella
  base: process.env.BASE_PATH || '/',
  build: {
    rolldownOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        styleLab: fileURLToPath(new URL('./style-lab.html', import.meta.url)),
      },
    },
  },
})
