import { defineConfig } from 'vite'
import { reactRouter } from '@react-router/dev/vite'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [reactRouter(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './app'),
      '@modules': resolve(__dirname, './app/modules'),
      '@redux': resolve(__dirname, './app/redux'),
      '@routes': resolve(__dirname, './app/routes'),
      '@utils': resolve(__dirname, './app/utils'),
      '@assets': resolve(__dirname, './app/assets'),
      '@hooks': resolve(__dirname, './app/hooks'),
      '@shared': resolve(__dirname, './app/shared')
    }
  }
})
