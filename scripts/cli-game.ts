#!/usr/bin/env node
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
 *   npx tsx scripts/cli-game.ts --new-game               # start fresh (delete saved progress)
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import chalk from 'chalk';
import { select, text as clackText } from '@clack/prompts';
import ora from 'ora';
import boxen from 'boxen';
import { Command } from 'commander';

const VERSION = '0.1.0';

// ── Commander program definition (before any arg-dependent code) ─────
// ponytail: commander handles help generation, manual printHelp() removed
const program = new Command()
  .name('ccrpg')
  .version(VERSION)
  .description('CCRPG')
  .option('--headless', 'Run without user interaction')
  .option('--json', 'Machine-readable JSON output')
  .option('--verbose', 'Show full narrative and feedback')
  .option('--dev', 'Developer mode: show holistic primitives (G_z/P_z, rayProfile, phase position)')
  .option('--no-llm', 'Disable LLM, use module assessments only')
  .option('--agent', 'Use the Persistent Developmental Agent (15-tool, session-persistent) instead of AgenticOrchestrator')
  .option('--new-game', 'Start fresh (delete saved progress)')
  .option('-e, --encounters <n>', 'Number of encounters', '20')
  .option('-m, --model <name>', 'Override LLM model name')
  .option('-l, --line <line>', 'Force a specific line')
  .option('-s, --stage <stage>', 'Force a specific stage')
  .option('--modality <mod>', 'Force a specific modality')
  .option('--force-shadow <quadrant>', 'Force a shadow quadrant')
  .option('--skip-calibration', 'Skip calibration, default all lines to Red');

program
  .command('setup')
  .description('Configure LLM and preferences');
program
  .command('status')
  .description('Show current save state');
program
  .command('new-game')
  .description('Reset progress and start fresh');
program
  .command('diagnostic')
  .description('Show system diagnostics');
program
  .command('session')
  .description('Start an interactive session');

// ponytail: .action() prevents commander from showing help when no subcommand given
program.action(() => {});

// Early parse for --model flag (before env bootstrap)
program.parseOptions(process.argv.slice(2));
const earlyModelOverride = program.opts().model;

const CONFIG_DIR = path.join(os.homedir(), '.ccrpg');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

// ── Config file loading ──────────────────────────────────────────────
interface CCRPGConfig {
  llm?: {
    provider?: 'ollama' | 'openai' | 'anthropic' | 'gemini' | 'custom';
    apiKey?: string;
    baseUrl?: string;
    model?: string;
  };
  session?: { defaultEncounters?: number; defaultMode?: string; };
}
function loadConfig(): CCRPGConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')) as CCRPGConfig;
  } catch { /* ignore */ }
  return {};
}
function saveConfig(config: CCRPGConfig): void {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

// ── Env bootstrap (must come before any project imports) ──────────────
const fileConfig = loadConfig();
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

// Config priority: CLI flag > env var > ~/.ccrpg/config.json > built-in defaults
const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_LLM_API_KEY || fileConfig.llm?.apiKey || 'sk-placeholder';
const baseUrl = process.env.VITE_LLM_BASE_URL || fileConfig.llm?.baseUrl || 'https://generativelanguage.googleapis.com/v1beta/openai';
const model = earlyModelOverride || process.env.VITE_LLM_MODEL || fileConfig.llm?.model || 'gemma-4-31b-it';
const provider = process.env.VITE_LLM_PROVIDER || fileConfig.llm?.provider || 'gemini';

// Set process.env so LLMClient's getEnvVal() fallback works in Node.js
process.env.VITE_LLM_BASE_URL = baseUrl;
process.env.VITE_LLM_API_KEY = apiKey;
process.env.VITE_LLM_MODEL = model;
process.env.VITE_LLM_PROVIDER = provider;

(globalThis as any).import = {
  meta: {
    env: {
      VITE_LLM_BASE_URL: baseUrl,
      VITE_LLM_API_KEY: apiKey,
      VITE_LLM_MODEL: model,
      VITE_LLM_PROVIDER: provider,
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
import { startSession, startSessionWithTDG, tickWithStrategy, endSession, endSessionAsync, applyResponseOnly, getTDGTransformationPressure, type SessionState } from '../src/core/GameLoop.js';
import { createInitialUserMatrixModel } from '../src/core/engines/UserMatrixModel.js';
import { AgenticOrchestrator, type AgenticUIHandler } from '../src/core/assessments/AgenticOrchestrator.js';
import { PersistentAgent } from '../src/core/agent/PersistentAgent.js';
import { runPersistentAgentEncounter } from '../src/core/agent/PersistentAgentBridge.js';
import { startTDGBridge, stopTDGBridge, getTDGBridgeStatus, registerTDGTools } from '../src/infra/tdg/TDGBridge.js';
import { createCCRPGToolRegistry } from '../src/core/agent/ToolRegistry.js';
import type { ModuleRegistry } from '../src/core/assessments/registry.js';
import type { AskUserQuestionParams, AskUserQuestionResult, UserAnswer } from '../src/core/assessments/agentTypes.js';
import { loadSave, saveGame, hasSave, deleteSave, saveWorldState, loadWorldState, deleteWorldSave, saveAll, deleteAllSaves } from '../src/infra/persistence/SaveRepository.js';

import holonsJson from '../src/core/data/red-layer-holons.json';
import type { ConsequenceRecord } from '../src/core/domain/ConsequenceRecord.js';
import type { Modality } from '../src/core/domain/enums.js';
import { thresholdToStage } from '../src/core/usecases/ThresholdMaps.js';
import { computeConfidence } from '../src/core/assessments/engine.js';
import type { TrialResult } from '../src/core/assessments/types.js';
import { renderLayers, renderLayersCompact } from '../src/game/cli/LayerRenderer.js';
import { detectBleedThrough } from '../src/core/engines/ThetaDecay.js';
import { toSnapshot } from '../src/core/domain/SignificatorSnapshot.js';
import { computeCCI } from '../src/core/engines/CCIEngine.js';
import { SessionAgent } from '../src/core/assessments/SessionAgent.js';

// ── Full parse with subcommands (after project imports) ──────────────
program.parse();
const opts = program.opts();
const subcommand = program.args[0] as string | undefined;

const HEADLESS = opts.headless ?? false;
const VERBOSE = opts.verbose ?? false;
const JSON_MODE = opts.json ?? false;
const DEV_MODE = (opts as any).dev ?? false;
const NO_LLM = opts.noLlm ?? false;
let LLM_ACTIVE = !NO_LLM && apiKey !== 'sk-placeholder';
const ACTIVE_MODEL = opts.model ?? model;
/** Phase 3: --agent routes encounters through the Persistent Developmental Agent (15-tool, session-persistent). Default: AgenticOrchestrator (2-tool, 4-exchange budget). */
const USE_PERSISTENT_AGENT = (opts as any).agent ?? false;
const encounterCount = parseInt(opts.encounters ?? String(fileConfig.session?.defaultEncounters ?? 20), 10);

const FORCE_LINE = opts.line as Line | undefined;
const FORCE_STAGE = opts.stage as Stage | undefined;
const FORCE_MODALITY = opts.modality as Modality | undefined;
const FORCE_SHADOW = opts.forceShadow as string | undefined;
const FORCE_RESPONSES = undefined; // ponytail: --responses removed, wasn't in commander spec
const NEW_GAME = opts.newGame ?? false;
const SKIP_CALIBRATION = opts.skipCalibration ?? false;

// ── Helpers ───────────────────────────────────────────────────────────
// ponytail: chalk auto-resets between calls, no explicit reset needed

function banner(text: string): void {
  if (!JSON_MODE) console.log(`\n${chalk.bold.cyan(`═══ ${text} ═══`)}`);
}

function info(label: string, value: string): void {
  if (!JSON_MODE) console.log(`  ${chalk.dim(label + ':')} ${value}`);
}

function success(text: string): void {
  if (!JSON_MODE) console.log(`  ${chalk.green('✓')} ${text}`);
}

function warn(text: string): void {
  if (!JSON_MODE) console.log(`  ${chalk.yellow('⚠')} ${text}`);
}

function error(text: string): void {
  if (!JSON_MODE) console.log(`  ${chalk.red('✗')} ${text}`);
}

function separator(label: string): void {
  if (!JSON_MODE) console.log(boxen(chalk.bold(label), {
    padding: { left: 1, right: 1 },
    borderStyle: 'round',
    borderColor: 'cyan',
    margin: { top: 1, bottom: 0 },
  }));
}

function verbose(label: string, value: string): void {
  if (VERBOSE && !JSON_MODE) console.log(`  ${chalk.magenta(label + ':')} ${value}`);
}

// Interactive prompt helper — uses @clack/prompts for beautiful UI
async function ask(q: string): Promise<string> {
  if (HEADLESS || JSON_MODE) return '';
  const answer = await clackText({ message: q, defaultValue: '' });
  return typeof answer === 'string' ? answer : '';
}

// ── LLM availability check (3s timeout, uses chat/completions) ──────
async function checkLLMAvailability(url: string, key: string): Promise<boolean> {
  if (key === 'sk-placeholder') return false;
  const isAnthropic = url.includes('anthropic.com');
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    let res: Response;
    if (isAnthropic) {
      res = await fetch(`${url}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 1,
        }),
        signal: controller.signal,
      });
    } else {
      res = await fetch(`${url}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 1,
        }),
        signal: controller.signal,
      });
    }
    clearTimeout(timeout);
    if (res.ok) return true;
    if (res.status === 401 || res.status === 403) return false;
    if (res.status >= 400 && res.status < 500 && res.status !== 429) return false;
    return true;
  } catch {
    return false;
  }
}

// ── Holon loading ─────────────────────────────────────────────────────
function loadHolons(): WorldState {
  // Try to load saved world state first (skip if --new-game)
  if (!NEW_GAME) {
    const savedWorld = loadWorldState();
    if (savedWorld && savedWorld.holons?.length) return savedWorld;
  }
  const holons = holonsJson as any[];
  return createInitialWorldState(holons);
}

