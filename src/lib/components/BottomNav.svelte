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
    height: var(--ccrpg-nav-height);
    background: var(--ccrpg-surface);
    border-top: 1px solid var(--ccrpg-border);
    display: flex;
    align-items: stretch;
    justify-content: space-around;
    z-index: var(--ccrpg-z-hud);
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }

  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    color: var(--ccrpg-fg-muted);
    text-decoration: none;
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-xs);
    transition: color var(--ccrpg-duration-fast) var(--ccrpg-ease),
                transform var(--ccrpg-duration-instant) var(--ccrpg-ease);
    -webkit-tap-highlight-color: transparent;
  }

  .nav-item:active {
    transform: scale(0.95);
  }

  .nav-item.active {
    color: var(--ccrpg-accent);
  }

  .nav-item:focus-visible {
    outline: 2px solid var(--ccrpg-accent);
    outline-offset: -2px;
  }

  .nav-label {
    letter-spacing: var(--ccrpg-tracking-wide);
  }

  /* Desktop: hide bottom nav, show sidebar instead */
  @media (min-width: 1024px) {
    .bottom-nav {
      display: none;
    }
  }
</style>
