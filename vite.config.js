import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  base: '/mifss-ui',
  build: {
    outDir: 'mifss-ui'
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/mifss/ipt': {
        target: 'http://127.0.0.1:7008',
        changeOrigin: true
      }
    }
  }
})
