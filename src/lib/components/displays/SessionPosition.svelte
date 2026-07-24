<script lang="ts">
  /**
   * SessionPosition — shows where the player is in the session arc.
   * Parity with CLI renderSessionPosition. Veil-compliant.
   */
  interface Props {
    position: 'warmup' | 'peak' | 'cooldown';
    progress: number; // 0-1
  }

  let { position, progress }: Props = $props();

  const POSITION_LABEL: Record<string, string> = {
    warmup: 'Warming up',
    peak: 'In the peak',
    cooldown: 'Cooling down',
  };

  const POSITION_COLOR: Record<string, string> = {
    warmup: 'var(--mysterium-info)',
    peak: 'var(--mysterium-accent)',
    cooldown: 'var(--mysterium-success)',
  };
</script>

<div class="session-position">
  <div class="position-bar" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Session progress">
    <div class="position-marker" style="left: {progress * 100}%; background: {POSITION_COLOR[position]}"></div>
    <div class="position-zone warmup" class:active={position === 'warmup'}></div>
    <div class="position-zone peak" class:active={position === 'peak'}></div>
    <div class="position-zone cooldown" class:active={position === 'cooldown'}></div>
  </div>
  <span class="position-label" style="color: {POSITION_COLOR[position]}">{POSITION_LABEL[position]}</span>
</div>

<style>
  .session-position {
    display: flex;
    flex-direction: column;
    gap: var(--mysterium-space-2);
  }

  .position-bar {
    position: relative;
    width: 100%;
    height: 6px;
    background: var(--mysterium-surface);
    border-radius: var(--mysterium-radius-full);
    overflow: hidden;
    display: flex;
  }

  .position-zone {
    flex: 1;
    opacity: 0.3;
    transition: opacity var(--mysterium-duration-fast) var(--mysterium-ease);
  }

  .position-zone.warmup { background: var(--mysterium-info); }
  .position-zone.peak { background: var(--mysterium-accent); }
  .position-zone.cooldown { background: var(--mysterium-success); }

  .position-zone.active {
    opacity: 0.6;
  }

  .position-marker {
    position: absolute;
    top: -2px;
    width: 4px;
    height: 10px;
    border-radius: 2px;
    transition: left var(--mysterium-duration-base) var(--mysterium-ease-out);
    z-index: 1;
  }

  .position-label {
    font-family: var(--mysterium-font-body);
    font-size: var(--mysterium-text-sm);
    font-style: italic;
    text-align: center;
  }
</style>
