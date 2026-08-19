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
          // GSAP kept separate from framer-motion: framer-motion is used by
          // eagerly-loaded chrome (navbar, footer), while GSAP is only needed
          // by the hero, so bundling them together forced GSAP onto the
          // critical path.
          'vendor-animation': ['framer-motion', '@studio-freight/lenis'],
          'vendor-gsap':      ['gsap'],
          'vendor-ui':        ['lucide-react', 'react-hot-toast'],
        },
      },
    },
  },
})
