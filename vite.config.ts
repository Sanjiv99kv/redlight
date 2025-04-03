import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Add assets configuration
  assetsInclude: ['**/*.mp4', '**/*.webm', '**/*.mov'],
  // Optimize assets handling
  build: {
    assetsInlineLimit: 0, // Don't inline any assets
  }
})
