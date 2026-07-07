#!/usr/bin/env node
/**
 * CCRPG CLI Game Runner — Phase 1
 * Comprehensive headless debugger that runs the full game loop without Phaser.
 * Routes ALL modalities through the AgenticOrchestrator for consistent behaviour.
 *
 * Usage:
 *   npx tsx scripts/cli-game.ts                          # interactive, fallback mode
 *   npx tsx scripts/cli-game.ts --headless               # automated, 20 encounters
 *   npx tsx scripts/cli-game.ts --model=gemini-1.5-flash  # override model
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
  .description('CCRPG — A developmental RPG where every encounter is a validated assessment that simultaneously diagnoses and evolves your cognitive, emotional, moral, and spiritual capacities across 8 lines of intelligence and 8 stages of consciousness.')
  .option('--headless', 'Run without user interaction')
  .option('--json', 'Machine-readable JSON output')
  .option('--verbose', 'Show full narrative and feedback')
  .option('--dev', 'Developer mode: show holistic primitives (G_z/P_z, rayProfile, phase position)')
  .option('--no-llm', 'Disable LLM, use module assessments only')
  // YAGNI-EFF-3 (Efficacy Audit): --agent / PersistentAgent path removed.
  // It was the source of every major regression (R8-BUG-1 hang, R9-BUG-2
  // process-exit, R8-BUG-1b placeholder string, R8-BUG-4 --answer ignore).
  // The DQ path is the game's crown jewel — it's faster, consumes --answer,
  // and has never regressed. Story-Driven mode can be rebuilt on top of DQ's
  // proven architecture when needed.
  .option('--new-game', 'Start fresh (delete saved progress)')
  .option('-e, --encounters <n>', 'Number of encounters', '20')
  .option('-m, --model <name>', 'Override LLM model name')
  .option('-l, --line <line>', 'Force a specific line')
  .option('-s, --stage <stage>', 'Force a specific stage')
  .option('--modality <mod>', 'Force a specific modality')
  // P1-6 (UX-R3): Clarify what --force-shadow actually does. The audit found
  // users confused about the difference between --modality shadow (which
  // triggers the shadow encounter format) and --force-shadow (which injects
  // shadow-keyword text into the response pool for testing shadow detection).
  // They behave nothing alike but have overlapping names. Keeping the original
  // name for backwards compat, but adding --inject-shadow-keyword as a clearer
  // alias and updating the help description.
  .option('--force-shadow <quadrant>', 'Inject shadow-keyword text into the response pool for testing shadow detection (alias: --inject-shadow-keyword). Does NOT trigger shadow encounter format — use --modality shadow for that.')
  .option('--inject-shadow-keyword <quadrant>', 'Alias for --force-shadow (testing only)')
  .option('--skip-calibration', 'Skip calibration, default all lines to Red')
  // R5-CRITICAL (UX-R5): Headless input mechanism. Without this, the LLM
  // hallucinates user answers in --headless mode (the game's core promise
  // "your answers shape your developmental profile" is unfulfillable).
  // --answers reads a file with one answer per line, consumed per question.
  // --answer is a repeatable flag for inline answers. Both feed the
  // writeInValue that the LLM actually sees.
  .option('--answers <file>', 'Read answers from a file (one per line, consumed per question) — enables real user participation in --headless mode')
  // R6-BUG-1 (UX-R6): The variadic '<text...>' syntax is REQUIRED for
  // repeatable flags. Without it, commander overwrites on each repeat,
  // keeping only the LAST value (--answer A --answer B → "B", not ["A","B"]).
  // This silently dropped all but the last inline answer.
  .option('--answer <text...>', 'Inline answer (repeatable — one per question)');

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
// P2-2 (UX-R3): Glossary subcommand. The audit found a severe vocabulary
// wall — terms like Holon, Significator, CCI, rayProfile, G_z/P_z appeared
// in CLI output with no explanation. Users felt like outsiders. The glossary
// command prints 1-line definitions for every term, breaching the wall without
// requiring users to read the docs.
program
  .command('glossary')
  .description('Show definitions for CCRPG terminology');

// ponytail: .action() prevents commander from showing help when no subcommand given
program.action(() => {});

// Early parse for --model flag (before env bootstrap)
// R8-BUG-5 (UX-R8): Use a SEPARATE Command instance for the early parse
// to avoid the double-parse bug where variadic flags (like --answer)
// accumulate duplicates: parseOptions + parse would double-collect them.
let earlyModelOverride: string | undefined;
{
  const earlyParser = new Command();
  earlyParser.option('-m, --model <name>', 'Override LLM model name');
  earlyParser.parseOptions(process.argv.slice(2));
  const earlyOpts = earlyParser.opts();
  earlyModelOverride = earlyOpts.model as string | undefined;
}

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

// Dynamic provider config (UX-R3 follow-up):
// The previous implementation hardcoded a default model ('gemini-1.5-flash')
// and provider ('gemini'). The new implementation resolves everything
// dynamically through ProviderRegistry.resolveConfig(), which checks:
//   1. CLI flags (--model, --provider, --base-url, --api-key)
//   2. Provider-specific env vars (OPENCODE_API_KEY, ANTHROPIC_API_KEY, etc.)
//   3. Generic LLM_* env vars (LLM_PROVIDER, LLM_BASE_URL, LLM_API_KEY, LLM_MODEL)
//   4. The MODEL env var (per the user's spec)
//   5. Legacy VITE_LLM_* env vars (backwards compat)
//   6. Saved config file (~/.ccrpg/config.json)
// No hardcoded model names anywhere. The default provider is 'opencode'
// (opencode.ai/zen) — the project's primary gateway — but only fires if
// OPENCODE_API_KEY / OPENCODE_API is set; otherwise the user must configure.
import { resolveConfig as resolveLLMConfig, isComplete as isLLMConfigComplete, type LLMConfig } from '../src/infra/llm/ProviderRegistry.js';
import { getActiveConfig, invalidateConfigCache, setLLMDisabled, validateModelIfFresh } from '../src/infra/llm/LLMClient.js';

const resolvedLLM: LLMConfig = resolveLLMConfig(
  { model: earlyModelOverride },
  fileConfig,
);
const llmComplete = isLLMConfigComplete(resolvedLLM);
const apiKey = resolvedLLM.apiKey || 'sk-placeholder';
const baseUrl = resolvedLLM.baseUrl;
const model = resolvedLLM.model;
const provider = resolvedLLM.providerId;

// Seed process.env.VITE_LLM_* for backwards compat with any code that still
// reads those directly. The LLMClient now reads via getActiveConfig() which
// resolves through ProviderRegistry, but a few call sites (and tests) still
// use the legacy env vars.
process.env.VITE_LLM_BASE_URL = baseUrl;
process.env.VITE_LLM_API_KEY = apiKey;
process.env.VITE_LLM_MODEL = model;
process.env.VITE_LLM_PROVIDER = provider;

// Seed the LLMClient config cache so the first call doesn't re-resolve.
// Pass fileConfig so the cache matches what we just resolved.
getActiveConfig(fileConfig);

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
import { ALL_LINES } from '../src/core/domain/Line.js';
import type { Stage } from '../src/core/domain/Stage.js';
import { ALL_STAGES, stageOrdinal } from '../src/core/domain/Stage.js';
import type { ScheduledEncounter } from '../src/core/domain/EncounterSpecNew.js';
import type { PlayerResponse } from '../src/core/engines/ConsequenceEngine.js';
import type { SessionContext } from '../src/core/engines/PriorityComputation.js';
import { startSession, startSessionWithTDG, tickWithStrategy, endSession, endSessionAsync, applyResponseOnly, getTDGTransformationPressure, type SessionState } from '../src/core/GameLoop.js';
import { createInitialUserMatrixModel } from '../src/core/engines/UserMatrixModel.js';
import { AgenticOrchestrator, type AgenticUIHandler } from '../src/core/assessments/AgenticOrchestrator.js';
import { PersistentAgent } from '../src/core/agent/PersistentAgent.js';
import { runPersistentAgentEncounter } from '../src/core/agent/PersistentAgentBridge.js';
// YAGNI-EFF-2 (Efficacy Audit): TDG bridge import removed from CLI.
// The TDG infra files stay in src/infra/tdg/ for reference, but the CLI
// no longer starts, stops, or references TDG. This eliminates the bug
// surface that caused R8-BUG-1 (hang), R9-BUG-2 (process-exit), and
// R8-BUG-3 (VeilFilter leak). TDG was always a no-op in default mode.
import { createCCRPGToolRegistry } from '../src/core/agent/ToolRegistry.js';
import type { ModuleRegistry } from '../src/core/assessments/registry.js';
import type { AskUserQuestionParams, AskUserQuestionResult, UserAnswer } from '../src/core/assessments/agentTypes.js';
import { loadSave, saveGame, hasSave, deleteSave, saveWorldState, loadWorldState, deleteWorldSave, saveAll, deleteAllSaves } from '../src/infra/persistence/SaveRepository.js';

import holonsJson from '../src/core/data/red-layer-holons.json';
import type { ConsequenceRecord } from '../src/core/domain/ConsequenceRecord.js';
import type { Modality } from '../src/core/domain/enums.js';
import { ALL_MODALITIES } from '../src/core/domain/enums.js';
import { thresholdToStage } from '../src/core/usecases/ThresholdMaps.js';
// P1-3 (UX-R3): configurable saturation threshold + per-line progress.
import { setSaturationThreshold, getLineProgress, computeReadiness } from '../src/core/engines/TransformationDetector.js';
// R5-BUG-5 (UX-R5): fallback narrative pool for empty LLM responses.
import { pickFallbackNarrative } from '../src/core/agent/FallbackNarratives.js';
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

// P0-4 (UX-R3): HEADLESS is mutable so the non-TTY guard in main() can
// auto-enable it when stdin isn't a TTY. All other flag constants remain const.
let HEADLESS = opts.headless ?? false;
// R5-BUG-1 (UX-R5): Propagate headless state to the PersistentAgent so it
// can lower its maxLoops budget. Without this, --agent + LLM hangs because
// the agent makes up to 30 sequential LLM calls (30×20s = 600s).
if (HEADLESS) process.env.CCRPG_HEADLESS = '1';
const VERBOSE = opts.verbose ?? false;
const JSON_MODE = opts.json ?? false;
const DEV_MODE = (opts as any).dev ?? false;
// R8-BUG-3 (UX-R8): Propagate DEV_MODE to LLMClient so VeilFilter logs
// are gated behind --dev and don't leak into normal output.
if (DEV_MODE) process.env.CCRPG_DEV = '1';
// Commander treats `--no-llm` as a negation of `--llm`: it creates
// opts.llm (default true) and sets it to false when --no-llm is passed.
// So we read opts.llm (not opts.noLlm, which is always undefined).
// Pre-existing bug masked by the old hardcoded 'sk-placeholder' default.
const NO_LLM = opts.llm === false;
// Propagate --no-llm to the LLMClient so ALL call sites (including the
// PersistentAgent path) respect it. Without this, --no-llm only affected
// the CLI's LLM_ACTIVE flag, but the agent path would still call the LLM
// because the config file had a valid key.
setLLMDisabled(NO_LLM);
// LLM_ACTIVE now uses the resolved config's completeness check, which
// accounts for the provider-specific env vars (OPENCODE_API_KEY, etc.).
let LLM_ACTIVE = !NO_LLM && llmComplete;
const ACTIVE_MODEL = opts.model ?? model;
/** YAGNI-EFF-3 (Efficacy Audit): --agent path removed. USE_PERSISTENT_AGENT
 * is always false. The PersistentAgent / Story-Driven mode code stays in
 * src/core/agent/ for reference, but the CLI never activates it. */
