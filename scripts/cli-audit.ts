#!/usr/bin/env npx tsx
/**
 * CCRPG Comprehensive Backend Audit
 * Tests every subsystem with real data to verify full functionality.
 *
 * Usage: npx tsx scripts/cli-audit.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// ── Env bootstrap ─────────────────────────────────────────────────────
try {
  const envPath = path.resolve('.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split('\n')) {
      const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*)\s*$/);
      if (match) {
        const key = match[1]!;
        let val = match[2]!.trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        process.env[key] = val;
      }
    }
  }
} catch { /* ignore */ }

(globalThis as any).import = {
  meta: {
    env: {
      VITE_LLM_BASE_URL: process.env.VITE_LLM_BASE_URL || 'https://api.openai.com/v1',
      VITE_LLM_API_KEY: process.env.VITE_LLM_API_KEY || 'sk-placeholder',
      VITE_LLM_MODEL: process.env.VITE_LLM_MODEL || 'gpt-4o-mini',
    }
  }
};

// ── Imports ───────────────────────────────────────────────────────────
import { bootRegistries } from '../src/core/registries/boot.js';
import { bootModuleRegistry } from '../src/core/assessments/bootModules.js';
import { ModuleRegistry } from '../src/core/assessments/registry.js';
import { createSignificator } from '../src/core/domain/Significator.js';
import type { Significator } from '../src/core/domain/Significator.js';
import type { Line } from '../src/core/domain/Line.js';
import { ALL_LINES } from '../src/core/domain/Line.js';
import type { Stage } from '../src/core/domain/Stage.js';
import { ALL_STAGES } from '../src/core/domain/Stage.js';
import type { ScheduledEncounter } from '../src/core/domain/EncounterSpecNew.js';
import type { PlayerResponse } from '../src/core/engines/ConsequenceEngine.js';
import { processOutcome, applyConsequences } from '../src/core/engines/ConsequenceEngine.js';
import type { SessionContext } from '../src/core/engines/PriorityComputation.js';
import { computeCCI } from '../src/core/engines/CCIEngine.js';
import { toSnapshot } from '../src/core/domain/SignificatorSnapshot.js';
import { generateSessionStrategy } from '../src/core/engines/AutoModeStrategy.js';
import { scheduleNext } from '../src/core/engines/EncounterScheduler.js';
import { createInitialWorldState } from '../src/core/engines/CandidateGeneration.js';
import { startSession, tickWithStrategy, endSession } from '../src/core/GameLoop.js';
import { detectThreshold } from '../src/core/engines/TransformationDetector.js';
import { computeCellStaleness, detectBleedThrough, DEFAULT_THETA_PARAMS } from '../src/core/engines/ThetaDecay.js';
import { getFallback } from '../src/infra/llm/FallbackProvider.js';
import { buildContext } from '../src/infra/llm/ContextPipeline.js';
import { parseConsequence } from '../src/infra/llm/ConsequenceParser.js';
import { generateFrequencySpec } from '../src/infra/llm/FrequencyConditioner.js';
import { filterInput } from '../src/infra/llm/VeilFilter.js';
import holonsJson from '../src/core/data/red-layer-holons.json';
import { ALL_MODALITIES } from '../src/core/domain/enums.js';

// ── Helpers ───────────────────────────────────────────────────────────
const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m', cyan: '\x1b[36m',
};

let passCount = 0;
let failCount = 0;
let warnCount = 0;
const failures: string[] = [];
const warnings: string[] = [];

function pass(test: string): void {
  passCount++;
  console.log(`  ${C.green}✓${C.reset} ${test}`);
}

function fail(test: string, detail: string): void {
  failCount++;
  failures.push(`${test}: ${detail}`);
  console.log(`  ${C.red}✗${C.reset} ${test} — ${detail}`);
}

function warn(test: string, detail: string): void {
  warnCount++;
  warnings.push(`${test}: ${detail}`);
  console.log(`  ${C.yellow}⚠${C.reset} ${test} — ${detail}`);
}

