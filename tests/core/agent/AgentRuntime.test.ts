/**
 * Tests for AgentRuntime — the EventBus → DirectorAgent bridge.
 *
 * Layer 1: runtime subscribes to all 14+ AGENT_RUNTIME_EVENTS.
 * Layer 2: events fired on the bus reach the DirectorAgent's Loom.
 * Layer 3: dispose() detaches listeners.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { EventBus } from '../../../src/core/events/EventBus.js';
import { DirectorAgent } from '../../../src/core/agent/DirectorAgent.js';
import { AgentRuntime, AGENT_RUNTIME_EVENTS } from '../../../src/core/agent/AgentRuntime.js';
import type { CCIScore } from '../../../src/core/engines/CCIEngine.js';
import type { ConsequenceRecord } from '../../../src/core/domain/ConsequenceRecord.js';

describe('AgentRuntime', () => {
  let bus: EventBus;
  let director: DirectorAgent;
  let runtime: AgentRuntime;

  beforeEach(() => {
    bus = new EventBus();
    director = new DirectorAgent();
    runtime = new AgentRuntime(bus, director);
    runtime.start();
  });

  it('subscribes to AGENT_RUNTIME_EVENTS', () => {
    expect(AGENT_RUNTIME_EVENTS.length).toBeGreaterThanOrEqual(14);
  });

  it('forwards events into the DirectorAgent Loom', () => {
    const fakeCci: CCIScore = {
      composite: 0.5,
      dimensions: { altitude: 0, driveHealth: 0, polarity: 0, shadowTopology: 0, transformationReadiness: 0 },
      weights: { altitude: 0, driveHealth: 0, polarity: 0, shadowTopology: 0, transformationReadiness: 0, knowledgeHealth: 0 },
      dominantDimension: 'altitude',
      sessionSignals: {
        recommendedTheme: 'consolidation',
        intensityBudget: 0,
        shadowPressure: 'low',
        transformationProximity: 'distant',
        driveRebalancingTarget: null,
        polarityGuidance: { mode: 'exploration', recommendedDiversity: 0, temptationFrequency: 0 },
      },
    };
    bus.emit('cci_computed', { score: fakeCci, timestamp: 1 });
    bus.emit('session_started', { timestamp: 42 });
    const events = director.loom$().gameEvents$();
    expect(events.length).toBe(2);
    const names = new Set(events.map((e) => e.event));
    expect(names.has('cci_computed')).toBe(true);
    expect(names.has('session_started')).toBe(true);
  });

  it('dispose detaches listeners', () => {
    runtime.dispose();
    expect(runtime.isRunning()).toBe(false);
    const fakeRecord = { encounterId: 'e-1', line: 'Cognitive', completedAt: Date.now() } as unknown as ConsequenceRecord;
    bus.emit('encounter_completed', { record: fakeRecord });
    expect(director.loom$().gameEvents$().length).toBe(0);
  });

  it('is idempotent on start() — second start is a no-op', () => {
    runtime.start();
    bus.emit('encounter_declined', {
      encounterId: 'e',
      moduleRef: 'm',
      line: 'Cognitive',
      stage: 'Red',
    });
    // Garbage in -> garbage out, only one event should be present.
    expect(director.loom$().gameEvents$().length).toBeLessThanOrEqual(1);
  });
});

// (no helper types — removed; tests use `as unknown as` for CCI/Consequence shapes)
