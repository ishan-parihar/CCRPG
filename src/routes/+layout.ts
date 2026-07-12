/**
 * Root layout load function.
 *
 * Controls SSR globally based on BUILD_TARGET:
 *   - BUILD_TARGET=static (Capacitor, GitHub Pages): SSR disabled.
 *     The app is a client-side SPA. Capacitor loads from file:// where
 *     SSR is impossible. GitHub Pages has no server runtime.
 *
 * process.env requires a typeof guard: in dev this file is shipped to
 * both server and browser, and Vite does not inline non-VITE_* env
 * vars, so a bare `process.env` reference throws on the client.
 */

const buildTarget =
  typeof process !== 'undefined' && process.env && process.env.BUILD_TARGET
    ? process.env.BUILD_TARGET
    : '';

export const ssr = buildTarget !== 'static';
export const prerender = buildTarget === 'static';
