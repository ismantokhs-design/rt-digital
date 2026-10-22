import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/rt-digital/', // 👈 WAJIB ADA agar asset terpanggil dengan benar di GitHub Pages
})