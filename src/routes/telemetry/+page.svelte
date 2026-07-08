<script lang="ts">
  /**
   * /telemetry route — transparency page.
   *
   * Audit fix I4: The plan §8.2 says "Build a /telemetry route showing
   * every event type with a sample payload — transparent by design."
   *
   * This route lists every telemetry event the game collects, with a
   * sample payload for each. Players can see exactly what data leaves
   * their device. Opt-out is one tap away (links to /settings).
   */

  import { goto } from '$app/navigation';
  import BackButton from '$lib/components/BackButton.svelte';
  import Seo from '$lib/components/Seo.svelte';
  import { stageFade } from '$lib/transitions/stageMotion.js';
  import { accessibilityStore } from '$lib/stores/accessibilityStore.js';

  const settings = $derived($accessibilityStore);

  // Every telemetry event type the game emits (from core/events/GameEvents.ts)
  const eventTypes = [
    {
      name: 'encounter_completed',
      description: 'Sent when you finish an encounter. Includes the consequence record (what changed in your profile).',
      sample: {
        type: 'encounter_completed',
        timestamp: 1720000000000,
        payload: { record: { encounterId: 'enc-abc123', line: 'cognitive', stage: 'red' } },
      },
    },
    {
      name: 'shadow_surfaced',
      description: 'Sent when a shadow pattern is detected during play. Includes the shadow ID, line, and quadrant.',
      sample: {
        type: 'shadow_surfaced',
        timestamp: 1720000000000,
        payload: { shadowId: 'shadow-def456', line: 'emotional', quadrant: 'UL' },
      },
    },
    {
      name: 'shadow_resolved',
      description: 'Sent when a previously-surfaced shadow is integrated. Includes the shadow ID.',
      sample: {
        type: 'shadow_resolved',
        timestamp: 1720000000000,
        payload: { shadowId: 'shadow-def456' },
      },
    },
    {
      name: 'transformation_triggered',
      description: 'Sent when a stage transformation is detected. Includes the transformation signal.',
      sample: {
        type: 'transformation_triggered',
        timestamp: 1720000000000,
        payload: { signal: { from: 'red', to: 'amber', line: 'cognitive' } },
      },
    },
    {
      name: 'session_started',
      description: 'Sent when a play session begins. Includes only the start timestamp.',
      sample: {
        type: 'session_started',
        timestamp: 1720000000000,
        payload: { timestamp: 1720000000000 },
      },
    },
    {
      name: 'session_ended',
      description: 'Sent when a play session ends. Includes the end timestamp and encounter count.',
      sample: {
        type: 'session_ended',
        timestamp: 1720000000000,
        payload: { timestamp: 1720000000000, encounterCount: 3 },
      },
    },
    {
      name: 'encounter_declined',
      description: 'Sent when you choose to skip an offered encounter. Includes the encounter ID and module reference.',
      sample: {
        type: 'encounter_declined',
        timestamp: 1720000000000,
        payload: { encounterId: 'enc-abc123', moduleRef: 'cognitive/red', line: 'cognitive', stage: 'red' },
      },
    },
  ];

  function backToMenu() {
    goto('/');
  }

  function goToSettings() {
    goto('/settings');
  }
</script>

<Seo
  title="Telemetry"
  description="Transparency: view every telemetry event CCRPG collects, with sample payloads. Opt in or out at any time."
/>

