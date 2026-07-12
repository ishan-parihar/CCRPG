<script lang="ts">
  /**
   * Toggle — accessible switch component.
   * Replaces 3 hand-rolled toggles in /settings.
   */
  interface Props {
    checked: boolean;
    onchange: (checked: boolean) => void;
    ariaLabel: string;
    disabled?: boolean;
    id?: string;
  }

  let { checked, onchange, ariaLabel, disabled = false, id }: Props = $props();

  function handleClick() {
    if (disabled) return;
    onchange(!checked);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleClick();
    }
  }
</script>

<button
  class="toggle"
  role="switch"
  aria-checked={checked}
  aria-label={ariaLabel}
  {disabled}
  {id}
  onclick={handleClick}
  onkeydown={handleKeydown}
>
  <span class="toggle-thumb" class:checked></span>
</button>

<style>
  .toggle {
    position: relative;
    width: 44px;
    height: 24px;
    background: var(--ccrpg-surface);
    border: 1px solid var(--ccrpg-border);
    border-radius: var(--ccrpg-radius-full);
    cursor: pointer;
    padding: 0;
    flex-shrink: 0;
    transition: background var(--ccrpg-duration-fast) var(--ccrpg-ease),
                border-color var(--ccrpg-duration-fast) var(--ccrpg-ease);
    -webkit-tap-highlight-color: transparent;
  }

  .toggle:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .toggle:focus-visible {
    outline: 2px solid var(--ccrpg-accent);
    outline-offset: 2px;
  }

  .toggle-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 18px;
    height: 18px;
    background: var(--ccrpg-fg-muted);
    border-radius: 50%;
    transition: transform var(--ccrpg-duration-base) var(--ccrpg-ease),
                background var(--ccrpg-duration-fast) var(--ccrpg-ease);
  }

  .toggle-thumb.checked {
    transform: translateX(20px);
    background: var(--ccrpg-accent);
  }
</style>
