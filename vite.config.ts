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
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      onwarn(warning, warn) {
        const message = typeof warning === 'string' ? warning : (warning.message || '')

        const isUseClientDirective =
          (typeof warning !== 'string' && warning.code === 'MODULE_LEVEL_DIRECTIVE' && /use client/i.test(message)) ||
          /Module level directives cause errors when bundled,\s*"use client"/i.test(message)

        const isSourcemapNoise =
          (typeof warning !== 'string' && warning.code === 'SOURCEMAP_ERROR' && /Can't resolve original location of error/i.test(message)) ||
          /Can't resolve original location of error/i.test(message)

        const isInvalidPureAnnotation =
          (typeof warning !== 'string' && warning.code === 'INVALID_ANNOTATION') ||
          /annotation that Rollup cannot interpret/i.test(message)

        if (isUseClientDirective || isSourcemapNoise || isInvalidPureAnnotation) {
          return
        }

        warn(warning)
      },
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (id.includes('@tanstack/react-query')) {
            return 'react-query';
          }

          if (id.includes('framer-motion')) {
            return 'framer-motion';
          }

          if (id.includes('lucide-react')) {
            return 'icons';
          }

          if (id.includes('@microsoft/signalr')) {
            return 'signalr';
          }

          if (id.includes('three') || id.includes('@react-three') || id.includes('@pmndrs')) {
            return 'three-vendor';
          }

          if (id.includes('zod')) {
            return 'zod';
          }

          if (id.includes('date-fns') || id.includes('react-day-picker')) {
            return 'date-picker-vendor';
          }

          const isRadixSelectOrTooltip =
            id.includes('@radix-ui/react-select') ||
            id.includes('@radix-ui/react-tooltip');

          const isRadixSharedRuntime =
            id.includes('@radix-ui/react-popper') ||
            id.includes('@radix-ui/react-portal') ||
            id.includes('@radix-ui/react-dismissable-layer') ||
            id.includes('@radix-ui/react-focus-scope') ||
            id.includes('@radix-ui/react-focus-guards') ||
            id.includes('@radix-ui/react-roving-focus') ||
            id.includes('@radix-ui/react-collection') ||
            id.includes('@radix-ui/react-presence') ||
            id.includes('@floating-ui/');

          if (isRadixSelectOrTooltip || isRadixSharedRuntime) {
            return 'radix-select-tooltip';
          }

        },
      },
    },
  },
});