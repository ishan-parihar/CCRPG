#!/usr/bin/env npx tsx
/**
 * CCRPG CLI Game Runner — Phase 1
 * Comprehensive headless debugger that runs the full game loop without Phaser.
 * Routes ALL modalities through the AgenticOrchestrator for consistent behaviour.
 *
 * Usage:
 *   npx tsx scripts/cli-game.ts                          # interactive, fallback mode
 *   npx tsx scripts/cli-game.ts --headless               # automated, 20 encounters
 *   npx tsx scripts/cli-game.ts --model=gemma-4-31b-it  # override model
 *   npx tsx scripts/cli-game.ts --headless --json        # AI-agent feedback loop
 *   npx tsx scripts/cli-game.ts --mode=encounter         # single encounter
 *   npx tsx scripts/cli-game.ts --mode=diagnostic        # print system state
 *   npx tsx scripts/cli-game.ts --encounters=5           # custom encounter count
 *   npx tsx scripts/cli-game.ts --verbose                # show full narrative flow
 *   npx tsx scripts/cli-game.ts --json                   # machine-readable JSON output
 */

import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';

// ── Env bootstrap (must come before any project imports) ──────────────
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

// Read --model flag early so it takes precedence over .env before polyfill
const earlyModelOverride = process.argv.slice(2).find(a => a.startsWith('--model='))?.split('=')[1];

// Polyfill import.meta.env for Node so LLMClient works
const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_LLM_API_KEY || 'sk-placeholder';
const baseUrl = process.env.VITE_LLM_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/openai';
const model = earlyModelOverride || process.env.VITE_LLM_MODEL || 'gemma-4-31b-it';

(globalThis as any).import = {
  meta: {
    env: {
      VITE_LLM_BASE_URL: baseUrl,
      VITE_LLM_API_KEY: apiKey,
      VITE_LLM_MODEL: model,
    }
  }
};

// ── Project imports (after env bootstrap) ─────────────────────────────
import { bootRegistries } from '../src/core/registries/boot.js';
import { bootModuleRegistry } from '../src/core/assessments/bootModules.js';
import { createSignificator } from '../src/core/domain/Significator.js';
import { createInitialWorldState, type WorldState } from '../src/core/engines/CandidateGeneration.js';
import type { Significator } from '../src/core/domain/Significator.js';
import type { Line } from '../src/core/domain/Line.js';
import type { Stage } from '../src/core/domain/Stage.js';
import type { ScheduledEncounter } from '../src/core/domain/EncounterSpecNew.js';
import type { PlayerResponse } from '../src/core/engines/ConsequenceEngine.js';
import type { SessionContext } from '../src/core/engines/PriorityComputation.js';
import { startSession, tickWithStrategy, endSession, type SessionState } from '../src/core/GameLoop.js';
import { AgenticOrchestrator, type AgenticUIHandler } from '../src/core/assessments/AgenticOrchestrator.js';
import type { ModuleRegistry } from '../src/core/assessments/registry.js';
import type { AskUserQuestionParams, AskUserQuestionResult, UserAnswer } from '../src/core/assessments/agentTypes.js';

import holonsJson from '../src/core/data/red-layer-holons.json';
import type { ConsequenceRecord } from '../src/core/domain/ConsequenceRecord.js';
import type { Modality } from '../src/core/domain/enums.js';

// ── CLI arg parsing ───────────────────────────────────────────────────
const args = process.argv.slice(2);
const flags = new Set(args.filter(a => a.startsWith('--')));
const getVal = (name: string): string | undefined =>
  args.find(a => a.startsWith(`--${name}=`))?.split('=')[1];

const HEADLESS = flags.has('--headless');
const VERBOSE = flags.has('--verbose');
const JSON_MODE = flags.has('--json');
const NO_LLM = flags.has('--no-llm');
const LLM_ACTIVE = !NO_LLM && apiKey !== 'sk-placeholder';
const ACTIVE_MODEL = getVal('model') ?? model;
const mode = getVal('mode') ?? (flags.has('--mode') ? args[args.indexOf('--mode') + 1] : 'full') ?? 'full';
const encounterCount = parseInt(getVal('encounters') ?? '20', 10);

// ── Debug forcing flags (for AI-agent feedback loops) ─────────────────
const FORCE_LINE = getVal('line') as Line | undefined;
const FORCE_STAGE = getVal('stage') as Stage | undefined;
const FORCE_MODALITY = getVal('modality') as Modality | undefined;
const FORCE_RESPONSES = getVal('responses')?.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
const FORCE_SHADOW = getVal('force-shadow') as string | undefined;

// ── Helpers ───────────────────────────────────────────────────────────
const C = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  green: '\x1b[32m', yellow: '\x1b[33m', blue: '\x1b[34m',
  magenta: '\x1b[35m', cyan: '\x1b[36m', red: '\x1b[31m',
};

function banner(text: string): void {
  if (!JSON_MODE) console.log(`\n${C.bold}${C.cyan}═══ ${text} ═══${C.reset}`);
}

function info(label: string, value: string): void {
  if (!JSON_MODE) console.log(`  ${C.dim}${label}:${C.reset} ${value}`);
}

function success(text: string): void {
  if (!JSON_MODE) console.log(`  ${C.green}✓${C.reset} ${text}`);
}

