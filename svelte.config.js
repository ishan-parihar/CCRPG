import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import adapter from '@sveltejs/adapter-auto';
import { readFileSync } from 'node:fs';

/**
 * SvelteKit configuration for CCRPG.
 *
 * Phase 0: adapter-auto (works on Cloudflare/Vercel/Netlify).
 * Phase 3: switch to adapter-cloudflare for production deploy.
 * Phase 4 (Capacitor): use adapter-static for SPA-mode builds.
 *
 * The existing Phaser game is preserved by mounting it inside
 * src/routes/+page.svelte via the existing startGame() entrypoint.
 */
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    alias: {
      // Preserve the existing core/infra/game path aliases.
      // These let SvelteKit routes import from the existing pure-TS layers
      // without modification — critical for "no regressions in core/".
      $core: 'src/core',
      $infra: 'src/infra',
      $game: 'src/game',
      $shared: 'src/shared',
      // Legacy @ aliases — kept so existing src/ code that imports
      // via @core/@game/@infra keeps working without modification.
      // New Svelte code should prefer $core / $infra / $game / $shared / $lib.
      '@core': 'src/core',
      '@game': 'src/game',
      '@infra': 'src/infra',
    },
    // Files that should be treated as static (not SSR'd).
    // The Phaser bundle and its assets live client-side only.
    typescript: {
      config: (cfg) => ({
        ...cfg,
        include: ['../src/**/*.ts', '../src/**/*.svelte', '../src/**/*.js'],
        exclude: ['../node_modules/**', '../dist/**', '../android/**'],
      }),
    },
  },
  // Svelte 5 runes mode — required for the new reactivity model.
  compilerOptions: {
    runes: true,
  },
};

export default config;
