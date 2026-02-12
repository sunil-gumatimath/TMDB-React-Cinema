import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server : {
    port : 3000,
    cors: true,
    proxy: {
      '/api': {
        target: 'https://api.themoviedb.org/3',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        headers: {
          'Authorization': `Bearer ${process.env.VITE_TMDB_TOKEN}`
        }
      }
    }
  }
})
