import { defineConfig } from 'tsup';

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
});