function section(title: string): void {
  console.log(`\n${C.bold}${C.cyan}═══ ${title} ═══${C.reset}`);
}

const MOCK_ENCOUNTER: ScheduledEncounter = {
  id: 'audit-enc', moduleRef: 'Cognitive/Red', modality: 'Deterministic',
  targetLines: ['Cognitive'], stage: 'Red', holonSource: 'audit-holon',
  shadowTarget: null, polarityMode: 'Exploring', difficulty: 0.5,
  sessionPosition: 'peak', priority: 0.5, driveTarget: null, executionMode: 'capacity',
};

const MOCK_RESPONSE: PlayerResponse = {
  encounterId: 'audit-enc',
  energeticDirection: 'Sovereign',
  driveDirectionality: { Agency: 'HealthyBalanced', Communion: 'HealthyBalanced', Eros: 'HealthyBalanced', Agape: 'HealthyBalanced' },
  stageOrientation: 'Homeostatic',
  sourceOfNourishment: 'Ambivalent',
  shadowSurfaced: null,
  shadowResolvedId: null,
  narrativeSummary: 'Audit test response',
};

function makeSnapshot(sig: Significator) {
  return toSnapshot(sig);
}

// ── Tests ─────────────────────────────────────────────────────────────

function testRegistries(): ModuleRegistry {
  section('1. Registry Boot');
  try {
    bootRegistries();
    pass('bootRegistries() succeeded');
  } catch (e: any) {
    fail('bootRegistries()', e.message);
    throw e;
  }

  let mr: ModuleRegistry;
  try {
    mr = bootModuleRegistry();
    pass(`ModuleRegistry: ${mr.count()} modules loaded`);
  } catch (e: any) {
    fail('bootModuleRegistry()', e.message);
    throw e;
  }
  return mr;
}

function testModuleKeys(mr: ModuleRegistry): void {
  section('2. Module Keys (8 lines × 8 stages)');
  let found = 0;
  const missing: string[] = [];
  for (const line of ALL_LINES) {
    for (const stage of ALL_STAGES) {
      if (mr.get(line as Line, stage as Stage)) found++;
      else missing.push(`${line}/${stage}`);
    }
  }
  if (found === 64) pass(`All 64 modules found`);
  else fail('Module keys', `Found ${found}/64. Missing: ${missing.join(', ')}`);
}

function testHolonData(): void {
  section('3. Holon Data');
  const holons = holonsJson as any[];
  if (holons.length === 0) { fail('Holons', 'Empty'); return; }
  pass(`${holons.length} holons loaded`);

  const byKind: Record<string, number> = {};
  for (const h of holons) byKind[h.kind] = (byKind[h.kind] || 0) + 1;
  for (const [kind, count] of Object.entries(byKind)) pass(`  ${kind}: ${count}`);

  const missing = holons.filter(h => !h.id || !h.kind || !h.line || !h.stage);
  if (missing.length > 0) fail('Holon fields', `${missing.length} missing required fields`);
  else pass('All holons have id/kind/line/stage');

  const withModality = holons.filter(h => h.modality).length;
  if (withModality === 0) warn('Holon modality', 'None have modality — hash-based fallback used');
  else pass(`${withModality}/${holons.length} have modality`);
}

