import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    cors: true,
    proxy: {  // ✅ 正确：proxy 在 server 对象内部
      '^/note_ms/.*': {
        target: 'https://note.ms',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/note_ms/, ''),
        configure: (proxy, options) => {
          console.log("🔧 代理配置已加载")
          console.log("目标地址:", options.target)

          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('📤 代理请求:', req.url, '->', options.target + req.url.replace('/note_ms', ''))
          })

          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('📥 代理响应:', proxyRes.statusCode, req.url)
          })
        }
      },
      '/textdb': {  // 匹配 /textdb 开头的请求
        target: 'https://textdb.online',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/textdb/, ''),
      }
    }
  }
})