import { defineConfig } from 'tsup';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  entry: ['scripts/cli-game.ts'],
  outDir: 'dist/cli',
  format: ['esm'],
  target: 'node18',
  platform: 'node',
  bundle: true,
  clean: true,
  minify: false,
  sourcemap: false,
  dts: false,
  // No banner — esbuild preserves the source shebang;
  // we change the source shebang to #!/usr/bin/env node for distribution
  // Mark all src/ imports as bundleable (no externals — everything gets inlined)
  noExternal: [/(.*)/],
  // Resolve SvelteKit path aliases ($shared, $core, $infra, @core, @infra)
  // when bundling for the CLI — these are normally resolved by Vite/SvelteKit.
  esbuildOptions(opts) {
    opts.alias = {
      ...(opts.alias ?? {}),
      $shared: resolve(here, 'src/shared'),
      $core: resolve(here, 'src/core'),
      $infra: resolve(here, 'src/infra'),
      '@core': resolve(here, 'src/core'),
      '@infra': resolve(here, 'src/infra'),
    };
  },
});
