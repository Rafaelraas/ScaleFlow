import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';

export default defineConfig(({ mode }) => {
  // Use VITE_APP_BASE_PATH environment variable, default to '/'
  const basePath = process.env.VITE_APP_BASE_PATH || '/';

  return {
    server: {
      host: '::',
      port: 8080,
    },
    plugins: [
      react(),
      viteCompression({
        algorithm: 'gzip',
        ext: '.gz',
      }),
      visualizer({
        filename: './dist/stats.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
      extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
    },
    base: basePath, // Use the configurable base path
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor chunks for better caching
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-select',
              '@radix-ui/react-popover',
              '@radix-ui/react-avatar',
              '@radix-ui/react-label',
              '@radix-ui/react-tabs',
              '@radix-ui/react-toast',
              '@radix-ui/react-tooltip',
            ],
            'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
            'date-vendor': ['date-fns', 'react-day-picker'],
            'charts-vendor': ['recharts'],
            'query-vendor': ['@tanstack/react-query'],
            'supabase-vendor': ['@supabase/supabase-js', '@supabase/auth-ui-react'],
          },
        },
      },
    },
    test: {
      globals: true, // Permite usar 'describe', 'it', 'expect' globalmente
      environment: 'jsdom', // Ambiente de DOM para testes de React
      setupFiles: './vitest.setup.ts', // Arquivo de setup para configurações adicionais
      css: true, // Habilita o processamento de CSS para testes de componentes
    },
  };
});
