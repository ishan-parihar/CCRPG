import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
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
  // SvelteKit manages base path via adapter — do not set `base` here.
  define: {
    __DEV__: JSON.stringify(mode !== 'production'),
  },
  plugins: [sveltekit()],
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
