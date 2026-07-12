import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import cloudflare from '@sveltejs/adapter-cloudflare';
import staticAdapter from '@sveltejs/adapter-static';
import { readFileSync } from 'node:fs';

/**
 * SvelteKit configuration for CCRPG.
 *
 * Adapter selection is driven by the BUILD_TARGET env var:
 *
 *   BUILD_TARGET=cloudflare  (default) → adapter-cloudflare
 *     - Full SSR + BFF endpoints (/api/*) + Cloudflare KV/Analytics
 *     - Used for the production web deploy (play.ccrpg.game)
 *     - Requires wrangler.toml + LLM_API_KEY secret
 *
 *   BUILD_TARGET=static → adapter-static (SPA fallback mode)
 *     - No SSR, no server endpoints — all client-side
 *     - Used for Capacitor (Android/iOS) + GitHub Pages
 *     - BFF endpoints are unreachable; the client falls back to
 *       local-only persistence + direct LLM (dev only)
 *
 * This dual-target setup lets one codebase deploy to both SSR platforms
 * (Cloudflare) and static platforms (Capacitor, GitHub Pages) without
 * code changes — only the BUILD_TARGET env differs.
 */

const BUILD_TARGET = process.env.BUILD_TARGET ?? 'cloudflare';

const adapter =
  BUILD_TARGET === 'static'
    ? staticAdapter({
        // SPA fallback — all routes render client-side.
        fallback: 'index.html',
        // Prerender the empty-shell routes (the app is client-rendered).
        precompress: false,
        strict: false,
      })
    : cloudflare({
        // Cloudflare Pages config
        routes: {
          include: ['/*'],
          exclude: ['/<allBuilderRoutes>'],
        },
      });

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter,
    alias: {
      $core: 'src/core',
      $infra: 'src/infra',
      $shared: 'src/shared',
      '@core': 'src/core',
      '@infra': 'src/infra',
    },
    typescript: {
      config: (cfg) => ({
        ...cfg,
        include: ['../src/**/*.ts', '../src/**/*.svelte', '../src/**/*.js'],
        exclude: ['../node_modules/**', '../dist/**', '../android/**'],
      }),
    },
  },
  compilerOptions: {
    runes: true,
  },
};

export default config;
