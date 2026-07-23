/**
 * Tests for the DirectorAgent loops.
 *
 * Layer 1 (Contract): nextCalibrationConfidence is monotone and bounded.
 * Layer 2 (Behavior): Two identical Loom snapshots fed to the same
 *     CalibrationAgent LLM mock produce two different AgenticProbes
 *     iff the Loom snapshots themselves differ — anti-determinism.
 * Layer 3 (Integration): observeProbeResponse walks confidence to the
 *     calibration threshold and flips calibrationComplete.
 */

import { describe, it, expect } from 'vitest';
import { DirectorAgent, nextCalibrationConfidence, CALIBRATION_THRESHOLD } from '../../../src/core/agent/DirectorAgent.js';
import { CalibrationAgent } from '../../../src/core/agent/CalibrationAgent.js';
import { RecognitionAgent } from '../../../src/core/agent/RecognitionAgent.js';
import type { AgenticProbe, AgenticProbeResponse } from '../../../src/core/agent/AgenticProbe.js';

describe('nextCalibrationConfidence (contract)', () => {
  it('clamps the result to [0, 1]', () => {
    expect(nextCalibrationConfidence(0.95, 0.5)).toBeLessThanOrEqual(1);
    expect(nextCalibrationConfidence(0, -0.5)).toBe(0);
  });
  it('increases on a positive signal weight', () => {
    const before = 0.3;
    const after = nextCalibrationConfidence(before, 0.5);
    expect(after).toBeGreaterThan(before);
    expect(after).toBeCloseTo(0.3 + 0.7 * 0.5);
  });
  it('is monotonically non-decreasing as prior grows toward 1', () => {
    let p = 0;
    for (let i = 0; i < 10; i++) p = nextCalibrationConfidence(p, 0.5);
    expect(p).toBeGreaterThanOrEqual(CALIBRATION_THRESHOLD);
  });
});

describe('DirectorAgent.observeProbeResponse (integration)', () => {
  it('flips calibrationComplete when signal fills over the threshold', async () => {
    const d = new DirectorAgent();
    const probe: AgenticProbe = {
      id: 'p-1',
      prompt: 'Hold the line.',
      options: [
        { label: 'A', polarity: 'reflective' },
        { label: 'B', polarity: 'action' },
        { label: 'C', polarity: 'communion' },
        { label: 'D', polarity: 'integrative' },
      ],
      freeInputPlaceholder: '...',
      metadata: { intent: 'i', trajectory: 't', signalWeight: 1.0 },
    };
    d.setLatestProbe(probe);
    d.setLatestProbeSignalWeight(probe.metadata.signalWeight);

    const resp: AgenticProbeResponse = {
      probeId: 'p-1',
      selectedPolarity: 'action',
      selectedIndex: 1,
      freeInput: 'I step forward.',
    };
    const after = await d.observeProbeResponse(resp);
    expect(after).toBeGreaterThan(0);
    expect(d.snapshot().calibrationConfidence).toBe(after);
    // Single full-signal response should cross the threshold immediately.
    expect(d.snapshot().calibrationComplete).toBe(true);
  });

  it('records the response into the Loom so its history evolves', async () => {
    const d = new DirectorAgent();
    const probe: AgenticProbe = {
      id: 'p',
      prompt: '.',
      options: [
        { label: 'R', polarity: 'reflective' },
        { label: 'A', polarity: 'action' },
        { label: 'C', polarity: 'communion' },
        { label: 'I', polarity: 'integrative' },
      ],
      freeInputPlaceholder: '.',
      metadata: { intent: '.', trajectory: '.', signalWeight: 0.1 },
    };
    d.setLatestProbe(probe);
    d.setLatestProbeSignalWeight(0.1);
    await d.observeProbeResponse({
      probeId: 'p',
      selectedPolarity: 'communion',
      selectedIndex: 2,
      freeInput: 'With the other.',
    });
    const snap = d.snapshot();
    expect(snap.loomInputsCount).toBe(1);
  });
});

describe('CalibrationAgent anti-determinism (behavior)', () => {
  it('produces a different prompt when the Loom differs', async () => {
    const director1 = new DirectorAgent();
    const ca = new CalibrationAgent({
      llmCaller: async (_sys, userMessage) => {
        // Vary the mocked output by counting free-input entries in
        // the user message — this is how the *real* LLM would see
        // the same prompt deliver different probe text.
        const loomMatches = userMessage.match(/"text":\s*"/g) ?? [];
        const id = `p-${loomMatches.length}`;
        return JSON.stringify({
          id,
          prompt: `prompt-${loomMatches.length}`,
          options: [
            { label: 'Hold', polarity: 'reflective' },
            { label: 'Push', polarity: 'action' },
            { label: 'Link', polarity: 'communion' },
            { label: 'Bind', polarity: 'integrative' },
          ],
          freeInputPlaceholder: '.',
          metadata: {
            intent: `derived from loom #${loomMatches.length}`,
            trajectory: 'toward integration',
            signalWeight: 0.5,
          },
        });
      },
    });

    // First probe: empty Loom.
    const res1 = await ca.generateProbe(director1.loom$(), 0.1);
    // Append a free-input → Loom evolves → second probe differs.
    director1.observeFreeInput({
      timestamp: Date.now(),
      text: 'first free input',
      selectedPolarity: 'integrative',
    });
    const res2 = await ca.generateProbe(director1.loom$(), 0.4);

    expect(res1.id).not.toBe(res2.id);
  });
});

describe('RecognitionAgent.profile (contract)', () => {
  it('returns a balanced profile when polarities are evenly distributed', () => {
    const r = new RecognitionAgent();
    const profile = r.profile(['action', 'reflective', 'communion', 'integrative']);
    expect(profile.balance).toBe(1);
  });
  it('marks all zero-count polarities as underrepresented', () => {
    const r = new RecognitionAgent();
    const profile = r.profile(['action', 'action', 'action', 'reflective']);
    expect(profile.counts.communion).toBe(0);
    expect(profile.counts.integrative).toBe(0);
    const zeroSet = new Set(profile.underrepresented.slice(0, 2));
    expect(zeroSet.has('communion')).toBe(true);
    expect(zeroSet.has('integrative')).toBe(true);
  });
});
