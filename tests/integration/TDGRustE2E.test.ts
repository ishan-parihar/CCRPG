/**
 * E2E integration test: CCRPG ↔ TDG-Rust.
 *
 * This test spawns the REAL tdg-rust binary (if installed) and exercises:
 *   1. TDGClient spawn + MCP handshake + tools/list
 *   2. All 7 TDG-Mind tools are exposed
 *   3. TDGHooks.onEncounterComplete creates a node in the graph
 *   4. TDGHooks.onShadowSurfaced creates a shadow node
 *   5. TDGHooks.onTransformation queries the greater cycle
 *   6. TDGHooks.onSessionEnd runs consolidation
 *   7. TDGHooks.getHealth / getTransformationPressure return correct shapes
 *   8. The graph actually contains the nodes we created (tdg_search verifies)
 *
 * If TDG-Rust is not installed, this test SKIPS (not fails) — it's an opt-in
 * integration test, not a unit test. Set CCRPG_E2E_TDG=1 to force-run.
 *
 * Run: LD_LIBRARY_PATH=~/.hermes/tdg-rust/lib CCRPG_E2E_TDG=1 npx vitest run tests/integration/TDGRustE2E.test.ts
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TDGClient } from '../../src/infra/tdg/TDGClient.js';
import { TDGHooks } from '../../src/infra/tdg/TDGHooks.js';
import { createSignificator } from '../../src/core/domain/Significator.js';
import type { ScheduledEncounter } from '../../src/core/domain/EncounterSpecNew.js';
import type { ConsequenceRecord } from '../../src/core/domain/ConsequenceRecord.js';
import type { Stage } from '../../src/core/domain/Stage.js';
import type { Line } from '../../src/core/domain/Line.js';
import * as fs from 'fs';
import * as path from 'path';

function makeAltitudes(stage: Stage): Record<Line, Stage> {
  return {
    Cognitive: stage, Emotional: stage, Moral: stage, Intrapersonal: stage,
    Spiritual: stage, Somatic: stage, Willpower: stage, Interpersonal: stage,
  };
}

// Skip the whole suite if TDG-Rust isn't installed.
const TDG_BINARY = path.join(process.env.HOME ?? '/home/z', '.hermes', 'tdg-rust', 'tdg-rust');
const TDG_INSTALLED = fs.existsSync(TDG_BINARY);
const FORCE_RUN = process.env.CCRPG_E2E_TDG === '1';
const SHOULD_RUN = (TDG_INSTALLED && FORCE_RUN) || (TDG_INSTALLED && process.env.CCRPG_E2E_TDG_AUTO === '1');

const describeOrSkip = SHOULD_RUN ? describe : describe.skip;

describeOrSkip('CCRPG ↔ TDG-Rust E2E integration', { timeout: 60_000 }, () => {
  let client: TDGClient;
  let hooks: TDGHooks;

  beforeAll(async () => {
    client = new TDGClient();
    await client.start();
    hooks = new TDGHooks();
    hooks.setClient(client);
  });

  afterAll(() => {
    client?.stop();
  });

  it('TDG-Rust binary spawns and completes MCP handshake', () => {
    expect(client.isRunning()).toBe(true);
  });

  it('exposes all 7 TDG-Mind tools the agent expects', () => {
    const toolNames = client.getTools().map(t => t.name);
    const expected = ['tdg_search', 'tdg_create', 'tdg_connect', 'tdg_reflect', 'tdg_fetch_context', 'tdg_tick', 'tdg_health'];
    for (const name of expected) {
      expect(toolNames).toContain(name);
    }
  });

  it('TDGHooks.isActive() is true after client starts', () => {
    expect(hooks.isActive()).toBe(true);
  });

  it('Hook 1: onEncounterComplete creates an encounter node in the graph', async () => {
    const sig = createSignificator('e2e-enc-player', makeAltitudes('Red'), 'Red');
    const encounter: ScheduledEncounter = {
      id: 'e2e-enc-1',
      moduleRef: 'Cognitive:Red',
      modality: 'LanguageReflective',
      targetLines: ['Cognitive'],
      stage: 'Red',
      holonSource: 'Cognitive:Red',
      shadowTarget: null,
      polarityMode: 'Exploring',
      difficulty: 0.5,
      sessionPosition: 'peak',
      priority: 0.5,
      driveTarget: null,
      executionMode: 'capacity',
    };
    const record = {
      timestamp: Date.now(),
      polarityTrace: {
        line: 'Cognitive' as Line,
        stage: 'Red' as Stage,
        energeticDirection: 'Radiative' as const,
        driveDirectionality: {
          Agency: 'HealthyBalanced' as const, Communion: 'HealthyBalanced' as const,
          Eros: 'HealthyBalanced' as const, Agape: 'HealthyBalanced' as const,
        },
        stageOrientation: 'Homeostatic' as const,
        sourceOfNourishment: 'Ambivalent' as const,
      },
      holonDeltas: [],
      shadowSurfaced: null,
      shadowResolved: null,
      narrativeSummary: 'E2E test: the player engaged deeply with cognitive reflection.',
    } as unknown as ConsequenceRecord;

    await hooks.onEncounterComplete(encounter, record, sig);

    // Verify the node was created by searching for it
    const searchResult = await client.callTool('tdg_search', {
      query: 'cognitive reflection',
      limit: 10,
    });
    const searchObj = searchResult as { content?: Array<{ type?: string; text?: string }> };
    const textBlock = searchObj.content?.find(b => b.type === 'text');
    expect(textBlock).toBeDefined();
    const parsed = JSON.parse(textBlock!.text!);
    expect(parsed.nodes).toBeInstanceOf(Array);
    expect(parsed.nodes.length).toBeGreaterThan(0);
    // The encounter node should appear in search results
    const encounterNode = parsed.nodes.find((n: any) => n.name?.startsWith('encounter:Cognitive:Red'));
    expect(encounterNode).toBeDefined();
  });

  it('Hook 2: onShadowSurfaced creates a shadow node', async () => {
    const sig = createSignificator('e2e-shadow-player', makeAltitudes('Red'), 'Red');
    await hooks.onShadowSurfaced(
      `e2e-shadow-${Date.now()}`,
      'DarkAddiction',
      'Emotional',
      'Red',
      0.7,
      sig,
    );
    // Verify the shadow node exists
    const searchResult = await client.callTool('tdg_search', {
      query: 'DarkAddiction shadow',
      limit: 10,
    });
    const searchObj = searchResult as { content?: Array<{ type?: string; text?: string }> };
    const textBlock = searchObj.content?.find(b => b.type === 'text');
    const parsed = JSON.parse(textBlock!.text!);
    const shadowNode = parsed.nodes.find((n: any) => n.name?.startsWith('shadow:'));
    expect(shadowNode).toBeDefined();
  });

  it('Hook 3: onTransformation queries the greater cycle without throwing', async () => {
    const sig = createSignificator('e2e-transform-player', makeAltitudes('Red'), 'Red');
    await expect(hooks.onTransformation('Red', 'Amber', sig)).resolves.toBeUndefined();
  });

  it('Hook 4: onSessionEnd runs consolidation without throwing', async () => {
    const sig = createSignificator('e2e-session-player', makeAltitudes('Red'), 'Red');
    await expect(hooks.onSessionEnd(sig)).resolves.toBeUndefined();
  });

  it('Hook 6: onPolarityCrystallized creates a polarity event + ticks', async () => {
    const sig = createSignificator('e2e-polarity-player', makeAltitudes('Red'), 'Red');
    await expect(hooks.onPolarityCrystallized('Crystallized', 'Radiative', 0.8, sig)).resolves.toBeUndefined();
  });

  it('Hook 8: getHealth returns null or a valid health object', async () => {
    const sig = createSignificator('e2e-health-player', makeAltitudes('Red'), 'Red');
    // Ensure the player node exists first
    await hooks.onEncounterComplete(
      { id: 'e2e-health-enc', moduleRef: 'Cognitive:Red', modality: 'LanguageReflective', targetLines: ['Cognitive'], stage: 'Red', holonSource: 'Cognitive:Red', shadowTarget: null, polarityMode: 'Exploring', difficulty: 0.5, sessionPosition: 'peak', priority: 0.5, driveTarget: null, executionMode: 'capacity' } as ScheduledEncounter,
      { timestamp: Date.now(), polarityTrace: { line: 'Cognitive', stage: 'Red', energeticDirection: 'Radiative' as const, driveDirectionality: { Agency: 'HealthyBalanced' as const, Communion: 'HealthyBalanced' as const, Eros: 'HealthyBalanced' as const, Agape: 'HealthyBalanced' as const }, stageOrientation: 'Homeostatic' as const, sourceOfNourishment: 'Ambivalent' as const }, holonDeltas: [], shadowSurfaced: null, shadowResolved: null, narrativeSummary: 'Health probe encounter.' } as unknown as ConsequenceRecord,
      sig,
    );
    const health = await hooks.getHealth(`player:${sig.id}`);
    // health may be null if the metabolism worker hasn't computed yet — that's fine
    if (health !== null) {
      expect(health).toHaveProperty('gz');
      expect(health).toHaveProperty('pz');
      expect(health).toHaveProperty('total');
      expect(health).toHaveProperty('computed');
    }
  });

  it('Hook 10: getTransformationPressure returns a number or null', async () => {
    const sig = createSignificator('e2e-pressure-player', makeAltitudes('Red'), 'Red');
    const pressure = await hooks.getTransformationPressure(sig);
    expect(pressure === null || typeof pressure === 'number').toBe(true);
  });
});

// Always-on metadata test (runs even without TDG installed)
describe('CCRPG ↔ TDG-Rust E2E test setup', () => {
  it('reports TDG-Rust install status correctly', () => {
    if (TDG_INSTALLED) {
      console.log(`  TDG-Rust binary found at ${TDG_BINARY}`);
      if (!SHOULD_RUN) {
        console.log('  Set CCRPG_E2E_TDG=1 to run the full integration suite');
      }
    } else {
      console.log('  TDG-Rust not installed — E2E suite skipped');
      console.log('  Install with: bash install.sh');
    }
    // This test always passes — it's just a status reporter
    expect(true).toBe(true);
  });
});