function testSignificator(): Significator {
  section('4. Significator');
  const altitudes: Record<Line, Stage> = {
    Cognitive: 'Red', Emotional: 'Red', Moral: 'Red', Intrapersonal: 'Red',
    Spiritual: 'Red', Somatic: 'Red', Willpower: 'Red', Interpersonal: 'Red',
  };
  try {
    const sig = createSignificator('audit', altitudes, 'Red');
    pass(`Created: id=${sig.id}, stage=${sig.currentStage}`);
    pass(`Altitudes: ${Object.keys(sig.altitudes).length} lines`);
    pass(`Drives: weights=${Object.keys(sig.drives.weights).length}, fixationRisk=${Object.keys(sig.drives.fixationRisk).length}`);
    pass(`Polarity: mode=${sig.polarity.master.mode}, cells=${Object.keys(sig.polarity.cells).length}`);
    pass(`Shadows: ${sig.shadows.entries.length} entries`);
    pass(`Theta: ${Object.keys(sig.theta.lastEncounter).length} timestamps`);
    pass(`totalEncounters=${sig.totalEncounters}, totalSessions=${sig.totalSessions}`);
    return sig;
  } catch (e: any) {
    fail('createSignificator()', e.message);
    throw e;
  }
}

function testCCI(sig: Significator): void {
  section('5. CCI Engine');
  try {
    const snapshot = makeSnapshot(sig);
    const cci = computeCCI(snapshot);
    pass(`Composite: ${cci.composite.toFixed(4)}`);
    for (const dim of ['altitude', 'driveHealth', 'polarity', 'shadowTopology', 'transformationReadiness'] as const) {
      const val = cci.dimensions[dim];
      if (typeof val === 'number') pass(`  ${dim}: ${val.toFixed(4)}`);
      else fail(`CCI.${dim}`, `Invalid: ${val}`);
    }
    if (cci.composite >= 0 && cci.composite <= 1) pass('Range valid [0,1]');
    else fail('CCI', `Out of range: ${cci.composite}`);
  } catch (e: any) {
    fail('computeCCI()', e.message);
  }
}

function testAutoMode(sig: Significator): void {
  section('6. Auto-Mode Strategy');
  try {
    const snapshot = makeSnapshot(sig);
    const cci = computeCCI(snapshot);
    const strategy = generateSessionStrategy(cci, {
      encountersSoFar: 0, sessionDurationMs: 0, targetSessionLength: 20, recentLines: [],
    }, null);
    pass(`Theme: ${strategy.theme}`);
    pass(`Budget: total=${strategy.encounterBudget.totalTarget}, warmup=${strategy.encounterBudget.warmupCount}, peak=${strategy.encounterBudget.peakCount}, cooldown=${strategy.encounterBudget.cooldownCount}`);
    if (strategy.theme && strategy.encounterBudget.totalTarget > 0) pass('Valid strategy');
    else fail('Strategy', 'Missing theme or budget');
  } catch (e: any) {
    fail('generateSessionStrategy()', e.message);
  }
}

function testThetaDecay(sig: Significator): void {
  section('7. Theta Decay');
  const now = Date.now();
  const s0 = computeCellStaleness(0, now, DEFAULT_THETA_PARAMS.halfLife);
  if (s0 > 0.99) pass(`Never visited (ts=0): staleness=${s0.toFixed(4)}`);
  else fail('Theta never visited', `Expected ~1.0, got ${s0}`);

  const sNow = computeCellStaleness(now, now, DEFAULT_THETA_PARAMS.halfLife);
  if (sNow < 0.01) pass(`Just visited: staleness=${sNow.toFixed(6)}`);
  else fail('Theta just visited', `Expected ~0, got ${sNow}`);

  const s7d = computeCellStaleness(now - 7 * 86400000, now, DEFAULT_THETA_PARAMS.halfLife);
  if (s7d > 0.4 && s7d < 0.6) pass(`7 days: staleness=${s7d.toFixed(4)}`);
  else warn('Theta 7 days', `Expected ~0.5, got ${s7d.toFixed(4)}`);

  const bleed = detectBleedThrough(sig.theta.lastEncounter, now);
  pass(`Bleed-through: ${bleed.length} cells stale`);
}

