<script lang="ts" module>
  /**
   * Icon — SVG icon component. Renders icons by name from a built-in set.
   * All icons are 24×24 viewBox, stroke=currentColor, stroke-width=2.
   * Based on Lucide (MIT-licensed) paths.
   */
  export type IconName =
    | 'arrow-left' | 'arrow-right' | 'arrow-up' | 'arrow-down'
    | 'play' | 'settings' | 'book' | 'user' | 'recover' | 'home'
    | 'check' | 'x' | 'chevron-down' | 'chevron-right'
    | 'menu' | 'close' | 'info' | 'warning' | 'error';

  export const ICON_PATHS: Record<IconName, string> = {
    'arrow-left': 'm12 19-7-7 7-7 M19 12H5',
    'arrow-right': 'm12 5 7 7-7 7 M5 12h14',
    'arrow-up': 'm5 12 7-7 7 7 M12 19V5',
    'arrow-down': 'M19 12l-7 7-7-7 M12 5v14',
    'play': 'polygon points="6 3 20 12 6 21 6 3"',
    'settings': '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    'book': 'path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"',
    'user': 'path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"',
    'recover': 'path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8 M3 3v5h5"',
    'home': 'path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10"',
    'check': 'polyline points="20 6 9 17 4 12"',
    'x': 'path d="M18 6 6 18 M6 6l12 12"',
    'chevron-down': 'polyline points="6 9 12 15 18 9"',
    'chevron-right': 'polyline points="9 18 15 12 9 6"',
    'menu': 'line x1="4" x2="20" y1="12" y2="12 M4 6h16 M4 18h16"',
    'close': 'path d="M18 6 6 18 M6 6l12 12"',
    'info': 'circle cx="12" cy="12" r="10 M12 16v-4 M12 8h.01"',
    'warning': 'path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z M12 9v4 M12 17h.01"',
    'error': 'circle cx="12" cy="12" r="10 M12 8v4 M12 16h.01"',
  };
</script>

<script lang="ts">
  interface Props {
    name: IconName;
    size?: number;
    class?: string;
    ariaLabel?: string;
  }

  let { name, size = 20, class: className = '', ariaLabel }: Props = $props();

  const path = $derived(ICON_PATHS[name] ?? '');
  const isDecorative = $derived(ariaLabel === undefined);
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  class={className}
  role={isDecorative ? 'presentation' : 'img'}
  aria-label={ariaLabel}
  aria-hidden={isDecorative}
>
  {@html path}
</svg>
