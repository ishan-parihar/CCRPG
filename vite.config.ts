import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { fileURLToPath, URL } from 'node:url';

/**
 * Vite config — SvelteKit-powered pure-Svelte frontend.
 *
 * Phaser was purged in the greenfield rebuild. The UI is now 100% Svelte.
 * Path aliases: @core/@infra (legacy) + $core/$infra/$shared (SvelteKit).
 * The CLI build (tsup) is unaffected — it has its own config.
 */
export default defineConfig(({ mode }) => ({
  // Base path: GitHub Pages serves at /CCRPG/, Cloudflare serves at /.
  // The BUILD_TARGET env drives both the adapter (svelte.config.js) and
  // the base path here. For Capacitor (static), base is './' so assets
  // resolve from the file:// origin.
  base: process.env.BUILD_TARGET === 'static' ? './' : '/',
  define: {
    __DEV__: JSON.stringify(mode !== 'production'),
  },
  plugins: [
    sveltekit(),
    SvelteKitPWA({
      strategies: 'generateSW',
      registerType: 'autoUpdate',
      manifest: {
        name: 'CCRPG — Cognitive Combat RPG',
        short_name: 'CCRPG',
        description: 'A Cognitive-Capacity-Driven RPG where every gameplay verb is a gamified developmental assessment across 8 lines of intelligence × 8 stages of consciousness.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#05070b',
        theme_color: '#0b0d12',
        categories: ['games', 'education', 'health'],
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Play',
            short_name: 'Play',
            description: 'Continue your journey',
            url: '/play',
          },
          {
            name: 'Settings',
            short_name: 'Settings',
            description: 'Adjust accessibility and privacy',
            url: '/settings',
          },
          {
            name: 'Recover Save',
            short_name: 'Recover',
            description: 'Restore progress on a new device',
            url: '/recover',
          },
        ],
      },
      workbox: {
        // Precache the app shell + fonts (woff2 only — TTF purged)
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4MB
        runtimeCaching: [
          {
            // LLM BFF — network-only (don't cache responses)
            urlPattern: /\/api\/llm\//,
            handler: 'NetworkOnly',
          },
          {
            // Fonts — cache-first (long-lived)
            urlPattern: /\/fonts\/.*\.woff2$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ccrpg-fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
  resolve: {
    alias: {
      // Legacy @ aliases — kept for src/core + src/infra + scripts/cli-game.ts
      '@core': fileURLToPath(new URL('./src/core', import.meta.url)),
      '@infra': fileURLToPath(new URL('./src/infra', import.meta.url)),
    },
  },
  // Node-only modules used by src/infra/tdg/ (TDGClient imports child_process, fs, path).
  // These are dynamically imported at runtime (TDGBridge uses `await import('./TDGClient.js')`
  // only when TDG-Rust is detected, which never happens in the browser). Mark them as
  // external so Vite doesn't try to bundle them for the browser build.
  build: {
    target: 'es2020',
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      external: ['child_process', 'fs', 'path', 'os', 'crypto'],
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: false,
  },
  preview: {
    port: 4173,
  },
}));
