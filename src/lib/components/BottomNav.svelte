<script lang="ts">
  /**
   * BottomNav — mobile bottom-tab navigation. Hidden on desktop (≥1024px).
   * Shows aria-current="page" on the active route.
   */
  import { page } from '$app/state';
  import Icon, { type IconName } from './Icon.svelte';

  interface NavItem {
    href: string;
    label: string;
    icon: IconName;
  }

  interface Props {
    items?: readonly NavItem[];
  }

  let {
    items = [
      { href: '/play', label: 'Continue', icon: 'play' },
      { href: '/profile', label: 'Profile', icon: 'user' },
      { href: '/journal', label: 'Journal', icon: 'book' },
      { href: '/settings', label: 'Settings', icon: 'settings' },
    ] as const,
  }: Props = $props();

  function isActive(href: string): boolean {
    return page.url.pathname === href;
  }
</script>

<nav class="bottom-nav" aria-label="Primary">
  {#each items as item (item.href)}
    <a
      class="nav-item"
      class:active={isActive(item.href)}
      href={item.href}
      aria-current={isActive(item.href) ? 'page' : undefined}
    >
      <Icon name={item.icon} size={22} />
      <span class="nav-label">{item.label}</span>
    </a>
  {/each}
</nav>

<style>
  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: var(--mysterium-nav-height);
    background: var(--mysterium-surface);
    border-top: 1px solid var(--mysterium-border);
    display: flex;
    align-items: stretch;
    justify-content: space-around;
    z-index: var(--mysterium-z-hud);
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }

  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    color: var(--mysterium-fg-muted);
    text-decoration: none;
    font-family: var(--mysterium-font-body);
    font-size: var(--mysterium-text-xs);
    transition: color var(--mysterium-duration-fast) var(--mysterium-ease),
                transform var(--mysterium-duration-instant) var(--mysterium-ease);
    -webkit-tap-highlight-color: transparent;
  }

  .nav-item:active {
    transform: scale(0.95);
  }

  .nav-item.active {
    color: var(--mysterium-accent);
  }

  .nav-item:focus-visible {
    outline: 2px solid var(--mysterium-accent);
    outline-offset: -2px;
  }

  .nav-label {
    letter-spacing: var(--mysterium-tracking-wide);
  }

  /* Desktop: hide bottom nav, show sidebar instead */
  @media (min-width: 1024px) {
    .bottom-nav {
      display: none;
    }
  }
</style>
