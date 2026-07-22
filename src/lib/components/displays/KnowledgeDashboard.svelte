<script lang="ts">
  /**
   * KnowledgeDashboard — curriculum knowledge state visualization.
   * Shows concept coverage, depth distribution, retention health,
   * and study recommendations based on the player's KnowledgeState.
   *
   * Veil-compliant: qualitative bands, no raw metrics exposed.
   */
  import type { KnowledgeState, ConceptState, DepthLevel } from '$core/curriculum/types.js';
  import { ALL_DEPTH_LEVELS, depthOrdinal } from '$core/curriculum/types.js';

  interface Props {
    knowledge: KnowledgeState | undefined;
    totalConceptsInCurriculum?: number;
  }

  let { knowledge, totalConceptsInCurriculum = 0 }: Props = $props();

  // Compute derived metrics
  const conceptCount = $derived(knowledge?.conceptStates.size ?? 0);
  const coverage = $derived(
    totalConceptsInCurriculum > 0
      ? Math.min(1, conceptCount / totalConceptsInCurriculum)
      : 0
  );

  // Depth distribution
  const depthDistribution = $derived.by(() => {
    if (!knowledge || knowledge.conceptStates.size === 0) {
      return ALL_DEPTH_LEVELS.map(level => ({ level, count: 0, percentage: 0 }));
    }
    const counts = new Map<DepthLevel, number>();
    for (const level of ALL_DEPTH_LEVELS) counts.set(level, 0);
    for (const cs of knowledge.conceptStates.values()) {
      counts.set(cs.depthLevel, (counts.get(cs.depthLevel) ?? 0) + 1);
    }
    const total = knowledge.conceptStates.size;
    return ALL_DEPTH_LEVELS.map(level => ({
      level,
      count: counts.get(level) ?? 0,
      percentage: total > 0 ? ((counts.get(level) ?? 0) / total) * 100 : 0,
    }));
  });

  // Average retention
  const avgRetention = $derived.by(() => {
    if (!knowledge || knowledge.conceptStates.size === 0) return 0;
    let total = 0;
    for (const cs of knowledge.conceptStates.values()) {
      total += cs.retention;
    }
    return total / knowledge.conceptStates.size;
  });

  // Concepts needing review (retention < 0.7)
  const needsReview = $derived.by(() => {
    if (!knowledge) return 0;
    let count = 0;
    for (const cs of knowledge.conceptStates.values()) {
      if (cs.retention < 0.7) count++;
    }
    return count;
  });

  // Concepts with misconceptions
  const hasMisconceptions = $derived.by(() => {
    if (!knowledge) return 0;
    let count = 0;
    for (const cs of knowledge.conceptStates.values()) {
      if (cs.misconceptionFlags.length > 0) count++;
    }
    return count;
  });

  // Study profile
  const profile = $derived(knowledge?.learningProfile);

  function retentionBand(value: number): { label: string; color: string } {
    if (value > 0.8) return { label: 'strong', color: 'var(--ccrpg-success)' };
    if (value > 0.5) return { label: 'developing', color: 'var(--ccrpg-warning)' };
    return { label: 'fading', color: 'var(--ccrpg-danger)' };
  }

  function coverageBand(value: number): { label: string; color: string } {
    if (value > 0.6) return { label: 'broad', color: 'var(--ccrpg-success)' };
    if (value > 0.3) return { label: 'growing', color: 'var(--ccrpg-warning)' };
    return { label: 'emerging', color: 'var(--ccrpg-accent)' };
  }

  const DEPTH_COLORS: Record<string, string> = {
    absent: 'var(--ccrpg-fg-muted)',
    memorized: 'var(--ccrpg-danger)',
    comprehended: 'var(--ccrpg-warning)',
    applied: 'var(--ccrpg-accent)',
    analyzed: 'var(--ccrpg-success)',
    evaluated: 'var(--ccrpg-success)',
    transformed: 'var(--ccrpg-accent)',
  };
</script>