// ── Quick Calibration ────────────────────────────────────────────────

const CALIBRATION_PROMPTS: Record<string, { prompt: string; options: string[] }> = {
  Cognitive: {
    prompt: 'Describe your strategy for solving complex problems. How do you handle interference or prioritize competing goals?',
    options: [
      'Systematically isolate variables and execute step-by-step.',
      'Trust intuitive patterns and adapt resources dynamically as needed.',
      'Gather community perspectives and build consensus on the plan.',
    ],
  },
  Emotional: {
    prompt: 'Two people you care about have deeply conflicting needs. Describe what you feel and how you navigate the emotional tension.',
    options: [
      'Prioritize rules or roles to establish order.',
      'Empathize with both perspectives and sit with the tension.',
      'Seek a higher systemic resolution that transcends their individual desires.',
    ],
  },
  Moral: {
    prompt: 'Your friend broke a rule to prevent minor harm to a stranger. Authority asks you what happened. What do you say, and why?',
    options: [
      'Report the truth immediately because rules are absolute.',
      'Protect my friend because personal loyalty comes first.',
      'Explain the nuance and justify the rule-breaking to the authority.',
    ],
  },
  Intrapersonal: {
    prompt: 'Describe a time you changed your mind about something important. What shifted in your perspective?',
    options: [
      'I realized my old view was factually incorrect based on new data.',
      'I integrated a completely different worldview that expanded my own.',
      'I realized my previous stance was causing harm to those around me.',
    ],
  },
  Spiritual: {
    prompt: 'What does it mean to act in alignment with the greatest good, and how do you experience this in your daily life?',
    options: [
      'Strict adherence to cosmic law and duty.',
      'Acting from a place of unconditional love and service to others.',
      'Dissolving the ego to act as a clear channel for the Creator.',
    ],
  },
  Interpersonal: {
    prompt: 'Describe how you approach resolving a disagreement with someone who holds a completely different set of core values.',
    options: [
      'Explain my rational points and let the facts speak for themselves.',
      'Listen deeply to their perspective to find common emotional ground.',
      'Look for the evolutionary synthesis that makes room for both viewpoints.',
    ],
  },
};

// Index 0 = Red level, 1 = Amber level, 2 = Orange level
const CHOICE_THRESHOLDS: Record<string, [number, number, number]> = {
  Cognitive: [1.8, 2.2, 2.8],
  Emotional: [2, 2.5, 3],
  Moral: [2, 2.5, 3],
  Intrapersonal: [2, 2.5, 3],
  Spiritual: [2, 2.5, 3],
  Interpersonal: [2, 2.5, 3],
};

const HOLD_TARGETS: Record<string, number> = {
  Somatic: 4000,
  Willpower: 5000,
};

const CAL_STAGES = ['Infrared', 'Magenta', 'Red', 'Amber', 'Orange', 'Green', 'Turquoise', 'White'] as const;

async function runQuickCalibration(): Promise<Record<Line, Stage>> {
  const altitudes: Partial<Record<Line, Stage>> = {};
  const lines: Line[] = ['Cognitive', 'Emotional', 'Moral', 'Intrapersonal', 'Spiritual', 'Somatic', 'Willpower', 'Interpersonal'];

  banner('Quick Calibration');
  console.log(`  ${chalk.dim('A brief probe of each developmental line to set your starting altitudes.')}\n`);

  for (const line of lines) {
    let stage: Stage = 'Red';
    let confidence = 0.5;
    let trial: TrialResult;

    if (line === 'Somatic' || line === 'Willpower') {
      // ── Hold probe: measure timing accuracy ──
      const target = HOLD_TARGETS[line]!;
      const targetSec = (target / 1000).toFixed(1);

      console.log(`  ${chalk.bold.cyan(line + ':')} ${chalk.dim('Timing probe')}`);
      console.log(`  ${chalk.dim('Press Enter when you think ' + targetSec + ' seconds have passed.')}\n`);

      const startTime = Date.now();
      const answer = await clackText({ message: `Press Enter after ~${targetSec}s...`, defaultValue: '' });
      if (typeof answer === 'symbol') { altitudes[line] = 'Red'; continue; }
      const elapsed = Date.now() - startTime;

      const accuracy = Math.max(0, 1 - Math.abs(elapsed - target) / target);

      let threshold: number;
      if (line === 'Somatic') {
        // Inverted: lower RT = higher stage (range 200-900)
        threshold = 900 - accuracy * 700;
      } else {
        // Standard: higher = better (range 1-12)
        threshold = 1 + accuracy * 11;
      }

      stage = thresholdToStage(line, threshold);

      trial = {
        taskId: `cal-${line.toLowerCase()}`,
        timestamp: Date.now(),
        dimensions: { accuracy, response_time: accuracy },
        rawResponse: elapsed,
        durationMs: elapsed,
      };

      confidence = computeConfidence([trial], 0.5);

    } else {
      // ── LLM dialogue probe: multiple choice ──
      const probe = CALIBRATION_PROMPTS[line];
      if (!probe) { altitudes[line] = 'Red'; continue; }

      console.log(`  ${chalk.bold.cyan(line + ':')}`);
      console.log(`  ${chalk.dim(probe.prompt)}\n`);

      const choice = await select({
        message: `How would you approach this?`,
        options: probe.options.map((opt) => ({ value: opt, label: opt })),
      });

      if (typeof choice === 'symbol') { altitudes[line] = 'Red'; continue; }

      const choiceIdx = probe.options.indexOf(choice as string);
      const idx = choiceIdx >= 0 ? choiceIdx : 0;

      const thresholds = CHOICE_THRESHOLDS[line]!;
      const threshold = thresholds[Math.min(idx, 2)];

      stage = thresholdToStage(line, threshold);

      const depthScores = [0.3, 0.6, 0.85];
      const coherenceScores = [0.4, 0.7, 0.9];

      trial = {
        taskId: `cal-${line.toLowerCase()}`,
        timestamp: Date.now(),
        dimensions: { depth: depthScores[idx], coherence: coherenceScores[idx] },
        rawResponse: idx,
        durationMs: 0,
      };

      confidence = computeConfidence([trial], 0.5);
    }

    altitudes[line] = stage;

    const stageIdx = CAL_STAGES.indexOf(stage as typeof CAL_STAGES[number]);
    const color = stageColor(stage);
    const bar = '■'.repeat(stageIdx + 1) + '○'.repeat(7 - stageIdx);
    console.log(`  ${line.padEnd(14)} ${bar} ${color(stage)} ${chalk.dim('(confidence: ' + confidence.toFixed(2) + ')')}\n`);
  }

  console.log(`\n  ${chalk.bold('Calibration complete:')}`);
  for (const line of lines) {
    const s = altitudes[line] ?? 'Red';
    const color = stageColor(s);
    console.log(`    ${line.padEnd(14)} ${color(s)}`);
  }
  console.log('');

  return altitudes as Record<Line, Stage>;
}

// ── Significator creation (simplified onboarding) ─────────────────────
async function createDefaultSignificator(): Promise<Significator> {
  // Try to load saved state first (skip if --new-game)
  if (!NEW_GAME) {
    const saved = loadSave();
    if (saved) {
      if (!JSON_MODE) console.log(`  ${chalk.green('✓')} Loaded saved progress (${saved.totalEncounters} encounters, stage: ${saved.currentStage})`);
      return saved;
    }
  } else {
    deleteSave();
    deleteWorldSave();
    if (!JSON_MODE) console.log(`  ${chalk.yellow('↻')} Starting new game (previous save deleted)`);
  }

  const allRed: Record<Line, Stage> = {
    Cognitive: 'Red', Emotional: 'Red', Moral: 'Red', Intrapersonal: 'Red',
    Spiritual: 'Red', Somatic: 'Red', Willpower: 'Red', Interpersonal: 'Red',
  };

  // Run quick calibration unless in automated/skip mode
  let altitudes: Record<Line, Stage>;
  if (HEADLESS || NO_LLM || SKIP_CALIBRATION || JSON_MODE) {
    altitudes = allRed;
  } else {
    altitudes = await runQuickCalibration();
  }

  const stageCounts: Record<string, number> = {};
  for (const s of Object.values(altitudes)) {
    stageCounts[s] = (stageCounts[s] ?? 0) + 1;
  }
  let dominantStage: Stage = 'Red';
  let maxCount = 0;
  for (const [s, count] of Object.entries(stageCounts)) {
    if (count > maxCount || (count === maxCount && CAL_STAGES.indexOf(s as typeof CAL_STAGES[number]) > CAL_STAGES.indexOf(dominantStage))) {
      maxCount = count;
      dominantStage = s as Stage;
    }
  }

  return createSignificator('cli-player', altitudes, dominantStage);
}

// ── JSON event emitter for AI-agent consumption ───────────────────────
/** Strip ANSI escape codes from text for clean JSON output */
const ANSI_REGEX = new RegExp(String.raw`\x1b\[[0-9;]*[a-zA-Z]`, 'g');
function stripAnsi(text: string): string {
  return text.replace(ANSI_REGEX, '');
}

function emitEvent(type: string, data: Record<string, unknown>): void {
  if (JSON_MODE) {
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) {
      cleaned[k] = typeof v === 'string' ? stripAnsi(v) : v;
    }
    process.stdout.write(JSON.stringify({ type, ts: Date.now(), ...cleaned }) + '\n');
  }
}

// ── Rendering helpers ────────────────────────────────────────────────

/** Shadow quadrant label map — used by drive display */
const SHADOW_LABELS: Record<string, string> = {
  DarkAddicted: 'DkAddict', DarkAverted: 'DkAvert',
  GoldenAddicted: 'GdAddict', GoldenAverted: 'GdAvert',
  HealthyBalanced: '',
};