function warn(text: string): void {
  if (!JSON_MODE) console.log(`  ${C.yellow}⚠${C.reset} ${text}`);
}

function error(text: string): void {
  if (!JSON_MODE) console.log(`  ${C.red}✗${C.reset} ${text}`);
}

function separator(label: string): void {
  if (!JSON_MODE) console.log(`\n${C.bold}${C.blue}── ${label} ──${C.reset}`);
}

function verbose(label: string, value: string): void {
  if (VERBOSE && !JSON_MODE) console.log(`  ${C.magenta}${label}:${C.reset} ${value}`);
}

const rl = !HEADLESS ? readline.createInterface({ input: process.stdin, output: process.stdout }) : null;
const ask = (q: string): Promise<string> =>
  new Promise(resolve => rl!.question(q, resolve));

// ── Holon loading ─────────────────────────────────────────────────────
function loadHolons(): WorldState {
  const holons = holonsJson as any[];
  return createInitialWorldState(holons);
}

// ── Significator creation (simplified onboarding) ─────────────────────
function createDefaultSignificator(): Significator {
  const allRed: Record<Line, Stage> = {
    Cognitive: 'Red', Emotional: 'Red', Moral: 'Red', Intrapersonal: 'Red',
    Spiritual: 'Red', Somatic: 'Red', Willpower: 'Red', Interpersonal: 'Red',
  };
  return createSignificator('cli-player', allRed, 'Red');
}

// ── JSON event emitter for AI-agent consumption ───────────────────────
function emitEvent(type: string, data: Record<string, unknown>): void {
  if (JSON_MODE) {
    process.stdout.write(JSON.stringify({ type, ts: Date.now(), ...data }) + '\n');
  }
}

// ── Rendering helpers ────────────────────────────────────────────────

/** Shadow quadrant label map — used by drive display */
const SHADOW_LABELS: Record<string, string> = {
  DarkAddicted: 'Addict', DarkAverted: 'Avert',
  GoldenAddicted: 'Gold', GoldenAverted: 'GAvr',
  HealthyBalanced: '',
};

/** Stage color helper: returns ANSI color for a given stage */
function stageColor(stage: string): string {
  const colors: Record<string, string> = {
    Infrared: '\x1b[38;5;52m',  // dark red
    Magenta: '\x1b[38;5;127m',  // magenta
    Red: '\x1b[38;5;196m',     // bright red
    Amber: '\x1b[38;5;214m',   // orange
    Orange: '\x1b[38;5;208m',  // orange
    Green: '\x1b[38;5;40m',    // green
    Turquoise: '\x1b[38;5;44m',// teal
    White: '\x1b[38;5;255m',   // white
  };
  return colors[stage] ?? C.dim;
}

/** Stage abbreviation for compact display */
function stageAbbr(stage: string): string {
  const abb: Record<string, string> = {
    Infrared: 'IR', Magenta: 'MG', Red: 'RD', Amber: 'AM',
    Orange: 'OR', Green: 'GR', Turquoise: 'TQ', White: 'WH',
  };
  return abb[stage] ?? stage.slice(0, 2).toUpperCase();
}

/** Render an altitude bar chart showing per-line stage progression */
function renderAltitudesChart(sig: Significator): void {
  const orderedLines: Line[] = ['Cognitive', 'Emotional', 'Moral', 'Intrapersonal', 'Spiritual', 'Somatic', 'Willpower', 'Interpersonal'];
  const allStages = ['Infrared', 'Magenta', 'Red', 'Amber', 'Orange', 'Green', 'Turquoise', 'White'] as const;
  const stageKeys: readonly string[] = allStages;

  for (const line of orderedLines) {
    const current = sig.altitudes[line] ?? 'Red';
    const currentIdx = stageKeys.indexOf(current);
    const color = stageColor(current);

    // Build a horizontal bar: filled squares up to current stage, empty beyond
    const bars = stageKeys.map((s, i) => {
      if (i < currentIdx) return `${C.dim}■${C.reset}`;  // passed stages
      if (i === currentIdx) return `${color}●${C.reset}`; // current stage
      return `${C.dim}○${C.reset}`; // future stages
    });

    // Segment label: first 3 stages, current, last 2
    const segLabels = stageKeys.map((s, i) => {
      if (i === 0 || i === stageKeys.length - 1 || i === currentIdx) {
        return `${i === currentIdx ? color : C.dim}${stageAbbr(s)}${C.reset}`;
      }
      return '  '; // skip most labels for compactness
    });

    // Pad line name to 15 chars for alignment
    const paddedLine = line.padEnd(14);
    if (!JSON_MODE) {
      console.log(`  ${paddedLine} ${bars.join('')} ${C.dim}${current}${C.reset}`);
    }
  }
}

/** Render CCI composite with dimension breakdown */
function renderCCIDisplay(cci: { composite: number; dimensions: Record<string, number> }): void {
  if (JSON_MODE) return;
  const pct = (cci.composite * 100).toFixed(1);
  const barLen = 20;
  const filled = Math.round(cci.composite * barLen);
  const bar = '█'.repeat(filled) + '░'.repeat(barLen - filled);

  console.log(`  ${C.bold}CCI${C.reset}  ${C.cyan}${bar}${C.reset} ${C.bold}${pct}%${C.reset}`);

  // Show dimensions in a compact row
  const dims = Object.entries(cci.dimensions).map(([k, v]) => {
    const labels: Record<string, string> = {
      altitude: 'alt', driveHealth: 'drvH', polarity: 'pol',
      shadowTopology: 'shd', transformationReadiness: 'trns',
    };
    const short = labels[k] ?? k.slice(0, 4);
    const val = (v * 100).toFixed(0);
    const color = v > 0.6 ? C.green : v > 0.3 ? C.yellow : C.red;
    return `${C.dim}${short}:${color}${val}%${C.reset}`;
  });
  console.log(`   ${dims.join(' ')}`);
}

