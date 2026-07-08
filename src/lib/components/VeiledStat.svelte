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
   *
   * The `label` prop is optional and rendered as a small caption above
   * the descriptor. It must itself be Veil-compliant (no raw terms).
   */

  type Props = {
    /** The qualitative descriptor string (from veilDescriptors.ts). */
    descriptor: string;
    /** Optional caption label (must be Veil-compliant — no raw terms). */
    label?: string;
    /** Optional variant for styling. */
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
    gap: 0.25rem;
  }

  .veiled-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--ccrpg-fg-muted, #8899aa);
    font-family: var(--ccrpg-font-body, system-ui);
  }

  .veiled-descriptor {
    font-size: 1rem;
    color: var(--ccrpg-fg, #e7eaf2);
    font-family: var(--ccrpg-font-body, system-ui);
    line-height: 1.5;
  }

  .veiled-stat[data-variant="muted"] .veiled-descriptor {
    color: var(--ccrpg-fg-muted, #8899aa);
    font-size: 0.875rem;
  }

  .veiled-stat[data-variant="accent"] .veiled-descriptor {
    color: var(--ccrpg-accent, #b8252a);
    font-weight: 500;
  }
</style>
