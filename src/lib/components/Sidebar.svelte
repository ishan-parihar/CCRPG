<script lang="ts">
  /**
   * Sidebar — desktop left-rail navigation. Hidden on mobile (<1024px).
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
      { href: '/profiles', label: 'Profiles', icon: 'user' },
      { href: '/journal', label: 'Journal', icon: 'book' },
      { href: '/codex', label: 'Codex', icon: 'book' },
      { href: '/settings', label: 'Settings', icon: 'settings' },
      { href: '/setup', label: 'Setup', icon: 'settings' },
      { href: '/recover', label: 'Recover', icon: 'recover' },
      { href: '/glossary', label: 'Glossary', icon: 'info' },
    ] as const,
  }: Props = $props();

  function isActive(href: string): boolean {
    return page.url.pathname === href;
  }
</script>

<aside class="sidebar" aria-label="Primary">
  <div class="sidebar-brand">
    <span class="brand-mark">CCRPG</span>
  </div>
  <nav class="sidebar-nav">
    {#each items as item (item.href)}
      <a
        class="nav-item"
        class:active={isActive(item.href)}
        href={item.href}
        aria-current={isActive(item.href) ? 'page' : undefined}
      >
        <Icon name={item.icon} size={20} />
        <span class="nav-label">{item.label}</span>
      </a>
    {/each}
  </nav>
</aside>

<style>
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 240px;
    background: var(--ccrpg-surface);
    border-right: 1px solid var(--ccrpg-border);
    display: flex;
    flex-direction: column;
    padding: var(--ccrpg-space-5) var(--ccrpg-space-3);
    z-index: var(--ccrpg-z-hud);
  }

  .sidebar-brand {
    padding: 0 var(--ccrpg-space-3) var(--ccrpg-space-5);
    border-bottom: 1px solid var(--ccrpg-border);
    margin-bottom: var(--ccrpg-space-4);
  }

  .brand-mark {
    font-family: var(--ccrpg-font-display);
    font-size: var(--ccrpg-text-lg);
    font-weight: 700;
    color: var(--ccrpg-fg);
    letter-spacing: var(--ccrpg-tracking-wider);
  }

  .sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: var(--ccrpg-space-1);
    flex: 1;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: var(--ccrpg-space-3);
    padding: var(--ccrpg-space-3);
    color: var(--ccrpg-fg-muted);
    text-decoration: none;
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-sm);
    font-weight: 500;
    border-radius: var(--ccrpg-radius);
    transition: background var(--ccrpg-duration-fast) var(--ccrpg-ease),
                color var(--ccrpg-duration-fast) var(--ccrpg-ease);
    -webkit-tap-highlight-color: transparent;
  }

  .nav-item:hover {
    background: var(--ccrpg-surface-elevated);
    color: var(--ccrpg-fg);
  }

  .nav-item.active {
    background: var(--ccrpg-accent-soft);
    color: var(--ccrpg-accent-fg);
  }

  .nav-item:focus-visible {
    outline: 2px solid var(--ccrpg-accent);
    outline-offset: 2px;
  }

  /* Mobile: hide sidebar, show bottom nav instead */
  @media (max-width: 1023px) {
    .sidebar {
      display: none;
    }
  }
</style>