/** Render session arc position with progress bar */
function renderSessionPosition(label: string, position: 'warmup' | 'peak' | 'cooldown', progress: number): void {
  if (JSON_MODE) return;
  const barLen = 12;
  const pos = Math.round(progress * barLen);
  let bar = '';
  for (let i = 0; i < barLen; i++) {
    if (position === 'warmup') {
      bar += i <= pos ? C.blue + '▰' + C.reset : C.dim + '▱' + C.reset;
    } else if (position === 'peak') {
      bar += i <= pos ? C.magenta + '▰' + C.reset : C.dim + '▱' + C.reset;
    } else {
      bar += i <= pos ? C.green + '▰' + C.reset : C.dim + '▱' + C.reset;
    }
  }
  const posLabel = position === 'warmup' ? C.blue + 'WARMUP' + C.reset
    : position === 'peak' ? C.magenta + 'PEAK' + C.reset
    : C.green + 'COOLDOWN' + C.reset;
  console.log(`  ${posLabel} ${bar} ${C.dim}${label}${C.reset}`);
}

/** Render active shadows with quadrant labels */
function renderShadows(sig: Significator): void {
  if (JSON_MODE) return;
  const active = sig.shadows.entries.filter(e => !e.resolvedAt);
  if (active.length === 0) {
    info('shadows', `${C.green}none active${C.reset}`);
    return;
  }

  // Group by quadrant
  const groups: Record<string, typeof active> = {};
  for (const s of active) {
    const key = s.quadrant ?? 'Unknown';
    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
  }

  const qColors: Record<string, string> = {
    DarkAddiction: '\x1b[38;5;196m',   // bright red
    DarkAllergy: '\x1b[38;5;166m',    // orange-red
    GoldenAddiction: '\x1b[38;5;220m', // gold-yellow
    GoldenAllergy: '\x1b[38;5;240m',   // grey
  };

  const parts = Object.entries(groups).map(([q, entries]) => {
    const color = qColors[q] ?? C.yellow;
    const sev = entries.map(e => (e.severity * 100).toFixed(0)).join('/');
    return `${color}${q.replace('Dark', '').replace('Golden', 'G').slice(0, 8)}${entries.length > 1 ? '×' + entries.length : ''}(${sev}%)${C.reset}`;
  });
  console.log(`  ${C.yellow}⚠${C.reset} shadows: ${parts.join(' ')}`);
}

/** Render drive balance compass */
function renderDrives(sig: Significator): void {
  if (JSON_MODE) return;
  const balances = ['Agency', 'Communion', 'Eros', 'Agape'] as const;
  const vals = balances.map(d => sig.drives.weights[d] ?? 0);
  const maxVal = Math.max(1, ...vals);
  const barLen = 8;

  for (let i = 0; i < balances.length; i++) {
    const d = balances[i];
    const w = sig.drives.weights[d] ?? 0;
    const fix = sig.drives.fixationRisk[d] ?? 0;
    const filled = Math.max(0, Math.round((w / maxVal) * barLen));
    const bar = '█'.repeat(filled) + '░'.repeat(barLen - filled);
    const color = fix > 0.5 ? C.red : w > 0.3 ? C.green : C.yellow;
    const fixIcon = fix > 0.7 ? '⚠' : fix > 0.4 ? '~' : ' ';
    console.log(`  ${C.dim}${d.padEnd(10)}${C.reset} ${color}${bar}${C.reset} ${fixIcon}${C.dim}${fix > 0.1 ? `fix:${(fix * 100).toFixed(0)}%` : ''}${C.reset}`);
  }
}

// ── Print state ───────────────────────────────────────────────────────
function printSignificator(sig: Significator): void {
  info('id', sig.id);
  info('stage', sig.currentStage);
  info('encounters', String(sig.totalEncounters));
  info('sessions', String(sig.totalSessions));
}

function printEncounter(enc: ScheduledEncounter): void {
  const posColor = enc.sessionPosition === 'warmup' ? C.blue
    : enc.sessionPosition === 'cooldown' ? C.green : C.magenta;
  const stageCol = stageColor(enc.stage);
  const posTag = enc.sessionPosition === 'warmup' ? 'WARMUP'
    : enc.sessionPosition === 'cooldown' ? 'COOLDOWN' : 'PEAK';
  info('module', `${stageCol}${enc.moduleRef}${C.reset}`);
  info('modality', `${posColor}${enc.modality}${C.reset}`);
  info('arc', `${posColor}${posTag}${C.reset}  ${C.dim}difficulty:${enc.difficulty.toFixed(2)} pr:${enc.priority.toFixed(3)}${C.reset}`);
  info('holon', `${C.dim}${enc.holonSource}${C.reset}`);
  info('mode', `${enc.executionMode === 'shadow' ? C.yellow + 'shadow' + C.reset : C.dim + enc.executionMode + C.reset}`);
}