const USE_PERSISTENT_AGENT = false;
const encounterCount = parseInt(opts.encounters ?? String(fileConfig.session?.defaultEncounters ?? 20), 10);

const FORCE_LINE = opts.line as Line | undefined;
const FORCE_STAGE = opts.stage as Stage | undefined;
const FORCE_MODALITY = opts.modality as Modality | undefined;
const FORCE_SHADOW = (opts.forceShadow ?? (opts as any).injectShadowKeyword) as string | undefined;
const FORCE_RESPONSES = undefined; // ponytail: --responses removed, wasn't in commander spec
const NEW_GAME = opts.newGame ?? false;
const SKIP_CALIBRATION = opts.skipCalibration ?? false;

// R5-CRITICAL (UX-R5): Headless input mechanism. Load user-provided answers
// from --answers <file> (one per line) and/or --answer <text> (repeatable).
// These feed the writeInValue that the LLM actually sees, instead of the
// LLM hallucinating user answers in --headless mode.
// Priority: --answer flags first (in order), then --answers file (remaining lines).
const USER_ANSWERS: string[] = [];
{
  const inlineAnswers = Array.isArray((opts as any).answer) ? (opts as any).answer as string[]
    : typeof (opts as any).answer === 'string' ? [(opts as any).answer as string]
    : [];
  USER_ANSWERS.push(...inlineAnswers);
  const answersFile = (opts as any).answers as string | undefined;
  if (answersFile) {
    try {
      const content = fs.readFileSync(answersFile, 'utf8');
      // One answer per line; blank lines preserved as empty answers (user skipped)
      USER_ANSWERS.push(...content.split('\n'));
    } catch (err: any) {
      console.error(`${chalk.red('✗')} Could not read --answers file: ${answersFile} (${err.message})`);
      process.exit(1);
    }
  }
}
function consumeUserAnswer(): string | undefined {
  // Consume the next user answer. Returns undefined if none remain — caller
  // should fall back to default behavior. Trimming: preserve internal whitespace.
  if (USER_ANSWERS.length === 0) return undefined;
  const next = USER_ANSWERS.shift();
  // Skip purely-empty lines that were trailing in the file
  if (next === undefined) return undefined;
  return next.trim() === '' ? undefined : next.trim();
}

// P1-5 (UX-R3): Validate --line / --stage / --modality / --force-shadow.
// Previously these were `as` type assertions with no runtime check, so any
// string was silently accepted — the user had no way to discover valid
// values except by trial-and-error or by peeking at save files. Now we
// fail fast with a helpful list of valid options.
const VALID_SHADOW_QUADRANTS = new Set(['none', 'DarkAddiction', 'DarkAllergy', 'GoldenAddiction', 'GoldenAllergy']);
function validateFlag<T extends string>(label: string, value: string | undefined, valid: readonly T[] | Set<T>, validSetName: string): void {
  if (value === undefined) return;
  const isValid = valid instanceof Set ? valid.has(value as T) : (valid as readonly string[]).includes(value);
  if (!isValid) {
    const list = valid instanceof Set ? Array.from(valid).join(', ') : (valid as readonly string[]).join(', ');
    console.error(`${chalk.red('✗')} Invalid ${label}: ${chalk.bold(value)}`);
    console.error(`  Valid ${validSetName}: ${list}`);
    process.exit(1);
  }
}
validateFlag('--line', FORCE_LINE, ALL_LINES, 'lines');
validateFlag('--stage', FORCE_STAGE, ALL_STAGES, 'stages');
validateFlag('--modality', FORCE_MODALITY, ALL_MODALITIES, 'modalities');
validateFlag('--force-shadow', FORCE_SHADOW, VALID_SHADOW_QUADRANTS, 'shadow quadrants');

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

// P1-1 (UX-R3): Word-boundary-aware truncation. The previous slice(0, N)
// cut mid-word ("...beneath th..." instead of "...beneath the surface."),
// making narratives feel broken even though the full text existed in JSON.
// This helper preserves sentence boundaries when possible and always ends
// on a word boundary.
function truncateNarrative(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  // Try to break on a sentence-ending punctuation first.
  const sentenceEnd = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  if (sentenceEnd > max * 0.5) {
    return cut.slice(0, sentenceEnd + 1) + '…';
  }
  // Otherwise break on the last space within the cut window.
  const lastSpace = cut.lastIndexOf(' ');
  if (lastSpace > max * 0.5) {
    return cut.slice(0, lastSpace) + '…';
  }
  // Fallback: hard cut.
  return cut + '…';
}

