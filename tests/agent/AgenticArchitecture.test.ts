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
import { TDGClient } from '../../src/infra/tdg/TDGClient.js';
import { TDGHooks } from '../../src/infra/tdg/TDGHooks.js';
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