// ── AgenticOrchestrator encounter handler (all modalities) ────────────
async function runAgenticEncounter(
  encounter: ScheduledEncounter,
  sig: Significator,
  world: WorldState,
  history: ConsequenceRecord[],
  responsesPool?: number[],
): Promise<{
  outcome: import('../src/core/assessments/AgenticOrchestrator.js').OrchestratorResult;
  response: PlayerResponse;
  narrativeSummary: string;
}> {
  const [encLine, encStage] = encounter.moduleRef.split(':') as [Line, Stage];
  const modRegistry = (globalThis as any).__moduleRegistry as ModuleRegistry | undefined;

  // If --line/--stage/--modality forcing is active, override the encounter
  let forcedEncounter = encounter;
  if (FORCE_LINE || FORCE_STAGE || FORCE_MODALITY) {
    const forcedLine = FORCE_LINE ?? encLine;
    const forcedStage = FORCE_STAGE ?? encStage;
    const forcedModality = FORCE_MODALITY ?? encounter.modality;
    const forcedModule = modRegistry?.get(forcedLine, forcedStage);
    if (forcedModule) {
      forcedEncounter = {
        ...encounter,
        moduleRef: `${forcedLine}:${forcedStage}`,
        modality: forcedModality,
        targetLines: [forcedLine],
        stage: forcedStage,
      };
    }
  }

  const uiHandler: AgenticUIHandler = {
    askUser: async (params: AskUserQuestionParams): Promise<AskUserQuestionResult> => {
      const answers: UserAnswer[] = [];

      for (const q of params.questions) {
        if (!JSON_MODE) {
          const mod = forcedEncounter.modality;
          let modHeader = '';

          switch (mod) {
            case 'Deterministic':
              modHeader = `${C.bold}${C.red}⏳ [TIMED TRIAL] ▬▬▬▬▬▬▬▬▬▬▬▬▬░ (9.5s remaining)${C.reset}\n`;
              break;
            case 'LanguageReflective':
              modHeader = `${C.bold}${C.blue}🧘 [REFLECTION BEAT] • Tune in to your inner state •${C.reset}\n`;
              break;
            case 'ScenarioChoice':
              modHeader = `${C.bold}${C.yellow}🔀 [DECISION CROSSROADS] • A path diverges •${C.reset}\n`;
              break;
            case 'Embodied':
              modHeader = `${C.bold}${C.green}💓 [SOMATIC SCAN] • Focus on body sensation •${C.reset}\n`;
              break;
            case 'Strategic':
              modHeader = `${C.bold}${C.magenta}♟️ [TACTICAL WAR-TABLE] • Assess constraints •${C.reset}\n`;
              break;
            case 'SocialCooperative':
              modHeader = `${C.bold}${C.cyan}🤝 [DIPLOMACY] • Navigating connection •${C.reset}\n`;
              break;
            case 'ImmersiveRPG':
              modHeader = `${C.bold}${C.yellow}📖 [NARRATIVE SCENE] • The story unfolds •${C.reset}\n`;
              break;
            default:
              modHeader = `${C.bold}${C.dim}[${mod.toUpperCase()}]${C.reset}\n`;
          }

          console.log(`\n  ${modHeader}  ${C.magenta}[${q.header}]${C.reset}`);
          console.log(`  ${C.bold}${q.question}${C.reset}`);
          if (q.options?.length) {
            for (let i = 0; i < q.options.length; i++) {
              const opt = q.options[i];
              console.log(`    ${C.cyan}[${i + 1}]${C.reset} ${opt.label} — ${opt.description}`);
            }
          }
        }

        emitEvent('ask_user', {
          header: q.header,
          question: q.question,
          options: q.options?.map((o, i) => ({ index: i + 1, label: o.label, description: o.description })),
          allowWriteIn: q.allowWriteIn,
        });

        if (HEADLESS) {
          // Use forced responses pool if provided (one index per question, consumed sequentially)
          let selectedIdx: number;
          if (responsesPool && responsesPool.length > 0) {
            const forcedIdx = responsesPool.shift()!;
            if (q.options && forcedIdx >= 1 && forcedIdx <= q.options.length) {
              selectedIdx = forcedIdx - 1;
            } else {
              selectedIdx = 0;
            }
          } else {
            // Vary selection to probe different shadow patterns:
            // Cycle through options to ensure shadow detection has varied input
            const hash = (Date.now() + (q.options?.length ?? 4)) % 4;
            selectedIdx = hash < (q.options?.length ?? 4) ? hash : 0;
          }
          const selectedOpt = q.options?.[selectedIdx];
          const selectedLabel = selectedOpt?.label ?? '';

          // Shadow keyword injection for testing — randomly inject (10% chance)
          // to allow MOST encounters to pass and demonstrate altitude shifts.
          // When FORCE_SHADOW=none, skip injection entirely for clean progression.
          const shadowInjections = ['', 'i feel the need to withdraw from this confrontation', 'i must transcend these petty concerns and reach enlightenment', 'i prefer to stay here where it is safe and comfortable'];
          const injectShadow = FORCE_SHADOW !== 'none' && selectedIdx > 0 && Math.random() < 0.1;
          const writeInShadow = injectShadow ? (shadowInjections[selectedIdx] ?? '') : '';

          if (writeInShadow) {
            answers.push({ selectedLabels: [selectedLabel], writeInValue: writeInShadow });
          } else {
            answers.push({ selectedLabels: [selectedLabel] });
          }
        } else {
          const promptText = q.multiSelect
            ? '\n  Select (comma-separated): '
            : '\n  Select: ';
          const answer = await ask(promptText);
          const selections = answer.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
          const selectedLabels = selections
            .filter(n => n >= 1 && n <= (q.options?.length ?? 0))
            .map(n => q.options![n - 1]!.label);

          // Determine if input is a simple numeric choice from the options
          let isSimpleNumericChoice = false;
          if (q.options?.length && answer.trim()) {
            const parts = answer.split(',').map(s => s.trim());
            isSimpleNumericChoice = parts.every(part => {
              const num = parseInt(part, 10);
              return !isNaN(num) && String(num) === part && num >= 1 && num <= q.options!.length;
            });
          }

          if (q.allowWriteIn || (!q.options?.length && answer.trim())) {
            // Only populate writeInValue if it's NOT a simple numeric choice
            if (!isSimpleNumericChoice && answer.trim()) {
              answers.push({ selectedLabels, writeInValue: answer.trim() });
            } else {
              answers.push({ selectedLabels });
            }
          } else {
            answers.push({ selectedLabels });
          }
        }
      }

      return { answers };
    }
  };

  // Always route through AgenticOrchestrator — it handles LLM + fallback internally
  // Look up the assessment module from the registry to inject into the LLM context
  const baseModule = modRegistry?.get(encLine, encStage);

  // Build ConceptDraftIndex from the module registry so the LLM sees module metadata
  const conceptModules: Record<string, any> = {};
  if (modRegistry) {
    for (const m of modRegistry.getAll()) {
      const key = `${m.line.toLowerCase()}:${m.stage.toLowerCase()}`;
      conceptModules[key] = {
        line: m.line,
        stage: m.stage,
        title: `${m.line} ${m.stage} Module`,
        modalities: m.tasks.map(t => t.type === 'llm_dialogue' ? 'LanguageReflective' as const : 'Deterministic' as const),
      };
    }
  }

  const orchestrator = new AgenticOrchestrator({
    encounter: forcedEncounter,
    significator: sig,
    world,
    history,
    conceptIndex: { modules: conceptModules },
    uiHandler,
    module: modRegistry?.get(FORCE_LINE ?? encLine, FORCE_STAGE ?? encStage) ?? baseModule,
    noLlm: !LLM_ACTIVE,
    forceShadow: FORCE_SHADOW,
  });

  const outcome = await orchestrator.run();

  // Build a PlayerResponse from the orchestrator's consequence record
  const cr = outcome.consequenceRecord;
  const response: PlayerResponse = {
    encounterId: encounter.id,
    energeticDirection: cr.polarityTrace.energeticDirection,
    driveDirectionality: cr.polarityTrace.driveDirectionality,
    stageOrientation: cr.polarityTrace.stageOrientation,
    sourceOfNourishment: cr.polarityTrace.sourceOfNourishment,
    shadowSurfaced: cr.shadowSurfaced,
    shadowResolvedId: cr.shadowResolved,
    narrativeSummary: outcome.narrativeSummary,
  };

  return { outcome, response, narrativeSummary: outcome.narrativeSummary };
}

