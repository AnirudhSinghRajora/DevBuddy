import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Keep this for local development
    historyApiFallback: true
  },
  preview: {
    // Handle client-side routing in preview mode
    historyApiFallback: true,
  },
  build: {
    // Generate a 404.html that redirects to index.html
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})