<div class="knowledge-dashboard">
  {#if !knowledge || knowledge.conceptStates.size === 0}
    <div class="empty-state">
      <p class="empty-title">No curriculum data yet</p>
      <p class="empty-desc">Begin studying to build your knowledge profile.</p>
    </div>
  {:else}
    <!-- Coverage overview -->
    <div class="metric-row">
      <div class="metric">
        <span class="metric-label">Concepts</span>
        <span class="metric-value">{conceptCount}</span>
        {#if totalConceptsInCurriculum > 0}
          <span class="metric-sub">of {totalConceptsInCurriculum}</span>
        {/if}
      </div>
      <div class="metric">
        {@const cb = coverageBand(coverage)}
        <span class="metric-label">Coverage</span>
        <span class="metric-value" style="color: {cb.color}">{cb.label}</span>
      </div>
      <div class="metric">
        {@const rb = retentionBand(avgRetention)}
        <span class="metric-label">Retention</span>
        <span class="metric-value" style="color: {rb.color}">{rb.label}</span>
      </div>
    </div>

    <!-- Depth distribution -->
    <div class="section">
      <h3 class="section-title">Depth Distribution</h3>
      <div class="depth-bars">
        {#each depthDistribution as d (d.level)}
          {#if d.count > 0}
            <div class="depth-row">
              <span class="depth-label">{d.level}</span>
              <div class="depth-bar">
                <div
                  class="depth-bar-fill"
                  style="width: {d.percentage}%; background: {DEPTH_COLORS[d.level] ?? 'var(--ccrpg-accent)'}"
                ></div>
              </div>
              <span class="depth-count">{d.count}</span>
            </div>
          {/if}
        {/each}
      </div>
    </div>

    <!-- Alerts -->
    {#if needsReview > 0 || hasMisconceptions > 0}
      <div class="section alerts">
        {#if needsReview > 0}
          <div class="alert alert-review">
            <span class="alert-icon">↻</span>
            <span>{needsReview} concept{needsReview !== 1 ? 's' : ''} need review</span>
          </div>
        {/if}
        {#if hasMisconceptions > 0}
          <div class="alert alert-misconception">
            <span class="alert-icon">⚠</span>
            <span>{hasMisconceptions} misconception{hasMisconceptions !== 1 ? 's' : ''} flagged</span>
          </div>
        {/if}
      </div>
    {/if}

    <!-- Learning profile -->
    {#if profile && profile.preferredModalities.length > 0}
      <div class="section">
        <h3 class="section-title">Study Profile</h3>
        <div class="profile-tags">
          {#each profile.preferredModalities as mod (mod)}
            <span class="profile-tag">{mod}</span>
          {/each}
        </div>
      </div>
    {/if}
  {/if}
</div>

<style>
  .knowledge-dashboard {
    display: flex;
    flex-direction: column;
    gap: var(--ccrpg-space-4);
  }

  .empty-state {
    text-align: center;
    padding: var(--ccrpg-space-5) var(--ccrpg-space-4);
  }

  .empty-title {
    font-family: var(--ccrpg-font-display);
    font-size: var(--ccrpg-text-sm);
    font-weight: 600;
    color: var(--ccrpg-fg-muted);
    margin: 0 0 var(--ccrpg-space-1);
  }

  .empty-desc {
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-xs);
    color: var(--ccrpg-fg-muted);
    font-style: italic;
    margin: 0;
  }

  .metric-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--ccrpg-space-3);
  }

  .metric {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--ccrpg-space-1);
  }

  .metric-label {
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-xs);
    color: var(--ccrpg-fg-muted);
    text-transform: uppercase;
    letter-spacing: var(--ccrpg-tracking-wide);
  }

  .metric-value {
    font-family: var(--ccrpg-font-display);
    font-size: var(--ccrpg-text-lg);
    font-weight: 700;
    color: var(--ccrpg-fg);
  }

  .metric-sub {
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-xs);
    color: var(--ccrpg-fg-muted);
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: var(--ccrpg-space-2);
  }

  .section-title {
    font-family: var(--ccrpg-font-display);
    font-size: var(--ccrpg-text-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: var(--ccrpg-tracking-wider);
    color: var(--ccrpg-accent);
    margin: 0;
  }

  .depth-bars {
    display: flex;
    flex-direction: column;
    gap: var(--ccrpg-space-1);
  }

  .depth-row {
    display: grid;
    grid-template-columns: 7rem 1fr 2rem;
    align-items: center;
    gap: var(--ccrpg-space-2);
  }

  .depth-label {
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-xs);
    color: var(--ccrpg-fg-muted);
    text-transform: capitalize;
  }

  .depth-bar {
    height: 6px;
    background: var(--ccrpg-surface);
    border-radius: var(--ccrpg-radius-full);
    overflow: hidden;
  }

  .depth-bar-fill {
    height: 100%;
    border-radius: var(--ccrpg-radius-full);
    transition: width var(--ccrpg-duration-slow) var(--ccrpg-ease-out);
  }

  .depth-count {
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-xs);
    color: var(--ccrpg-fg-muted);
    text-align: right;
  }

  .alerts {
    display: flex;
    flex-direction: column;
    gap: var(--ccrpg-space-2);
  }

  .alert {
    display: flex;
    align-items: center;
    gap: var(--ccrpg-space-2);
    padding: var(--ccrpg-space-2) var(--ccrpg-space-3);
    border-radius: var(--ccrpg-radius-md);
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-xs);
  }

  .alert-review {
    background: color-mix(in srgb, var(--ccrpg-warning) 15%, transparent);
    color: var(--ccrpg-warning);
    border: 1px solid color-mix(in srgb, var(--ccrpg-warning) 30%, transparent);
  }

  .alert-misconception {
    background: color-mix(in srgb, var(--ccrpg-danger) 15%, transparent);
    color: var(--ccrpg-danger);
    border: 1px solid color-mix(in srgb, var(--ccrpg-danger) 30%, transparent);
  }

  .alert-icon {
    font-size: var(--ccrpg-text-sm);
  }

  .profile-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--ccrpg-space-1);
  }

  .profile-tag {
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-xs);
    padding: var(--ccrpg-space-1) var(--ccrpg-space-2);
    border-radius: var(--ccrpg-radius-full);
    background: color-mix(in srgb, var(--ccrpg-accent) 15%, transparent);
    color: var(--ccrpg-accent);
    border: 1px solid color-mix(in srgb, var(--ccrpg-accent) 30%, transparent);
  }
</style>
