import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],// 💥 ADD OR UPDATE THIS BASE PROPERTY 💥
  base: './', // Forces Vite to use relative paths for all assets (CSS, JS, images)
})