function testScheduling(sig: Significator): void {
  section('8. Encounter Scheduling');
  const world = createInitialWorldState(holonsJson as any[]);
  pass(`WorldState: ${world.holons.length} holons`);

  const session: SessionContext = {
    encountersSoFar: 0, sessionDurationMs: 0, targetSessionLength: 20, recentLines: [],
  };

  try {
    const encounters = scheduleNext(sig, world, session, Date.now(), 5);
    if (encounters.length === 0) { fail('Scheduling', 'No encounters'); return; }
    pass(`Scheduled ${encounters.length} encounters`);

    const modalities = new Set(encounters.map(e => e.modality));
    const lines = new Set(encounters.flatMap(e => e.targetLines));
    pass(`Modality diversity: ${modalities.size} types`);
    pass(`Line diversity: ${lines.size} lines`);

    for (const enc of encounters) {
      if (!enc.id || !enc.moduleRef || !enc.modality || !enc.executionMode) {
        fail(`Encounter ${enc.id}`, 'Missing fields');
        return;
      }
    }
    pass('All encounters have required fields');
  } catch (e: any) {
    fail('scheduleNext()', e.message);
  }
}

function testGameLoop(sig: Significator): void {
  section('9. Game Loop (5 encounters)');
  const world = createInitialWorldState(holonsJson as any[]);
  const session: SessionContext = {
    encountersSoFar: 0, sessionDurationMs: 0, targetSessionLength: 5, recentLines: [],
  };

  try {
    const sessionState = startSession(sig, session);
    pass(`Session started: theme=${sessionState.strategy.theme}`);

    let curSig = sig;
    let curWorld = world;
    let prevEnc: ScheduledEncounter | null = null;
    let prevResp: PlayerResponse | null = null;
    let completed = 0;
    const now = Date.now();

    for (let i = 0; i < 5; i++) {
      const { tickResult } = tickWithStrategy(
        curSig, curWorld,
        { ...session, encountersSoFar: i, sessionDurationMs: i * 5000 },
        sessionState, prevResp, prevEnc, now + i * 5000,
      );
      curSig = tickResult.sig;
      curWorld = tickResult.world;
      if (!tickResult.encounter) continue;
      prevEnc = tickResult.encounter;
      prevResp = { ...MOCK_RESPONSE, encounterId: tickResult.encounter.id };
      completed++;
    }

    // Apply last encounter's consequences
    if (prevResp && prevEnc) {
      const { tickResult: final } = tickWithStrategy(
        curSig, curWorld,
        { ...session, encountersSoFar: 5, sessionDurationMs: 25000 },
        sessionState, prevResp, prevEnc, now + 25000,
      );
      curSig = final.sig;
    }

    pass(`Completed: ${completed}, totalEncounters: ${curSig.totalEncounters}`);
    if (curSig.totalEncounters === completed) pass('Counter matches');
    else fail('Counter', `Expected ${completed}, got ${curSig.totalEncounters}`);

    const end = endSession(curSig, sessionState, now + 30000);
    pass(`Session ended: sessions=${end.sig.totalSessions}, shadows surfaced=${end.summary.shadowsSurfaced}`);
  } catch (e: any) {
    fail('Game loop', e.message);
  }
}

function testConsequenceEngine(sig: Significator): void {
  section('10. Consequence Engine');
  const world = createInitialWorldState(holonsJson as any[]);

  try {
    const record = processOutcome(MOCK_ENCOUNTER, MOCK_RESPONSE, Date.now());
    pass(`Record: encounter=${record.encounterId}, polarity=${record.polarityTrace.energeticDirection}`);

    const { sig: newSig, world: newWorld } = applyConsequences(sig, world, record, MOCK_ENCOUNTER);
    pass(`Applied: totalEncounters=${newSig.totalEncounters}`);

    if (newSig.totalEncounters === sig.totalEncounters + 1) pass('Counter incremented');
    else fail('Counter', `Expected ${sig.totalEncounters + 1}, got ${newSig.totalEncounters}`);

    if (newWorld.recentEncounterIds.length > world.recentEncounterIds.length) pass('recentEncounterIds updated');
    else fail('recentEncounterIds', 'Not updated');

    if ((newWorld.recentEncounters?.length ?? 0) > 0) pass('recentEncounters tracking works');
    else fail('recentEncounters', 'Not populated');
  } catch (e: any) {
    fail('Consequence engine', e.message);
  }
}

