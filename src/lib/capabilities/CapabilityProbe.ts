/**
 * CapabilityProbe — detects device capabilities at boot and sets
 * data-capability / data-input attributes on <html>.
 *
 * This is the spine of Mysterium's universality layer (plan §11). It enables:
 * - 10-foot TV mode (large touch targets, 4-dir nav, high-contrast)
 * - Reduced-motion handling (disable stage motion transitions)
 * - Coarse-pointer enlargement (bigger touch targets on touch devices)
 * - WebGL-shader on/off (skip shaders on weak GPUs)
 * - Particle density scaling (fewer particles on low-RAM devices)
 *
 * The probe runs in <50ms on a low-end device. It reads from:
 * - navigator.gpu / WebGL context (GPU capability)
 * - navigator.deviceMemory (RAM — Chrome only, approximated elsewhere)
 * - navigator.hardwareConcurrency (CPU cores)
 * - navigator.connection (network type — Chrome only)
 * - matchMedia('(pointer: coarse)') etc. (input method)
 * - matchMedia('(prefers-reduced-motion: reduce)') (a11y)
 * - matchMedia('(prefers-contrast: more)') (a11y)
 * - window.screen (size + orientation)
 *
 * The detected capabilities are set as data-* attributes on <html>:
 *   data-input="touch|mouse|gamepad|tv"
 *   data-capability="high|medium|low"
 *   data-motion="full|reduced"
 *   data-contrast="normal|more"
 *   data-connection="4g|3g|2g|slow-2g|unknown"
 *
 * CSS reads these via attribute selectors to adjust the UI.
 */

export interface CapabilityReport {
  readonly inputMethod: 'touch' | 'mouse' | 'gamepad' | 'tv';
  readonly capability: 'high' | 'medium' | 'low';
  readonly motion: 'full' | 'reduced';
  readonly contrast: 'normal' | 'more';
  readonly connection: '4g' | '3g' | '2g' | 'slow-2g' | 'unknown';
  readonly webglVersion: 'none' | '1' | '2';
  readonly deviceMemory: number; // GB, approximate
  readonly hardwareConcurrency: number;
  readonly screenWidth: number;
  readonly screenHeight: number;
  readonly orientation: 'portrait' | 'landscape';
  readonly hasGamepad: boolean;
}

/**
 * Detect device capabilities. Returns a CapabilityReport.
 * Safe to call in the browser; returns a sensible default on the server.
 */
