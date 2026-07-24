<script lang="ts">
  /**
   * <VeiledStat> — renders a qualitative descriptor for a raw game value.
   *
   * CRITICAL CANON COMPLIANCE: This component NEVER renders raw numbers,
   * stage labels, drive percentages, or any Veil-violating data. It takes
   * a descriptor function from core/presentation/veilDescriptors.ts and
   * renders only the qualitative string.
   *
   * Usage:
   *   <VeiledStat descriptor={describeStage(sig.currentStage)} label="World" />
   *   <VeiledStat descriptor={describeEncounterCount(sig.totalEncounters)} />
   */

  type Props = {
    descriptor: string;
    label?: string;
    variant?: 'default' | 'muted' | 'accent';
  };

  let { descriptor, label, variant = 'default' }: Props = $props();
</script>

<div class="veiled-stat" data-variant={variant}>
  {#if label}
    <span class="veiled-label">{label}</span>
  {/if}
  <span class="veiled-descriptor">{descriptor}</span>
</div>

<style>
  .veiled-stat {
    display: flex;
    flex-direction: column;
    gap: var(--mysterium-space-1);
  }

  .veiled-label {
    font-family: var(--mysterium-font-body);
    font-size: var(--mysterium-text-xs);
    text-transform: uppercase;
    letter-spacing: var(--mysterium-tracking-wider);
    color: var(--mysterium-fg-muted);
  }

  .veiled-descriptor {
    font-family: var(--mysterium-font-body);
    font-size: var(--mysterium-text-base);
    color: var(--mysterium-fg);
    line-height: var(--mysterium-leading-normal);
  }

  .veiled-stat[data-variant="muted"] .veiled-descriptor {
    color: var(--mysterium-fg-muted);
    font-size: var(--mysterium-text-sm);
  }

  .veiled-stat[data-variant="accent"] .veiled-descriptor {
    color: var(--mysterium-accent);
    font-weight: 500;
  }
</style>