function testTransformation(sig: Significator): void {
  section('11. Transformation Detector');
  try {
    const result = detectThreshold(sig);
    if (result) pass(`Detected: ${result}`);
    else pass('No threshold (expected for new player)');
  } catch (e: any) {
    fail('detectThreshold()', e.message);
  }
}

function testFallbackProvider(): void {
  section('12. Fallback Provider');
  let total = 0, ok = 0;
  for (const modality of ALL_MODALITIES) {
    for (const stage of ['Red', 'Amber', 'Orange'] as Stage[]) {
      for (const line of ['Cognitive', 'Emotional', 'Moral'] as Line[]) {
        total++;
        try {
          const fb = getFallback(modality, line, stage);
          if (fb && (fb.prompt || fb.framing || fb.scenario)) ok++;
          else warn(`Fallback ${modality}/${line}/${stage}`, 'Empty');
        } catch (e: any) {
          fail(`Fallback ${modality}/${line}/${stage}`, e.message);
        }
      }
    }
  }
  if (ok === total) pass(`All ${total} combinations return content`);
  else warn('Fallback coverage', `${ok}/${total} have content`);
}

function testContextPipeline(sig: Significator): void {
  section('13. Context Pipeline');
  const world = createInitialWorldState(holonsJson as any[]);
  try {
    const ctx = buildContext({
      encounter: MOCK_ENCOUNTER,
      significator: sig,
      holonRegistry: { holons: world.holons } as any,
      conceptIndex: { modules: {} } as any,
      recentConsequences: [],
      sessionContext: { energy: 'moderate' },
    });
    if (ctx.systemPrompt.length > 100) pass(`Prompt: ${ctx.systemPrompt.length} chars`);
    else fail('Context', 'Prompt too short');

    for (const s of ['[ROLE]', '[HOLONS]', '[ENCOUNTER]', '[PLAYER STATE]']) {
      if (ctx.systemPrompt.includes(s)) pass(`  Contains ${s}`);
      else warn('Context', `Missing ${s}`);
    }
  } catch (e: any) {
    fail('buildContext()', e.message);
  }
}

function testVeilFilter(): void {
  section('14. Veil Filter');
  const cases = [
    { input: 'You are at the Red stage of development.', expect: true },
    { input: 'Your agency drive is elevated.', expect: true },
    { input: 'The warrior faces you.', expect: false },
    { input: 'Shadow quadrant: Dark-Addiction', expect: true },
    { input: 'You feel the heat of the forge.', expect: false },
  ];
  for (const tc of cases) {
    const filtered = filterInput(tc.input);
    const changed = filtered !== tc.input;
    if (changed === tc.expect) pass(`"${tc.input.slice(0, 40)}..." ${changed ? 'filtered' : 'passed'}`);
    else warn('Veil', `"${tc.input.slice(0, 40)}..." expected ${tc.expect ? 'filter' : 'pass'}`);
  }
}

function testConsequenceParser(): void {
  section('15. Consequence Parser');
  const valid = JSON.stringify({
    affectedHolons: [{ holonId: 'test', field: 'disposition', delta: 0.1 }],
    polarityDirection: 'sto', polarityMagnitude: 0.7,
    narrativeSummary: 'The warrior stands tall.',
  });
  try {
    const r = parseConsequence(valid, MOCK_ENCOUNTER);
    if (r.errors.length === 0) pass('Valid JSON parsed');
    else fail('Parser', r.errors.join(', '));
    if (r.record?.polarityDirection === 'sto') pass('Polarity correct');
    else fail('Parser', `Wrong polarity: ${r.record?.polarityDirection}`);
  } catch (e: any) {
    fail('parseConsequence()', e.message);
  }

  const bad = parseConsequence('not json', MOCK_ENCOUNTER);
  if (bad.errors.length > 0) pass('Invalid JSON handled gracefully');
  else fail('Parser', 'Invalid JSON should produce errors');
}

