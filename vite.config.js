import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // BASE_PATH si imposta dopo, quando scegliamo il repo GitHub
  base: process.env.BASE_PATH || '/',
})
