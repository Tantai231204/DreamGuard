import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })

// để tạm để test
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "https://cohabit.vn",
        changeOrigin: true,
        secure: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});