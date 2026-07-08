import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { fileURLToPath, URL } from 'node:url';

/**
 * Vite config — now SvelteKit-powered (Phase 0 migration).
 *
 * SvelteKit IS Vite underneath, so the existing Phaser integration
 * continues to work. The Phaser game is mounted inside
 * src/routes/+page.svelte via startGame().
 *
 * The existing path aliases (@core, @game, @infra) are preserved
 * so src/game/main.ts and all existing code keep working unchanged.
 * SvelteKit also gets $core, $infra, $game, $shared aliases (see
 * svelte.config.js).
 *
 * The CLI build (tsup) is unaffected — it has its own config
 * (tsup.config.ts) and doesn't go through Vite.
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
        // Precache the app shell + fonts
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,ttf}'],
        // Don't precache the Phaser bundle (too large — runtime cache instead)
        globIgnores: ['**/phaser*', '**/game/main*'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, // 4MB
        runtimeCaching: [
          {
            // Phaser bundle — runtime cache, stale-while-revalidate
            urlPattern: /.*game\/main.*/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'ccrpg-phaser',
              expiration: { maxEntries: 1, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            // LLM BFF — network-first (don't cache responses)
            urlPattern: /\/api\/llm\//,
            handler: 'NetworkOnly',
          },
          {
            // Fonts — cache-first (long-lived)
            urlPattern: /\/fonts\/.*\.ttf$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'ccrpg-fonts',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 365 },
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
      // Legacy @ aliases — keep for existing src/ code that imports
      // via @core/@game/@infra. New Svelte code uses $core/$game/$infra.
      '@core': fileURLToPath(new URL('./src/core', import.meta.url)),
      '@game': fileURLToPath(new URL('./src/game', import.meta.url)),
      '@infra': fileURLToPath(new URL('./src/infra', import.meta.url)),
    },
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 1500,
    // NOTE: manualChunks for phaser removed — SvelteKit's SSR build
    // treats phaser as external (browser-only), and manualChunks
    // conflicts with that. SvelteKit's default chunking is sufficient.
    // If we need finer chunking for the /play route's lazy-load, we'll
    // add it via a SvelteKit-specific build hook in a future phase.
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
