// Root page load function.
//
// Disables SSR for the root route because the Phaser game + its deps
// (SaveRepository, etc.) use Node built-ins (fs, path, crypto) that
// cannot be bundled for the browser. The game is client-only by design.
//
// Phase 1 will re-enable SSR for menu routes (which won't import Phaser)
// and keep SSR disabled only for /play.

export const ssr = false;
export const prerender = false;
export const load = () => {
  return {};
};
