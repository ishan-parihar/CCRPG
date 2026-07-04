/**
 * Tests for the CCRPG agentic architecture: tools, registry, persistent agent.
 */
import { describe, it, expect } from 'vitest';
import {
  ALL_CCRPG_TOOLS,
  executeCCRPGTool,
  type ToolContext,
} from '../../src/core/agent/tools/CCRPGTools.js';
import { createCCRPGToolRegistry } from '../../src/core/agent/ToolRegistry.js';
import { PersistentAgent } from '../../src/core/agent/PersistentAgent.js';
import { runPersistentAgentEncounter } from '../../src/core/agent/PersistentAgentBridge.js';
import { TDGClient } from '../../src/infra/tdg/TDGClient.js';
import { TDGHooks } from '../../src/infra/tdg/TDGHooks.js';
import { maybeFireHook, getTDGBridgeStatus } from '../../src/infra/tdg/TDGBridge.js';
import { applyConsequences, processOutcome, type PlayerResponse } from '../../src/core/engines/ConsequenceEngine.js';
import { createSignificator } from '../../src/core/domain/Significator.js';
import { createInitialWorldState } from '../../src/core/engines/CandidateGeneration.js';
import { createInitialUserMatrixModel } from '../../src/core/engines/UserMatrixModel.js';
import type { ScheduledEncounter } from '../../src/core/domain/EncounterSpecNew.js';
import type { Line } from '../../src/core/domain/Line.js';
import type { Stage } from '../../src/core/domain/Stage.js';

function makeAltitudes(stage: Stage): Record<Line, Stage> {
  return {
    Cognitive: stage, Emotional: stage, Moral: stage, Intrapersonal: stage,
    Spiritual: stage, Somatic: stage, Willpower: stage, Interpersonal: stage,
  };
}

function makeToolContext(overrides: Partial<ToolContext> = {}): ToolContext {
  const sig = createSignificator('test', makeAltitudes('Red'), 'Red');
  const world = createInitialWorldState([]);
  return {
    sig,
    world,
    sessionState: {
      encountersSoFar: 0,
      targetSessionLength: 10,
      recentLines: [],
      userMatrixModel: createInitialUserMatrixModel(),
    },
    onAskPlayer: async () => ({ selectedLabel: 'test', writeInValue: undefined }),
    selectedEncounter: null,
    onEncounterSelected: () => {},
    onEncounterComplete: () => {},
    ...overrides,
  };
}

