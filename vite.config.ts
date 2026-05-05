import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Vite configuration optimized for DreamGuard

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://cohabit.vn",
        changeOrigin: true,
        secure: true,
      },
      "/chathub": {
        target: "https://cohabit.vn",
        changeOrigin: true,
        secure: true,
        ws: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Dev Optimization: Pre-bundle heavy dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'framer-motion',
      'lucide-react',
      '@tanstack/react-query',
      'axios',
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      'zustand'
    ],
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 2000,
    reportCompressedSize: false,
    sourcemap: false,
    assetsInlineLimit: 4096,
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE' || warning.code === 'SOURCEMAP_ERROR' || warning.code === 'INVALID_ANNOTATION') {
          return;
        }
        warn(warning);
      },
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('@radix-ui') || id.includes('@floating-ui')) return 'radix-ui-vendor';
          if (id.includes('lucide-react')) return 'icons-vendor';
          if (id.includes('three') || id.includes('@react-three')) return 'three-vendor';
          if (id.includes('react-markdown') || id.includes('remark-') || id.includes('rehype-')) return 'markdown-vendor';
          if (id.includes('recharts')) return 'charts-vendor';
          if (id.includes('@tanstack')) return 'query-table-vendor';
          if (id.includes('framer-motion') || id.includes('gsap')) return 'animation-vendor';
          if (id.includes('axios') || id.includes('zustand') || id.includes('date-fns')) return 'core-vendor';
          return 'vendor';
        },
      },
    },
  },
});