// ── Diagnostic mode ───────────────────────────────────────────────────
async function runDiagnostic(): Promise<void> {
  banner('CCRPG Diagnostic');

  console.log('\nRegistries:');
  bootRegistries();
  const moduleRegistry = bootModuleRegistry();
  (globalThis as any).__moduleRegistry = moduleRegistry;
  success(`${moduleRegistry.count()} assessment modules loaded`);

  console.log('\nHolons:');
  const world = loadHolons();
  const npcCount = world.holons.filter(h => h.kind === 'NPC').length;
  const factionCount = world.holons.filter(h => h.kind === 'Faction').length;
  const locationCount = world.holons.filter(h => h.kind === 'Location').length;
  success(`${world.holons.length} total: ${npcCount} NPCs, ${factionCount} factions, ${locationCount} locations`);

  console.log('\nSignificator:');
  const sig = createDefaultSignificator();
  printSignificator(sig);

  console.log('\nSession:');
  const session: SessionContext = {
    encountersSoFar: 0,
    sessionDurationMs: 0,
    targetSessionLength: encounterCount,
    recentLines: [],
  };
  const sessionState = startSession(sig, session);
  info('CCI', sessionState.cci.composite.toFixed(4));
  info('theme', sessionState.strategy.theme);
  info('totalTarget', String(sessionState.strategy.encounterBudget.totalTarget));

  console.log('\nEncounter scheduling:');
  const now = Date.now();
  const { tickResult } = tickWithStrategy(sig, world, session, sessionState, null, null, now);
  if (tickResult.encounter) {
    success('Scheduler produced encounter:');
    printEncounter(tickResult.encounter);
  } else {
    warn('Scheduler returned null — no encounters available');
  }

  console.log(`\n${C.dim}LLM: ${LLM_ACTIVE ? 'active' : 'fallback (placeholder key)'} | Endpoint: ${baseUrl} | Model: ${model}${C.reset}`);
  console.log(`${C.dim}LLM endpoint: ${baseUrl}${C.reset}`);
  console.log(`${C.dim}LLM model: ${model}${C.reset}`);
}