// Task 4: Narrative context — map line names to challenge descriptions
const CHALLENGE_NAMES: Record<string, string> = {
  Cognitive: 'Pattern Recognition',
  Emotional: 'Emotional Landscape',
  Moral: 'Moral Dilemma',
  Intrapersonal: 'Self-Reflection',
  Spiritual: 'Meaning-Making',
  Interpersonal: 'Social Cue Reading',
  Somatic: 'Body Awareness',
  Willpower: 'Sustained Attention',
};

/** Stage color helper: returns ANSI color for a given stage */
// ponytail: returns chalk function, caller invokes with text
function stageColor(stage: string): (text: string) => string {
  const colors: Record<string, (text: string) => string> = {
    Infrared: chalk.hex('#8B0000'),
    Magenta: chalk.hex('#BA55D3'),
    Red: chalk.hex('#FF0000'),
    Amber: chalk.hex('#FF8C00'),
    Orange: chalk.hex('#FFA500'),
    Green: chalk.hex('#00C853'),
    Turquoise: chalk.hex('#00CED1'),
    White: chalk.hex('#FFFFFF'),
  };
  return colors[stage] ?? chalk.dim;
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
      if (i < currentIdx) return chalk.dim('■');  // passed stages
      if (i === currentIdx) return color('●'); // current stage
      return chalk.dim('○'); // future stages
    });

    // Segment label: first 3 stages, current, last 2
    const segLabels = stageKeys.map((s, i) => {
      if (i === 0 || i === stageKeys.length - 1 || i === currentIdx) {
        return i === currentIdx ? color(stageAbbr(s)) : chalk.dim(stageAbbr(s));
      }
      return '  '; // skip most labels for compactness
    });

    // Pad line name to 15 chars for alignment
    const paddedLine = line.padEnd(14);
    if (!JSON_MODE) {
      console.log(`  ${paddedLine} ${bars.join('')} ${chalk.dim(current)}`);
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

  console.log(`  ${chalk.bold('CCI')}  ${chalk.cyan(bar)} ${chalk.bold(pct + '%')}`);

  // Show dimensions in a compact row
  const dims = Object.entries(cci.dimensions).map(([k, v]) => {
    const labels: Record<string, string> = {
      altitude: 'alt', driveHealth: 'drive', polarity: 'polar',
      shadowTopology: 'shadow', transformationReadiness: 'xform',
    };
    const short = labels[k] ?? k.slice(0, 5);
    const val = (v * 100).toFixed(0);
    const color = v > 0.6 ? chalk.green : v > 0.3 ? chalk.yellow : chalk.red;
    return `${chalk.dim(short + ':')}${color(val + '%')}`;
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
      bar += i <= pos ? chalk.blue('▰') : chalk.dim('▱');
    } else if (position === 'peak') {
      bar += i <= pos ? chalk.magenta('▰') : chalk.dim('▱');
    } else {
      bar += i <= pos ? chalk.green('▰') : chalk.dim('▱');
    }
  }
  const posLabel = position === 'warmup' ? chalk.blue('WARMUP')
    : position === 'peak' ? chalk.magenta('PEAK')
    : chalk.green('COOLDOWN');
  console.log(`  ${posLabel} ${bar} ${chalk.dim(label)}`);
}

/** Render active shadows with quadrant labels */
function renderShadows(sig: Significator): void {
  if (JSON_MODE) return;
  const active = sig.shadows.entries.filter(e => !e.resolvedAt);
  if (active.length === 0) {
    info('shadows', `${chalk.green('none active')}`);
    return;
  }

  // Group by quadrant
  const groups: Record<string, typeof active> = {};
  for (const s of active) {
    const key = s.quadrant ?? 'Unknown';
    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
  }

  const qColors: Record<string, (text: string) => string> = {
    DarkAddiction: chalk.hex('#FF0000'),
    DarkAllergy: chalk.hex('#FF6347'),
    GoldenAddiction: chalk.hex('#FFD700'),
    GoldenAllergy: chalk.hex('#808080'),
  };

  const parts = Object.entries(groups).map(([q, entries]) => {
    const color = qColors[q] ?? chalk.yellow;
    const sev = entries.map(e => (e.severity * 100).toFixed(0)).join('/');
    return color(q + (entries.length > 1 ? '×' + entries.length : '') + '(' + sev + '%)');
  });
  // U.3 FIX: Show count clearly instead of misleading CCI dimension percentage
  console.log(`  ${chalk.yellow('⚠')} shadows [${active.length}]: ${parts.join(' ')}`);
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
    const color = fix > 0.5 ? chalk.red : w > 0.3 ? chalk.green : chalk.yellow;
    const fixIcon = fix > 0.7 ? '⚠' : fix > 0.4 ? '~' : ' ';
    const dirIcon = w > 0.6 ? '↑' : w < 0.35 ? '↓' : ' ';
    console.log(`  ${chalk.dim(d.padEnd(10))} ${color(bar)} ${fixIcon}${dirIcon} ${chalk.dim(fix > 0.1 ? `fix:${(fix * 100).toFixed(0)}%` : '')}`);
  }
}

/** Render Direct Questioning progress — Veil-compliant (no line names, no stages, no pass/fail counts) */
function renderLinesProgress(_sig: Significator, history: ConsequenceRecord[]): void {
  if (JSON_MODE) return;
  // Veil compliance: show only the count of questions answered so far,
  // not which lines, not their stages, not pass/fail counts.
  const totalAnswered = history.length;
  const totalQuestions = 8;
  const barWidth = 16;
  const filled = Math.round((totalAnswered / totalQuestions) * barWidth);
  const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);
  console.log(`  ${chalk.bold('Progress')}  ${chalk.cyan(bar)} ${totalAnswered}/${totalQuestions}`);
  console.log('');
}

/** Render radar chart showing developmental profile across 8 lines */
function renderRadarChart(sig: Significator): void {
  if (JSON_MODE) return;
  const lines: Line[] = ['Cognitive', 'Emotional', 'Moral', 'Intrapersonal', 'Spiritual', 'Somatic', 'Willpower', 'Interpersonal'];
  const allStages = ['Infrared', 'Magenta', 'Red', 'Amber', 'Orange', 'Green', 'Turquoise', 'White'] as const;

  console.log(`\n  ${chalk.bold('Developmental Profile — Radar Chart')}\n`);

  for (const line of lines) {
    const stage = sig.altitudes[line] ?? 'Red';
    const stageIdx = allStages.indexOf(stage as typeof allStages[number]);
    const color = stageColor(stage);

    const barLen = 16;
    const filled = Math.round((stageIdx / (allStages.length - 1)) * barLen);
    const bar = '█'.repeat(filled) + '░'.repeat(barLen - filled);

    console.log(`  ${chalk.dim(line.padEnd(14))} ${color(bar)} ${color(stage)}`);
  }
  console.log('');
}

// ── Print state ───────────────────────────────────────────────────────
function printSignificator(sig: Significator): void {
  // T-3.4 (Veil compliance): printSignificator is only called from
  // diagnostic/verbose paths. Show only id + qualitative state.
  info('id', sig.id);
  const stageAesthetics: Record<string, string> = {
    Infrared: 'cave-dark, primal', Magenta: 'spirit-saturated, symbolic',
    Red: 'fortress-sharp, weapon-walls', Amber: 'cathedral-ordered, gold-stone',
    Orange: 'mechanism-precise, steel-glass', Green: 'garden-lush, earth-toned',
    Turquoise: 'crystalline, translucent', White: 'luminous silence, spacious',
  };
  info('resonance', stageAesthetics[sig.currentStage] ?? 'shifting, becoming');
}

function printEncounter(enc: ScheduledEncounter): void {
  const isShadow = enc.executionMode === 'shadow';
  const posColor = enc.sessionPosition === 'warmup' ? chalk.blue
    : enc.sessionPosition === 'cooldown' ? chalk.green : chalk.magenta;
  const posTag = enc.sessionPosition === 'warmup' ? 'WARMUP'
    : enc.sessionPosition === 'cooldown' ? 'COOLDOWN' : 'PEAK';

  if (isShadow && !JSON_MODE) {
    console.log(`  ${chalk.bgRed.white.bold(' ◆ SHADOW-WORK ')} ${chalk.dim('— accumulated shadows exceed threshold')}`);
  }

  // Veil compliance: no holonSource ID, no shadowTarget quadrant name, no executionMode label.
  // Show only the arc position (warmup/peak/cooldown) which is structural, not developmental.
  info('arc', `${posColor(posTag)}`);
  if (isShadow) {
    // No quadrant name — just the shadow-work indicator
    info('mode', `${chalk.bgRed.white(' shadow ')}`);
  }
}