export function detectCapabilities(): CapabilityReport {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    // SSR fallback — sensible defaults for a mid-range device.
    return {
      inputMethod: 'mouse',
      capability: 'medium',
      motion: 'full',
      contrast: 'normal',
      connection: 'unknown',
      webglVersion: '1',
      deviceMemory: 4,
      hardwareConcurrency: 4,
      screenWidth: 1920,
      screenHeight: 1080,
      orientation: 'landscape',
      hasGamepad: false,
    };
  }

  // ─── Input method ───
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const hoverNone = window.matchMedia('(hover: none)').matches;
  const hasGamepad = navigator.getGamepads ? Array.from(navigator.getGamepads()).some((g) => g !== null) : false;

  // TV detection: large screen + coarse pointer + no hover + (optional) gamepad.
  // This is a heuristic — true TV detection requires UA parsing which is fragile.
  const isLikelyTV =
    window.screen.width >= 1920 &&
    window.screen.height >= 1080 &&
    coarsePointer &&
    hoverNone;

  let inputMethod: CapabilityReport['inputMethod'];
  if (isLikelyTV) inputMethod = 'tv';
  else if (hasGamepad && coarsePointer) inputMethod = 'gamepad';
  else if (coarsePointer) inputMethod = 'touch';
  else inputMethod = 'mouse';

  // ─── Motion preference ───
  const motion: CapabilityReport['motion'] = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'reduced'
    : 'full';

  // ─── Contrast preference ───
  const contrast: CapabilityReport['contrast'] = window.matchMedia('(prefers-contrast: more)').matches
    ? 'more'
    : 'normal';

  // ─── Connection type ───
  const conn = (navigator as any).connection?.effectiveType as string | undefined;
  const connection: CapabilityReport['connection'] =
    conn === '4g' || conn === '3g' || conn === '2g' || conn === 'slow-2g'
      ? conn
      : 'unknown';

  // ─── WebGL version ───
  let webglVersion: CapabilityReport['webglVersion'] = 'none';
  try {
    const canvas = document.createElement('canvas');
    const gl2 = canvas.getContext('webgl2');
    if (gl2) {
      webglVersion = '2';
    } else {
      const gl1 = canvas.getContext('webgl');
      if (gl1) webglVersion = '1';
    }
  } catch {
    webglVersion = 'none';
  }

  // ─── Device memory (Chrome only — approximate elsewhere) ───
  const deviceMemory = (navigator as any).deviceMemory ?? 4; // default 4GB

  // ─── Hardware concurrency ───
  const hardwareConcurrency = navigator.hardwareConcurrency ?? 4;

  // ─── Screen ───
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const orientation: CapabilityReport['orientation'] =
    screenWidth > screenHeight ? 'landscape' : 'portrait';

  // ─── Overall capability score ───
  let capability: CapabilityReport['capability'];
  const score =
    (webglVersion === '2' ? 3 : webglVersion === '1' ? 2 : 0) +
    (deviceMemory >= 8 ? 3 : deviceMemory >= 4 ? 2 : 1) +
    (hardwareConcurrency >= 8 ? 3 : hardwareConcurrency >= 4 ? 2 : 1);
  if (score >= 8) capability = 'high';
  else if (score >= 5) capability = 'medium';
  else capability = 'low';

  return {
    inputMethod,
    capability,
    motion,
    contrast,
    connection,
    webglVersion,
    deviceMemory,
    hardwareConcurrency,
    screenWidth,
    screenHeight,
    orientation,
    hasGamepad,
  };
}

/**
 * Apply the capability report to <html> as data-* attributes.
 * CSS reads these via attribute selectors to adjust the UI.
 *
 * Call this once on app boot (in +layout.svelte onMount).
 */
export function applyCapabilities(report: CapabilityReport = detectCapabilities()): CapabilityReport {
  if (typeof document === 'undefined') return report;

  const html = document.documentElement;
  html.setAttribute('data-input', report.inputMethod);
  html.setAttribute('data-capability', report.capability);
  html.setAttribute('data-motion', report.motion);
  html.setAttribute('data-contrast', report.contrast);
  html.setAttribute('data-connection', report.connection);
  html.setAttribute('data-orientation', report.orientation);

  return report;
}

/**
 * Listen for capability changes (orientation flip, gamepad connect/disconnect,
 * motion preference toggle) and re-apply.
 *
 * Returns an unsubscribe function.
 */
export function watchCapabilities(callback?: (report: CapabilityReport) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handlers: Array<[MediaQueryList, () => void]> = [];

  const reapply = () => {
    const report = applyCapabilities();
    callback?.(report);
  };

  // Watch media queries
  const mediaQueries = [
    '(pointer: coarse)',
    '(pointer: fine)',
    '(hover: none)',
    '(hover: hover)',
    '(prefers-reduced-motion: reduce)',
    '(prefers-contrast: more)',
    '(orientation: portrait)',
    '(orientation: landscape)',
  ];

  for (const query of mediaQueries) {
    const mql = window.matchMedia(query);
    const handler = () => reapply();
    mql.addEventListener('change', handler);
    handlers.push([mql, handler]);
  }

  // Watch gamepad connect/disconnect
  const gamepadHandler = () => reapply();
  window.addEventListener('gamepadconnected', gamepadHandler);
  window.addEventListener('gamepaddisconnected', gamepadHandler);

  // Watch screen orientation (for devices that don't fire media query changes)
  window.addEventListener('orientationchange', gamepadHandler);

  return () => {
    for (const [mql, handler] of handlers) {
      mql.removeEventListener('change', handler);
    }
    window.removeEventListener('gamepadconnected', gamepadHandler);
    window.removeEventListener('gamepaddisconnected', gamepadHandler);
    window.removeEventListener('orientationchange', gamepadHandler);
  };
}