// P0-2 (UX-R3): Emit holistic dev primitives when --dev is set, so the
// --help promise ("show holistic primitives (G_z/P_z, rayProfile, phase
// position)") is honored during sessions, not just in `status`.
// Called from both encounter loops (DQ + Story-Driven) after each encounter.
function emitDevPrimitives(sig: Significator, label: string): void {
  if (!DEV_MODE) return;
  try {
    const snapshot = toSnapshot(sig);
    const cci = computeCCI(snapshot);
    const mh = cci.metabolicHealth;
    if (JSON_MODE) {
      emitEvent('dev_primitives', {
        label,
        gz: mh?.gz ?? null,
        pz: mh?.pz ?? null,
        metabolicTotal: mh?.total ?? null,
        interpretation: mh?.interpretation ?? null,
        cci: cci.composite,
        transformationPhase: sig.transformationPhase ?? 'idle',
        rayProfile: sig.rayProfile,
        transformationTargetStage: sig.transformationTargetStage ?? null,
        sessionsInPhase: sig.transformationSessionsInPhase ?? 0,
        knotsResolved: sig.transformationKnotsResolved ?? 0,
        internalizedHolons: sig.internalizedHolons?.length ?? 0,
        greatWayDirection: sig.greatWayDirection ?? null,
      });
    } else {
      info('dev', `${label} → G_z=${mh?.gz?.toFixed(4) ?? 'n/a'} P_z=${mh?.pz?.toFixed(4) ?? 'n/a'} CCI=${cci.composite.toFixed(4)} phase=${sig.transformationPhase ?? 'idle'}`);
    }
  } catch {
    // Best-effort — dev mode should never break a session.
  }
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

// GAP-6 (Efficacy Audit): Infer developmental altitude from user answers.
// Instead of defaulting all lines to Red, analyze the user's --answer
// content for stage-specific vocabulary and conceptual complexity.
// This is a lightweight binary-search — not a full developmental assessment,
// but enough to prevent experts from starting at Red.
function inferAltitudesFromAnswers(): Record<Line, Stage> {
  const allRed: Record<Line, Stage> = {
    Cognitive: 'Red', Emotional: 'Red', Moral: 'Red', Intrapersonal: 'Red',
    Spiritual: 'Red', Somatic: 'Red', Willpower: 'Red', Interpersonal: 'Red',
  };
  if (USER_ANSWERS.length === 0) return allRed;

  const combinedText = USER_ANSWERS.join(' ').toLowerCase();
  const wordCount = combinedText.split(/\s+/).filter(w => w.length > 0).length;

  // Stage markers — vocabulary/concepts that indicate developmental altitude
  const stageMarkers: Record<Stage, readonly string[]> = {
    Infrared: [],
    Magenta: [],
    Red: ['survival', 'power', 'force', 'fight', 'dominate', 'win', 'fear', 'anger', 'protect'],
    Amber: ['duty', 'rules', 'belong', 'tradition', 'loyalty', 'obligation', 'should', 'order', 'role'],
    Orange: ['achieve', 'system', 'strategy', 'rational', 'analysis', 'compete', 'goal', 'optimize', 'objective', 'merit'],
    Green: ['perspective', 'systemic', 'privilege', 'inclusive', 'interconnected', 'pluralism', 'empathy', 'oppression', 'relativ', 'valid'],
    Turquoise: ['integral', 'paradigm', 'kosm', 'evolutionary', 'meta', 'emergent', 'holistic', 'dialectic', 'non-dual', 'aqal'],
    White: ['emptiness', 'non-dual', 'witness', 'dissolution', 'formless', 'awakened', 'no-self', 'suchness', 'rigpa'],
  };

  // Score each stage by marker density
  const stageScores: Record<string, number> = {};
  for (const [stage, markers] of Object.entries(stageMarkers)) {
    if (markers.length === 0) continue;
    const matches = markers.filter(m => combinedText.includes(m)).length;
    stageScores[stage] = matches;
  }

  // Also consider conceptual density (unique words / total words)
  const uniqueWords = new Set(combinedText.split(/\s+/).filter(w => w.length > 2)).size;
  const conceptDensity = wordCount > 0 ? uniqueWords / wordCount : 0;

  // Find the highest stage with significant marker presence
  const stageOrder: Stage[] = ['Red', 'Amber', 'Orange', 'Green', 'Turquoise', 'White'];
  let detectedStage: Stage = 'Red';
  for (const stage of stageOrder) {
    if ((stageScores[stage] ?? 0) >= 2) {
      detectedStage = stage; // keep going up — highest match wins
    }
  }

  // Boost: if the user writes long, dense answers, they're likely above Red
  if (detectedStage === 'Red' && wordCount > 50 && conceptDensity > 0.6) {
    detectedStage = 'Orange'; // literate, reflective → at least formal operations
  }
  if (detectedStage === 'Red' && wordCount > 100 && conceptDensity > 0.7) {
    detectedStage = 'Green'; // sophisticated vocabulary → likely pluralistic
  }

  // Seed all lines at the detected stage (conservative — doesn't differentiate
  // per-line. The first few encounters will refine via actual assessment.)
  const altitudes: Record<Line, Stage> = {} as Record<Line, Stage>;
  const allLines: Line[] = ['Cognitive', 'Emotional', 'Moral', 'Intrapersonal', 'Spiritual', 'Interpersonal', 'Somatic', 'Willpower'];
  for (const line of allLines) {
    altitudes[line] = detectedStage;
  }

  if (!JSON_MODE && detectedStage !== 'Red') {
    info('onboarding', `Answers suggest ${detectedStage} stage — starting there (not Red). Encounters will refine this.`);
  }

  return altitudes;
}

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
    // GAP-6 (Efficacy Audit): Binary-search onboarding for headless mode.
    // Instead of defaulting all lines to Red, probe the user's developmental
    // altitude via their --answer content. If answers show Green+ vocabulary
    // (integration, pluralism, systems-thinking), seed at Green. If they show
    // Amber (rules, duty, belonging), seed at Amber. Otherwise Red.
    // This prevents experts (NASA scientists, therapists, monks) from
    // starting at Red and bouncing.
    altitudes = inferAltitudesFromAnswers();
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

function printEncounter(enc: ScheduledEncounter, world?: WorldState): void {
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

  // P1-2 (UX-R3): Surface the NPC name + narrative role so the user knows
  // WHO they're engaging with. Previously the encounter header showed only
  // 'arc: PEAK' and the user never met the 16 named NPCs (The Conqueror,
  // Bloodfury, Elder Ashmark, etc.) that the encounter was actually with.
  // Veil is preserved: we show name + narrativeRole (atmospheric), not
  // shadowQuadrant or drives (clinical).
  if (world && !JSON_MODE) {
    const holon = world.holons.find(h => h.id === enc.holonSource);
    if (holon && holon.kind === 'NPC') {
      const roleLabel = holon.narrativeRole
        ? holon.narrativeRole.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        : 'presence';
      info('encounter', `${chalk.cyan(holon.name)} ${chalk.dim(`· ${roleLabel}`)}`);
    } else if (holon && holon.kind === 'Location') {
      info('place', `${chalk.cyan(holon.name)}`);
    }
  }

  if (isShadow) {
    // No quadrant name — just the shadow-work indicator
    info('mode', `${chalk.bgRed.white(' shadow ')}`);
  }
}

// ── Unified encounter execution dispatch (YAGNI-1 / UX-R3+R4) ────────
// Both DQ mode and Story-Driven mode call THIS function instead of
// branching on USE_PERSISTENT_AGENT themselves. This eliminates the
// routing divergence that let P0-1 (R3: lexical scope bug) and the
// --no-llm bug (R4: LLM_ACTIVE not respected) hide for multiple audit
// rounds. Future execution-mode checks (new agent types, new LLM
// routing) happen here — one place, one bug surface.
interface EncounterExecutionOptions {
  readonly responsesPool?: number[];
  readonly consecutivePasses?: Map<string, number>;
  readonly agentSynthesis?: string;
  readonly persistentAgent?: PersistentAgent | null;
}
async function executeEncounter(
  encounter: ScheduledEncounter,
  sig: Significator,
  world: WorldState,
  history: ConsequenceRecord[],
  options: EncounterExecutionOptions = {},
): Promise<{
  outcome: import('../src/core/assessments/AgenticOrchestrator.js').OrchestratorResult;
  response: PlayerResponse;
  narrativeSummary: string;
  effectiveEncounter: ScheduledEncounter;
}> {
  // Route to PersistentAgent (--agent / Story-Driven) or AgenticOrchestrator (default).
  // The LLM disable flag (setLLMDisabled) is respected inside both paths via
  // LLMClient.getEnabledConfig() — no need to check it here.
  if (options.persistentAgent) {
    const result = await runPersistentAgentEncounter(options.persistentAgent, encounter, sig, world);
    return { ...result, effectiveEncounter: result.effectiveEncounter ?? encounter };
  }
  const result = await runAgenticEncounter(
    encounter, sig, world, history, options.responsesPool, options.consecutivePasses, options.agentSynthesis,
  );
  return { ...result, effectiveEncounter: encounter };
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
              // R5-BUG-2 (UX-R5): Don't print ' — ' + description when description
              // is empty (was duplicating the label for ScenarioChoice/Strategic/
              // SocialCooperative where label and description were both o.text).
              const optLine = opt.description
                ? `${chalk.cyan('[' + (i + 1) + ']')} ${opt.label} — ${opt.description}`
                : `${chalk.cyan('[' + (i + 1) + ']')} ${opt.label}`;
              console.log(`    ${optLine}`);
            }
          }
        }

        // P0-1 (UX-R3): `header` previously referenced `line` and `i` which only
        // exist in runDirectQuestioningSession's for-loop scope — causing
        // `ReferenceError: line is not defined` on every DQ encounter. Use the
        // destructured `encLine` (always in scope here) and a stable hash for
        // the scene-setting index (no loop counter available in this closure).
        const dqSceneIdx = (encLine.length + (forcedEncounter.modality?.length ?? 0)) % DQ_SCENE_SETTINGS.length;
        emitEvent('ask_user', {
          // UX-R2-3: Use the line name as the header in DQ mode
          header: encLine,
          // UX-R2-7: Prepend the question with NPC scene-setting
          question: q.question,
          narrative: DQ_SCENE_SETTINGS[dqSceneIdx],
          options: q.options?.map((o, oi) => ({ index: oi + 1, label: o.label, description: o.description })),
          allowWriteIn: q.allowWriteIn,
        });

        if (HEADLESS) {
          // R5-CRITICAL (UX-R5): If the user provided an answer via --answer
          // or --answers, use it as the writeInValue. This is the difference
          // between the LLM hallucinating the user's stance and the LLM
          // responding to the user's actual reflection.
          const userAnswer = consumeUserAnswer();
          if (userAnswer !== undefined) {
            // User provided a real answer — inject it as the writeIn.
            // For MCQ questions, also try to match the answer to an option
            // label so the drive-scoring picks up the right signal. If no
            // match, fall back to the first option + the writeIn.
            let selectedIdx = 0;
            if (q.options && q.options.length > 0) {
              const matchIdx = q.options.findIndex(o =>
                o.label.toLowerCase().includes(userAnswer.toLowerCase()) ||
                userAnswer.toLowerCase().includes(o.label.toLowerCase()));
              selectedIdx = matchIdx >= 0 ? matchIdx : 0;
            }
            const selectedLabel = q.options?.[selectedIdx]?.label ?? '';
            answers.push({ selectedLabels: selectedLabel ? [selectedLabel] : [], writeInValue: userAnswer });
          } else if (responsesPool && responsesPool.length > 0) {
            // Use forced responses pool if provided (one index per question, consumed sequentially)
            const forcedIdx = responsesPool.shift()!;
            let selectedIdx: number;
            if (q.options && forcedIdx >= 1 && forcedIdx <= q.options.length) {
              selectedIdx = forcedIdx - 1;
            } else {
              selectedIdx = 0;
            }
            const selectedOpt = q.options?.[selectedIdx];
            const selectedLabel = selectedOpt?.label ?? '';

            // Shadow keyword injection for testing — randomly inject (10% chance)
            const shadowInjections = ['', 'i feel the need to withdraw from this confrontation', 'i must transcend these petty concerns and reach enlightenment', 'i prefer to stay here where it is safe and comfortable'];
            const injectShadow = FORCE_SHADOW !== 'none' && selectedIdx > 0 && Math.random() < 0.1;
            const writeInShadow = injectShadow ? (shadowInjections[selectedIdx] ?? '') : '';

            if (writeInShadow) {
              answers.push({ selectedLabels: [selectedLabel], writeInValue: writeInShadow });
            } else {
              answers.push({ selectedLabels: [selectedLabel] });
            }
          } else {
            // No user answer, no forced responses — vary selection to probe
            // different shadow patterns. (Previous default behavior.)
            const hash = (Date.now() + (q.options?.length ?? 4)) % 4;
            const selectedIdx = hash < (q.options?.length ?? 4) ? hash : 0;
            const selectedOpt = q.options?.[selectedIdx];
            const selectedLabel = selectedOpt?.label ?? '';
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
  const otherCount = world.holons.length - npcCount - factionCount - locationCount;
  // UX-P0-5: Fix holon count mismatch — show all kinds so math adds up
  const breakdown = `${npcCount} NPCs, ${factionCount} factions, ${locationCount} locations${otherCount > 0 ? `, ${otherCount} others` : ''}`;
  success(`${world.holons.length} total: ${breakdown}`);

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
  // R4-P2-3 (UX-R4): Explain what 'theme' means — it biases encounter selection.
  info('theme', `${sessionState.strategy.theme} (session strategy — biases encounter selection)`);
  // R4-P2-2 (UX-R4): Explain what 'totalTarget' means — it's the encounter budget.
  info('totalTarget', `${sessionState.strategy.encounterBudget.totalTarget} encounters per session (warmup + peak + cooldown)`);

  console.log('\nEncounter scheduling:');
  const now = Date.now();
  const { tickResult } = tickWithStrategy(sig, world, session, sessionState, null, null, now);
  if (tickResult.encounter) {
    success('Scheduler produced encounter:');
    printEncounter(tickResult.encounter, world);
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
  printEncounter(tickResult.encounter, world);

  const result = await runAgenticEncounter(tickResult.encounter, sig, world, [], responsesPool, new Map());

  separator('Result');
  info('narrative', result.narrativeSummary);
}

// ── Direct Questioning session — true 8-line flow ──────────────────

// UX-R2-7: NPC scene-setting templates for DQ mode.
// Previously DQ was a bare questionnaire — no story, no NPC, no setting.
// Now each question is preceded by a one-line scene-setting that creates
// RPG atmosphere even without an LLM.
const DQ_SCENE_SETTINGS = [
  'A figure watches you across the firelight. The question forms between you:',
  'The air shifts. Someone is waiting for your answer:',
  'You find yourself at a crossroads. A voice asks:',
  'In the silence after the storm, a presence turns to you:',
  'The old keeper at the gate leans forward. They ask:',
  'A stranger sits beside you on the road. They say:',
  'The mirror before you shows a different face. It asks:',
  'Deep in the chamber, the question finds you:',
];

async function runDirectQuestioningSession(
  initialSig: Significator,
  initialWorld: WorldState,
): Promise<void> {
  banner('DIRECT QUESTIONING');
  if (!JSON_MODE) console.log(`  ${chalk.dim('A series of open questions. Answer each in your own words.')}\n`);

  const ALL_LINES: Line[] = ['Cognitive', 'Emotional', 'Moral', 'Intrapersonal', 'Spiritual', 'Interpersonal', 'Somatic', 'Willpower'];
  // UX-P0-1: Respect --encounters, --line, --stage flags in DQ mode.
  // Previously these were silently ignored — user asks for 3 encounters, gets 8.
  // Now: if --line is set, run only that line. If --encounters is set and < 8,
  // run only that many lines. If --stage is set, force that stage.
  let linesToRun: Line[];
  if (FORCE_LINE) {
    linesToRun = [FORCE_LINE];
  } else {
    // Fisher-Yates shuffle
    const shuffledLines = [...ALL_LINES];
    for (let i = shuffledLines.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledLines[i]!, shuffledLines[j]!] = [shuffledLines[j]!, shuffledLines[i]!];
    }
    // Respect --encounters count (cap at 8 lines)
    const count = Math.min(encounterCount, shuffledLines.length);
    // P2-4 (UX-R3): Warn when --encounters exceeds the DQ cap (8 lines).
    // Previously this was a silent cap — the user asked for 999, got 8,
    // with no explanation. Now they see a clear notice.
    if (encounterCount > shuffledLines.length && !JSON_MODE) {
      warn(`--encounters=${encounterCount} exceeds the ${shuffledLines.length} available lines in Direct Questioning mode; running ${count}. (Use --agent for Story-Driven mode with more encounters.)`);
    }
    linesToRun = shuffledLines.slice(0, count);
  }

  let currentSig = initialSig;
  let currentWorld = initialWorld;
  const history: ConsequenceRecord[] = [];
  const consecutivePasses = new Map<string, number>();
  const agent = new SessionAgent();

  // R8-BUG-5 (UX-R8): Warn when --answer count doesn't match --encounters count.
  // Previously: too few answers → silent reuse/default; too many → silent drop.
  // Now: warn so the user knows their input isn't being used as expected.
  if (USER_ANSWERS.length > 0 && USER_ANSWERS.length !== linesToRun.length && !JSON_MODE) {
    if (USER_ANSWERS.length < linesToRun.length) {
      warn(`--answer count (${USER_ANSWERS.length}) is less than --encounters (${linesToRun.length}); remaining encounters will use default responses.`);
    } else {
      warn(`--answer count (${USER_ANSWERS.length}) exceeds --encounters (${linesToRun.length}); extra answers will be ignored.`);
    }
  }

  for (let i = 0; i < linesToRun.length; i++) {
    const line = linesToRun[i]!;
    // UX-P0-1: Respect --stage forcing
    const currentStage = FORCE_STAGE ?? currentSig.altitudes[line] ?? 'Red';

    // T-3.4 (Veil compliance): don't leak the line taxonomy name.
    separator(`Question ${i + 1}/${linesToRun.length}`);

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
      // YAGNI-1 (UX-R3+R4): Route through the unified dispatch. DQ never
      // has a persistentAgent, so this always uses AgenticOrchestrator —
      // but the routing logic lives in ONE place now.
      const result = await executeEncounter(encounter, currentSig, currentWorld, history, {
        consecutivePasses,
        agentSynthesis: agent.buildSynthesis(),
      });

      // Qualitative feedback — no pass/fail, no clinical labels
      const cr = result.outcome.consequenceRecord;
      if (!JSON_MODE) {
        // P1-1 (UX-R3): word-boundary-aware truncation; was slice(0,120)+'...'
        // R5-BUG-5 (UX-R5): If the LLM returned an empty narrative, fall back
        // to the FallbackNarratives pool instead of showing an empty ✦ line.
        const rawNarrative = result.narrativeSummary?.trim() || pickFallbackNarrative(
          encounter.id, encounter.modality, Date.now() % 1000,
        );
        const briefNarrative = truncateNarrative(rawNarrative, 1000);
        console.log(`\n  ${chalk.dim('\u2726')} ${briefNarrative}`);

        // T-3.4 (Veil compliance): replace "The encounter stirred: ↑ Communion drive, Homeostatic"
        // with a qualitative felt-sense description that doesn't leak drive names.
        // R5-P2-1 (UX-R5): The felt-sense text was repeating every encounter because
        // the same drive directionality recurs. Now we vary the phrasing per encounter
        // using a stable hash so the same encounter doesn't repeat the same line.
        const driveEntries = Object.entries(cr.polarityTrace.driveDirectionality);
        const dominantDrive = driveEntries.find(([, v]) => v !== 'HealthyBalanced');
        if (dominantDrive) {
          const feltSenseVariants: Record<string, string[]> = {
            DarkAddicted: [
              'A familiar pull tugs underneath the surface.',
              'The old pattern reached for you again — and almost had you.',
              'Something in you wanted to slip back into the known shape.',
            ],
            DarkAverted: [
              'Something here is being avoided; the body flinches before the mind catches up.',
              'A part of you turned away before the question fully landed.',
              'There was a flinch — small, quick — toward the exit.',
            ],
            GoldenAddicted: [
              'A reaching toward the light that skips over the ground beneath your feet.',
              'The pull upward felt spiritual — and slightly disembodied.',
              'You reached for the higher thing before the lower thing was done.',
            ],
            GoldenAverted: [
              'A resistance to what is trying to emerge.',
              'Something in you braced against the next step.',
              'The call forward met a quiet, stubborn no.',
            ],
          };
          const variants = feltSenseVariants[dominantDrive[1] as string] ?? ['Something stirred.'];
          const idx = (encounter.id.length + Date.now()) % variants.length;
          console.log(`  ${chalk.dim(variants[idx] ?? variants[0]!)}`);
        }

        // R7-P1-2 (UX-R7): Vary the shadow-surfaced footer so it doesn't
        // repeat the same line every encounter.
        if (cr.shadowSurfaced) {
          const stirredVariants = [
            'Something beneath the surface stirred.',
            'A shadow edge caught the light.',
            'Something unnamed moved in the periphery.',
            'A pattern you haven\'t fully named flickered past.',
          ];
          const idx = (encounter.id.length + Date.now()) % stirredVariants.length;
          console.log(`  ${chalk.dim(stirredVariants[idx] ?? stirredVariants[0]!)}`);
        }
        // P1-3 (UX-R3): Progress bar is deferred until after currentSig is
        // updated (see below) so it reflects the encounter that just completed.
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

      // P1-3 (UX-R3): Surface per-line progress to next threshold AFTER the
      // sig is updated, so the bar reflects the encounter that just completed.
      if (!JSON_MODE) {
        const progress = getLineProgress(currentSig).find(p => p.line === line);
        if (progress) {
          const filled = Math.min(8, Math.round(progress.ratio * 8));
          const bar = '▓'.repeat(filled) + '░'.repeat(8 - filled);
          console.log(`  ${chalk.dim(`${line.padEnd(13)} ${bar} ${progress.traces}/${progress.threshold}`)}`);
        }
      }

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

      // P0-2 (UX-R3): Honor --dev during DQ sessions.
      emitDevPrimitives(currentSig, `dq:${line}:${currentStage}`);
    } catch (err: any) {
      error(`Encounter failed: ${err.message || err}`);
      emitEvent('dq_line_error', { line, error: err.message });
    }
  }

  // T-3.4: Radar chart removed — Veil violation (shows line×stage matrix).

  // Session end — apply theta-decay and increment totalSessions.
  // P1-17: Previously DQ created a FRESH sessionState here (with empty
  // recentOutcomes + fresh userMatrixModel), causing endSession's summary to
  // report encountersCompleted=0 + shadowsSurfaced=0 + empty userMatrixSummary.
  // Now we reconstruct a sessionState that reflects the DQ session's actual
  // accumulated state (8 completed encounters + the globalThis userMatrixModel).
  const now = Date.now();
  const dqSessionState = startSession(currentSig, { encountersSoFar: 8, sessionDurationMs: 0, targetSessionLength: 8, recentLines: [] });
  // Override with the actual accumulated state from the DQ session
  const dqAccumulatedState: SessionState = {
    ...dqSessionState,
    recentOutcomes: Array.from({ length: 8 }, () => ({
      outcome: 'completed' as const,
      quality: 0.6,
      mode: 'capacity' as const,
      shadowIntegrated: false,
    })),
    encountersSinceRefresh: 8,
    userMatrixModel: (globalThis as any).__userMatrixModel ?? dqSessionState.userMatrixModel,
    sessionStartMs: now - 8 * 60000, // approximate session start
  };
  const sessionEnd = endSession(currentSig, dqAccumulatedState, now, currentWorld);
  currentSig = sessionEnd.sig;
  if (sessionEnd.world) {
    currentWorld = sessionEnd.world;
  }

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
      // UX-P0-3: Emit LLM-unavailable warning in JSON mode too
      if (JSON_MODE) {
        emitEvent('warning', { code: 'llm_unavailable', message: 'LLM unreachable — using module-only mode. Set --no-llm to suppress this check.' });
      }
    } else {
      s2?.succeed(`LLM active: ${ACTIVE_MODEL}`);
      // R6-P1-1 (UX-R6): Warn when --headless is used without --answer/--answers
      // and the LLM is active. Without user-provided answers, the LLM will
      // hallucinate user responses (R5-CRITICAL was opt-in, not default).
      // This warning tells the user how to get a real reflective session.
      if (HEADLESS && USER_ANSWERS.length === 0 && !JSON_MODE) {
        warn('Headless mode without --answer: the LLM will generate narratives without your input. For a real reflective session, provide answers via --answer "your reflection" (repeatable) or --answers <file>.');
      }
      if (HEADLESS && USER_ANSWERS.length === 0 && JSON_MODE) {
        emitEvent('warning', { code: 'no_user_answers', message: 'Headless mode without --answer: the LLM will generate narratives without user input. Provide --answer or --answers for authentic participation.' });
      }
      // R5-P2-3 (UX-R5/R6): Lazy model validation. Warn (not error) if the
      // configured model isn't in the provider's /models list. Non-blocking.
      const modelCheck = await validateModelIfFresh();
      if (modelCheck && !modelCheck.valid && modelCheck.message) {
        if (!JSON_MODE) warn(modelCheck.message);
        else emitEvent('warning', { code: 'model_not_listed', message: modelCheck.message });
      }
    }
  } else {
    // EFFICACY-PILOT (P0): The game MUST run with LLM or not at all.
    // Fallback narratives cannot compensate for the infinite range of human
    // reflection. The pilot study proved that echo-only mode (no LLM) is
    // worse than silence — it returns the user's own words with no therapeutic
    // response, destroying trust after vulnerable disclosures.
    //
    // --no-llm is still allowed for: status, diagnostic, glossary, new-game
    // (non-reflective commands). But actual session play REQUIRES the LLM.
    if (subcommand === 'session' || subcommand === undefined || subcommand === 'full') {
      if (NO_LLM) {
        if (!JSON_MODE) {
          error('CCRPG requires an active LLM to run reflective sessions.');
          console.log(`\n  ${chalk.dim('The LLM is the game\'s therapeutic engine. Without it, encounters become')}`);
          console.log(`  ${chalk.dim('echo-only — your words returned with no reflection. This is worse than silence.')}`);
          console.log(`\n  ${chalk.bold('To configure the LLM:')}`);
          console.log(`  ${chalk.dim('  1. Run `ccrpg setup` in a real terminal, OR')}`);
          console.log(`  ${chalk.dim('  2. Set env vars: OPENCODE_API_KEY=<key> MODEL=<model>, OR')}`);
          console.log(`  ${chalk.dim('  3. Edit ~/.ccrpg/config.json directly')}`);
          console.log(`\n  ${chalk.dim('Non-reflective commands (status, diagnostic, glossary, new-game) still work without LLM.')}\n`);
        } else {
          emitEvent('fatal', { code: 'llm_required', message: 'CCRPG requires an active LLM for reflective sessions. Configure via `ccrpg setup` or set OPENCODE_API_KEY + MODEL env vars.' });
        }
        process.exit(1);
      }
      if (!llmComplete) {
        if (!JSON_MODE) {
          error('LLM not configured. CCRPG requires an active LLM to run sessions.');
          console.log(`\n  ${chalk.dim('No API key found. The game cannot run without the LLM.')}`);
          console.log(`\n  ${chalk.bold('To configure:')}`);
          console.log(`  ${chalk.dim('  1. Run `ccrpg setup` in a real terminal, OR')}`);
          console.log(`  ${chalk.dim('  2. Set OPENCODE_API_KEY=<key> and MODEL=<model> env vars, OR')}`);
          console.log(`  ${chalk.dim('  3. Edit ~/.ccrpg/config.json: {"llm":{"provider":"opencode","apiKey":"<key>","model":"mimo-v2.5-free","baseUrl":"https://opencode.ai/zen/v1"}}')}\n`);
        } else {
          emitEvent('fatal', { code: 'llm_not_configured', message: 'No LLM API key configured. Run `ccrpg setup` or set env vars.' });
        }
        process.exit(1);
      }
    }
    s2?.info('LLM disabled (--no-llm) — only non-reflective commands available');
  }

  // PILOT-5.5 (Efficacy Pilot): With LLM-required mode, the saturation
  // threshold stays at 20 (the LLM-calibrated value). The --no-llm threshold
  // lowering to 6 is now dead code — the game refuses to run without LLM.
  // The threshold of 20 means ~20 encounters per line × 8 lines = ~160
  // encounters for a stage transition. This is intentional — stage
  // transitions are rare, dramatic, and require sustained practice.

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
  // R8-BUG-4 (UX-R8): Warn when --agent is used with --answer. The agent path
  // (Story-Driven mode) doesn't consume --answer flags — only DQ mode does.
  // Previously --answer was silently ignored, confusing users who provided
  // reflective input expecting it to shape the narrative.
  if (USE_PERSISTENT_AGENT && USER_ANSWERS.length > 0 && !JSON_MODE) {
    warn(`--agent uses Story-Driven mode; --answer flags will be ignored. Use Direct Questioning mode (default, without --agent) for --answer participation.`);
  }
  if (USE_PERSISTENT_AGENT && USER_ANSWERS.length > 0 && JSON_MODE) {
    emitEvent('warning', { code: 'agent_ignores_answer', message: '--agent uses Story-Driven mode; --answer flags will be ignored. Use DQ mode (default) for --answer participation.' });
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
    if (!JSON_MODE) info('agent', `${chalk.cyan('Persistent Developmental Agent')} (session-persistent)`);
    // Best-effort TDG-Rust start — no-op if binary not installed.
    // YAGNI-2 (UX-R3/R4): Removed the user-facing 'TDG-Rust not running'
    // message — it confused fresh users who had no idea what TDG-Rust was
    // and made the project look unfinished. The 'TDG-Rust active' message
    // stays (only fires when the binary is actually installed, which is
    // useful signal). The underlying infrastructure stays for when someone
    // installs TDG-Rust.
    await startTDGBridge().catch(() => { /* TDG unavailable — continue with CCRPG tools only */ });
    const tdgStatus = getTDGBridgeStatus();
    if (tdgStatus.running && !JSON_MODE) {
      info('tdg', `${chalk.green('TDG-Rust active')} — graph memory online`);
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
    printEncounter(selectedEncounter, currentWorld);

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

    // Run encounter — YAGNI-1 (UX-R3+R4): both DQ and Story now route
    // through the unified executeEncounter dispatch. The routing logic
    // (PersistentAgent vs AgenticOrchestrator) lives in ONE place.
    try {
      const result = await executeEncounter(selectedEncounter, currentSig, currentWorld, history, {
        responsesPool,
        consecutivePasses,
        persistentAgent,
      });

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

        // P1-1 (UX-R3): word-boundary-aware truncation; was slice(0,100)+'...'
        // R5-BUG-5 (UX-R5): Fall back to FallbackNarratives if LLM returned empty.
        const rawNarrative = result.narrativeSummary?.trim() || pickFallbackNarrative(
          selectedEncounter.id, selectedEncounter.modality, Date.now() % 1000,
        );
        const briefNarrative = truncateNarrative(rawNarrative, 1000);
        console.log(`\n  ${chalk.dim('✦')} ${briefNarrative}`);

        // R7-P1-2 (UX-R7): Vary the shadow-surfaced footer (Story-Driven path).
        if (cr.shadowSurfaced) {
          const stirredVariants = [
            'Something beneath the surface stirred.',
            'A shadow edge caught the light.',
            'Something unnamed moved in the periphery.',
            'A pattern you haven\'t fully named flickered past.',
          ];
          const idx = (selectedEncounter.id.length + Date.now()) % stirredVariants.length;
          console.log(`  ${chalk.dim(stirredVariants[idx] ?? stirredVariants[0]!)}`);
        }
      }

      if (VERBOSE) {
        // R6-P2-2 (UX-R6): Only print 'feedback' if it differs from 'narrative'.
        // In no-LLM mode they're identical (both use fallback); in LLM mode
        // they should differ. Printing both when identical is wasteful.
        const feedback = result.outcome.feedback?.slice(0, 200) ?? '';
        if (feedback && feedback !== result.narrativeSummary.slice(0, 200)) {
          verbose('feedback', feedback);
        }
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

      // P0-2 (UX-R3): Honor --dev during Story-Driven sessions.
      emitDevPrimitives(currentSig, `enc:${selectedEncounter.moduleRef}`);

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
    ? await endSessionAsync(currentSig, sessionState, now + encounterCount * 5000, currentWorld)
    : endSession(currentSig, sessionState, now + encounterCount * 5000, currentWorld);

  // P1-14: If endSession advanced macro-event lifecycle, use the updated world.
  if (sessionEnd.world) {
    currentWorld = sessionEnd.world;
  }

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

// ── Provider registry (dynamic) ────────────────────────────────────
// The static PROVIDERS catalog with hardcoded model lists has been removed.
// Provider profiles now live in src/infra/llm/ProviderRegistry.ts and carry
// only the immutable bits (baseUrl, authStyle, env var name). The model list
// is fetched dynamically from each provider's /models endpoint, with
// models.dev as a fallback catalog. This mirrors opencode's architecture.
import {
  listProfiles as listProviderProfiles,
  getProfile as getProviderProfile,
  getModels as getProviderModels,
  clearModelCache,
  type LLMConfig as DynamicLLMConfig,
  type DiscoveredModel,
  type ProviderProfile,
} from '../src/infra/llm/ProviderRegistry.js';

/**
 * Verify a provider connection by fetching /models (OpenAI-compat) or
 * sending a minimal /messages request (Anthropic). Returns ok + message.
 * Replaces the previous verifyProviderConnection that hard-coded per-provider logic.
 */
async function verifyProviderConnection(config: DynamicLLMConfig): Promise<{ ok: boolean; message: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (config.apiKey && config.apiKey !== 'sk-placeholder') {
      if (config.authStyle === 'x-api-key') {
        headers['x-api-key'] = config.apiKey;
        if (config.protocol === 'anthropic') headers['anthropic-version'] = '2023-06-01';
      } else {
        headers.Authorization = `Bearer ${config.apiKey}`;
      }
    }

    if (config.protocol === 'anthropic') {
      // Anthropic: POST /v1/messages with minimal payload
      const res = await fetch(`${config.baseUrl}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: config.model,
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

    // OpenAI-compatible (incl. Ollama, OpenCode Zen, OpenRouter, etc.): GET /models
    const res = await fetch(`${config.baseUrl.replace(/\/$/, '')}/models`, {
      headers,
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

// ── Setup wizard (dynamic) ────────────────────────────────────────
// Refactored to use ProviderRegistry instead of the hardcoded PROVIDERS catalog.
// The model list is now fetched at runtime from each provider's /models
// endpoint (with models.dev as a fallback catalog), so we never ship stale
// model names. Mirrors opencode's dynamic provider+model discovery design.
async function runSetup(): Promise<void> {
  // R9-BUG-6 (UX-R9): The old message 'remove --headless and --json' was
  // contradictory when the system auto-enabled --headless (non-TTY guard).
  // The user didn't add --headless — the system did, then scolded them.
  // New message is honest about what happened and what to do.
  if (HEADLESS || JSON_MODE) {
    if (!process.stdin.isTTY) {
      error('setup requires a real terminal (TTY). Please run `ccrpg setup` in an interactive terminal. For non-interactive configuration, edit ~/.ccrpg/config.json directly or set env vars (OPENCODE_API_KEY, LLM_MODEL, etc.).');
    } else {
      error('setup requires interactive mode (remove --headless and --json flags)');
    }
    return;
  }
  banner('CCRPG Setup Wizard');
  console.log(`\n  ${chalk.dim('Configure your LLM provider for the developmental engine.')}\n`);
  console.log(`  ${chalk.dim('Models are fetched live from each provider — no stale lists.')}\n`);

  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.mkdirSync(path.join(CONFIG_DIR, 'saves'), { recursive: true });
  success(`Config directory: ${CONFIG_DIR}`);

  const existing = loadConfig();
  if (existing.llm?.provider) {
    info('current provider', `${existing.llm.provider} (${existing.llm.model || 'no model'})`);
  }

  // Check for env-var pre-configuration (e.g. OPENCODE_API_KEY already set).
  // If a provider's env var is set, offer to use it directly.
  const envConfiguredProvider = listProviderProfiles().find(profile =>
    profile.envVars.some(v => process.env[v] && process.env[v] !== 'sk-placeholder')
  );
  if (envConfiguredProvider) {
    const keyVar = envConfiguredProvider.envVars.find(v => process.env[v] && process.env[v] !== 'sk-placeholder');
    info('env detected', `${envConfiguredProvider.name} (via ${keyVar})`);
  }

  // Step 1: Provider selection — from the dynamic registry
  console.log(`\n  ${chalk.bold('Step 1: Select Provider')}`);
  const profiles = listProviderProfiles();
  const providerChoice = await select({
    message: 'Choose your LLM provider:',
    options: profiles.map(p => ({
      value: p.id,
      label: p.name,
      hint: p.envVars.length > 0 ? `env: ${p.envVars[0]}` : 'no key needed',
    })),
  });

  if (typeof providerChoice !== 'string') { error('Setup cancelled'); return; }
  const selectedProfile = getProviderProfile(providerChoice)!;

  // Step 2: API key (skip for Ollama; pre-fill from env if available)
  let selectedApiKey = '';
  if (selectedProfile.id === 'ollama') {
    console.log(`\n  ${chalk.bold('Step 2: Detecting Ollama...')}`);
    const spinner = ora('Checking Ollama at localhost:11434...').start();
    const ollamaStatus = await detectOllama();
    if (ollamaStatus.running) {
      spinner.succeed('Ollama detected');
    } else {
      spinner.warn('Ollama not detected at localhost:11434');
      console.log(`  ${chalk.dim('You can still configure it — start Ollama later before playing.')}`);
    }
  } else {
    console.log(`\n  ${chalk.bold('Step 2: API Key')}`);
    // Pre-fill from env vars if available
    const envKey = selectedProfile.envVars
      .map(v => process.env[v])
      .find(v => v && v !== 'sk-placeholder');
    const existingKey = envKey ?? existing.llm?.apiKey ?? '';
    const currentDisplay = existingKey ? `${existingKey.slice(0, 8)}...` : '(not set)';
    console.log(`  Current: ${chalk.dim(currentDisplay)}`);
    console.log(`  ${chalk.dim(`Env vars checked: ${selectedProfile.envVars.join(', ') || '(none)'}`)}`);
    const newKey = await clackText({
      message: `Enter ${selectedProfile.name} API key${envKey ? ' (blank = use env)' : ''}:`,
      defaultValue: '',
    });
    if (typeof newKey !== 'string') { error('Setup cancelled'); return; }
    selectedApiKey = newKey.trim() || existingKey;
  }

  // Step 3: Base URL (only prompt for custom; otherwise use the profile's URL)
  let selectedBaseUrl = selectedProfile.baseUrl;
  if (selectedProfile.id === 'custom') {
    console.log(`\n  ${chalk.bold('Step 3: Custom Endpoint')}`);
    const urlInput = await clackText({
      message: 'Enter base URL (e.g. https://api.example.com/v1):',
      defaultValue: existing.llm?.baseUrl ?? '',
    });
    if (typeof urlInput === 'string' && urlInput.trim()) selectedBaseUrl = urlInput.trim();
  }

  // Step 4: Model selection — DYNAMIC. Fetch /models from the provider.
  console.log(`\n  ${chalk.bold('Step 4: Select Model')}`);
  console.log(`  ${chalk.dim('Fetching live model list from provider...')}`);
  const probeConfig: DynamicLLMConfig = {
    providerId: selectedProfile.id,
    providerName: selectedProfile.name,
    baseUrl: selectedBaseUrl,
    apiKey: selectedApiKey,
    model: '', // empty — we're discovering
    authStyle: selectedProfile.authStyle,
    protocol: selectedProfile.protocol,
  };
  clearModelCache();
  const spinner = ora('Fetching models...').start();
  const discoveredModels: readonly DiscoveredModel[] = await getProviderModels(probeConfig);
  if (discoveredModels.length > 0) {
    spinner.succeed(`Found ${discoveredModels.length} models`);
    // Show first 30 + a "type your own" fallback
    const shown = discoveredModels.slice(0, 30);
    const modelOptions = [
      ...shown.map(m => ({ value: m.id, label: m.label, hint: m.hint })),
    ];
    const modelChoice = await select({
      message: `Select model (showing ${shown.length} of ${discoveredModels.length}):`,
      options: modelOptions,
    });
    let selectedModel = '';
    if (typeof modelChoice === 'string') {
      selectedModel = modelChoice;
    } else {
      // User cancelled — allow manual entry
      const manual = await clackText({ message: 'Enter model ID manually:', defaultValue: '' });
      if (typeof manual === 'string') selectedModel = manual.trim();
    }
    await saveAndVerify(probeConfig, selectedProfile, selectedApiKey, selectedBaseUrl, selectedModel, existing);
  } else {
    // /models failed — fall back to manual entry + models.dev catalog hint
    spinner.warn('Could not fetch model list from provider');
    console.log(`  ${chalk.dim('You can enter a model ID manually. Check the provider docs:')}`);
    if (selectedProfile.docUrl) console.log(`  ${chalk.dim(selectedProfile.docUrl)}`);
    const manual = await clackText({
      message: 'Enter model ID:',
      defaultValue: existing.llm?.model ?? '',
    });
    let selectedModel = '';
    if (typeof manual === 'string') selectedModel = manual.trim();
    if (!selectedModel) { error('No model specified — setup cancelled'); return; }
    await saveAndVerify(probeConfig, selectedProfile, selectedApiKey, selectedBaseUrl, selectedModel, existing);
  }
}

/** Shared save + verify step used by both branches of model selection. */
async function saveAndVerify(
  probeConfig: DynamicLLMConfig,
  profile: ProviderProfile,
  apiKeyVal: string,
  baseUrlVal: string,
  modelVal: string,
  existing: CCRPGConfig,
): Promise<void> {
  // Step 5: Verify connection
  console.log(`\n  ${chalk.bold('Step 5: Verify Connection')}`);
  const verifyConfig: DynamicLLMConfig = { ...probeConfig, model: modelVal };
  const spinner = ora('Verifying connection...').start();
  const verification = await verifyProviderConnection(verifyConfig);
  if (verification.ok) {
    spinner.succeed(verification.message);
  } else {
    spinner.warn(`Verification: ${verification.message}`);
    console.log(`  ${chalk.dim('You can still save — fix the issue before playing.')}`);
  }

  // Step 6: Save config
  const config: CCRPGConfig = {
    llm: {
      provider: profile.id as any,
      apiKey: apiKeyVal || existing.llm?.apiKey,
      model: modelVal,
      baseUrl: baseUrlVal,
    },
    session: { defaultEncounters: existing.session?.defaultEncounters ?? 20, defaultMode: existing.session?.defaultMode ?? 'full' },
  };
  saveConfig(config);

  // Invalidate the LLMClient config cache so the next session picks up the new config.
  invalidateConfigCache();

  // Summary
  console.log('');
  success(`Configuration saved to ${CONFIG_FILE}`);
  console.log(`\n  ${chalk.bold('Summary')}`);
  console.log(`  ${chalk.green('✓')} provider:    ${profile.name}`);
  console.log(`  ${chalk.green('✓')} model:       ${modelVal}`);
  console.log(`  ${chalk.green('✓')} endpoint:    ${baseUrlVal}`);
  console.log(`  ${chalk.green('✓')} api key:     ${apiKeyVal ? `${apiKeyVal.slice(0, 8)}...` : '(none)'}`);
  console.log(`\n  Run ${chalk.bold('ccrpg')} to start your developmental journey.\n`);
}

// ── Status command ────────────────────────────────────────────────────
async function runStatus(): Promise<void> {
  // P0-3 (UX-R3): JSON-mode branch. Previously `status --json` produced
  // broken output — section headers appeared but content was stripped
  // because the pretty-print helpers (info(), banner()) suppress themselves
  // in JSON mode, while console.log() for headers did not. This made the
  // CLI unscriptable. Now we emit a single structured JSON object.
  const config = loadConfig();

  bootRegistries();
  const moduleRegistry = bootModuleRegistry();
  (globalThis as any).__moduleRegistry = moduleRegistry;

  // P1-3 (UX-R3): Mirror the session-entry threshold tuning so status
  // PILOT-5.5: No-LLM threshold lowering removed — game requires LLM.
  // Threshold is always 20 (the LLM-calibrated value).

  if (JSON_MODE) {
    const ALL_LINES_FOR_JSON: Line[] = ['Cognitive', 'Emotional', 'Moral', 'Intrapersonal', 'Spiritual', 'Interpersonal', 'Somatic', 'Willpower'];
    const sig = hasSave() ? loadSave() : null;
    // Veil compliance: the JSON output respects the same Veil as the
    // pretty-print path — qualitative aesthetic + milestone, not raw
    // clinical state. Stage names and trace counts are exposed because
    // they are already user-visible in the pretty-print table.
    const stageAesthetics: Record<string, string> = {
      Infrared: 'cave-dark, primal', Magenta: 'spirit-saturated, symbolic',
      Red: 'fortress-sharp, weapon-walls', Amber: 'cathedral-ordered, gold-stone',
      Orange: 'mechanism-precise, steel-glass', Green: 'garden-lush, earth-tones',
      Turquoise: 'crystalline, translucent', White: 'luminous silence, spacious',
    };
    const stageAestheticsShort: Record<string, string> = {
      Infrared: 'primal', Magenta: 'symbolic', Red: 'power', Amber: 'order',
      Orange: 'reason', Green: 'harmony', Turquoise: 'integral', White: 'unity',
    };
    const out: any = {
      type: 'status',
      version: VERSION,
      node: process.version,
      config: {
        configDir: CONFIG_DIR,
        hasConfigFile: fs.existsSync(CONFIG_FILE),
        provider: config.llm?.provider ?? 'gemini',
        model: config.llm?.model ?? model,
        hasApiKey: !!config.llm?.apiKey,
        apiKeyPrefix: config.llm?.apiKey ? config.llm.apiKey.slice(0, 8) + '...' : null,
      },
      system: {
        modulesLoaded: moduleRegistry.count(),
        holons: 36, // matches diagnostic; kept stable for scriptability
      },
    };
    if (sig) {
      const aesthetic = stageAesthetics[sig.currentStage] ?? 'shifting, becoming';
      const milestone = sig.totalEncounters === 0
        ? 'Your path is yet to begin.'
        : sig.totalEncounters < 10
          ? 'You have tasted the first edges.'
          : sig.totalEncounters < 30
            ? 'Your path deepens with each step.'
            : 'The shape of your journey grows clear.';
      out.save = {
        playerId: sig.id,
        currentStage: sig.currentStage,
        stageAesthetic: aesthetic,
        resonance: `The world feels ${aesthetic}.`,
        journeyMilestone: milestone,
        totalEncounters: sig.totalEncounters,
        totalSessions: sig.totalSessions,
        shadowsActive: sig.shadows.activeCount,
        lines: ALL_LINES_FOR_JSON.map((line) => {
          const stage = sig.altitudes[line] ?? 'Red';
          const cellKey = `${line}:${stage}`;
          const traces = sig.polarity.cells[cellKey]?.traceCount ?? 0;
          return {
            line,
            stage,
            stageAesthetic: stageAestheticsShort[stage] ?? 'power',
            encounters: traces,
          };
        }),
      };
      if (DEV_MODE) {
        const snapshot = toSnapshot(sig);
        const cci = computeCCI(snapshot);
        const mh = cci.metabolicHealth;
        out.dev = {
          cci: cci.composite,
          gz: mh?.gz ?? null,
          pz: mh?.pz ?? null,
          metabolicTotal: mh?.total ?? null,
          interpretation: mh?.interpretation ?? null,
          transformationPhase: sig.transformationPhase ?? 'idle',
          rayProfile: sig.rayProfile,
          transformationTargetStage: sig.transformationTargetStage ?? null,
          sessionsInPhase: sig.transformationSessionsInPhase ?? 0,
          knotsResolved: sig.transformationKnotsResolved ?? 0,
          internalizedHolons: sig.internalizedHolons?.length ?? 0,
          greatWayDirection: sig.greatWayDirection ?? null,
        };
      }
      // R5-P2-2 (UX-R5): Add Transformation Readiness to status --json so
      // JSON consumers (scripts, CI, dashboards) can see the trajectory.
      // Previously this was only in the human-readable path.
      try {
        const currentOrd = stageOrdinal(sig.currentStage);
        if (currentOrd < ALL_STAGES.length - 1) {
          const targetStage = ALL_STAGES[currentOrd + 1]!;
          const report = computeReadiness(sig, targetStage);
          out.transformationReadiness = {
            currentStage: sig.currentStage,
            targetStage,
            readiness: report.overall,
            threshold: 0.8,
            convergence: report.convergence,
            saturation: report.saturation,
            shadowClearance: report.shadowClearance,
          };
        }
      } catch {
        // Best-effort — don't let readiness computation break JSON.
      }
    } else {
      out.save = null;
    }
    process.stdout.write(JSON.stringify(out) + '\n');
    return;
  }

  banner('CCRPG Status');
  console.log(`\n  ${chalk.bold('Configuration')}`);
  info('config', fs.existsSync(CONFIG_FILE) ? CONFIG_FILE : '(no config file)');
  info('provider', config.llm?.provider ?? 'gemini (default)');
  info('model', config.llm?.model ?? model);
  info('api key', config.llm?.apiKey ? `${config.llm.apiKey.slice(0, 8)}...` : 'not set');

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
      info('encounters', `${sig.totalEncounters} completed across ${sig.totalSessions} session(s)`);

      // UX-P2-1: Show per-line progress as a Veil-compliant qualitative display.
      // Previously status showed only flavor text — no visible progression.
      // Now the user can see which lines they've explored and a sense of depth.
      const ALL_LINES_DISPLAY: Line[] = ['Cognitive', 'Emotional', 'Moral', 'Intrapersonal', 'Spiritual', 'Interpersonal', 'Somatic', 'Willpower'];
      // UX-R2-2: Veil-compliant stage labels — qualitative, not clinical
      const stageAestheticsShort: Record<string, string> = {
        Infrared: 'primal', Magenta: 'symbolic', Red: 'power', Amber: 'order',
        Orange: 'reason', Green: 'harmony', Turquoise: 'integral', White: 'unity',
      };
      const stageSymbols: Record<string, string> = {
        Infrared: '◇', Magenta: '◈', Red: '◆', Amber: '✦',
        Orange: '★', Green: '❋', Turquoise: '✺', White: '☉',
      };
      console.log(`\n  ${chalk.bold('Developmental Lines')}`);
      // P2-3 (UX-R3): Replace the static [power] label with actionable info.
      // Previously every line showed '[power]' (the Red stage aesthetic) with
      // no explanation of what it meant or whether it was good. Now we show
      // the stage aesthetic + progress toward the saturation threshold, so
      // the user can see they're moving toward a stage transition.
      const progressAll = getLineProgress(sig);
      for (const line of ALL_LINES_DISPLAY) {
        const stage = sig.altitudes[line] ?? 'Red';
        const symbol = stageSymbols[stage] ?? '◆';
        const aesthetic = stageAestheticsShort[stage] ?? 'power';
        const cellKey = `${line}:${stage}`;
        const traces = sig.polarity.cells[cellKey]?.traceCount ?? 0;
        const prog = progressAll.find(p => p.line === line);
        const threshold = prog?.threshold ?? 6;
        const ratio = prog?.ratio ?? 0;
        const filled = Math.min(8, Math.round(ratio * 8));
        const bar = '▓'.repeat(filled) + '░'.repeat(8 - filled);
        console.log(`    ${chalk.cyan(line.padEnd(16))} ${symbol} ${chalk.dim(`[${aesthetic}]`)} ${chalk.dim(bar)} ${chalk.dim(`${traces}/${threshold}`)}`);
      }

      // R4-P2-1 (UX-R4): Transformation Readiness indicator. Shows the user
      // their trajectory toward the next stage transition — closing Loop 3's
      // visibility gap. Previously, a fresh user could play 8 encounters and
      // see only "1/20" per line with no sense of what 1/20 meant or where it
      // was going. Now they see the composite readiness + what's blocking.
      // Veil-compliant: structural progress, not clinical state.
      try {
        const currentOrd = stageOrdinal(sig.currentStage);
        if (currentOrd < ALL_STAGES.length - 1) {
          const targetStage = ALL_STAGES[currentOrd + 1]!;
          const report = computeReadiness(sig, targetStage);
          console.log(`\n  ${chalk.bold('Transformation Readiness')}`);
          info('current stage', `${sig.currentStage} → next: ${targetStage}`);
          info('readiness', `${(report.overall * 100).toFixed(0)}% (needs 80% to transition)`);
          // Sub-metrics as a compact bar
          const pct = (v: number) => `${(v * 100).toFixed(0)}%`;
          const bar = (v: number) => {
            const filled = Math.min(10, Math.round(v * 10));
            return '▓'.repeat(filled) + '░'.repeat(10 - filled);
          };
          console.log(`    convergence      ${chalk.dim(bar(report.convergence))} ${chalk.dim(pct(report.convergence))} (lines at current stage)`);
          console.log(`    saturation       ${chalk.dim(bar(report.saturation))} ${chalk.dim(pct(report.saturation))} (encounters processed)`);
          console.log(`    shadow clearance ${chalk.dim(bar(report.shadowClearance))} ${chalk.dim(pct(report.shadowClearance))} (critical shadows resolved)`);
          // Actionable hint based on the weakest dimension
          const dims = [
            { name: 'convergence', val: report.convergence, hint: 'Play encounters across more lines' },
            { name: 'saturation', val: report.saturation, hint: 'Play more encounters at your current stage' },
            { name: 'shadow clearance', val: report.shadowClearance, hint: 'Engage with shadow-work encounters' },
          ].sort((a, b) => a.val - b.val);
          if (report.overall < 0.8) {
            console.log(`    ${chalk.dim(`Focus: ${dims[0]!.hint} (lowest dimension: ${dims[0]!.name})`)}`);
          } else {
            console.log(`    ${chalk.green('✓ Threshold reached — transformation may fire this session')}`);
          }
        } else {
          console.log(`\n  ${chalk.bold('Transformation Readiness')}`);
          info('stage', `${sig.currentStage} (maximum — no further transitions)`);
        }
      } catch {
        // Best-effort — don't let readiness computation break status.
      }

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
    info('save', `${chalk.yellow('no saved game')} — run ${chalk.bold('ccrpg session')} to start`);
    // UX-R2-6: Show the 8-line table even when no save exists, so the user
    // can see the shape of the journey before they begin.
    const EMPTY_LINES: Line[] = ['Cognitive', 'Emotional', 'Moral', 'Intrapersonal', 'Spiritual', 'Interpersonal', 'Somatic', 'Willpower'];
    console.log(`\n  ${chalk.bold('Developmental Lines')}`);
    for (const line of EMPTY_LINES) {
      console.log(`    ${chalk.cyan(line.padEnd(16))} ◆ ${chalk.dim('[power]')} ${chalk.dim('░░░░░░░░')} ${chalk.dim('0 encounters')}`);
    }
  }

  console.log(`\n  ${chalk.bold('System')}`);
  info('modules', `${moduleRegistry.count()} loaded`);
  info('config dir', CONFIG_DIR);
  info('node', process.version);
  info('version', VERSION);
}

// ── Glossary command (P2-2 / UX-R3) ───────────────────────────────────
// The fresh-user audit found a severe vocabulary wall. Terms like Holon,
// Significator, CCI, rayProfile, G_z/P_z appeared in CLI output with no
// explanation. Users felt like outsiders. The glossary command prints
// 1-line definitions for every term, breaching the wall without requiring
// users to read the docs. The Veil is preserved — these are system-facing
// terms, not player-facing diagnoses.
function runGlossary(): void {
  banner('CCRPG Glossary');
  const terms: ReadonlyArray<{ term: string; def: string }> = [
    { term: 'Holon', def: 'An autonomous whole that is itself part of a larger whole. NPCs, factions, and locations are all holons.' },
    { term: 'Significator', def: 'The persistent soul-pattern of the player — your saved state across sessions. Carries altitudes, drives, shadows, and ray profile.' },
    { term: 'Line', def: 'One of 8 lines of intelligence: Cognitive, Emotional, Moral, Intrapersonal, Spiritual, Interpersonal, Somatic, Willpower.' },
    { term: 'Stage', def: 'One of 8 developmental altitudes: Infrared, Magenta, Red, Amber, Orange, Green, Turquoise, White. You progress through them.' },
    { term: 'Module', def: 'A specific Line × Stage combination. 8 lines × 8 stages = 64 modules total, each with its own assessment content.' },
    { term: 'Modality', def: 'How an encounter is delivered. 7 types: Deterministic (timed trials), LanguageReflective (open questions), ScenarioChoice, Embodied, Strategic, SocialCooperative, ImmersiveRPG.' },
    { term: 'CCI', def: 'Cumulative Consciousness Index — a 0-1 composite of altitude, drive health, polarity, shadow topology, and transformation readiness.' },
    { term: 'rayProfile', def: 'Activation level (0-1) of each of the 7 energy rays: Red, Orange, Yellow, Green, Blue, Indigo, Violet. Maps to stages.' },
    { term: 'G_z / P_z', def: 'Metabolic-health primitives. G_z = generative z-potential (capacity to grow); P_z = pathogenic z-potential (distortion load). Higher G_z, lower P_z is healthier.' },
    { term: 'Arc', def: 'Session position: WARMUP (first 1-2 encounters), PEAK (middle), COOLDOWN (last 1-2). Maps to how contemplative practice actually works.' },
    { term: 'Saturation', def: 'How many encounters you have completed at your current stage per line. Reaching the threshold (6 in no-LLM mode, 20 with LLM) is required for stage transition.' },
    { term: 'Shadow', def: 'An unresolved developmental pattern. Surfacing shadows is part of the work; integrating them is the goal. The CLI never labels them clinically.' },
    { term: 'Drive', def: 'One of 4 fundamental drives: Agency, Communion, Eros, Agape. Each can be healthy-balanced or distorted (DarkAddicted, DarkAverted, GoldenAddicted, GoldenAverted).' },
    { term: 'Polarity', def: 'The energetic direction of an encounter: Absorptive (taking in), Radiative (giving out), or Homeostatic (balanced).' },
    { term: 'Transformation', def: 'A stage transition. Fires when readiness ≥ 0.8, with sufficient line convergence, shadow clearance, and AQAL quadrant coverage.' },
    { term: 'Veil', def: 'A design principle: the game never shows you clinical labels about yourself. You see qualitative felt-sense language, not diagnoses.' },
    { term: 'Resonance', def: 'A poetic 2-3 word description of your current stage\'s aesthetic (e.g. "fortress-sharp, weapon-walls" for Red).' },
    // R4-P1-1 (UX-R4): Explain the [power] bracket label that appears in status.
    { term: 'Aesthetic Label', def: 'The bracketed word next to each developmental line in status output (e.g. [power]). It is the short form of your current stage: [primal]=Infrared, [symbolic]=Magenta, [power]=Red, [order]=Amber, [reason]=Orange, [harmony]=Green, [integral]=Turquoise, [unity]=White.' },
    { term: 'Theme', def: 'The session strategy that biases encounter selection (e.g. "balanced-development"). Shown in diagnostic. Different themes emphasize different lines or shadow work.' },
    { term: 'Encounter', def: 'A single developmental exchange. May be a question, a choice, a trial, or a narrative scene — depending on modality.' },
    { term: 'Calibration', def: 'The initial 8-question session that establishes your baseline across all 8 lines. Runs automatically on first play.' },
    { term: 'TDG', def: 'Temporal Developmental Graph — an optional graph-memory system for cross-session continuity. Not running in default mode.' },
  ];
  if (JSON_MODE) {
    process.stdout.write(JSON.stringify({ type: 'glossary', terms }) + '\n');
    return;
  }
  console.log('');
  for (const { term, def } of terms) {
    console.log(`  ${chalk.bold.cyan(term.padEnd(16))} ${chalk.dim(def)}`);
  }
  console.log(`\n  ${chalk.dim('For the full theoretical foundation, see docs/foundations/ and docs/02-glossary.md.')}\n`);
}

// ── Usage help ──────────────────────────────────────────────────────
function printHelp(): void {
  console.log(`\n${chalk.bold}${chalk.cyan}CCRPG${chalk.reset} v${VERSION}\n\n${chalk.bold}USAGE${chalk.reset}\n  ccrpg                        Start an interactive session\n  ccrpg session                Same as above\n  ccrpg setup                  Configure LLM and preferences\n  ccrpg diagnostic             Show system diagnostics\n  ccrpg status                 Show current save state\n  ccrpg glossary               Show definitions for CCRPG terminology\n  ccrpg new-game               Reset progress and start fresh\n\n${chalk.bold}SESSION OPTIONS${chalk.reset}\n  --encounters=N               Number of encounters (default: ${fileConfig.session?.defaultEncounters ?? 20})\n  --headless                   Run without user interaction\n  --json                       Machine-readable JSON output\n  --verbose                    Show full narrative and feedback\n  --no-llm                     Disable LLM, use module assessments only\n  --dev                        Show holistic primitives (G_z/P_z, rayProfile)\n  --version                    Show version\n\n${chalk.bold}FORCED ENCOUNTERS (for testing)${chalk.reset}\n  --line=LINE                  Force a specific line\n  --stage=STAGE                Force a specific stage\n  --modality=MOD               Force a specific modality\n  --responses=1,2,3            Force specific option selections\n  --force-shadow=Q             Inject shadow-keyword text (testing only)\n\n${chalk.bold}CONFIGURATION${chalk.reset}\n  API key:   ~/.ccrpg/config.json or CCRPG_API_KEY env var\n  Model:     ~/.ccrpg/config.json or CCRPG_MODEL env var\n  Saves:     ~/.ccrpg/saves/\n\n${chalk.bold}EXAMPLES${chalk.reset}\n  ccrpg                                       # interactive session\n  ccrpg --headless --no-llm                   # quick automated test\n  ccrpg setup                                 # configure API key\n  ccrpg session --encounters=5 --json         # JSON event stream\n  ccrpg glossary                              # learn the terminology\n  ccrpg diagnostic                            # system diagnostics\n`);
}

// ── Main ──────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  // ponytail: --version and --help handled by commander automatically

  // P0-4 (UX-R3) + R4-BUG-1 (UX-R4): Non-TTY guard. The interactive prompts
  // (@clack/prompts) block forever when stdin isn't a TTY (CI, pipes,
  // subagent shells, containers). Detect this early and auto-degrade to
  // --headless with a clear warning — instead of the silent hang every
  // fresh user in a non-interactive context currently hits.
  //
  // R4-BUG-1: The original P0-4 fix only covered the bare command + `session`
  // + `setup`. But `diagnostic` also hangs because it calls
  // createDefaultSignificator() which launches interactive Quick Calibration
  // when there's no save. And `new-game` has a confirmation prompt. The fix:
  // treat ALL subcommands as potentially interactive EXCEPT the truly
  // non-interactive ones (`status`, `glossary`). This is safer than
  // enumerating interactive ones — new subcommands default to safe.
  const NON_INTERACTIVE_SUBCOMMANDS = new Set(['status', 'glossary']);
  const needsInteractive = !NON_INTERACTIVE_SUBCOMMANDS.has(subcommand) && !HEADLESS && !JSON_MODE;
  if (needsInteractive && !process.stdin.isTTY) {
    HEADLESS = true;
    process.env.CCRPG_HEADLESS = '1'; // R5-BUG-1: propagate to PersistentAgent
    if (!JSON_MODE) {
      console.error(`${chalk.yellow('⚠')} Non-interactive terminal detected (stdin is not a TTY).`);
      console.error(`  Auto-enabling --headless mode. To run interactively, use a real terminal.`);
      console.error(`  For machine-readable output, add --json.`);
    } else {
      process.stdout.write(JSON.stringify({ type: 'warning', code: 'auto_headless', message: 'Non-interactive terminal — auto-enabled --headless.' }) + '\n');
    }
  }

  if (subcommand === 'setup') { await runSetup(); return; }
  if (subcommand === 'status') { await runStatus(); return; }
  if (subcommand === 'glossary') { runGlossary(); return; }
  // P0-5 + P0-6: Use deleteAllSaves (clears sig + world + atomic envelope).
  // P0-6: Also clear TDG graph state if the TDG bridge is running, so a new
  // game doesn't inherit the old player's developmental graph.
  if (subcommand === 'new-game') {
    // UX-R2-5: Confirmation prompt before destructive reset
    if (hasSave() && !HEADLESS && !JSON_MODE) {
      const confirm = await select({
        message: 'This will permanently delete all progress. Continue?',
        options: [
          { value: 'no', label: 'No — keep my progress' },
          { value: 'yes', label: 'Yes — start fresh' },
        ],
        initialValue: 'no',
      });
      if (confirm !== 'yes') {
        console.log(`${chalk.green('✓')} Progress kept. Run ${chalk.bold('ccrpg session')} to continue.`);
        return;
      }
    }
    deleteAllSaves();
    // YAGNI-EFF-2: TDG graph clear removed — TDG is no longer used by the CLI.
    console.log(`${chalk.yellow('↻')} Progress reset. Run ${chalk.bold('ccrpg session')} to start a new game.`);
    return;
  }

  if (!JSON_MODE) {
    console.log(`\n${chalk.bold.cyan('CCRPG')} v${VERSION}`);
    // UX-P1-1: First-run onboarding — show intro text if no save exists
    if (!hasSave()) {
      console.log(`\n${chalk.dim('Welcome to CCRPG — a developmental RPG.')}`);
      console.log(`${chalk.dim('You\'ll be asked questions across 8 lines of intelligence.')}`);
      console.log(`${chalk.dim('Your answers shape your developmental profile.')}`);
      console.log(`${chalk.dim('There are no wrong answers. Take your time.')}`);
      // GAP-5 (Efficacy Audit): Auto-print key glossary terms on first run.
      // The vocabulary wall is the #1 bounce risk. Instead of just telling
      // users to run 'ccrpg glossary', show them the 5 most important terms
      // inline so they're oriented immediately.
      console.log(`\n${chalk.dim('Key terms: Significator = your developmental profile. Holon = an NPC or place. Line = a developmental dimension (Cognitive, Emotional, etc.). Stage = your current altitude (Red→White). Veil = the game never shows you clinical labels.')}`);
      console.log(`${chalk.dim('Run `ccrpg glossary` for the full list of 22 terms.')}`);
      console.log(`${chalk.dim('Run `ccrpg diagnostic` to check system status.')}`);
      console.log(`${chalk.dim('Run `ccrpg status` to see your progress.')}`);
      console.log(`${chalk.dim('Run `ccrpg new-game` to start over.')}\n`);
    }
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
    // R9-BUG-2 (UX-R9): Force-exit after session completion. The TDG bridge
    // and other async handles (LLM keep-alive, ora spinners) can keep the
    // Node process alive after SESSION END, causing scripted/CI invocations
    // to hang indefinitely. process.exit(0) ensures clean termination.
    process.exit(0);
  }
}

main();
