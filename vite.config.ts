import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/yearn-charts/',
  plugins: [react()],
  css: {
    postcss: './postcss.config.js', // Ensure Vite uses the PostCSS config
  },
})
