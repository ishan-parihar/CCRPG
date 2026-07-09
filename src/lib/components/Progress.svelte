<script lang="ts">
  /**
   * Progress — determinate progress bar. For Phaser preload progress, encounter progress, etc.
   */
  interface Props {
    value: number; // 0..max
    max?: number;
    label?: string;
    class?: string;
  }

  let { value, max = 100, label, class: className = '' }: Props = $props();

  const percent = $derived(Math.max(0, Math.min(100, (value / max) * 100)));
</script>

<div class="progress {className}" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label}>
  <div class="progress-bar" style="width: {percent}%"></div>
</div>

<style>
  .progress {
    width: 100%;
    height: 6px;
    background: var(--ccrpg-surface);
    border: 1px solid var(--ccrpg-border);
    border-radius: var(--ccrpg-radius-full);
    overflow: hidden;
  }

  .progress-bar {
    height: 100%;
    background: var(--ccrpg-accent);
    border-radius: var(--ccrpg-radius-full);
    transition: width var(--ccrpg-duration-base) var(--ccrpg-ease-out);
  }
</style>