// ── Single encounter mode ─────────────────────────────────────────────
async function runSingleEncounter(): Promise<void> {
  banner('CCRPG Single Encounter');

  bootRegistries();
  const moduleRegistry = bootModuleRegistry();
  (globalThis as any).__moduleRegistry = moduleRegistry;
  success(`${moduleRegistry.count()} modules loaded`);

  const sig = createDefaultSignificator();
  const world = loadHolons();
  const session: SessionContext = {
    encountersSoFar: 0,
    sessionDurationMs: 0,
    targetSessionLength: 1,
    recentLines: [],
    ...(FORCE_LINE ? { forceLine: FORCE_LINE } : {}),
    ...(FORCE_STAGE ? { forceStage: FORCE_STAGE } : {}),
    ...(FORCE_MODALITY ? { forceModality: FORCE_MODALITY } : {}),
  } as any;
  const sessionState = startSession(sig, session);

  const now = Date.now();
  let { tickResult } = tickWithStrategy(sig, world, session, sessionState, null, null, now);

  // Create a local mutable copy of FORCE_RESPONSES for this session
  const responsesPool = FORCE_RESPONSES ? [...FORCE_RESPONSES] : undefined;

  // If forcing and no natural encounter, create a synthetic one
  if (!tickResult.encounter && (FORCE_LINE || FORCE_STAGE || FORCE_MODALITY)) {
    const synthLine = FORCE_LINE ?? 'Cognitive' as Line;
    const synthStage = FORCE_STAGE ?? 'Red' as Stage;
    const synthModality = FORCE_MODALITY ?? 'Deterministic' as Modality;
    const synthHolon = world.holons[0] ?? { id: 'synthetic', name: 'The Examiner', narrativeRole: 'guide' };
    const syntheticEncounter: ScheduledEncounter = {
      id: `synthetic:${synthLine}:${synthStage}:${now}`,
      moduleRef: `${synthLine}:${synthStage}`,
      modality: synthModality,
      targetLines: [synthLine],
      stage: synthStage,
      holonSource: synthHolon.id ?? 'synthetic',
      shadowTarget: null,
      polarityMode: 'Exploring',
      difficulty: 0.5,
      sessionPosition: 'peak',
      priority: 0.999,
      driveTarget: null,
      executionMode: 'capacity',
    };
    if (VERBOSE) warn(`No natural encounter at ${synthLine}:${synthStage} — using synthetic encounter`);
    tickResult = { ...tickResult, encounter: syntheticEncounter };
  }

  if (!tickResult.encounter) {
    error('No encounter available');
    return;
  }

  separator('Encounter');
  printEncounter(tickResult.encounter);

  const result = await runAgenticEncounter(tickResult.encounter, sig, world, [], responsesPool);

  separator('Result');
  info('narrative', result.narrativeSummary);
}

