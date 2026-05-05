import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Optimization: Pre-compute vendor chunks mapping for O(1) lookups
const VENDOR_MAP: Record<string, string> = {
  'react-markdown': 'markdown-vendor',
  'remark-': 'markdown-vendor',
  'rehype-': 'markdown-vendor',
  'micromark': 'markdown-vendor',
  'lucide-react': 'icons-vendor',
  '@microsoft/signalr': 'signalr-vendor',
  'three': 'three-vendor',
  '@react-three': 'three-vendor',
  '@pmndrs': 'three-vendor',
  'zod': 'schema-vendor',
  'date-fns': 'date-picker-vendor',
  'react-day-picker': 'date-picker-vendor',
  'framer-motion': 'motion-vendor',
  'axios': 'utils-vendor',
  'clsx': 'utils-vendor',
  'tailwind-merge': 'utils-vendor',
};

const RADIX_PACKAGES = [
  '@radix-ui/react-select',
  '@radix-ui/react-tooltip',
  '@radix-ui/react-popper',
  '@radix-ui/react-portal',
  '@radix-ui/react-dismissable-layer',
  '@radix-ui/react-focus-scope',
  '@radix-ui/react-focus-guards',
  '@radix-ui/react-roving-focus',
  '@radix-ui/react-collection',
  '@radix-ui/react-presence',
  '@floating-ui/'
];

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
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    chunkSizeWarningLimit: 1500,
    reportCompressedSize: false, // Performance: Skip Gzip/Brotli size reporting for faster builds
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

          // Faster lookup for pre-defined vendors
          for (const [key, chunk] of Object.entries(VENDOR_MAP)) {
            if (id.includes(key)) return chunk;
          }

          if (RADIX_PACKAGES.some(pkg => id.includes(pkg))) {
            return 'radix-ui-vendor';
          }
        },
      },
    },
  },
});