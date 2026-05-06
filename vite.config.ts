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
    dedupe: ['react', 'react-dom', 'three', '@react-three/fiber', '@react-three/drei'],
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

          // Core React and framework libraries - MUST be handled first to avoid being caught by other vendors
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/scheduler/')) {
            return 'vendor-react';
          }

          if (id.includes('@radix-ui') || id.includes('@floating-ui')) return 'vendor-radix';
          if (id.includes('lucide-react')) return 'vendor-icons';
          
          // Group three and react-three together
          if (id.includes('three') || id.includes('@react-three')) return 'vendor-three';
          
          if (id.includes('react-markdown') || id.includes('remark-') || id.includes('rehype-')) return 'vendor-markdown';
          if (id.includes('recharts')) return 'vendor-charts';
          if (id.includes('@tanstack')) return 'vendor-tanstack';
          if (id.includes('framer-motion') || id.includes('gsap')) return 'vendor-animation';
          if (id.includes('axios') || id.includes('zustand') || id.includes('date-fns')) return 'vendor-core';
          
          return 'vendor';
        },
      },
    },
  },
});