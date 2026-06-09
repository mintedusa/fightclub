import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':     ['react', 'react-dom', 'react-router-dom', 'react-helmet-async'],
          'vendor-animation': ['gsap', 'framer-motion', '@studio-freight/lenis'],
          'vendor-ui':        ['lucide-react', 'react-hot-toast'],
        },
      },
    },
  },
})
