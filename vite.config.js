import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // sito utente giuseppepentrelli.github.io: servito dalla radice, BASE_PATH solo per build in sottocartella
  base: process.env.BASE_PATH || '/',
})