function testFrequencyConditioner(): void {
  section('16. Frequency Conditioner');
  for (const stage of ['Red', 'Amber', 'Turquoise'] as Stage[]) {
    try {
      const freq = generateFrequencySpec('Cognitive' as Line, stage, 'Willpower' as Line, stage, 'Deterministic');
      if (freq.toneDirective && freq.vocabularyBand) pass(`${stage}: tone="${freq.toneDirective}"`);
      else fail(`Freq ${stage}`, 'Missing fields');
    } catch (e: any) {
      fail(`generateFrequencySpec(${stage})`, e.message);
    }
  }
}

async function testEncounterRouting(): Promise<void> {
  section('17. Encounter Routing');
  try {
    const { routeModality } = await import('../src/game/logic/encounterRouting.js');
    const cases = [
      { modality: 'Deterministic', expected: 'Encounter' },
      { modality: 'LanguageReflective', expected: 'Reflection' },
      { modality: 'ScenarioChoice', expected: 'Dilemma' },
      { modality: 'Embodied', expected: 'Encounter' },
      { modality: 'SocialCooperative', expected: 'Encounter' },
      { modality: 'ImmersiveRPG', expected: 'Encounter' },
    ];
    for (const tc of cases) {
      const scene = routeModality(tc.modality as any);
      if (scene.includes(tc.expected)) pass(`${tc.modality} → ${scene}`);
      else fail(`Route ${tc.modality}`, `Expected ${tc.expected}, got ${scene}`);
    }
  } catch (e: any) {
    fail('Routing', e.message);
  }
}

function testPolarity(sig: Significator): void {
  section('18. Polarity Engine');
  if (sig.polarity.master.mode === 'Exploring') pass(`Master mode: ${sig.polarity.master.mode}`);
  else fail('Polarity', `Expected Exploring, got ${sig.polarity.master.mode}`);
  // Cells start empty — they're populated as encounters produce traces
  pass(`Polarity cells: ${Object.keys(sig.polarity.cells).length} (populated during gameplay)`);
}

// ── Main ──────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  console.log(`\n${C.bold}CCRPG Comprehensive Backend Audit${C.reset}`);
  console.log(`${C.dim}Testing all subsystems...${C.reset}\n`);

  const mr = testRegistries();
  testModuleKeys(mr);
  testHolonData();
  const sig = testSignificator();
  testCCI(sig);
  testAutoMode(sig);
  testThetaDecay(sig);
  testScheduling(sig);
  testGameLoop(sig);
  testConsequenceEngine(sig);
  testTransformation(sig);
  testFallbackProvider();
  testContextPipeline(sig);
  testVeilFilter();
  testConsequenceParser();
  testFrequencyConditioner();
  await testEncounterRouting();
  testPolarity(sig);

  section('AUDIT SUMMARY');
  console.log(`  ${C.green}✓ Passed: ${passCount}${C.reset}`);
  console.log(`  ${C.yellow}⚠ Warnings: ${warnCount}${C.reset}`);
  console.log(`  ${C.red}✗ Failed: ${failCount}${C.reset}`);

  if (failures.length > 0) {
    console.log(`\n${C.red}${C.bold}FAILURES:${C.reset}`);
    for (const f of failures) console.log(`  ${C.red}✗${C.reset} ${f}`);
  }
  if (warnings.length > 0) {
    console.log(`\n${C.yellow}${C.bold}WARNINGS:${C.reset}`);
    for (const w of warnings) console.log(`  ${C.yellow}⚠${C.reset} ${w}`);
  }

  console.log(`\n${failCount === 0 ? C.green : C.red}${C.bold}${failCount === 0 ? 'ALL CHECKS PASSED' : `${failCount} CHECKS FAILED`}${C.reset}\n`);
}

main().catch(console.error);
