<script lang="ts">
  /**
   * KnowledgeDashboard — curriculum knowledge state visualization.
   * Shows concept coverage, depth distribution, retention health,
   * study recommendations, and learning analytics based on the player's KnowledgeState.
   *
   * Veil-compliant: qualitative bands, no raw metrics exposed.
   */
  import type { KnowledgeState, ConceptState, DepthLevel } from '$core/curriculum/types.js';
  import { ALL_DEPTH_LEVELS, depthOrdinal } from '$core/curriculum/types.js';
  import { computeLearningAnalytics } from '$core/curriculum/LearningAnalytics.js';
  import type { LearningAnalyticsReport } from '$core/curriculum/LearningAnalytics.js';

  interface Props {
    knowledge: KnowledgeState | undefined;
    totalConceptsInCurriculum?: number;
  }

  let { knowledge, totalConceptsInCurriculum = 0 }: Props = $props();

  // Compute learning analytics report
  const analytics = $derived(
    knowledge && knowledge.conceptStates.size > 0 && knowledge.studyHistory.length > 0
      ? computeLearningAnalytics(knowledge)
      : null
  );

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

  const coverageBandResult = $derived(coverageBand(coverage));
  const retentionBandResult = $derived(retentionBand(avgRetention));

  // Forgetting curve derived metrics (moved from @const to $derived)
  const forgettingCurves = $derived(knowledge?.forgettingCurves ? [...knowledge.forgettingCurves.values()] : []);
  const avgHalfLife = $derived(forgettingCurves.length > 0 ? forgettingCurves.reduce((s, c) => s + c.halfLifeMs, 0) / forgettingCurves.length : 0);
  const strongCount = $derived(forgettingCurves.filter(c => c.retention > 0.7).length);
  const fadingCount = $derived(forgettingCurves.filter(c => c.retention <= 0.5).length);

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

  function velocityLabel(rate: number): string {
    if (rate > 2) return 'rapid';
    if (rate > 0.5) return 'steady';
    return 'emerging';
  }

  function modalityLabel(eff: number): string {
    if (eff > 0.7) return 'highly effective';
    if (eff > 0.4) return 'moderately effective';
    return 'developing';
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
            <span class="metric-label">Coverage</span>
            <span class="metric-value" style="color: {coverageBandResult.color}">{coverageBandResult.label}</span>
          </div>
          <div class="metric">
            <span class="metric-label">Retention</span>
            <span class="metric-value" style="color: {retentionBandResult.color}">{retentionBandResult.label}</span>
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

    <!-- Learning Analytics -->
    {#if analytics && analytics.confidence > 0.1}
      <div class="section">
        <h3 class="section-title">Learning Analytics</h3>
        <div class="analytics-grid">
          <!-- Velocity -->
          {#if analytics.velocity.overallRate > 0}
            <div class="analytics-card">
              <span class="analytics-label">Learning Velocity</span>
              <span class="analytics-value">{velocityLabel(analytics.velocity.conceptsPerSession)}</span>
              <span class="analytics-sub">{analytics.velocity.conceptsPerSession.toFixed(1)} concepts/session</span>
            </div>
          {/if}

          <!-- Best Modality -->
          {#if analytics.modalityEffectiveness.length > 0}
            <div class="analytics-card">
              <span class="analytics-label">Best Modality</span>
              <span class="analytics-value">{analytics.modalityEffectiveness[0]?.modality ?? '—'}</span>
              <span class="analytics-sub">{modalityLabel(analytics.modalityEffectiveness[0]?.effectiveness ?? 0)}</span>
            </div>
          {/if}

          <!-- Review Urgency -->
          {#if analytics.reviewIntervals.length > 0}
            <div class="analytics-card">
              <span class="analytics-label">Needs Review</span>
              <span class="analytics-value">{analytics.reviewIntervals.length}</span>
              <span class="analytics-sub">concept{analytics.reviewIntervals.length !== 1 ? 's' : ''} overdue</span>
            </div>
          {/if}
        </div>

        <!-- Modality Effectiveness Chart -->
        {#if analytics.modalityEffectiveness.length > 0}
          <div class="modality-chart">
            <h4 class="sub-title">Modality Effectiveness</h4>
            {#each analytics.modalityEffectiveness as me (me.modality)}
              <div class="modality-row">
                <span class="modality-name">{me.modality}</span>
                <div class="modality-bar">
                  <div
                    class="modality-bar-fill"
                    style="width: {me.effectiveness * 100}%; background: {me.effectiveness > 0.7 ? 'var(--ccrpg-success)' : me.effectiveness > 0.4 ? 'var(--ccrpg-warning)' : 'var(--ccrpg-danger)'}"
                  ></div>
                </div>
                <span class="modality-stat">{me.eventCount} sessions</span>
              </div>
            {/each}
          </div>
        {/if}

        <!-- Top review candidates -->
        {#if analytics.reviewIntervals.length > 0}
          <div class="review-list">
            {#each analytics.reviewIntervals.slice(0, 3) as ri (ri.conceptId)}
              <div class="review-item">
                <span class="review-concept">{ri.conceptId.split('.').pop()}</span>
                <span class="review-days" style="color: {ri.recommendedDays < 2 ? 'var(--ccrpg-danger)' : 'var(--ccrpg-warning)'}">
                  review in {Math.round(ri.recommendedDays)}d
                </span>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}

    <!-- Forgetting Curve Summary -->
    {#if knowledge?.forgettingCurves && knowledge.forgettingCurves.size > 0}
      <div class="section">
        <h3 class="section-title">Retention Curves</h3>
        <div class="curve-summary">
          <div class="curve-metrics">
            <div class="curve-metric">
              <span class="curve-metric-value">{forgettingCurves.length}</span>
              <span class="curve-metric-label">tracked concepts</span>
            </div>
            <div class="curve-metric">
              <span class="curve-metric-value" style="color: var(--ccrpg-success)">{strongCount}</span>
              <span class="curve-metric-label">strong retention</span>
            </div>
            <div class="curve-metric">
              <span class="curve-metric-value" style="color: {fadingCount > 0 ? 'var(--ccrpg-danger)' : 'var(--ccrpg-fg-muted)'}">{fadingCount}</span>
              <span class="curve-metric-label">fading</span>
            </div>
            <div class="curve-metric">
              <span class="curve-metric-value">{Math.round(avgHalfLife / 86400000)}d</span>
              <span class="curve-metric-label">avg half-life</span>
            </div>
          </div>
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

  /* Analytics */
  .analytics-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--ccrpg-space-2);
  }

  .analytics-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--ccrpg-space-1);
    padding: var(--ccrpg-space-3) var(--ccrpg-space-2);
    border-radius: var(--ccrpg-radius-md);
    background: color-mix(in srgb, var(--ccrpg-surface) 50%, transparent);
    border: 1px solid color-mix(in srgb, var(--ccrpg-fg-muted) 10%, transparent);
  }

  .analytics-label {
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-xs);
    color: var(--ccrpg-fg-muted);
    text-transform: uppercase;
    letter-spacing: var(--ccrpg-tracking-wide);
  }

  .analytics-value {
    font-family: var(--ccrpg-font-display);
    font-size: var(--ccrpg-text-sm);
    font-weight: 700;
    color: var(--ccrpg-fg);
    text-transform: capitalize;
  }

  .analytics-sub {
    font-family: var(--ccrpg-font-body);
    font-size: 0.65rem;
    color: var(--ccrpg-fg-muted);
  }

  .review-list {
    display: flex;
    flex-direction: column;
    gap: var(--ccrpg-space-1);
    margin-top: var(--ccrpg-space-2);
  }

  .review-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--ccrpg-space-1) var(--ccrpg-space-2);
    border-radius: var(--ccrpg-radius-sm);
    background: color-mix(in srgb, var(--ccrpg-warning) 8%, transparent);
  }

  .review-concept {
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-xs);
    color: var(--ccrpg-fg);
    text-transform: capitalize;
  }

    .review-days {
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-xs);
    font-weight: 500;
  }

  /* Modality Effectiveness Chart */
  .modality-chart {
    display: flex;
    flex-direction: column;
    gap: var(--ccrpg-space-1);
    margin-top: var(--ccrpg-space-2);
  }

  .sub-title {
    font-family: var(--ccrpg-font-display);
    font-size: 0.65rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: var(--ccrpg-tracking-wider);
    color: var(--ccrpg-fg-muted);
    margin: 0 0 var(--ccrpg-space-1);
  }

  .modality-row {
    display: grid;
    grid-template-columns: 8rem 1fr 5rem;
    align-items: center;
    gap: var(--ccrpg-space-2);
  }

  .modality-name {
    font-family: var(--ccrpg-font-body);
    font-size: var(--ccrpg-text-xs);
    color: var(--ccrpg-fg-muted);
    text-transform: capitalize;
  }

  .modality-bar {
    height: 6px;
    background: var(--ccrpg-surface);
    border-radius: var(--ccrpg-radius-full);
    overflow: hidden;
  }

  .modality-bar-fill {
    height: 100%;
    border-radius: var(--ccrpg-radius-full);
    transition: width var(--ccrpg-duration-slow) var(--ccrpg-ease-out);
  }

  .modality-stat {
    font-family: var(--ccrpg-font-body);
    font-size: 0.65rem;
    color: var(--ccrpg-fg-muted);
    text-align: right;
  }

  /* Forgetting Curve Summary */
  .curve-summary {
    display: flex;
    flex-direction: column;
    gap: var(--ccrpg-space-2);
  }

  .curve-metrics {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--ccrpg-space-2);
  }

  .curve-metric {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--ccrpg-space-1);
    padding: var(--ccrpg-space-2);
    border-radius: var(--ccrpg-radius-md);
    background: color-mix(in srgb, var(--ccrpg-surface) 50%, transparent);
    border: 1px solid color-mix(in srgb, var(--ccrpg-fg-muted) 10%, transparent);
  }

  .curve-metric-value {
    font-family: var(--ccrpg-font-display);
    font-size: var(--ccrpg-text-sm);
    font-weight: 700;
    color: var(--ccrpg-fg);
  }

  .curve-metric-label {
    font-family: var(--ccrpg-font-body);
    font-size: 0.6rem;
    color: var(--ccrpg-fg-muted);
    text-align: center;
    text-transform: uppercase;
    letter-spacing: var(--ccrpg-tracking-wide);
  }
</style>
