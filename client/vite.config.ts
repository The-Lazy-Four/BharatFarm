import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { VitePWA } from 'vite-plugin-pwa';

const workspaceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, workspaceRoot, '');
  const apiPort = env.PORT || '3000';

  return {
    plugins: [
      react(),
      VitePWA({
        // Use injectManifest so our custom sw.ts (with push handlers) is the base
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.ts',
        registerType: 'prompt',
        injectRegister: 'script',
        includeAssets: [
          'favicon.png',
          'favicon-16.png',
          'icons/apple-touch-icon.png',
          'icons/icon-*.png'
        ],
        manifest: {
          name: 'BharatFarm – Smart Agriculture',
          short_name: 'BharatFarm',
          description: 'Smart agriculture platform for farmers with climate intelligence, crop risk analysis, mandi intelligence, aggregation and Sahayak assistance.',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          orientation: 'portrait',
          theme_color: '#0d4a1e',
          background_color: '#0d4a1e',
          categories: ['agriculture', 'productivity', 'utilities'],
          lang: 'en-IN',
          icons: [
            {
              src: '/icons/icon-32.png',
              sizes: '32x32',
              type: 'image/png'
            },
            {
              src: '/icons/icon-96.png',
              sizes: '96x96',
              type: 'image/png'
            },
            {
              src: '/icons/icon-144.png',
              sizes: '144x144',
              type: 'image/png'
            },
            {
              src: '/icons/icon-192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/icons/icon-384.png',
              sizes: '384x384',
              type: 'image/png'
            },
            {
              src: '/icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: '/icons/icon-192-maskable.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable'
            },
            {
              src: '/icons/icon-512-maskable.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ]
        },
        injectManifest: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          // Don't precache noise/large images from external URLs
          globIgnores: ['**/node_modules/**', '**/sw.js', '**/workbox-*.js']
        },
        devOptions: {
          enabled: false
        }
      })
    ],
    resolve: {
      alias: {
        '@core': path.resolve(__dirname, './src/core')
      }
    },
    server: {
      port: 5173,
      host: true,
      proxy: {
        '/api': {
          target: `http://localhost:${apiPort}`,
          changeOrigin: true
        }
      }
    }
  };
});
