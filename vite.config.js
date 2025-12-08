import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    cors: true,
    proxy: { 
      '/textdb': {
        target: 'https://textdb.online',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/textdb/, ''),
      }
    }
  }
})