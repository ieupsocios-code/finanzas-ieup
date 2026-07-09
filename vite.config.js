import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: false,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
<<<<<<< HEAD
})
=======
});
>>>>>>> febd9e174de100083d50f3e7b4ecd03631f361b9