<div class="telemetry-route" in:stageFade>
  <header class="telemetry-header">
    <BackButton onclick={backToMenu} label="Back" />
    <h1>Telemetry</h1>
  </header>

  <main class="telemetry-content">
    <section class="status-section">
      <div class="status-row">
        <div class="status-label">
          <span class="status-name">Telemetry is currently</span>
          <span class="status-desc">
            {#if settings.telemetryOptIn}
              <strong class="status-on">ON</strong> — events are sent to the server
            {:else}
              <strong class="status-off">OFF</strong> — no events leave your device
            {/if}
          </span>
        </div>
        <button class="settings-link" onclick={goToSettings}>
          {settings.telemetryOptIn ? 'Disable' : 'Enable'} in Settings
        </button>
      </div>
    </section>

    <section class="intro-section">
      <p>
        CCRPG collects anonymous telemetry to understand how the game is used
        and to improve the developmental assessment engine. We are transparent
        about every event we send. Below is the complete list.
      </p>
      <p>
        <strong>What we never collect:</strong> your Significator contents,
        encounter responses, journal entries, or any personally identifiable
        information. Telemetry events contain only event types, timestamps,
        and structural metadata (which line, which stage, which shadow ID).
      </p>
    </section>

    <section class="events-section">
      <h2>Event Types ({eventTypes.length})</h2>
      <div class="event-list">
        {#each eventTypes as evt}
          <article class="event-card">
            <h3 class="event-name">{evt.name}</h3>
            <p class="event-desc">{evt.description}</p>
            <details class="event-payload">
              <summary>Sample payload</summary>
              <pre><code>{JSON.stringify(evt.sample, null, 2)}</code></pre>
            </details>
          </article>
        {/each}
      </div>
    </section>
  </main>
</div>

<style>
  .telemetry-route {
    min-height: 100vh;
    background: var(--ccrpg-bg, #05070b);
    color: var(--ccrpg-fg, #e7eaf2);
    font-family: var(--ccrpg-font-body, system-ui);
    padding: 1rem;
    padding-top: calc(1rem + env(safe-area-inset-top, 0px));
    overflow-y: auto;
    touch-action: pan-y;
  }

  .telemetry-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .telemetry-header h1 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
    font-family: var(--ccrpg-font-display, system-ui);
  }

  .telemetry-content {
    max-width: 700px;
    margin: 0 auto;
    padding-bottom: 4rem;
  }

  .status-section {
    margin-bottom: 2rem;
  }

  .status-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem;
    background: var(--ccrpg-surface, #1a0f0f);
    border: 1px solid var(--ccrpg-border, rgba(184, 37, 42, 0.3));
    border-radius: var(--ccrpg-radius-lg, 12px);
  }

  .status-label {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .status-name {
    font-size: 1rem;
    font-weight: 500;
  }

  .status-desc {
    font-size: 0.8125rem;
    color: var(--ccrpg-fg-muted, #a89080);
  }

  .status-on {
    color: #4cc9f0;
  }

  .status-off {
    color: var(--ccrpg-fg-muted, #a89080);
  }

  .settings-link {
    background: var(--ccrpg-surface-elevated, #261818);
    border: 1px solid var(--ccrpg-border, rgba(184, 37, 42, 0.3));
    color: var(--ccrpg-fg, #e7eaf2);
    padding: 0.5rem 1rem;
    border-radius: var(--ccrpg-radius, 6px);
    cursor: pointer;
    font-size: 0.875rem;
    font-family: var(--ccrpg-font-body, system-ui);
    white-space: nowrap;
    transition: background var(--ccrpg-duration-fast, 180ms) var(--ccrpg-ease, ease);
  }

  .settings-link:hover {
    background: var(--ccrpg-accent-soft, #5a1318);
  }

  .intro-section {
    margin-bottom: 2rem;
  }

  .intro-section p {
    font-size: 0.9375rem;
    line-height: 1.6;
    color: var(--ccrpg-fg-muted, #a89080);
    margin: 0 0 1rem 0;
  }

  .events-section h2 {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--ccrpg-accent, #b8252a);
    margin: 0 0 1rem 0;
  }

  .event-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .event-card {
    background: var(--ccrpg-surface, #1a0f0f);
    border: 1px solid var(--ccrpg-border, rgba(184, 37, 42, 0.3));
    border-radius: var(--ccrpg-radius-lg, 12px);
    padding: 1.25rem;
  }

  .event-name {
    font-family: var(--ccrpg-font-body, monospace);
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--ccrpg-accent, #b8252a);
    margin: 0 0 0.5rem 0;
  }

  .event-desc {
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--ccrpg-fg-muted, #a89080);
    margin: 0 0 0.75rem 0;
  }

  .event-payload summary {
    font-size: 0.8125rem;
    color: var(--ccrpg-fg-muted, #a89080);
    cursor: pointer;
    padding: 0.25rem 0;
  }

  .event-payload pre {
    margin: 0.5rem 0 0 0;
    padding: 0.75rem;
    background: var(--ccrpg-bg, #05070b);
    border: 1px solid var(--ccrpg-border, rgba(184, 37, 42, 0.2));
    border-radius: var(--ccrpg-radius, 6px);
    overflow-x: auto;
    font-size: 0.8125rem;
    line-height: 1.5;
  }

  .event-payload code {
    font-family: var(--ccrpg-font-body, monospace);
    color: var(--ccrpg-fg, #e7eaf2);
  }
</style>
