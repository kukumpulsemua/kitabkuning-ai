import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // The 'define' block for API_KEY has been removed for security.
  // The key is now exclusively handled by the backend proxy.
  base: './', // Ubah dari '/' ke './' agar aset dimuat relative (wajib untuk Capacitor/Android)
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