// ── AgenticOrchestrator encounter handler (all modalities) ────────────
async function runAgenticEncounter(
  encounter: ScheduledEncounter,
  sig: Significator,
  world: WorldState,
  history: ConsequenceRecord[],
  responsesPool?: number[],
  consecutivePasses?: Map<string, number>,
  agentSynthesis?: string,
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
          const isShadow = forcedEncounter.executionMode === 'shadow';
          let modHeader = '';

          switch (mod) {
            case 'Deterministic':
              modHeader = isShadow
                ? `${chalk.bold.red('◆ [SHADOW TRIAL] ▬▬▬▬▬▬▬▬▬▬▬▬▬░ (9.5s remaining)')}\n`
                : `${chalk.bold.red('⏳ [TIMED TRIAL] ▬▬▬▬▬▬▬▬▬▬▬▬▬░ (9.5s remaining)')}\n`;
              break;
            case 'LanguageReflective':
              modHeader = isShadow
                ? `${chalk.bold.red('◆ [SHADOW REFLECTION] • Confront the unresolved pattern •')}\n`
                : `${chalk.bold.blue('🧘 [REFLECTION BEAT] • Tune in to your inner state •')}\n`;
              break;
            case 'ScenarioChoice':
              modHeader = isShadow
                ? `${chalk.bold.red('◆ [SHADOW CROSSROADS] • The shadow demands a choice •')}\n`
                : `${chalk.bold.yellow('🔀 [DECISION CROSSROADS] • A path diverges •')}\n`;
              break;
            case 'Embodied':
              modHeader = isShadow
                ? `${chalk.bold.red('◆ [SHADOW SCAN] • Feel where the shadow lives in the body •')}\n`
                : `${chalk.bold.green('💓 [SOMATIC SCAN] • Focus on body sensation •')}\n`;
              break;
            case 'Strategic':
              modHeader = isShadow
                ? `${chalk.bold.red('◆ [SHADOW WAR-TABLE] • Map the shadow\'s strategy •')}\n`
                : `${chalk.bold.magenta('♟️ [TACTICAL WAR-TABLE] • Assess constraints •')}\n`;
              break;
            case 'SocialCooperative':
              modHeader = isShadow
                ? `${chalk.bold.red('◆ [SHADOW DIPLOMACY] • Navigate the shadow in relation •')}\n`
                : `${chalk.bold.cyan('🤝 [DIPLOMACY] • Navigating connection •')}\n`;
              break;
            case 'ImmersiveRPG':
              modHeader = isShadow
                ? `${chalk.bold.red('◆ [SHADOW SCENE] • The shadow writes its chapter •')}\n`
                : `${chalk.bold.yellow('📖 [NARRATIVE SCENE] • The story unfolds •')}\n`;
              break;
            default:
              modHeader = isShadow
                ? `${chalk.bold.red('◆ [SHADOW WORK]')}\n`
                : `${chalk.bold.dim('[' + (mod as string).toUpperCase() + ']')}\n`;
          }

          console.log(`\n  ${modHeader}  ${chalk.magenta('[' + q.header + ']')}`);
          console.log(`  ${chalk.bold(q.question)}`);
          if (q.options?.length) {
            for (let i = 0; i < q.options.length; i++) {
              const opt = q.options[i];
              console.log(`    ${chalk.cyan('[' + (i + 1) + ']')} ${opt.label} — ${opt.description}`);
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

  const  orchestrator = new AgenticOrchestrator({
    encounter: forcedEncounter,
    significator: sig,
    world,
    history,
    conceptIndex: { modules: conceptModules },
    uiHandler,
    module: modRegistry?.get(FORCE_LINE ?? encLine, FORCE_STAGE ?? encStage) ?? baseModule,
    noLlm: !LLM_ACTIVE,
    forceShadow: FORCE_SHADOW,
    consecutivePasses,
    agentSynthesis,
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
  const sig = await createDefaultSignificator();
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

  console.log(`\n${chalk.dim('LLM: ' + (LLM_ACTIVE ? 'active' : 'fallback (placeholder key)') + ' | Endpoint: ' + baseUrl + ' | Model: ' + model)}`);
  console.log(`${chalk.dim('LLM endpoint: ' + baseUrl)}`);
  console.log(`${chalk.dim('LLM model: ' + model)}`);
}

// ── Single encounter mode ─────────────────────────────────────────────
async function runSingleEncounter(): Promise<void> {
  banner('CCRPG Single Encounter');

  bootRegistries();
  const moduleRegistry = bootModuleRegistry();
  (globalThis as any).__moduleRegistry = moduleRegistry;
  success(`${moduleRegistry.count()} modules loaded`);

  const sig = await createDefaultSignificator();
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

  const result = await runAgenticEncounter(tickResult.encounter, sig, world, [], responsesPool, new Map());

  separator('Result');
  info('narrative', result.narrativeSummary);
}

// ── Direct Questioning session — true 8-line flow ──────────────────
async function runDirectQuestioningSession(
  initialSig: Significator,
  initialWorld: WorldState,
): Promise<void> {
  banner('DIRECT QUESTIONING');
  console.log(`  ${chalk.dim('A series of open questions. Answer each in your own words.')}\n`);

  const ALL_LINES: Line[] = ['Cognitive', 'Emotional', 'Moral', 'Intrapersonal', 'Spiritual', 'Interpersonal', 'Somatic', 'Willpower'];
  // ponytail: Fisher-Yates shuffle in-place
  const shuffledLines = [...ALL_LINES];
  for (let i = shuffledLines.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledLines[i]!, shuffledLines[j]!] = [shuffledLines[j]!, shuffledLines[i]!];
  }

  let currentSig = initialSig;
  let currentWorld = initialWorld;
  const history: ConsequenceRecord[] = [];
  const consecutivePasses = new Map<string, number>();
  const agent = new SessionAgent();

  for (let i = 0; i < shuffledLines.length; i++) {
    const line = shuffledLines[i]!;
    const currentStage = currentSig.altitudes[line] ?? 'Red';

    // T-3.4 (Veil compliance): don't leak the line taxonomy name.
    separator(`Question ${i + 1}/8`);

    // ponytail: synthetic encounter forces LanguageReflective modality
    const encounter: ScheduledEncounter = {
      id: `dq-${line}:${currentStage}:${Date.now()}`,
      moduleRef: `${line}:${currentStage}`,
      modality: 'LanguageReflective',
      targetLines: [line],
      stage: currentStage,
      holonSource: 'self-reflection',
      shadowTarget: null,
      polarityMode: 'Exploring',
      difficulty: 0.5,
      sessionPosition: i < 2 ? 'warmup' : i >= 6 ? 'cooldown' : 'peak',
      priority: 1.0,
      driveTarget: null,
      executionMode: 'capacity',
    };

    try {
      const result = await runAgenticEncounter(encounter, currentSig, currentWorld, history, undefined, consecutivePasses, agent.buildSynthesis());

      // Qualitative feedback — no pass/fail, no clinical labels
      const cr = result.outcome.consequenceRecord;
      if (!JSON_MODE) {
        const briefNarrative = result.narrativeSummary.length > 120
          ? result.narrativeSummary.slice(0, 120) + '...'
          : result.narrativeSummary;
        console.log(`\n  ${chalk.dim('\u2726')} ${briefNarrative}`);

        // T-3.4 (Veil compliance): replace "The encounter stirred: ↑ Communion drive, Homeostatic"
        // with a qualitative felt-sense description that doesn't leak drive names.
        const driveEntries = Object.entries(cr.polarityTrace.driveDirectionality);
        const dominantDrive = driveEntries.find(([, v]) => v !== 'HealthyBalanced');
        if (dominantDrive) {
          // Map drive directionality to qualitative felt-sense language
          const feltSense: Record<string, string> = {
            DarkAddicted: 'A familiar pull tugs underneath the surface.',
            DarkAverted: 'Something here is being avoided; the body flinches before the mind catches up.',
            GoldenAddicted: 'A reaching toward the light that skips over the ground beneath your feet.',
            GoldenAverted: 'A resistance to what is trying to emerge.',
            HealthyBalanced: 'Something settles into place without effort.',
          };
          const sense = feltSense[dominantDrive[1] as string] ?? 'Something stirred.';
          console.log(`  ${chalk.dim(sense)}`);
        }

        if (cr.shadowSurfaced) {
          console.log(`  ${chalk.dim('Something beneath the surface stirred.')}`);
        }
      }

      // Feed result to session agent for cross-encounter synthesis
      const driveExpr = cr.polarityTrace.driveDirectionality;
      agent.addEncounter({
        line,
        stage: currentStage,
        narrativeSummary: result.narrativeSummary,
        writeInResponse: result.outcome.playerWriteIn ?? result.narrativeSummary,
        driveExpression: {
          agency: result.outcome.driveScores?.agency ?? (driveExpr.Agency === 'HealthyBalanced' ? 0.6 : 0.3),
          communion: result.outcome.driveScores?.communion ?? (driveExpr.Communion === 'HealthyBalanced' ? 0.6 : 0.3),
          eros: result.outcome.driveScores?.eros ?? (driveExpr.Eros === 'HealthyBalanced' ? 0.6 : 0.3),
          agape: result.outcome.driveScores?.agape ?? (driveExpr.Agape === 'HealthyBalanced' ? 0.6 : 0.3),
        },
        shadowSurfaced: cr.shadowSurfaced,
        passed: result.outcome.finalResult.passed,
        timestamp: Date.now(),
      });

      history.push(cr);
      currentSig = result.outcome.updatedSig;
      currentWorld = result.outcome.updatedWorld;

      // Wave 1.3: Apply the response to GameLoop state engines in Direct Questioning mode too.
      // DQ bypasses tickWithStrategy but should still update UserMatrixModel + transformation state.
      if (result.response) {
        // DQ doesn't have a sessionState from startSession — create a minimal one
        const dqSessionState: SessionState = {
          strategy: { theme: 'balanced-development', weightBias: { thetaUrgency: 1, shadowActivation: 1, polarityAlignment: 1, transformationReadiness: 1, driveCorrection: 1, narrativeCoherence: 1, sessionFit: 1 }, encounterBudget: { totalTarget: 8, warmup: 2, peak: 4, cooldown: 2 }, adjustmentThresholds: { reEvaluationInterval: 5, midSessionAdjustmentThreshold: 0.3 } },
          cci: { composite: 0.5, dimensions: { altitude: 0.3, driveHealth: 0.5, polarity: 0.2, shadowTopology: 0.5, transformationReadiness: 0.2 }, weights: { altitude: 0.15, driveHealth: 0.25, polarity: 0.15, shadowTopology: 0.25, transformationReadiness: 0.2 }, dominantDimension: 'driveHealth', sessionSignals: { recommendedTheme: 'balanced-development', intensityBudget: 0.5, shadowPressure: 'low', transformationProximity: 'distant', driveRebalancingTarget: null, polarityGuidance: { mode: 'exploration', recommendedDiversity: 0.7, temptationFrequency: 0.3 } } },
          recentOutcomes: [],
          encountersSinceRefresh: i,
          transformationState: { phase: currentSig.transformationPhase ?? 'idle', targetStage: currentSig.transformationTargetStage ?? null, sessionsInPhase: currentSig.transformationSessionsInPhase ?? 0, knotsResolved: currentSig.transformationKnotsResolved ?? 0, totalKnots: currentSig.transformationTotalKnots ?? 0 },
          userMatrixModel: (globalThis as any).__userMatrixModel ?? createInitialUserMatrixModel(),
        };
        const applied = applyResponseOnly(
          currentSig, currentWorld, dqSessionState,
          result.response, encounter, Date.now(),
        );
        currentSig = applied.sig;
        currentWorld = applied.world;
        (globalThis as any).__userMatrixModel = applied.sessionState.userMatrixModel;
      }

      emitEvent('dq_line_completed', {
        line, stage: currentStage,
        narrative: result.narrativeSummary,
        totalEncounters: currentSig.totalEncounters,
      });
    } catch (err: any) {
      error(`Encounter failed: ${err.message || err}`);
      emitEvent('dq_line_error', { line, error: err.message });
    }
  }

  // T-3.4: Radar chart removed — Veil violation (shows line×stage matrix).

  // Session end — apply theta-decay and increment totalSessions
  const now = Date.now();
  const sessionState = startSession(currentSig, { encountersSoFar: 8, sessionDurationMs: 0, targetSessionLength: 8, recentLines: [] });
  const sessionEnd = endSession(currentSig, sessionState, now);
  currentSig = sessionEnd.sig;

  // No decorative closing — the session's per-encounter feedback is sufficient.
  // Atmospheric closing lines impose a specific vibe that may not resonate
  // universally and break the flow.

  // Save (P0-5: atomic saveAll for sig + world consistency)
  saveAll(currentSig, currentWorld);
  if (!JSON_MODE) info('save', `${chalk.green('Progress saved')}`);

  emitEvent('session_ended', {
    mode: 'direct',
    linesAssessed: history.length,
    totalEncounters: currentSig.totalEncounters,
    totalSessions: currentSig.totalSessions,
    shadowsSurfaced: currentSig.shadows.activeCount,
    finalStage: currentSig.currentStage,
  });
}

// ── Full session mode ─────────────────────────────────────────────────
async function runFullSession(): Promise<void> {
  banner('CCRPG Session Runner');

  // Boot with ora spinners for clean loading UX
  const s1 = JSON_MODE ? null : ora('Booting registries...').start();
  bootRegistries();
  const moduleRegistry = bootModuleRegistry();
  (globalThis as any).__moduleRegistry = moduleRegistry;
  s1?.succeed(`${moduleRegistry.count()} assessment modules loaded`);

  // LLM availability check
  const s2 = JSON_MODE ? null : ora('Checking LLM availability...').start();
  if (LLM_ACTIVE) {
    const llmUp = await checkLLMAvailability(baseUrl, apiKey);
    if (!llmUp) {
      LLM_ACTIVE = false;
      s2?.warn('LLM unreachable — falling back to module assessments (use --no-llm to skip this check)');
    } else {
      s2?.succeed(`LLM active: ${ACTIVE_MODEL}`);
    }
  } else {
    s2?.info('LLM disabled (--no-llm or no API key)');
  }

  // Holons
  const s3 = JSON_MODE ? null : ora('Loading world...').start();
  const world = loadHolons();
  const npcCount = world.holons.filter(h => h.kind === 'NPC').length;
  s3?.succeed(`${world.holons.length} holons (${npcCount} NPCs)`);

  // Significator
  const s4 = JSON_MODE ? null : ora('Creating Significator...').start();
  const sig = await createDefaultSignificator();
  printSignificator(sig);
  s4?.succeed('Significator ready');
  const session: SessionContext = {
    encountersSoFar: 0,
    sessionDurationMs: 0,
    targetSessionLength: encounterCount,
    recentLines: [],
    ...(FORCE_LINE ? { forceLine: FORCE_LINE } : {}),
    ...(FORCE_STAGE ? { forceStage: FORCE_STAGE } : {}),
    ...(FORCE_MODALITY ? { forceModality: FORCE_MODALITY } : {}),
  } as any;
  // M4: When --agent is set, use the TDG-augmented session start. This blends
  // TDG G_z/P_z into the CCI's metabolicHealth dimension and runs a graph-level
  // reflection to seed the session strategy. No-op (returns baseline) when TDG
  // is not running — zero regression.
  let sessionState = USE_PERSISTENT_AGENT
    ? await startSessionWithTDG(sig, session)
    : startSession(sig, session);

  // Declare mutable state BEFORE the banner so it can reference them
  let currentSig = sig;
  let currentWorld = world;

  // Task 5: Mode selection — player chooses gameplay mode
  let gameMode: string = 'direct'; // ponytail: default to direct-questioning for cleaner UX
  if (!HEADLESS && !JSON_MODE && !FORCE_LINE && !FORCE_MODALITY) {
    const modeChoice = await select({
      message: 'Choose your gameplay mode:',
      options: [
        { value: 'direct', label: 'Direct Questioning — Personality-test style' },
        { value: 'story', label: 'Story-Driven — Immersive RPG narrative' },
      ],
    });
    gameMode = String(modeChoice);
  }
  // M1: When --agent is set, auto-switch to Story mode (the PersistentAgent is
  // wired into the Story-Driven encounter loop, not the Direct Questioning flow).
  // This ensures the --agent flag actually exercises the 15-tool agent + TDG
  // integration rather than being silently ignored. Warn the user so they know.
  if (USE_PERSISTENT_AGENT && gameMode === 'direct') {
    if (!JSON_MODE) {
      info('agent', `${chalk.cyan('--agent')} requires Story-Driven mode — auto-switching.`);
    }
    gameMode = 'story';
  }
  const isDirectMode = gameMode === 'direct';

  // ponytail: Direct Questioning gets its own session flow — 8 lines, write-in, no pass/fail
  if (isDirectMode) {
    await runDirectQuestioningSession(currentSig, currentWorld);
    return;
  }

  banner('SESSION START');
  info('theme', `${chalk.cyan(sessionState.strategy.theme)}`);
  info('target', `${encounterCount} encounters`);
  console.log('');

  if (!JSON_MODE) {
    const atmospheres = [
      `${chalk.dim('The world stirs with latent potential. Fragments of memory surface — echoes of journeys not yet taken.')}`,
      `${chalk.dim('A pale light filters through the veil. The architecture of consciousness awaits your engagement.')}`,
      `${chalk.dim('The field of development hums with quiet energy. Each encounter will shape the landscape of your becoming.')}`,
      `${chalk.dim('Between the seen and unseen, the developmental engines prepare their catalysts. Step forward.')}`,
    ];
    console.log(`\n  ${atmospheres[Math.floor(Math.random() * atmospheres.length)]}`);
  }

  emitEvent('session_started', {
    cci: sessionState.cci.composite,
    theme: sessionState.strategy.theme,
    targetEncounters: encounterCount,
  });
  let completedCount = 0;
  let passedCount = 0;
  const now = Date.now();
  const history: ConsequenceRecord[] = [];
  const consecutivePasses = new Map<string, number>();
  const responsesPool = FORCE_RESPONSES ? [...FORCE_RESPONSES] : undefined;

  // Phase 3: If --agent is set, create a session-persistent PersistentAgent.
  // This instance is reused across all encounters in the session — its message
  // history accumulates, giving the agent cross-encounter memory. The TDG-Rust
  // bridge is started best-effort (no-op if the binary isn't installed); when
  // TDG is running, the 7 TDG-Mind tools are registered alongside the 8 CCRPG
  // tools, giving the agent the full 15-tool surface.
  let persistentAgent: PersistentAgent | null = null;
  if (USE_PERSISTENT_AGENT) {
    if (!JSON_MODE) info('agent', `${chalk.cyan('Persistent Developmental Agent')} (15-tool, session-persistent)`);
    // Best-effort TDG-Rust start — no-op if binary not installed
    await startTDGBridge().catch(() => { /* TDG unavailable — continue with CCRPG tools only */ });
    const tdgStatus = getTDGBridgeStatus();
    if (tdgStatus.running && !JSON_MODE) {
      info('tdg', `${chalk.green('TDG-Rust active')} — graph memory online`);
    } else if (!JSON_MODE) {
      info('tdg', `${chalk.dim('TDG-Rust not running — using CCRPG-native 8 tools only')}`);
    }
    // Build the tool registry with CCRPG + TDG tools (TDG tools added only if running)
    const toolRegistry = createCCRPGToolRegistry();
    if (tdgStatus.running) {
      await registerTDGTools(toolRegistry);
    }
    persistentAgent = new PersistentAgent({
      sig: currentSig,
      world: currentWorld,
      sessionState: {
        encountersSoFar: 0,
        targetSessionLength: encounterCount,
        recentLines: [],
        userMatrixModel: sessionState.userMatrixModel,
      },
      onAskPlayer: async (params) => {
        // Bridge the agent's ask_player to the CLI's interactive prompt
        if (HEADLESS || JSON_MODE) {
          // Non-interactive: return a neutral default
          return { selectedLabel: params.options?.[0]?.label, writeInValue: undefined };
        }
        if (params.narrative) console.log(`\n  ${chalk.dim(params.narrative)}`);
        const opts = params.options?.map((o: any, idx: number) => ({ value: idx, label: `${idx + 1}. ${o.label}` })) ?? [];
        if (opts.length > 0) {
          const choice = await select({ message: params.question, options: opts, initialValue: 0 });
          const chosen = typeof choice === 'number' ? params.options?.[choice] : undefined;
          return { selectedLabel: chosen?.label, writeInValue: undefined };
        }
        // Write-in only
        const answer = await clackText({ message: params.question, defaultValue: '' });
        return { selectedLabel: undefined, writeInValue: answer };
      },
      tdgToolRegistry: tdgStatus.running ? toolRegistry : undefined,
    });
    if (!JSON_MODE) info('tools', `${toolRegistry.count} tools registered (${toolRegistry.getDefinitionsBySource('ccrpg').length} CCRPG + ${toolRegistry.getDefinitionsBySource('tdg').length} TDG)`);
  }

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
      tickResult = { ...tickResult, encounter: syntheticEncounter, encounters: [syntheticEncounter] };
    }

    if (!tickResult.encounter) {
      warn('No encounter available — skipping');
      continue;
    }      // G.10: Non-coercion — present 3-5 ranked offers, player chooses
    let selectedEncounter: ScheduledEncounter = tickResult.encounter!;
    const offers = tickResult.encounters;
    if (offers.length > 1 && !HEADLESS && !JSON_MODE) {
      const posLabel = (pos: string) => pos === 'warmup' ? chalk.blue('warmup') : pos === 'cooldown' ? chalk.green('cooldown') : chalk.magenta('peak');
      const options = offers.map((enc, idx) => {
        const [encLineName, st] = enc.moduleRef.split(':');
        if (isDirectMode) {
          // Direct mode: show LINE + stage, personality-test style
          const lineLabel = CHALLENGE_NAMES[encLineName ?? ''] ?? encLineName;
          const stageCol = stageColor(st ?? 'Red');
          const label = `${idx + 1}. ${chalk.bold(lineLabel)}  ${stageCol(st ?? 'Red')}  ${chalk.dim(enc.modality)}  ${posLabel(enc.sessionPosition)}`;
          return { value: idx, label };
        }
        // Story mode: show location/NPC name
        const holon = world.holons.find(h => h.id === enc.holonSource);
        const location = holon?.name ?? encLineName;
        const label = `${idx + 1}. ${chalk.cyan(location)}  ${chalk.dim(enc.modality)}  ${posLabel(enc.sessionPosition)}`;
        return { value: idx, label };
      });
      const choice = await select({
        message: isDirectMode ? 'Choose your developmental line:' : 'Choose your encounter:',
        options,
        initialValue: 0,
      });
      if (typeof choice === 'number') {
        selectedEncounter = offers[choice];
        const skipped = offers.filter((_, idx) => idx !== choice).map(e => e.id);
        if (skipped.length > 0) {
          currentSig = { ...currentSig, avoidedEncounters: [...(currentSig.avoidedEncounters ?? []), ...skipped] };
        }
      }
    }
    // Direct mode: also show progress chart at the top of each encounter
    if (isDirectMode && !JSON_MODE) {
      renderLinesProgress(currentSig, history);
    }
    tickResult = { ...tickResult, encounter: selectedEncounter };

    // Show session position and encounter header
    const encProgress = (selectedEncounter.sessionPosition === 'warmup' ? 0.1
      : selectedEncounter.sessionPosition === 'cooldown' ? 0.9 : 0.5);
    renderSessionPosition(`${i + 1}/${encounterCount}`, selectedEncounter.sessionPosition, encProgress);
    printEncounter(selectedEncounter);

    // Transition indicator with processing spinner
    if (i > 0 && !JSON_MODE) {
      const transitions = [
        `${chalk.dim('The previous encounter settles into memory. A new catalyst emerges...')}`,
        `${chalk.dim('The developmental field shifts. What comes next is precisely what you need...')}`,
        `${chalk.dim('Integration ripples outward. The next challenge crystallizes...')}`,
        `${chalk.dim('The veil parts once more. A new mirror reflects...')}`,
        `${chalk.dim('The residue of the last encounter lingers. The next catalyst forms...')}`,
        `${chalk.dim('Memory folds into potential. A new edge of growth appears...')}`,
      ];
      console.log(`\n  ${transitions[Math.floor(Math.random() * transitions.length)]}`);
      // U.4: Smooth ora spinner
      const s = ora({ text: 'Preparing encounter...', color: 'cyan' }).start();
      await new Promise(r => setTimeout(r, 300));
      s.succeed('Encounter ready');
    }

    // Run encounter — route through PersistentAgent (--agent) or AgenticOrchestrator (default)
    try {
      const result = USE_PERSISTENT_AGENT && persistentAgent
        ? await runPersistentAgentEncounter(persistentAgent, selectedEncounter, currentSig, currentWorld)
        : await runAgenticEncounter(
            selectedEncounter, currentSig, currentWorld, history, responsesPool, consecutivePasses,
          );

      // Apply consequences from the orchestrator result
      const record = result.outcome.consequenceRecord;
      history.push(record);
      currentSig = result.outcome.updatedSig;
      currentWorld = result.outcome.updatedWorld;

      // Wave 1.1: Apply the response to the GameLoop's state engines
      // (UserMatrixModel + transformation state) WITHOUT re-applying consequences
      // (the orchestrator already did that). This fixes the stale-state bug where
      // UserMatrixModel was never updated and transformation state ran on stale sig.
      //
      // Phase 3 bugfix: when the PersistentAgent path is active, use the agent's
      // effectiveEncounter (which may differ from the scheduler's pick if the
      // agent called ccrpg_select_encounter with a different moduleRef). Using
      // the wrong encounter here would update the wrong (line, stage) cell in
      // UserMatrixModel and fire shadow knot resolution on the wrong executionMode.
      const encounterForApply = (USE_PERSISTENT_AGENT && persistentAgent && 'effectiveEncounter' in result)
        ? (result as { effectiveEncounter: ScheduledEncounter }).effectiveEncounter
        : selectedEncounter;

      if (result.response) {
        const applied = applyResponseOnly(
          currentSig,
          currentWorld,
          sessionState,
          result.response,
          encounterForApply,
          Date.now(),
        );
        currentSig = applied.sig;
        currentWorld = applied.world;
        sessionState = applied.sessionState;
      }

      // Phase 3 + L4 + L5: Keep the PersistentAgent's sig/world/sessionState fresh
      // across encounters so its tool queries reflect the latest state. Without
      // the sessionState refresh, ccrpg_get_encounter_pool always saw
      // encountersSoFar:0 + recentLines:[], skewing scheduler ranking. Without
      // the weightBias, the agent saw a different ranking than the scheduler.
      if (persistentAgent) {
        persistentAgent.updateSnapshot(currentSig, currentWorld);
        persistentAgent.updateSessionState({
          encountersSoFar: i + 1,
          targetSessionLength: encounterCount,
          recentLines: history.slice(-5).map(r => r.polarityTrace.line),
          userMatrixModel: sessionState.userMatrixModel,
          weightBias: sessionState.strategy.weightBias,
        });
      }



      verbose('narrative', result.narrativeSummary);

      // ── Per-encounter state display (Veil-compliant) ──
      // ponytail: no PASSED/FAILED, no clinical labels, no layer labels.
      // The player sees narrative consequence only.
      if (!JSON_MODE) {
        const cr = result.outcome.consequenceRecord;
        const polarityArrow = cr.polarityTrace.energeticDirection === 'Radiative' ? '↑'
          : cr.polarityTrace.energeticDirection === 'Absorptive' ? '↓' : '·';

        // Show the narrative consequence as the primary feedback
        const briefNarrative = result.narrativeSummary.length > 100
          ? result.narrativeSummary.slice(0, 100) + '...'
          : result.narrativeSummary;
        console.log(`\n  ${chalk.dim('✦')} ${briefNarrative}`);

        // Shadow surfaces as narrative, not as a clinical label
        if (cr.shadowSurfaced) {
          console.log(`  ${chalk.dim('Something beneath the surface stirred.')}`);
        }
      }

      if (VERBOSE) {
        verbose('feedback', result.outcome.feedback.slice(0, 200));
        verbose('updatedEncounters', String(currentSig.totalEncounters));
      }

      emitEvent('encounter_completed', {
        encounter: selectedEncounter.id,
        modality: selectedEncounter.modality,
        module: selectedEncounter.moduleRef,
        passed: result.outcome.finalResult.passed,
        narrative: result.narrativeSummary,
        totalEncounters: currentSig.totalEncounters,
      });

      completedCount++;
      if (result.outcome.finalResult.passed) passedCount++;
    } catch (err: any) {
      error(`Encounter failed: ${err.message || err}`);
      emitEvent('encounter_error', { encounter: selectedEncounter.id, error: err.message });
    }

      // Check transformation
    if (tickResult.transformation) {
      // T-3.4 (Veil compliance): don't leak the target stage name.
      if (!JSON_MODE) console.log(`\n  ${chalk.magenta('⚡ Something rearranges at the foundation.')}`);
      emitEvent('transformation', { targetStage: tickResult.transformation.targetStage, readiness: tickResult.transformation.readiness });
    }

    // M4: When --agent is active, query TDG's graph-level transformation pressure
    // to supplement CCRPG's detectThreshold signal. This is best-effort + async —
    // no-op when TDG is not running. We emit a tdg_pressure telemetry event so
    // the session can track graph-level readiness alongside the CCRPG signal.
    if (USE_PERSISTENT_AGENT) {
      const tdgPressure = await getTDGTransformationPressure(currentSig);
      if (tdgPressure !== null) {
        emitEvent('tdg_pressure', { pressure: tdgPressure, ccrpgReadiness: tickResult.transformation?.readiness ?? 0 });
        if (VERBOSE && !JSON_MODE) {
          verbose('tdg_pressure', tdgPressure.toFixed(3));
        }
      }
    }

    // T-3.4: removed the `layers:` prefix + renderLayersCompact leak.
    // Bleed-through is now conveyed narratively through ConsequenceNarrator.

  }

  // Session end — apply theta-decay and persist.
  // P0-3 BUGFIX: When --agent is active, use endSessionAsync() which AWAITS the
  // TDG onSessionEnd hook (tdg_consolidate + tdg_save_mind_state) before returning.
  // The sync endSession() fires the hook fire-and-forget, which races with
  // stopTDGBridge() below — the TDG-Rust process can be killed mid-call, losing
  // the session's graph snapshot. endSessionAsync() ensures the hook completes first.
  const sessionEnd = USE_PERSISTENT_AGENT
    ? await endSessionAsync(currentSig, sessionState, now + encounterCount * 5000)
    : endSession(currentSig, sessionState, now + encounterCount * 5000);

  // Phase 3: If the PersistentAgent + TDG bridge was active, stop the TDG-Rust
  // process now. With endSessionAsync above, the onSessionEnd hook has already
  // completed (tdg_consolidate + tdg_save_mind_state finished), so it's safe to
  // tear down the process.
  if (USE_PERSISTENT_AGENT) {
    stopTDGBridge();
  }

  // Save progress to disk (Significator + WorldState).
  // P0-5: Use atomic saveAll() — writes both sig + world to a single JSON
  // envelope via temp-file + rename, so a crash between writes can't leave
  // them out of sync. The individual saveGame()/saveWorldState() calls are
  // still made inside saveAll() for backward compat with older code paths.
  saveAll(sessionEnd.sig, currentWorld);
  if (!JSON_MODE) info('save', `${chalk.green('Progress saved')}`);

  banner('SESSION END');

  // No decorative session closure — per-encounter feedback is sufficient.
  // The prior closure block leaked line names, shadow quadrant names, pass/fail
  // counts, and imposed atmospheric vibes that may not resonate universally.
  // The session's felt-sense is carried by the per-encounter qualitative
  // feedback, not by a summary block.

  // T-3.4: removed CCI bar, altitudes chart, shadow/drive displays, and
  // perceptual-layers rendering from session closure — all Veil violations.
  // The session's felt-sense is carried by the qualitative narrative above.

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

// ── Provider registry ─────────────────────────────────────────────
interface ProviderInfo {
  id: string;
  name: string;
  baseUrl: string;
  requiresApiKey: boolean;
  defaultModel: string;
  models: { value: string; label: string; hint: string }[];
  apiFormat: 'openai' | 'anthropic';
}

const PROVIDERS: Record<string, ProviderInfo> = {
  ollama: {
    id: 'ollama',
    name: 'Ollama (Local)',
    baseUrl: 'http://localhost:11434/v1',
    requiresApiKey: false,
    defaultModel: 'llama3.2',
    models: [
      { value: 'llama3.2', label: 'Llama 3.2', hint: 'Meta, 8B' },
      { value: 'codellama', label: 'CodeLlama', hint: 'Meta, code-focused' },
      { value: 'mistral', label: 'Mistral', hint: '7B' },
      { value: 'phi3', label: 'Phi-3', hint: 'Microsoft, 3.8B' },
    ],
    apiFormat: 'openai',
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    requiresApiKey: true,
    defaultModel: 'gpt-4o-mini',
    models: [
      { value: 'gpt-4o', label: 'GPT-4o', hint: 'Latest, most capable' },
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini', hint: 'Fast, affordable' },
      { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', hint: '128K context' },
      { value: 'o1-mini', label: 'o1-mini', hint: 'Reasoning model' },
    ],
    apiFormat: 'openai',
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    requiresApiKey: true,
    defaultModel: 'claude-3-haiku-20240307',
    models: [
      { value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4', hint: 'Latest, balanced' },
      { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet', hint: 'Strong reasoning' },
      { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku', hint: 'Fast, affordable' },
      { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus', hint: 'Most capable' },
    ],
    apiFormat: 'anthropic',
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    requiresApiKey: true,
    defaultModel: 'gemini-1.5-flash',
    models: [
      { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', hint: 'Latest, fast' },
      { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', hint: 'Balanced' },
      { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', hint: 'Fast, affordable' },
      { value: 'gemma-4-31b-it', label: 'Gemma 4 31B', hint: 'Open model' },
    ],
    apiFormat: 'openai',
  },
  custom: {
    id: 'custom',
    name: 'Custom Provider',
    baseUrl: '',
    requiresApiKey: true,
    defaultModel: '',
    models: [],
    apiFormat: 'openai',
  },
};

// ── Ollama auto-detect ──────────────────────────────────────────
async function detectOllama(): Promise<{ running: boolean; models: string[] }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch('http://localhost:11434/api/tags', { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return { running: false, models: [] };
    const data = (await res.json()) as { models?: { name: string }[] };
    const models = (data.models ?? []).map(m => m.name.split(':')[0] ?? m.name);
    return { running: true, models: [...new Set(models)] };
  } catch {
    return { running: false, models: [] };
  }
}

// ── API key verification ────────────────────────────────────────
async function verifyProviderConnection(provider: ProviderInfo, apiKeyVal: string, modelVal: string, baseUrlVal: string): Promise<{ ok: boolean; message: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    if (provider.id === 'ollama') {
      // Ollama: GET /api/tags
      const res = await fetch('http://localhost:11434/api/tags', { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) return { ok: true, message: 'Ollama connected' };
      return { ok: false, message: `Ollama responded with ${res.status}` };
    }

    if (provider.id === 'anthropic') {
      // Anthropic: POST /v1/messages with minimal payload
      const res = await fetch(`${baseUrlVal}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKeyVal,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: modelVal,
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 1,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (res.ok) return { ok: true, message: 'Anthropic connected' };
      if (res.status === 401 || res.status === 403) return { ok: false, message: 'Invalid API key' };
      return { ok: false, message: `Anthropic responded with ${res.status}` };
    }

    // OpenAI / Gemini / Custom: GET /models
    const res = await fetch(`${baseUrlVal}/models`, {
      headers: { 'Authorization': `Bearer ${apiKeyVal}` },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (res.ok) return { ok: true, message: 'Connected' };
    if (res.status === 401 || res.status === 403) return { ok: false, message: 'Invalid API key' };
    return { ok: false, message: `Endpoint responded with ${res.status}` };
  } catch (err: any) {
    return { ok: false, message: err.name === 'AbortError' ? 'Connection timed out' : 'Connection failed' };
  }
}

// ── Setup wizard ──────────────────────────────────────────────────
async function runSetup(): Promise<void> {
  if (HEADLESS || JSON_MODE) { error('setup requires interactive mode (remove --headless and --json)'); return; }
  banner('CCRPG Setup Wizard');
  console.log(`\n  ${chalk.dim('Configure your LLM provider for the developmental engine.')}\n`);

  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.mkdirSync(path.join(CONFIG_DIR, 'saves'), { recursive: true });
  success(`Config directory: ${CONFIG_DIR}`);

  const existing = loadConfig();
  if (existing.llm?.provider) {
    info('current provider', existing.llm.provider);
  }

  // Step 1: Provider selection
  console.log(`\n  ${chalk.bold('Step 1: Select Provider')}`);
  const providerChoice = await select({
    message: 'Choose your LLM provider:',
    options: Object.values(PROVIDERS).map(p => ({
      value: p.id,
      label: p.name,
      hint: p.requiresApiKey ? 'Requires API key' : 'No API key needed',
    })),
  });

  if (typeof providerChoice !== 'string') { error('Setup cancelled'); return; }
  const selectedProvider = PROVIDERS[providerChoice]!;

  // Step 2: Ollama auto-detect or API key
  let selectedApiKey = existing.llm?.apiKey ?? '';
  let ollamaModels: string[] = [];

  if (selectedProvider.id === 'ollama') {
    console.log(`\n  ${chalk.bold('Step 2: Detecting Ollama...')}`);
    const spinner = ora('Checking Ollama at localhost:11434...').start();
    const ollamaStatus = await detectOllama();
    if (ollamaStatus.running) {
      spinner.succeed('Ollama detected');
      ollamaModels = ollamaStatus.models;
      if (ollamaModels.length > 0) {
        info('available models', ollamaModels.join(', '));
      }
    } else {
      spinner.warn('Ollama not detected at localhost:11434');
      console.log(`  ${chalk.dim('You can still configure it — start Ollama later before playing.')}`);
    }
  } else if (selectedProvider.requiresApiKey) {
    console.log(`\n  ${chalk.bold('Step 2: API Key')}`);
    const currentKey = existing.llm?.apiKey ? `${existing.llm.apiKey.slice(0, 8)}...` : '(not set)';
    console.log(`  Current: ${chalk.dim(currentKey)}`);
    const newKey = await clackText({
      message: `Enter ${selectedProvider.name} API key:`,
      defaultValue: '',
    });
    if (typeof newKey !== 'string') { error('Setup cancelled'); return; }
    selectedApiKey = newKey.trim() || (existing.llm?.apiKey ?? '');
  }

  // Step 3: Model selection
  console.log(`\n  ${chalk.bold('Step 3: Select Model')}`);
  let selectedModel = selectedProvider.defaultModel;
  let selectedBaseUrl = selectedProvider.baseUrl;

  if (selectedProvider.id === 'ollama' && ollamaModels.length > 0) {
    // Show auto-detected models plus defaults
    const modelOptions = [
      ...ollamaModels.map(m => ({ value: m, label: m, hint: 'detected' })),
      ...selectedProvider.models.filter(pm => !ollamaModels.includes(pm.value)).map(pm => ({
        value: pm.value, label: pm.label, hint: pm.hint,
      })),
    ];
    const modelChoice = await select({ message: 'Select model:', options: modelOptions });
    if (typeof modelChoice === 'string') selectedModel = modelChoice;
  } else if (selectedProvider.models.length > 0) {
    const modelChoice = await select({
      message: 'Select model:',
      options: selectedProvider.models.map(m => ({
        value: m.value, label: m.label, hint: m.hint,
      })),
    });
    if (typeof modelChoice === 'string') selectedModel = modelChoice;
  } else {
    // Custom provider: ask for model ID
    const modelInput = await clackText({ message: 'Enter model ID:', defaultValue: selectedModel });
    if (typeof modelInput === 'string' && modelInput.trim()) selectedModel = modelInput.trim();
  }

  // Step 4: Custom provider base URL
  if (selectedProvider.id === 'custom') {
    console.log(`\n  ${chalk.bold('Step 4: Custom Endpoint')}`);
    const urlInput = await clackText({ message: 'Enter base URL (e.g. http://localhost:8080/v1):', defaultValue: '' });
    if (typeof urlInput === 'string' && urlInput.trim()) selectedBaseUrl = urlInput.trim();
  }

  // Step 5: Verify connection
  console.log(`\n  ${chalk.bold('Step 5: Verify Connection')}`);
  const verifyProvider = selectedProvider.id === 'custom'
    ? { ...selectedProvider, baseUrl: selectedBaseUrl, apiFormat: 'openai' as const }
    : selectedProvider;
  const verifyBaseUrl = selectedProvider.id === 'custom' ? selectedBaseUrl : selectedProvider.baseUrl;

  const spinner = ora('Verifying connection...').start();
  const verification = await verifyProviderConnection(
    { ...verifyProvider, baseUrl: verifyBaseUrl },
    selectedApiKey,
    selectedModel,
    verifyBaseUrl,
  );
  if (verification.ok) {
    spinner.succeed(verification.message);
  } else {
    spinner.warn(`Verification: ${verification.message}`);
    console.log(`  ${chalk.dim('You can still save — fix the issue before playing.')}`);
  }

  // Step 6: Save config
  const config: CCRPGConfig = {
    llm: {
      provider: selectedProvider.id as 'ollama' | 'openai' | 'anthropic' | 'gemini' | 'custom',
      apiKey: selectedApiKey || existing.llm?.apiKey,
      model: selectedModel,
      baseUrl: verifyBaseUrl,
    },
    session: { defaultEncounters: existing.session?.defaultEncounters ?? 20, defaultMode: existing.session?.defaultMode ?? 'full' },
  };

  saveConfig(config);

  // Summary
  console.log('');
  success(`Configuration saved to ${CONFIG_FILE}`);
  console.log(`\n  ${chalk.bold('Summary')}`);
  console.log(`  ${chalk.green('✓')} provider:    ${selectedProvider.name}`);
  console.log(`  ${chalk.green('✓')} model:       ${selectedModel}`);
  console.log(`  ${chalk.green('✓')} endpoint:    ${verifyBaseUrl}`);
  console.log(`  ${chalk.green('✓')} api key:     ${selectedApiKey ? `${selectedApiKey.slice(0, 8)}...` : '(none)'}`);
  console.log(`\n  Run ${chalk.bold('ccrpg')} to start your developmental journey.\n`);
}

// ── Status command ────────────────────────────────────────────────────
async function runStatus(): Promise<void> {
  banner('CCRPG Status');
  const config = loadConfig();
  console.log(`\n  ${chalk.bold('Configuration')}`);
  info('config', fs.existsSync(CONFIG_FILE) ? CONFIG_FILE : '(no config file)');
  info('provider', config.llm?.provider ?? 'gemini (default)');
  info('model', config.llm?.model ?? model);
  info('api key', config.llm?.apiKey ? `${config.llm.apiKey.slice(0, 8)}...` : 'not set');

  bootRegistries();
  const moduleRegistry = bootModuleRegistry();
  (globalThis as any).__moduleRegistry = moduleRegistry;

  console.log(`\n  ${chalk.bold('Game State')}`);
  if (hasSave()) {
    const sig = loadSave();
    if (sig) {
      // T-3.4 (Veil compliance): show only player id + qualitative state.
      // No stage name, no encounter count, no altitudes chart, no shadow/drive displays.
      info('player', sig.id);

      // Qualitative felt-sense description of current stage
      const stageAesthetics: Record<string, string> = {
        Infrared: 'cave-dark, primal',
        Magenta: 'spirit-saturated, symbolic',
        Red: 'fortress-sharp, weapon-walls',
        Amber: 'cathedral-ordered, gold-stone',
        Orange: 'mechanism-precise, steel-glass',
        Green: 'garden-lush, earth-toned',
        Turquoise: 'crystalline, translucent',
        White: 'luminous silence, spacious',
      };
      const aesthetic = stageAesthetics[sig.currentStage] ?? 'shifting, becoming';
      info('resonance', `The world feels ${aesthetic}.`);

      // Qualitative encounter milestone
      const milestone = sig.totalEncounters === 0
        ? 'Your path is yet to begin.'
        : sig.totalEncounters < 10
          ? 'You have tasted the first edges.'
          : sig.totalEncounters < 30
            ? 'Your path deepens with each step.'
            : 'The shape of your journey grows clear.';
      info('journey', milestone);

      // Wave 3.1: Dev-mode holistic primitives
      if (DEV_MODE) {
        console.log(`\n  ${chalk.bold('Holistic Primitives (dev mode)')}`);
        const snapshot = toSnapshot(sig);
        const cci = computeCCI(snapshot);
        info('G_z', cci.metabolicHealth?.gz.toFixed(4) ?? 'n/a');
        info('P_z', cci.metabolicHealth?.pz.toFixed(4) ?? 'n/a');
        info('total', cci.metabolicHealth?.total.toFixed(4) ?? 'n/a');
        info('interpretation', cci.metabolicHealth?.interpretation ?? 'n/a');
        info('transformationPhase', sig.transformationPhase ?? 'idle');
        info('rayProfile', JSON.stringify(sig.rayProfile));
        if (sig.transformationTargetStage) info('targetStage', sig.transformationTargetStage);
        info('sessionsInPhase', String(sig.transformationSessionsInPhase ?? 0));
        info('knotsResolved', String(sig.transformationKnotsResolved ?? 0));
        info('internalizedHolons', String(sig.internalizedHolons?.length ?? 0));
        info('greatWayDirection', sig.greatWayDirection ?? 'null');
        // Ponytail gap: expose indigoRayAccessibility in dev mode
        const indigoAccess = (sig.rayProfile.Green + sig.rayProfile.Blue + sig.rayProfile.Indigo) / 3;
        info('indigoRayAccess', indigoAccess.toFixed(4));
      }
    }
  } else {
    info('save', `${chalk.yellow('no saved game')} — run ${chalk.bold('ccrpg')} to start`);
  }

  console.log(`\n  ${chalk.bold('System')}`);
  info('modules', `${moduleRegistry.count()} loaded`);
  info('config dir', CONFIG_DIR);
  info('node', process.version);
  info('version', VERSION);
}

// ── Usage help ──────────────────────────────────────────────────────
function printHelp(): void {
  console.log(`\n${chalk.bold}${chalk.cyan}CCRPG${chalk.reset} v${VERSION}\n\n${chalk.bold}USAGE${chalk.reset}\n  ccrpg                        Start an interactive session\n  ccrpg session                Same as above\n  ccrpg setup                  Configure LLM and preferences\n  ccrpg diagnostic             Show system diagnostics\n  ccrpg status                 Show current save state\n  ccrpg new-game               Reset progress and start fresh\n\n${chalk.bold}SESSION OPTIONS${chalk.reset}\n  --encounters=N               Number of encounters (default: ${fileConfig.session?.defaultEncounters ?? 20})\n  --headless                   Run without user interaction\n  --json                       Machine-readable JSON output\n  --verbose                    Show full narrative and feedback\n  --no-llm                     Disable LLM, use module assessments only\n  --version                    Show version\n\n${chalk.bold}FORCED ENCOUNTERS (for testing)${chalk.reset}\n  --line=LINE                  Force a specific line\n  --stage=STAGE                Force a specific stage\n  --modality=MOD               Force a specific modality\n  --responses=1,2,3            Force specific option selections\n  --force-shadow=Q             Force a shadow quadrant\n\n${chalk.bold}CONFIGURATION${chalk.reset}\n  API key:   ~/.ccrpg/config.json or CCRPG_API_KEY env var\n  Model:     ~/.ccrpg/config.json or CCRPG_MODEL env var\n  Saves:     ~/.ccrpg/saves/\n\n${chalk.bold}EXAMPLES${chalk.reset}\n  ccrpg                                       # interactive session\n  ccrpg --headless --no-llm                   # quick automated test\n  ccrpg setup                                 # configure API key\n  ccrpg session --encounters=5 --json         # JSON event stream\n  ccrpg diagnostic                            # system diagnostics\n`);
}

// ── Main ──────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  // ponytail: --version and --help handled by commander automatically
  if (subcommand === 'setup') { await runSetup(); return; }
  if (subcommand === 'status') { await runStatus(); return; }
  // P0-5 + P0-6: Use deleteAllSaves (clears sig + world + atomic envelope).
  // P0-6: Also clear TDG graph state if the TDG bridge is running, so a new
  // game doesn't inherit the old player's developmental graph.
  if (subcommand === 'new-game') {
    deleteAllSaves();
    // Best-effort TDG graph clear — no-op if TDG isn't running.
    try {
      import('../src/infra/tdg/TDGBridge.js').then(async ({ startTDGBridge, getTDGHooks, stopTDGBridge }) => {
        await startTDGBridge().catch(() => {});
        const hooks = getTDGHooks();
        if (hooks && hooks.isActive()) {
          // Clear the TDG graph by calling tdg_self_manage with gc_all action.
          // This garbage-collects all nodes + edges, effectively starting fresh.
          const client = (hooks as any).tdg;
          if (client) {
            await client.callTool('tdg_self_manage', { action: 'gc_all', dry_run: false }).catch(() => {});
          }
        }
        stopTDGBridge();
      }).catch(() => {});
    } catch { /* TDG not available — skip */ }
    console.log(`${chalk.yellow('↻')} Progress reset. Run ${chalk.bold('ccrpg')} to start a new game.`);
    return;
  }

  if (!JSON_MODE) {
    console.log(`\n${chalk.bold.cyan('CCRPG')} v${VERSION}`);
  }

  try {
    const effectiveMode: string = subcommand === 'diagnostic' ? 'diagnostic' : subcommand === 'session' ? 'full' : 'full';
    switch (effectiveMode) {
      case 'diagnostic': await runDiagnostic(); break;
      case 'encounter': await runSingleEncounter(); break;
      case 'session': case 'full': default: await runFullSession(); break;
    }
  } catch (err: any) {
    error(`Fatal: ${err.message || err}`);
    if (!JSON_MODE) console.error(err.stack);
    emitEvent('fatal', { error: err.message, stack: err.stack });
  } finally {
    // cleanup if needed
  }
}

main();
