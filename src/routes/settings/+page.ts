// /settings route — client-only.
//
// The settings page imports accessibilityStore which reads localStorage
// at module load. SSR would run this on the server where localStorage
// is undefined. Disable SSR to keep settings client-only.
// (The isBrowser guard in accessibilityStore prevents crashes, but
// disabling SSR avoids the flash-of-default-settings on hydration.)

export const ssr = false;
export const prerender = false;
