/**
 * Root layout load function.
 *
 * Controls SSR globally based on BUILD_TARGET:
 *   - BUILD_TARGET=static (Capacitor, GitHub Pages): SSR disabled.
 *     The app is a client-side SPA. Capacitor loads from file:// where
 *     SSR is impossible. GitHub Pages has no server runtime.
 *   - BUILD_TARGET=cloudflare (default): SSR enabled for routes that
 *     don't import Phaser. The BFF endpoints (/api/*) require SSR.
 *     Individual routes disable SSR via their own +page.ts when needed
 *     (e.g. / and /play import Phaser which uses Node built-ins).
 *
 * This fixes audit issue X3: /settings had no +page.ts and would try to
 * SSR on Capacitor, breaking. With this layout-level control, all routes
 * are client-only when BUILD_TARGET=static.
 */

export const ssr = process.env.BUILD_TARGET !== 'static';
export const prerender = process.env.BUILD_TARGET === 'static';