// ── Full session mode ─────────────────────────────────────────────────
async function runFullSession(): Promise<void> {
  banner('CCRPG Session Runner');

  // Boot
  if (!JSON_MODE) console.log('\n[1/4] Booting registries...');
  bootRegistries();
  const moduleRegistry = bootModuleRegistry();
  (globalThis as any).__moduleRegistry = moduleRegistry;
  success(`${moduleRegistry.count()} assessment modules loaded`);

  // Holons
  if (!JSON_MODE) console.log('\n[2/4] Loading world...');
  const world = loadHolons();
  const npcCount = world.holons.filter(h => h.kind === 'NPC').length;
  success(`${world.holons.length} holons (${npcCount} NPCs)`);

  // Significator
  if (!JSON_MODE) console.log('\n[3/4] Creating Significator...');
  const sig = createDefaultSignificator();
  printSignificator(sig);

  // Session
  if (!JSON_MODE) console.log('\n[4/4] Starting session...');
  const session: SessionContext = {
    encountersSoFar: 0,
    sessionDurationMs: 0,
    targetSessionLength: encounterCount,
    recentLines: [],
    ...(FORCE_LINE ? { forceLine: FORCE_LINE } : {}),
    ...(FORCE_STAGE ? { forceStage: FORCE_STAGE } : {}),
    ...(FORCE_MODALITY ? { forceModality: FORCE_MODALITY } : {}),
  } as any;
  let sessionState = startSession(sig, session);

  // Declare mutable state BEFORE the banner so it can reference them
  let currentSig = sig;
  let currentWorld = world;

  banner('SESSION START');
  renderCCIDisplay(sessionState.cci);
  info('theme', `${C.cyan}${sessionState.strategy.theme}${C.reset}`);
  info('target', `${encounterCount} encounters`);
  console.log('');
  renderAltitudesChart(currentSig);
  console.log('');
  renderShadows(currentSig);
  renderDrives(currentSig);

  // World-building atmosphere
  if (!JSON_MODE) {
    const atmospheres = [
      `${C.dim}The world stirs with latent potential. Fragments of memory surface — echoes of journeys not yet taken.${C.reset}`,
      `${C.dim}A pale light filters through the veil. The architecture of consciousness awaits your engagement.${C.reset}`,
      `${C.dim}The field of development hums with quiet energy. Each encounter will shape the landscape of your becoming.${C.reset}`,
      `${C.dim}Between the seen and unseen, the developmental engines prepare their catalysts. Step forward.${C.reset}`,
    ];
    console.log(`\n  ${atmospheres[Math.floor(Math.random() * atmospheres.length)]}`);
  }

  emitEvent('session_started', {
    cci: sessionState.cci.composite,
    theme: sessionState.strategy.theme,
    targetEncounters: encounterCount,
  });
  let completedCount = 0;
  const now = Date.now();
  const history: ConsequenceRecord[] = [];
  // Create a local mutable copy of FORCE_RESPONSES per session so --responses works predictably
  const responsesPool = FORCE_RESPONSES ? [...FORCE_RESPONSES] : undefined;

  for (let i = 0; i < encounterCount; i++) {
    separator(`Encounter ${i + 1}/${encounterCount}`);

    // Feed back the PREVIOUS encounter's response to apply consequences
    // NOTE: Don't pass prevResponse to tickWithStrategy — the orchestrator already
    // applies consequences via processOutcome + applyConsequences. Passing it here
    // would double-count encounters (totalEncounters increments twice per encounter).
    let { tickResult, sessionState: newState } = tickWithStrategy(
      currentSig,
      currentWorld,
      { ...session, encountersSoFar: i, sessionDurationMs: i * 5000 },
      sessionState,
      null,
      null,
      now + i * 5000,
    );

    currentSig = tickResult.sig;
    currentWorld = tickResult.world;
    sessionState = newState;

    // If no natural encounter and forcing is active, create a synthetic one
    if (!tickResult.encounter && (FORCE_LINE || FORCE_STAGE || FORCE_MODALITY)) {
      const synthLine = FORCE_LINE ?? 'Cognitive' as Line;
      const synthStage = FORCE_STAGE ?? 'Red' as Stage;
      const synthModality = FORCE_MODALITY ?? 'Deterministic' as Modality;
      const synthHolon = currentWorld.holons[0] ?? { id: 'synthetic', name: 'The Examiner', narrativeRole: 'guide' };
      const syntheticEncounter: ScheduledEncounter = {
        id: `synthetic:${synthLine}:${synthStage}:${now + i * 5000}`,
        moduleRef: `${synthLine}:${synthStage}`,
        modality: synthModality,
        targetLines: [synthLine],
        stage: synthStage,
        holonSource: synthHolon.id ?? 'synthetic',
        shadowTarget: null,
        polarityMode: 'Exploring',
        difficulty: 0.5,
        sessionPosition: 'peak',
        priority: 0.999,
        driveTarget: null,
        executionMode: 'capacity',
      };
      if (VERBOSE) warn(`No natural encounter found at ${synthLine}:${synthStage} — using synthetic encounter`);
      tickResult = { ...tickResult, encounter: syntheticEncounter };
    }

    if (!tickResult.encounter) {
      warn('No encounter available — skipping');
      continue;
    }

    // Show session position and encounter header
    const encProgress = (tickResult.encounter.sessionPosition === 'warmup' ? 0.1
      : tickResult.encounter.sessionPosition === 'cooldown' ? 0.9 : 0.5);
    renderSessionPosition(`${i + 1}/${encounterCount}`, tickResult.encounter.sessionPosition, encProgress);
    printEncounter(tickResult.encounter);

    // Transition indicator
    if (i > 0 && !JSON_MODE) {
      const transitions = [
        `${C.dim}The previous encounter settles into memory. A new catalyst emerges...${C.reset}`,
        `${C.dim}The developmental field shifts. What comes next is precisely what you need...${C.reset}`,
        `${C.dim}Integration ripples outward. The next challenge crystallizes...${C.reset}`,
        `${C.dim}The veil parts once more. A new mirror reflects...${C.reset}`,
      ];
      console.log(`\n  ${transitions[Math.floor(Math.random() * transitions.length)]}`);
    }

    // Run encounter through AgenticOrchestrator (all modalities)
    try {
      const result = await runAgenticEncounter(
        tickResult.encounter, currentSig, currentWorld, history, responsesPool,
      );

      // Apply consequences from the orchestrator result
      const record = result.outcome.consequenceRecord;
      history.push(record);
      currentSig = result.outcome.updatedSig;
      currentWorld = result.outcome.updatedWorld;



      verbose('narrative', result.narrativeSummary);

      // ── Per-encounter state display ──
      const encResult = result.outcome.finalResult;
      if (!JSON_MODE) {
        const passIcon = encResult.passed ? `${C.green}✓ PASSED${C.reset}` : `${C.red}✗ FAILED${C.reset}`;
        console.log(`\n  ${C.bold}Result:${C.reset} ${passIcon}`);
        if (VERBOSE) {
          // Show drive signals with shadow quadrant labels
          const ds = result.outcome.consequenceRecord.polarityTrace.driveDirectionality;
          const driveEntries = Object.entries(ds).map(([k, v]) => {
            const short = k.slice(0, 3);
            const suffix = SHADOW_LABELS[v] ?? v.slice(0, 4);
            if (suffix) {
              const col = v.startsWith('Dark') ? C.red : C.yellow;
              return `${C.dim}${short}:${col}${suffix}${C.reset}`;
            }
            return `${C.dim}${short}:${C.green}✓${C.reset}`;
          });
          console.log(`  ${C.dim}drives:${C.reset} ${driveEntries.join(' ')}`);
        }
        // Show shadow status
        const shadow = result.outcome.consequenceRecord.shadowSurfaced;
        if (shadow) {
          console.log(`  ${C.yellow}⚠ shadow:${C.reset} ${C.yellow}${shadow}${C.reset}`);
        }

      }

      if (VERBOSE) {
        verbose('feedback', result.outcome.feedback.slice(0, 200));
        verbose('updatedEncounters', String(currentSig.totalEncounters));
      }

      emitEvent('encounter_completed', {
        encounter: tickResult.encounter.id,
        modality: tickResult.encounter.modality,
        module: tickResult.encounter.moduleRef,
        passed: result.outcome.finalResult.passed,
        narrative: result.narrativeSummary,
        totalEncounters: currentSig.totalEncounters,
      });

      completedCount++;
    } catch (err: any) {
      error(`Encounter failed: ${err.message || err}`);
      emitEvent('encounter_error', { encounter: tickResult.encounter.id, error: err.message });
    }

      // Check transformation
    if (tickResult.transformation) {
      if (!JSON_MODE) console.log(`\n  ${C.magenta}⚡ TRANSFORMATION: ${tickResult.transformation.targetStage}${C.reset}`);
      emitEvent('transformation', { targetStage: tickResult.transformation.targetStage, readiness: tickResult.transformation.readiness });
    }

    // Only show bleed-through for the first encounter (subsequent ones are verbose)
    if (i === 0 && tickResult.bleedThrough.length > 0) {
      info('bleedThrough (first 10)', tickResult.bleedThrough.slice(0, 10).join(', ') + `... (${tickResult.bleedThrough.length} total)`);
    }

  }

  // Session end — apply theta-decay and persist
  const sessionEnd = endSession(currentSig, sessionState, now + encounterCount * 5000);

  banner('SESSION END');

  // Session closure narrative
  if (!JSON_MODE) {
    // Track pass/fail from consequence records — check if the polarity trace
    // indicates a healthy integration (HealthyBalanced on all drives = passed)
    const passedCount = history.filter(r => {
      const dirs = Object.values(r.polarityTrace.driveDirectionality);
      return dirs.every(d => d === 'HealthyBalanced');
    }).length;
    const failedCount = completedCount - passedCount;
    const shadowsSurfaced = sessionEnd.summary.shadowsSurfaced;
    const altShifts = history.filter(r => r.altitudeShift !== null).length;

    const closureNarratives = [
      `The veil settles. ${completedCount} encounters etched their mark upon the developmental landscape. ${passedCount > failedCount ? `${C.green}More capacities were integrated than deferred${C.reset}.` : `${C.yellow}The tension holds — integration remains the work ahead${C.reset}.`}${altShifts > 0 ? ` ${C.magenta}${altShifts} line${altShifts > 1 ? 's' : ''} advanced${C.reset}.` : ''}${shadowsSurfaced > 0 ? ` ${C.red}${shadowsSurfaced} shadow${shadowsSurfaced > 1 ? 's' : ''} surfaced for attention${C.reset}.` : ''}`,
      `${C.dim}The session closes. Each encounter was a mirror — reflecting not who you are, but who you are becoming.${C.reset}`,
    ];
    console.log(`\n  ${closureNarratives[0]}`);
    console.log(`  ${closureNarratives[1]}`);
  }

  info('encounters completed', String(completedCount));
  info('total encounters', String(currentSig.totalEncounters));
  info('total sessions', String(sessionEnd.sig.totalSessions));

  // Show developmental trajectory
  console.log('');
  renderCCIDisplay(sessionState.cci);
  console.log('');
  renderAltitudesChart(currentSig);
  console.log('');
  renderShadows(currentSig);
  renderDrives(currentSig);

  // Shadow summary
  if (sessionEnd.summary.shadowsSurfaced > 0) {
    info('shadows surfaced', String(sessionEnd.summary.shadowsSurfaced));
    info('shadows resolved', String(sessionEnd.summary.shadowsResolved));
  }

  if (VERBOSE) {
    console.log('\nFinal Significator:');
    printSignificator(sessionEnd.sig);
  }

  emitEvent('session_ended', {
    encountersCompleted: completedCount,
    totalEncounters: currentSig.totalEncounters,
    totalSessions: sessionEnd.sig.totalSessions,
    shadowsSurfaced: sessionEnd.summary.shadowsSurfaced,
    shadowsResolved: sessionEnd.summary.shadowsResolved,
    finalStage: sessionEnd.sig.currentStage,
  });
}

// ── Main ──────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  if (!JSON_MODE) {
    console.log(`\n${C.bold}CCRPG CLI Game Runner${C.reset}`);
    console.log(`${C.dim}Mode: ${mode} | Headless: ${HEADLESS} | LLM: ${LLM_ACTIVE ? 'active' : 'fallback'} | Model: ${ACTIVE_MODEL} | Verbose: ${VERBOSE} | JSON: ${JSON_MODE}${C.reset}`);
  }

  try {
    switch (mode) {
      case 'diagnostic':
        await runDiagnostic();
        break;
      case 'encounter':
        await runSingleEncounter();
        break;
      case 'session':
      case 'full':
      default:
        await runFullSession();
        break;
    }
  } catch (err: any) {
    error(`Fatal: ${err.message || err}`);
    if (!JSON_MODE) console.error(err.stack);
    emitEvent('fatal', { error: err.message, stack: err.stack });
  } finally {
    rl?.close();
  }
}

main();