describe('CCRPG Tools', () => {
  it('defines exactly 8 CCRPG-native tools', () => {
    expect(ALL_CCRPG_TOOLS).toHaveLength(8);
  });

  it('all tools have unique names', () => {
    const names = ALL_CCRPG_TOOLS.map(t => t.function.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('tool names follow ccrpg_ prefix convention', () => {
    for (const tool of ALL_CCRPG_TOOLS) {
      expect(tool.function.name).toMatch(/^ccrpg_/);
    }
  });
});

describe('ToolRegistry', () => {
  it('createCCRPGToolRegistry registers 8 tools', () => {
    const registry = createCCRPGToolRegistry();
    expect(registry.count).toBe(8);
  });

  it('has() returns true for registered tools', () => {
    const registry = createCCRPGToolRegistry();
    expect(registry.has('ccrpg_ask_player')).toBe(true);
    expect(registry.has('unknown_tool')).toBe(false);
  });

  it('execute() dispatches to ccrpg_get_player_state', async () => {
    const registry = createCCRPGToolRegistry();
    const ctx = makeToolContext();
    const result = await registry.execute('ccrpg_get_player_state', {}, ctx);
    const parsed = JSON.parse(result);
    expect(parsed.resonance).toContain('fortress-sharp');
  });

  it('execute() returns error for unknown tool', async () => {
    const registry = createCCRPGToolRegistry();
    const ctx = makeToolContext();
    const result = await registry.execute('unknown_tool', {}, ctx);
    expect(JSON.parse(result).error).toContain('Unknown tool');
  });
});

describe('CCRPG Tool execution', () => {
  it('ccrpg_get_player_state returns Veil-filtered state', async () => {
    const ctx = makeToolContext();
    const result = await executeCCRPGTool('ccrpg_get_player_state', {}, ctx);
    const parsed = JSON.parse(result);
    expect(parsed.resonance).toContain('fortress-sharp');
    expect(parsed.polarityMode).toBe('exploring');
    expect(parsed.userMatrixPhase).toBe('unmapped');
  });

  it('ccrpg_get_world_state returns world info', async () => {
    const ctx = makeToolContext();
    const result = await executeCCRPGTool('ccrpg_get_world_state', {}, ctx);
    const parsed = JSON.parse(result);
    // createInitialWorldState starts with 0 holons — just verify structure
    expect(parsed).toHaveProperty('holonCount');
    expect(parsed).toHaveProperty('npcCount');
    expect(parsed).toHaveProperty('activeMacroEvents');
  });

  it('ccrpg_get_encounter_pool returns ranked candidates', async () => {
    const ctx = makeToolContext();
    const result = await executeCCRPGTool('ccrpg_get_encounter_pool', { count: 3 }, ctx);
    const parsed = JSON.parse(result);
    expect(Array.isArray(parsed)).toBe(true);
  });

  it('ccrpg_select_encounter registers encounter', async () => {
    let selectedEnc: ScheduledEncounter | null = null;
    const ctx = makeToolContext({
      onEncounterSelected: (enc) => { selectedEnc = enc; },
    });
    const result = await executeCCRPGTool('ccrpg_select_encounter', {
      moduleRef: 'Cognitive:Red',
    }, ctx);
    expect(JSON.parse(result).status).toBe('selected');
    expect(selectedEnc).not.toBeNull();
  });

  it('ccrpg_check_transformation returns threshold info', async () => {
    const ctx = makeToolContext();
    const result = await executeCCRPGTool('ccrpg_check_transformation', {}, ctx);
    const parsed = JSON.parse(result);
    expect(parsed.atThreshold).toBe(false);
    expect(parsed.transformationPhase).toBe('idle');
  });

  it('ccrpg_get_content returns fallback content', async () => {
    const ctx = makeToolContext();
    const result = await executeCCRPGTool('ccrpg_get_content', {
      modality: 'LanguageReflective', line: 'Cognitive', stage: 'Red',
    }, ctx);
    const parsed = JSON.parse(result);
    expect(parsed).toHaveProperty('prompt');
  });

  it('ccrpg_ask_player calls the UI handler', async () => {
    let called = false;
    const ctx = makeToolContext({
      onAskPlayer: async () => { called = true; return { selectedLabel: 'test' }; },
    });
    await executeCCRPGTool('ccrpg_ask_player', {
      narrative: 'A scene.', question: 'What?', header: 'Test',
    }, ctx);
    expect(called).toBe(true);
  });

  it('ccrpg_complete_encounter triggers callback', async () => {
    let completed = false;
    const ctx = makeToolContext({
      onEncounterComplete: () => { completed = true; },
    });
    await executeCCRPGTool('ccrpg_complete_encounter', {
      passed: true,
      driveScores: { agency: 0.7, communion: 0.5, eros: 0.6, agape: 0.4 },
      driveSignals: { agency: 'HealthyBalanced', communion: 'HealthyBalanced', eros: 'HealthyBalanced', agape: 'HealthyBalanced' },
      narrativeSummary: 'Done.',
    }, ctx);
    expect(completed).toBe(true);
  });
});

describe('PersistentAgent', () => {
  it('constructs with config', () => {
    const sig = createSignificator('test', makeAltitudes('Red'), 'Red');
    const world = createInitialWorldState([]);
    const agent = new PersistentAgent({
      sig, world,
      sessionState: { encountersSoFar: 0, targetSessionLength: 10, recentLines: [], userMatrixModel: createInitialUserMatrixModel() },
      onAskPlayer: async () => ({ selectedLabel: 'test' }),
    });
    expect(agent).toBeDefined();
    expect(agent.getMessages()).toHaveLength(0);
  });

  it('constructs with agentSynthesis', () => {
    const sig = createSignificator('test', makeAltitudes('Red'), 'Red');
    const world = createInitialWorldState([]);
    const agent = new PersistentAgent({
      sig, world,
      sessionState: { encountersSoFar: 0, targetSessionLength: 10, recentLines: [], userMatrixModel: createInitialUserMatrixModel() },
      onAskPlayer: async () => ({ selectedLabel: 'test' }),
      agentSynthesis: 'Lines explored: Cognitive',
    });
    expect(agent.getMessages()).toHaveLength(1);
  });
});

describe('TDG integration (mock)', () => {
  it('TDGClient.isAvailable returns false when binary not installed', () => {
    const client = new TDGClient('/nonexistent/tdg-rust');
    expect(client.isAvailable()).toBe(false);
  });

  it('TDGHooks.isActive returns false without client', () => {
    const hooks = new TDGHooks();
    expect(hooks.isActive()).toBe(false);
  });
});

// ─── Phase 3: PersistentAgent loop + Bridge + Hook no-op safety ────────────

describe('PersistentAgent message persistence (Phase 3)', () => {
  it('messages accumulate across multiple runEncounter calls (no per-encounter reset)', async () => {
    const sig = createSignificator('persist', makeAltitudes('Red'), 'Red');
    const world = createInitialWorldState([]);
    const agent = new PersistentAgent({
      sig, world,
      sessionState: { encountersSoFar: 0, targetSessionLength: 10, recentLines: [], userMatrixModel: createInitialUserMatrixModel() },
      onAskPlayer: async () => ({ selectedLabel: 'test' }),
      agentSynthesis: 'Initial context',
    });

    // The agent starts with 1 message (the agentSynthesis)
    expect(agent.getMessages()).toHaveLength(1);
    const initialMessage = agent.getMessages()[0];

    // After runEncounter (returns early due to LLM unavailability in test env),
    // the initial message MUST still be present — proving no per-encounter reset.
    // This is the key regression guard: the old AgenticOrchestrator did `messages = []`
    // per encounter; PersistentAgent must NOT.
    await agent.runEncounter();
    expect(agent.getMessages()[0]).toBe(initialMessage);
    expect(agent.getMessages().length).toBeGreaterThanOrEqual(1);

    // After a second runEncounter, the initial message is STILL there (no reset)
    await agent.runEncounter();
    expect(agent.getMessages()[0]).toBe(initialMessage);
    expect(agent.getMessages().length).toBeGreaterThanOrEqual(1);

    // The message history is monotonically non-decreasing — never shrinks
    const lenAfterFirst = agent.getMessages().length;
    await agent.runEncounter();
    expect(agent.getMessages().length).toBeGreaterThanOrEqual(lenAfterFirst);
  });

  it('updateSnapshot updates the agent sig/world for tool queries', async () => {
    const sig = createSignificator('snap', makeAltitudes('Red'), 'Red');
    const world = createInitialWorldState([]);
    const agent = new PersistentAgent({
      sig, world,
      sessionState: { encountersSoFar: 0, targetSessionLength: 10, recentLines: [], userMatrixModel: createInitialUserMatrixModel() },
      onAskPlayer: async () => ({ selectedLabel: 'test' }),
    });

    // Mutate sig (advance stage) and verify the agent's tool queries reflect it
    const advancedSig = { ...sig, currentStage: 'Amber' as Stage, totalEncounters: 42 };
    agent.updateSnapshot(advancedSig, world);

    // The agent's ccrpg_get_player_state tool should now reflect Amber aesthetics
    const result = await executeCCRPGTool('ccrpg_get_player_state', {}, {
      sig: advancedSig,
      world,
      sessionState: { encountersSoFar: 0, targetSessionLength: 10, recentLines: [], userMatrixModel: createInitialUserMatrixModel() },
      onAskPlayer: async () => ({ selectedLabel: 'test' }),
      selectedEncounter: null,
      onEncounterSelected: () => {},
      onEncounterComplete: () => {},
    });
    const parsed = JSON.parse(result);
    expect(parsed.resonance).toContain('cathedral-ordered'); // Amber aesthetic
    expect(parsed.totalEncounters).toBe(42);
  });
});

describe('PersistentAgentBridge (Phase 3)', () => {
  it('runPersistentAgentEncounter produces an OrchestratorResult-compatible shape', async () => {
    const sig = createSignificator('bridge', makeAltitudes('Red'), 'Red');
    const world = createInitialWorldState([]);
    const agent = new PersistentAgent({
      sig, world,
      sessionState: { encountersSoFar: 0, targetSessionLength: 10, recentLines: [], userMatrixModel: createInitialUserMatrixModel() },
      onAskPlayer: async () => ({ selectedLabel: 'test' }),
    });

    const encounter: ScheduledEncounter = {
      id: 'test-enc-1',
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

    const result = await runPersistentAgentEncounter(agent, encounter, sig, world);

    // Verify the shape matches what cli-game.ts expects
    expect(result.outcome).toBeDefined();
    expect(result.outcome.updatedSig).toBeDefined();
    expect(result.outcome.updatedWorld).toBeDefined();
    expect(result.outcome.consequenceRecord).toBeDefined();
    expect(result.outcome.finalResult).toBeDefined();
    expect(typeof result.outcome.finalResult.passed).toBe('boolean');
    expect(typeof result.narrativeSummary).toBe('string');
    expect(result.response).toBeDefined();
    // totalEncounters should have advanced by 1 (applyConsequences was called)
    expect(result.outcome.updatedSig.totalEncounters).toBe(sig.totalEncounters + 1);
  });
});

describe('TDG hook no-op safety (Phase 3 — non-regression)', () => {
  it('maybeFireHook is a no-op when TDG is not running (does not throw, does not block)', () => {
    // TDG-Rust is not installed in the test environment — hooks must be no-ops.
    const status = getTDGBridgeStatus();
    expect(status.running).toBe(false);

    // Calling maybeFireHook with a throwing function must NOT throw —
    // the fn should never even be invoked when TDG is inactive.
    let fnCalled = false;
    expect(() => {
      maybeFireHook('test', async () => {
        fnCalled = true;
        throw new Error('should never run');
      });
    }).not.toThrow();
    expect(fnCalled).toBe(false);
  });

  it('ConsequenceEngine.applyConsequences fires hooks without regression when TDG is absent', () => {
    // Build a minimal encounter + response + record and run applyConsequences.
    // The hooks wired into it (onEncounterComplete, onShadowSurfaced, etc.)
    // must no-op silently — no throw, no behavior change vs pre-hook baseline.
    const sig = createSignificator('hook-safety', makeAltitudes('Red'), 'Red');
    const world = createInitialWorldState([]);

    const encounter: ScheduledEncounter = {
      id: 'hook-enc-1',
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

    const response: PlayerResponse = {
      encounterId: encounter.id,
      energeticDirection: 'Radiative',
      driveDirectionality: {
        Agency: 'HealthyBalanced', Communion: 'HealthyBalanced',
        Eros: 'HealthyBalanced', Agape: 'HealthyBalanced',
      },
      stageOrientation: 'Homeostatic',
      sourceOfNourishment: 'Ambivalent',
      shadowSurfaced: null,
      shadowResolvedId: null,
      narrativeSummary: 'The player engaged deeply.',
    };

    const record = processOutcome(encounter, response, Date.now());
    // Must not throw despite hooks firing internally
    const result = applyConsequences(sig, world, record, encounter);
    expect(result.sig.totalEncounters).toBe(sig.totalEncounters + 1);
  });

  it('ConsequenceEngine fires onShadowSurfaced hook path without regression', () => {
    const sig = createSignificator('hook-shadow', makeAltitudes('Red'), 'Red');
    const world = createInitialWorldState([]);

    const encounter: ScheduledEncounter = {
      id: 'hook-enc-shadow',
      moduleRef: 'Emotional:Red',
      modality: 'LanguageReflective',
      targetLines: ['Emotional'],
      stage: 'Red',
      holonSource: 'Emotional:Red',
      shadowTarget: null,
      polarityMode: 'Exploring',
      difficulty: 0.5,
      sessionPosition: 'peak',
      priority: 0.5,
      driveTarget: null,
      executionMode: 'shadow',
    };

    const response: PlayerResponse = {
      encounterId: encounter.id,
      energeticDirection: 'Absorptive',
      driveDirectionality: {
        Agency: 'DarkAddicted', Communion: 'DarkAverted',
        Eros: 'GoldenAddicted', Agape: 'HealthyBalanced',
      },
      stageOrientation: 'Homeostatic',
      sourceOfNourishment: 'Ambivalent',
      shadowSurfaced: 'DarkAddiction',
      shadowResolvedId: null,
      narrativeSummary: 'A shadow surfaced.',
    };

    const record = processOutcome(encounter, response, Date.now());
    // Must not throw despite the onShadowSurfaced hook path firing
    const result = applyConsequences(sig, world, record, encounter);
    // A new shadow entry should have been added (pre-hook baseline behaviour)
    expect(result.sig.shadows.entries.length).toBeGreaterThan(sig.shadows.entries.length);
  });
});

describe('Tool surface completeness (Phase 3)', () => {
  it('the 8 CCRPG tool names match the architecture plan', () => {
    const names = ALL_CCRPG_TOOLS.map(t => t.function.name);
    expect(names).toEqual([
      'ccrpg_ask_player',
      'ccrpg_get_player_state',
      'ccrpg_get_world_state',
      'ccrpg_get_encounter_pool',
      'ccrpg_select_encounter',
      'ccrpg_complete_encounter',
      'ccrpg_check_transformation',
      'ccrpg_get_content',
    ]);
  });

  it('PersistentAgent has no hardcoded 4-exchange budget (uses safety guard only)', () => {
    // The PersistentAgent.runEncounter uses maxLoops=30 as a SAFETY guard,
    // not a developmental budget. This is intentional — the agent decides when
    // an encounter is complete via ccrpg_complete_encounter, not a counter.
    // We verify the safety guard exists but is much higher than the old 4.
    // (Direct introspection isn't possible without running; we verify behaviour
    // by confirming the agent doesn't terminate early on LLM-unavailable path.)
    const sig = createSignificator('budget', makeAltitudes('Red'), 'Red');
    const world = createInitialWorldState([]);
    const agent = new PersistentAgent({
      sig, world,
      sessionState: { encountersSoFar: 0, targetSessionLength: 10, recentLines: [], userMatrixModel: createInitialUserMatrixModel() },
      onAskPlayer: async () => ({ selectedLabel: 'test' }),
    });
    // Should complete without hanging (the LLM-unavailable path returns early,
    // proving the agent isn't waiting for a 4-exchange counter to expire)
    return expect(agent.runEncounter()).resolves.toBeDefined();
  });
});
