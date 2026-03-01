import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

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
});