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
import { Command, Option } from 'commander';

const VERSION = '0.1.0';

// ── Commander program definition (before any arg-dependent code) ─────
// ponytail: commander handles help generation, manual printHelp() removed
const program = new Command()
  .name('ccrpg')
  .version(VERSION)
  // P2-F14 (Fresh-User UX Audit): The old description was a syllabus —
  // "A developmental RPG where every encounter is a validated assessment
  // that simultaneously diagnoses and evolves your cognitive, emotional,
  // moral, and spiritual capacities across 8 lines of intelligence and 8
  // stages of consciousness." A fresh user read it twice and felt like
  // they were entering a research instrument, not a game. The new line is
  // a hook: it tells you what the game FEELS like, not what it measures.
  // The theory unfolds through play.
  .description('CCRPG — A contemplative RPG that mirrors you back to yourself. Answer honest questions; the game reflects your inner landscape in mythopoetic prose. No wrong answers.')
  .option('--headless', 'Run without user interaction')
  .option('--json', 'Machine-readable JSON output')
  .option('--verbose', 'Show additional encounter detail (feedback line, drive expression, arc position)')
  .option('--dev', 'Developer mode: show internal metrics (G_z/P_z, CCI, rayProfile, phase). WARNING: breaks the experiential frame (Veil principle) — for debugging only.')
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
  //
  // R11-Y5 (Fresh-User UX Audit): Both flags are testing-only and confusing.
  // Mark them hidden so they don't appear in default --help output. The
  // printHelp() banner still mentions them in the FORCED ENCOUNTERS section
  // for discoverability by developers; that section is also being trimmed
  // (see printHelp edit below).
  .addOption(new Option('--force-shadow <quadrant>', 'Inject shadow-keyword text into the response pool for testing shadow detection (alias: --inject-shadow-keyword). Does NOT trigger shadow encounter format — use --modality shadow for that.').hideHelp())
  .addOption(new Option('--inject-shadow-keyword <quadrant>', 'Alias for --force-shadow (testing only)').hideHelp())
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
  // P1-F9: counts are dynamic so they never drift from the actual data.
  .description(`Show definitions for CCRPG terminology (${PLAYER_GLOSSARY_TERMS.length} essentials by default; --full for all ${GLOSSARY_TERMS.length})`)
  .option('--full', `Show all ${GLOSSARY_TERMS.length} terms (advanced theoretical set)`);
// Profiling system: multi-user support
// P0-F3 (Fresh-User UX Audit): Added 'show' action — the synthesis engine
// writes rich data (insights, patterns, active focus) to narrative-memory.md
// and goals.yaml after every session, but there was no command to read it
// back. The game whispered about the player behind their back.
program
  .command('profile [action] [name]')
  .description('Manage user profiles (list, switch, create, delete, show)');
program
  .command('setup-profile')
  .description('Create a new user profile with onboarding questions');

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
import { getActiveConfig, invalidateConfigCache, setLLMDisabled, validateModelIfFresh, queryLLM } from '../src/infra/llm/LLMClient.js';

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
// R11-R2: use canonical resonance from veilDescriptors instead of duplicated maps.
import { describeStage, describePersonalResonance } from '../src/core/presentation/veilDescriptors.js';

import holonsJson from '../src/core/data/red-layer-holons.json';
import { GLOSSARY_TERMS, PLAYER_GLOSSARY_TERMS, ADVANCED_GLOSSARY_TERMS } from '../src/core/data/glossary.js';
import type { ConsequenceRecord } from '../src/core/domain/ConsequenceRecord.js';
import type { Modality } from '../src/core/domain/enums.js';
import { ALL_MODALITIES } from '../src/core/domain/enums.js';
import { thresholdToStage } from '../src/core/usecases/ThresholdMaps.js';
// P1-3 (UX-R3): configurable saturation threshold + per-line progress.
import { setSaturationThreshold, getLineProgress, computeReadiness } from '../src/core/engines/TransformationDetector.js';
// R5-BUG-5 (UX-R5): fallback narrative pool for empty LLM responses.
import { pickFallbackNarrative } from '../src/core/agent/FallbackNarratives.js';
// NF-3 (Fresh-User Re-Audit): Cross-session question de-duplication.
// loadAskedPrompts / saveAskedPrompts persist the asked-prompts set to
// the profile directory so Session N doesn't repeat questions from
// Sessions 1..N-1.
import { loadAskedPrompts, saveAskedPrompts } from '../src/infra/llm/FallbackProvider.js';
// NF-5 (Fresh-User Re-Audit): Route verbose feedback through VeilFilter so
// clinical labels (DarkAllergy, DarkAverted, etc.) and metrics (93% conceptual
// density) don't leak through --verbose. The Veil principle applies to all
// user-facing output, not just the normal path.
import { filterOutput } from '../src/infra/llm/VeilFilter.js';
import {
  listProfiles, createProfile, setActiveProfile, deleteProfile,
  loadProfile, buildContextInjection, updateProfileAfterSession,
  appendEncounterLog, agentReadProfileFile, agentWriteProfileFile,
  getSaveFilePath, getActiveProfileName, getActiveProfileDir, migrateLegacySave,
  getProfilesDir,
} from '../src/infra/profiles/ProfileManager.js';
import { computeConfidence } from '../src/core/assessments/engine.js';
import type { TrialResult } from '../src/core/assessments/types.js';
import { renderLayers, renderLayersCompact } from '../src/cli/LayerRenderer.js';
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
// R11-Y1 (Fresh-User UX Audit): --dev surfaces internal metrics (G_z, P_z,
// CCI, rayProfile, phase position) that violate the Veil principle
// (AGENTS.md §5.4: "The game is NEVER diagnostic to the user"). Engineers
// need these for debugging; players shouldn't stumble into them.
// Solution: print a clear Veil-violation warning when --dev is used. In
// interactive mode, require confirmation. In headless mode (automated
// testing), just warn and continue.
if (DEV_MODE && !JSON_MODE) {
  const devWarning = `${chalk.yellow('⚠ DEV MODE')}: Showing internal metrics (G_z, P_z, CCI, rayProfile, phase).\n  These break the experiential frame (Veil principle) and should not be used during normal play.`;
  if (!HEADLESS) {
    // Interactive mode — require confirmation.
    console.error(devWarning);
    // Note: we don't block here because the confirmation would require an
    // async clack prompt, and this code runs synchronously at module top
    // level. The warning is sufficient — a player who passes --dev will
    // see it on every encounter. (P4 in the audit recommended a full
    // confirmation gate; this is the lightweight version that doesn't
    // require restructuring the CLI's init flow.)
  } else {
    // Headless mode (automated testing) — just warn.
    console.error(devWarning);
  }
}
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

/**
 * NF-8 (Fresh-User Re-Audit): Truncate at a word boundary under `max` chars.
 * Unlike truncateNarrative (which targets narrative prose), this is for
 * shorter fields like session key_shift where a mid-word cut is jarring.
 * Returns the text unchanged if it fits; otherwise cuts at the last space
 * under the limit and appends an ellipsis.
 */
function truncateAtWordBoundary(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  if (lastSpace > max * 0.5) {
    return cut.slice(0, lastSpace) + '…';
  }
  // No good word boundary — hard cut with ellipsis
  return cut.trimEnd() + '…';
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
// ponytail: calibration data extracted to src/core/data/calibrationPrompts.ts (shared with WebUI /onboarding).
import { CALIBRATION_PROMPTS, CHOICE_THRESHOLDS, HOLD_TARGETS } from '../src/core/data/calibrationPrompts.js';

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

  if (!JSON_MODE && detectedStage !== 'Red' && USER_ANSWERS.length > 0) {
    // P0-F2 (Fresh-User UX Audit): Be honest about WHAT was measured and WHEN.
    // The previous message ("inferred from your writing style") fired at boot
    // time, before the player had seen any question — because in --headless
    // mode the --answer flags are already in USER_ANSWERS. The player's
    // experiential reality was "I haven't written anything yet" while the
    // game claimed to have inferred something from their writing. This
    // destroyed trust in every subsequent claim the game made.
    //
    // Fix: (1) gate on USER_ANSWERS.length > 0 so the message never fires
    // when there's genuinely nothing to infer from; (2) reframe to be
    // honest that the inference is from the answers the player brought to
    // the session, not from writing produced during play; (3) soften the
    // claim — this is a rough seed, not a diagnosis.
    info('onboarding', `Starting altitude: ${detectedStage} (a rough seed from the answers you brought; encounters will refine it).`);
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
  // R11-R2: use describePersonalResonance for player-responsive resonance.
  info('id', sig.id);
  // NF-9 (Fresh-User Re-Audit): Add inline gloss so a new user doesn't think
  // 'fortress-sharp, weapon-walls' is a bug. The gloss explains it's the
  // poetic aesthetic of the current stage + shadow state.
  const resonance = describePersonalResonance(sig);
  info('resonance', `${resonance}  ${chalk.dim('(the poetic texture of your current stage)')}`);
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
    // BUG-1/7 fix: pass through user answer + question text for encounter-log.md
    writeInValue: outcome.playerWriteIn ?? undefined,
    questionText: (orchestrator as any)._lastQuestionText ?? undefined,
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
  success(`${moduleRegistry.count()} assessment modules loaded`); // R11-Y4: 64 modules across 8 stages. Red has full visual theming; other stages use LLM-generated narratives with validated assessment tasks.

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
  // NF-6 (Fresh-User Re-Audit): Show CCI with a qualitative interpretation
  // so the user knows what the number means. The re-audit found users could
  // see CCI change (0.5036 → 0.4749) but had no idea if that was good or bad.
  const cciVal = sessionState.cci.composite;
  const cciInterp = cciVal >= 0.7 ? 'flourishing'
    : cciVal >= 0.55 ? 'developing'
    : cciVal >= 0.4 ? 'working'
    : 'struggling';
  // NF3-6 (Fresh-User Audit 3): Add trajectory interpretation. A CCI drop
  // during shadow work is EXPECTED (shadows surfacing is part of the work,
  // not a sign of getting worse). The audit found players couldn't tell if
  // a downward trajectory was healthy or unhealthy. Now we correlate CCI
  // with shadow activity to give a trajectory note.
  const activeShadows = (sig.shadows?.entries ?? []).filter(s => !s.resolvedAt).length;
  const trajectoryNote = activeShadows >= 2
    ? '; shadows surfacing — expected during this phase'
    : activeShadows >= 1
      ? '; a shadow is surfacing — the dip is part of the work'
      : '';
  info('CCI', `${cciVal.toFixed(4)} (${cciInterp}${trajectoryNote})`);
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

/**
 * Post-session LLM synthesis: reads the encounter log from this session,
 * asks the LLM to extract key insights, and appends them to narrative-memory.md.
 * This is the "profile evolution" step — the profile grows smarter after every session.
 *
 * Inspired by Hermes-Agent's background_review pattern: the agent reads what
 * happened and synthesizes it into long-term memory.
 */
async function synthesizeSessionInsights(profileName: string, encounterCount: number): Promise<void> {
  // NF3-1 (Fresh-User Audit 3): Even when LLM is inactive, run the lighter-
  // weight fallback so the Active Focus doesn't go stale. The audit found
  // synthesis succeeds only 25% of the time — and when the LLM is unreachable
  // (LLM_ACTIVE=false), the old code returned immediately with no fallback,
  // leaving the Active Focus frozen on the last successful synthesis.
  if (JSON_MODE) return; // skip in JSON mode
  try {
    const { agentReadProfileFile, agentWriteProfileFile } = await import('../src/infra/profiles/ProfileManager.js');
    const encounterLog = agentReadProfileFile('encounter-log.md');
    if (!encounterLog || encounterLog.length < 100) return; // nothing to synthesize

    // If LLM is inactive, skip the full synthesis but still run the fallback
    // so the Active Focus has something current (the session's last narrative).
    if (!LLM_ACTIVE) {
      const encounters = encounterLog.split('## Encounter ');
      const recentEncounters = encounters.slice(-encounterCount - 1).join('## Encounter ');
      const fallbackFocus = extractLastNarrativeAsFocus(recentEncounters);
      if (fallbackFocus) {
        try {
          const goals = agentReadProfileFile('goals.yaml');
          if (goals) {
            let updatedGoals = goals.replace(/active_focus:.*$/m, `active_focus: "${fallbackFocus.replace(/"/g, "'")}"`);
            if (/last_synthesis_session:/m.test(updatedGoals)) {
              updatedGoals = updatedGoals.replace(/last_synthesis_session:.*$/m, `last_synthesis_session: "${new Date().toISOString()}" (fallback)`);
            } else {
              updatedGoals = updatedGoals.trimEnd() + `\nlast_synthesis_session: "${new Date().toISOString()}" (fallback)\n`;
            }
            agentWriteProfileFile('goals.yaml', updatedGoals, 'overwrite');
            if (!JSON_MODE) {
              info('synthesis', `${chalk.dim('LLM unavailable — using the session\'s last narrative as a placeholder focus')}`);
              console.log(`  ${chalk.dim('Run `ccrpg profile show` to see it. Full synthesis will run when the LLM is reachable.')}`);
            }
          }
        } catch { /* best-effort */ }
      } else {
        if (!JSON_MODE) info('synthesis', `${chalk.dim('LLM unavailable — no narrative to use as placeholder focus')}`);
      }
      return;
    }

    // Take the last N encounters from this session
    const encounters = encounterLog.split('## Encounter ');
    const recentEncounters = encounters.slice(-encounterCount - 1).join('## Encounter ');

    // NF3-1 (Fresh-User Audit 3): Shortened the synthesis prompt from 3000 to
    // 1500 chars. The audit found synthesis succeeds only 25% of the time —
    // the heavier prompt (3000 chars of encounter log + full instructions)
    // was likely causing timeouts or rate-limit failures on the free-tier
    // model. 1500 chars is still enough context for the LLM to extract
    // insight/pattern/active from the last 1-2 encounters.
    const synthesisPrompt = `You are a developmental synthesis engine. Read the following encounter log from a CCRPG session and extract:

1. KEY INSIGHT: One sentence capturing the most important therapeutic insight from this session (what the user discovered or what the LLM named that landed).
2. PATTERN: If a recurring pattern is visible (something that appeared in multiple encounters), name it in one sentence.
3. ACTIVE WORK: What the user is currently processing, in one sentence.

Format your response as exactly 3 lines:
INSIGHT: <one sentence>
PATTERN: <one sentence or "none">
ACTIVE: <one sentence>

Encounter log:
${recentEncounters.slice(0, 1500)}`;

    const result = await queryLLM('You are a developmental synthesis engine. Be concise and precise.', synthesisPrompt);
    if (result && !result.startsWith('{"error"')) {
      // Parse the response — be flexible about format
      const lines = result.split('\n').filter(l => l.trim());
      let insight = '';
      let pattern = '';
      let active = '';

      for (const line of lines) {
        const lower = line.toLowerCase();
        if (lower.startsWith('insight:') || lower.startsWith('1.')) {
          insight = line.replace(/^(insight:|1\.)\s*/i, '').trim();
        } else if (lower.startsWith('pattern:') || lower.startsWith('2.')) {
          pattern = line.replace(/^(pattern:|2\.)\s*/i, '').trim();
        } else if (lower.startsWith('active:') || lower.startsWith('3.')) {
          active = line.replace(/^(active:|3\.)\s*/i, '').trim();
        }
      }

      // Fallback: if no structured format, use the first non-empty line as insight
      if (!insight && lines.length > 0 && result.length > 20) {
        insight = lines[0]!.slice(0, 200);
      }

      let wroteSomething = false;
      if (insight && insight.toLowerCase() !== 'none') {
        // BUG-5 fix: Insert under "## Key Insights" section, not at end of file
        const memContent = agentReadProfileFile('narrative-memory.md') || '';
        const insightsHeader = '## Key Insights';
        const insightsIdx = memContent.indexOf(insightsHeader);
        if (insightsIdx >= 0) {
          const afterHeader = memContent.indexOf('\n## ', insightsIdx + insightsHeader.length);
          const insertAt = afterHeader >= 0 ? afterHeader : memContent.length;
          const updated = memContent.slice(0, insertAt) + `\n- **Session (synthesized):** ${insight}` + memContent.slice(insertAt);
          agentWriteProfileFile('narrative-memory.md', updated, 'overwrite');
        } else {
          agentWriteProfileFile('narrative-memory.md', `\n- **Session (synthesized):** ${insight}`, 'append');
        }
        wroteSomething = true;
      }
      if (pattern && pattern.toLowerCase() !== 'none') {
        // Insert under "## Patterns" section
        const memContent = agentReadProfileFile('narrative-memory.md') || '';
        const patternsHeader = '## Patterns';
        const patternsIdx = memContent.indexOf(patternsHeader);
        if (patternsIdx >= 0) {
          const afterHeader = memContent.indexOf('\n## ', patternsIdx + patternsHeader.length);
          const insertAt = afterHeader >= 0 ? afterHeader : memContent.length;
          const updated = memContent.slice(0, insertAt) + `\n- **Pattern:** ${pattern}` + memContent.slice(insertAt);
          agentWriteProfileFile('narrative-memory.md', updated, 'overwrite');
        } else {
          agentWriteProfileFile('narrative-memory.md', `\n- **Pattern:** ${pattern}`, 'append');
        }
        wroteSomething = true;
      }
      if (active && active.toLowerCase() !== 'none') {
        try {
          const goals = agentReadProfileFile('goals.yaml');
          if (goals) {
            // NF3-5: Also store last_synthesis_session so profile show can
            // display when the Active Focus was last updated. The audit found
            // players can't tell if the focus they're reading is current.
            const { getActiveProfileName } = await import('../src/infra/profiles/ProfileManager.js');
            const profileNameForCount = getActiveProfileName();
            let updatedGoals = goals.replace(/active_focus:.*$/m, `active_focus: "${active.replace(/"/g, "'")}"`);
            // Add or update last_synthesis_session field
            if (/last_synthesis_session:/m.test(updatedGoals)) {
              updatedGoals = updatedGoals.replace(/last_synthesis_session:.*$/m, `last_synthesis_session: ${profileNameForCount ? '' : ''}"${new Date().toISOString()}"`);
            } else {
              updatedGoals = updatedGoals.trimEnd() + `\nlast_synthesis_session: "${new Date().toISOString()}"\n`;
            }
            agentWriteProfileFile('goals.yaml', updatedGoals, 'overwrite');
          }
        } catch { /* best-effort */ }
        wroteSomething = true;
      }

      if (wroteSomething && !JSON_MODE) {
        info('synthesis', `${chalk.green('✓')} Profile updated: insight + pattern + active focus`);
        // P0-F3: Tell the player how to SEE what was synthesized. Before this
        // hint, the game said "profile updated" but gave no way to view the
        // update — the #1 frustration in the fresh-user audit.
        console.log(`  ${chalk.dim('Run `ccrpg profile show` to see what the game has noticed.')}`);
      } else if (!JSON_MODE) {
        info('synthesis', `${chalk.dim('No extractable insights from this session')}`);
      }
    } else {
      // NF-2 (Fresh-User Re-Audit): Distinguish "LLM unavailable" (the call
      // failed) from "LLM returned empty" (the call succeeded but the response
      // was unusable). The old message was always "LLM unavailable" even when
      // the boot probe had succeeded — which contradicted "LLM active" and
      // confused users. Now we check the error shape and report honestly.
      const isUnavailable = !result || result.startsWith('{"error"');

      // NF3-1 (Fresh-User Audit 3): Lighter-weight fallback when LLM synthesis
      // fails. The audit found synthesis succeeds only 25% of the time, leaving
      // the Active Focus/Insights/Patterns stale. Instead of going silent, we
      // extract a simple insight from the last encounter's LLM narrative (the
      // richest in-session text) and write it as the Active Focus. This keeps
      // the reflection layer alive even when the synthesis LLM call fails —
      // the player always has *something* current to read in profile show.
      if (isUnavailable) {
        const fallbackFocus = extractLastNarrativeAsFocus(recentEncounters);
        if (fallbackFocus) {
          try {
            const goals = agentReadProfileFile('goals.yaml');
            if (goals) {
              // NF3-5: Store last_synthesis_session timestamp + mark as fallback
              // so profile show can display "(placeholder — full synthesis pending)"
              let updatedGoals = goals.replace(/active_focus:.*$/m, `active_focus: "${fallbackFocus.replace(/"/g, "'")}"`);
              if (/last_synthesis_session:/m.test(updatedGoals)) {
                updatedGoals = updatedGoals.replace(/last_synthesis_session:.*$/m, `last_synthesis_session: "${new Date().toISOString()}" (fallback)`);
              } else {
                updatedGoals = updatedGoals.trimEnd() + `\nlast_synthesis_session: "${new Date().toISOString()}" (fallback)\n`;
              }
              agentWriteProfileFile('goals.yaml', updatedGoals, 'overwrite');
              if (!JSON_MODE) {
                info('synthesis', `${chalk.dim('the reflection engine could not be reached — using the session\'s last narrative as a placeholder focus')}`);
                console.log(`  ${chalk.dim('Run `ccrpg profile show` to see it. Full synthesis will run next session.')}`);
              }
            } else {
              if (!JSON_MODE) info('synthesis', `${chalk.dim('the reflection engine could not be reached this session')}`);
            }
          } catch {
            if (!JSON_MODE) info('synthesis', `${chalk.dim('the reflection engine could not be reached this session')}`);
          }
        } else {
          if (!JSON_MODE) info('synthesis', `${chalk.dim('the reflection engine could not be reached this session')}`);
        }
      } else {
        if (!JSON_MODE) info('synthesis', `${chalk.dim('the reflection did not surface anything new this session')}`);
      }
    }
  } catch (e: any) {
    if (!JSON_MODE) info('synthesis', `${chalk.dim('Synthesis error: ' + (e?.message || e))}`);
  }
}

/**
 * NF3-1 (Fresh-User Audit 3): Extract a simple one-sentence focus from the
 * last encounter's LLM narrative. Used as a fallback when the full LLM
 * synthesis call fails — so the Active Focus always has *something* current
 * rather than going stale. Returns null if no usable narrative is found.
 */
function extractLastNarrativeAsFocus(encounterLogText: string): string | null {
  // The encounter log has entries like:
  //   ## Encounter N — <timestamp>
  //   **Line:** ... | **Stage:** ...
  //   **Question:** ...
  //   **User's answer:** ...
  //   **LLM narrative:** <this is what we want>
  // Find the LAST "LLM narrative:" line and extract its first sentence.
  const narrativeMatches = encounterLogText.match(/\*\*LLM narrative:\*\*\s*(.+?)(?=\n\*\*|\n##|\n$|$)/gs);
  if (!narrativeMatches || narrativeMatches.length === 0) return null;
  const lastNarrative = narrativeMatches[narrativeMatches.length - 1]!
    .replace(/^\*\*LLM narrative:\*\*\s*/, '')
    .trim();
  if (lastNarrative.length < 10) return null;

  // NF3-1: If the "LLM narrative" is just the user's answer echoed back
  // (the echo fallback path), extract the QUESTION instead — it's a better
  // placeholder focus than the user's own words. The question represents
  // what the game was probing, which is more useful as a "current focus"
  // than a verbatim echo.
  const userAnswerMatches = encounterLogText.match(/\*\*User's answer:\*\*\s*(.+?)(?=\n\*\*|\n##|\n$|$)/gs);
  const lastUserAnswer = userAnswerMatches?.[userAnswerMatches.length - 1]
    ?.replace(/^\*\*User's answer:\*\*\s*/, '')
    .trim();
  if (lastUserAnswer && lastNarrative.trim().toLowerCase() === lastUserAnswer.trim().toLowerCase()) {
    // Echo case — extract the question instead
    const questionMatches = encounterLogText.match(/\*\*Question:\*\*\s*([\s\S]+?)(?=\n\*\*|\n##|\n$|$)/g);
    if (questionMatches && questionMatches.length > 0) {
      const lastQuestion = questionMatches[questionMatches.length - 1]!
        .replace(/^\*\*Question:\*\*\s*/, '')
        .trim();
      if (lastQuestion.length > 10) {
        // Take the first sentence of the question
        const qSentence = lastQuestion.match(/^[^.!?]*[.!?]/)?.[0] ?? lastQuestion.slice(0, 180);
        return `Exploring: ${qSentence.trim()}`;
      }
    }
  }

  // Take the first sentence (up to the first period, exclamation, or question mark)
  const firstSentence = lastNarrative.match(/^[^.!?]*[.!?]/)?.[0] ?? lastNarrative.slice(0, 180);
  return firstSentence.trim();
}

async function runDirectQuestioningSession(
  initialSig: Significator,
  initialWorld: WorldState,
): Promise<void> {
  banner('DIRECT QUESTIONING');
  if (!JSON_MODE) console.log(`  ${chalk.dim('A series of open questions. Answer each in your own words.')}\n`);

  // P1-F10 (Fresh-User UX Audit): Make the adaptive session focus perceptible.
  // The game silently shifts its session strategy based on the player's
  // surfacing shadows (e.g. from 'balanced-development' to 'shadow-integration')
  // — but this was completely invisible during normal play. The fresh-user
  // only discovered it by running `diagnostic`. Now we surface a Veil-compliant
  // qualitative hint at session start so the player can FEEL the game
  // responding to them, without breaking the Veil (no clinical labels, no
  // raw theme names, no metrics).
  if (!JSON_MODE) {
    const activeShadows = (initialSig.shadows?.entries ?? []).filter(s => !s.resolvedAt).length;
    const hint = activeShadows >= 3
      ? 'The work turns toward what has been avoided.'
      : activeShadows >= 1
        ? 'Something stirs beneath the surface — the work edges closer to it.'
        : 'The field is open; the work moves where it will.';
    console.log(`  ${chalk.dim(hint)}\n`);
  }

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
        // R11-P5 (Fresh-User UX Audit): The ✦ glyph precedes the narrative
        // and looks like the game is about to say something. When the
        // narrative is just the player's own write-in answer echoed back
        // (the DQ self-reflection path sets narrativeSummary = writeInValue),
        // the ✦ becomes a cruel punctuation mark — it promises a response
        // and delivers only your own words. Detect the echo case and show
        // an honest "recorded your response" indicator instead. The ✦ +
        // genuine LLM narrative path is preserved for when U1 ships.
        const userWriteIn = result.response?.writeInValue?.trim() ?? '';
        const isEcho = userWriteIn.length > 0
          && briefNarrative.trim().toLowerCase() === userWriteIn.toLowerCase();
        if (isEcho) {
          console.log(`\n  ${chalk.dim('· recorded your response ·')}`);
        } else {
          console.log(`\n  ${chalk.dim('\u2726')} ${briefNarrative}`);
        }

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

      // Profiling: append encounter to the encounter-log.md (preserves user
      // words + LLM responses across sessions — the therapeutic conversation).
      const _activeName = getActiveProfileName();
      if (_activeName) {
        try {
          const userAnswer = result.response?.writeInValue ?? '';
          const questionText = result.response?.questionText ?? '';
          const npcName = currentWorld.holons.find(h => h.id === encounter.holonSource)?.name;
          appendEncounterLog(_activeName, {
            encounterNum: currentSig.totalEncounters,
            line, stage: currentStage,
            npc: npcName,
            question: questionText?.slice(0, 500),
            userAnswer: userAnswer?.slice(0, 500),
            llmNarrative: result.narrativeSummary?.slice(0, 500),
            driveSignal: Object.entries(cr.polarityTrace.driveDirectionality)
              .filter(([, v]) => v !== 'HealthyBalanced')
              .map(([k, v]) => `${k}:${v}`).join(', ') || 'HealthyBalanced',
            shadowSurfaced: cr.shadowSurfaced,
            timestamp: new Date().toISOString(),
          });
        } catch (e: any) { if (!JSON_MODE) console.error(`  ${chalk.dim('profile log error: ' + (e?.message || e))}`); }
      }

      // P1-3 (UX-R3): Surface per-line progress to next threshold AFTER the
      // sig is updated, so the bar reflects the encounter that just completed.
      if (!JSON_MODE) {
        const progress = getLineProgress(currentSig).find(p => p.line === line);
        if (progress) {
          const filled = Math.min(8, Math.round(progress.ratio * 8));
          const bar = '▓'.repeat(filled) + '░'.repeat(8 - filled);
          console.log(`  ${chalk.dim(`${line.padEnd(13)} ${bar} ${progress.traces}/${progress.threshold}`)}`);
        }

        // P1-F6 (Fresh-User UX Audit): --verbose was a no-op in the DQ
        // (headless) session path — the flag was advertised in --help but
        // never referenced in runDirectQuestioningSession(). Now it surfaces:
        //   1. The LLM feedback line (distinct from narrative; normally suppressed)
        //   2. The encounter's drive expression (qualitative, Veil-compliant)
        //   3. The session arc position (warmup/peak/cooldown)
        //   4. The running total encounters
        // This gives curious players / developers a window into the engine
        // without breaking the Veil (no raw G_z/P_z/CCI — those stay behind --dev).
        if (VERBOSE) {
          // NF-5: Route feedback through VeilFilter so clinical labels
          // (DarkAllergy, DarkAverted) and metrics (93% conceptual density)
          // don't leak through --verbose. The Veil applies to all user-facing
          // output, not just the normal path.
          // NF3-2 (Fresh-User Audit 3): Use truncateAtWordBoundary instead of
          // raw .slice(0, 280) so feedback doesn't cut mid-word ("patter" instead
          // of "pattern"). The audit found --verbose feedback was still truncating
          // mid-word because NF-8's fix only applied to Recent Sessions.
          const rawFeedback = result.outcome.feedback ?? '';
          const veiledFeedback = filterOutput(rawFeedback).filtered;
          const truncatedFeedback = truncateAtWordBoundary(veiledFeedback, 280);
          if (truncatedFeedback && truncatedFeedback !== truncateAtWordBoundary(result.narrativeSummary ?? '', 280)) {
            verbose('feedback', truncatedFeedback);
          }
          // NF-5: Translate clinical drive labels to Veil-compliant descriptions.
          // Old: 'Agency:DarkAverted' (clinical). New: 'Agency: a rejection of a lower capacity' (qualitative).
          const driveExpr = cr.polarityTrace.driveDirectionality;
          const driveSummary = Object.entries(driveExpr)
            .filter(([, v]) => v !== 'HealthyBalanced')
            .map(([k, v]) => `${k}: ${veilDriveDirection(v as string)}`).join(', ') || 'balanced';
          verbose('drives', driveSummary);
          verbose('arc', `${encounter.sessionPosition} · encounter ${i + 1}/${linesToRun.length}`);
          verbose('total', `${currentSig.totalEncounters} cumulative encounters`);
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

  // NF3-3 (Fresh-User Audit 3): If no profile is active (first session),
  // migrate the legacy save NOW so the profile exists immediately — not
  // deferred to the next session start or a `profile list` invocation.
  // The audit found: after Session 1, `profile show` said "No active
  // profile yet" even though the player had just played, because
  // migrateLegacySave() was only called in runFullSession() (next session)
  // and profile list. Now it's called here, right after the save lands.
  if (!getActiveProfileName()) {
    const migrated = migrateLegacySave();
    if (migrated && !JSON_MODE) {
      info('profile', `${chalk.green('✓')} Profile "${migrated}" created.`);
    }
  }

  // Profiling system: update the active profile after session end.
  const _profileName = getActiveProfileName();
  if (_profileName) {
    try {
      // Build session entry for session-log.yaml
      // BUG-2 fix: PolarityTrace doesn't have a 'line' field. Get lines from the encounter moduleRefs.
      const linesTouched = [...new Set(history.map((r, i) => {
        // Try to extract line from the encounterId format "dq-Line:Stage:timestamp"
        const match = r.encounterId?.match(/dq-([^:]+):/);
        return match ? match[1] : `Encounter${i + 1}`;
      }))];
      const keyShift = history.length > 0
        ? (history.map(r => r.narrativeSummary).filter(n => n && n.length > 20).slice(-1)[0] || '').slice(0, 200)
        : '';
      const sessionEntry = {
        date: new Date().toISOString(),
        encounters: history.length,
        lines_touched: linesTouched.length > 0 ? linesTouched : ['Unknown'],
        themes: linesTouched.length > 0 ? linesTouched : ['Unknown'],
        key_shift: keyShift || 'No significant shift recorded',
        shadow_surfaced: history.some(r => r.shadowSurfaced) ? 'Yes' : 'No',
        llm_narrative_summary: keyShift || 'No narrative recorded',
      };

      // BUG-6 fix: Use drive DIRECTIONALITY (0-1 health scores) not raw weights.
      // The sig's drives.weights are cumulative offsets (-1 to +1), not health scores.
      // For the profile, convert to 0-1 range: 0.5 = balanced, >0.5 = healthy, <0.5 = pathological.
      const driveWeights = currentSig.drives.weights;
      const driveHealthScores = {
        agency: 0.5 + (driveWeights.agency ?? 0) * 0.5,
        communion: 0.5 + (driveWeights.communion ?? 0) * 0.5,
        eros: 0.5 + (driveWeights.eros ?? 0) * 0.5,
        agape: 0.5 + (driveWeights.agape ?? 0) * 0.5,
      };

      updateProfileAfterSession(_profileName, {
        totalEncounters: currentSig.totalEncounters,
        totalSessions: currentSig.totalSessions,
        currentStage: currentSig.currentStage,
        altitudes: { ...currentSig.altitudes },
        drives: driveHealthScores,
        cci: 0.5,
        sessionEntry,
        shadows: currentSig.shadows.entries,
      });
    } catch { /* best-effort — don't break session end */ }

    // Post-session LLM synthesis: read encounter log, extract insights,
    // append to narrative-memory.md, update goals.yaml active focus.
    if (!JSON_MODE) info('synthesis', `${chalk.dim('Synthesizing session insights...')}`);
    await synthesizeSessionInsights(_profileName, history.length);
  }

  // NF-3: Persist the asked-prompts set so the next session avoids repeats.
  saveAskedPrompts(getActiveProfileDir());

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

  // Profiling system: load active profile and inject context into LLM.
  // This gives the LLM long-term memory of the user across sessions.
  const activeProfileName = getActiveProfileName();
  if (activeProfileName) {
    const profile = loadProfile(activeProfileName);
    if (profile) {
      const contextInjection = buildContextInjection(profile);
      // Set as env var so AgenticOrchestrator can prepend it to the system prompt
      process.env.CCRPG_PROFILE_CONTEXT = contextInjection;
      if (!JSON_MODE) info('profile', `${chalk.cyan(profile.identity?.name || activeProfileName)} loaded — ${profile.identity?.total_sessions || 0} sessions, ${profile.identity?.total_encounters || 0} encounters`);
    }
  } else {
    // Auto-migrate legacy save if no profile exists
    const migrated = migrateLegacySave();
    if (migrated && !JSON_MODE) info('profile', `${chalk.green('✓')} Migrated existing save to profile "${migrated}"`);
    // NF-7: Don't tell the user to run setup-profile — it requires interactive
    // mode and fails in headless. The game will auto-create a 'default' profile
    // when the session saves. Just play.
    else if (!JSON_MODE) info('profile', `${chalk.dim('No profile yet — one will be created automatically when you play.')}`);
  }

  // NF-3 (Fresh-User Re-Audit): Load the cross-session asked-prompts set so
  // Session N doesn't repeat questions from Sessions 1..N-1. The re-audit
  // found Session 4 was entirely verbatim duplicates — the in-memory Set
  // was empty on each new process invocation. Now it's persisted to the
  // profile directory (asked-prompts.json).
  loadAskedPrompts(getActiveProfileDir());

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
  // P1-F10: Surface the adaptive theme with a Veil-compliant qualitative
  // gloss, so the player can feel the game responding to their state without
  // seeing raw engine labels. The raw theme name is still shown (in dim) for
  // developers, but the qualitative hint is what the player reads.
  const themeHint = veilThemeHint(sessionState.strategy.theme);
  info('focus', `${chalk.cyan(themeHint)}`);
  if (VERBOSE || DEV_MODE) info('theme', `${chalk.dim(sessionState.strategy.theme)}`);
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
    // ponytail: TDG-Rust integration removed. USE_PERSISTENT_AGENT is always
    // false, so this block never executes. Stub preserved for compile.
    const tdgStatus = { running: false } as const;
    if (tdgStatus.running && !JSON_MODE) {
      info('tdg', `${chalk.green('TDG-Rust active')} — graph memory online`);
    }
    // Build the tool registry with CCRPG + TDG tools (TDG tools added only if running)
    const toolRegistry = createCCRPGToolRegistry();
    if (tdgStatus.running) {
      // ponytail: registerTDGTools removed with TDG integration.
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
        // R11-P5 (Fresh-User UX Audit): Same echo-detection as DQ path (line ~1700).
        // Suppress ✦ when the "narrative" is just the player's write-in echoed back.
        const userWriteInStory = result.response?.writeInValue?.trim() ?? '';
        const isEchoStory = userWriteInStory.length > 0
          && briefNarrative.trim().toLowerCase() === userWriteInStory.toLowerCase();
        if (isEchoStory) {
          console.log(`\n  ${chalk.dim('· recorded your response ·')}`);
        } else {
          console.log(`\n  ${chalk.dim('✦')} ${briefNarrative}`);
        }

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
        // NF-5: Route through VeilFilter to strip clinical labels + metrics.
        // NF3-2: Use truncateAtWordBoundary instead of raw .slice(0, 200).
        const rawFeedback = result.outcome.feedback ?? '';
        const veiled = filterOutput(rawFeedback).filtered;
        const truncated = truncateAtWordBoundary(veiled, 200);
        if (truncated && truncated !== truncateAtWordBoundary(result.narrativeSummary, 200)) {
          verbose('feedback', truncated);
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

  // NF-3: Persist the asked-prompts set for cross-session de-duplication.
  saveAskedPrompts(getActiveProfileDir());

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
// ── Profile Management ──────────────────────────────────────────────

async function runProfile(action?: string, profileName?: string): Promise<void> {

  if (!action || action === 'list') {
    const profiles = listProfiles();
    const active = getActiveProfileName();
    if (profiles.length === 0) {
      console.log(`\n  ${chalk.dim('No profiles found. Run `ccrpg setup-profile` to create one.')}`);
      // Try migration
      const migrated = migrateLegacySave();
      if (migrated) {
        console.log(`  ${chalk.green('✓')} Migrated existing save to profile "${migrated}".`);
      }
    } else {
      console.log(`\n  ${chalk.bold('Profiles:')}`);
      for (const p of profiles) {
        const marker = p === active ? chalk.green(' ← active') : '';
        console.log(`    ${chalk.cyan(p)}${marker}`);
      }
    }
    console.log('');
    return;
  }

  if (action === 'switch') {
    if (!profileName) { error('Usage: ccrpg profile switch <name>'); return; }
    try {
      setActiveProfile(profileName);
      console.log(`\n  ${chalk.green('✓')} Switched to profile "${profileName}".\n`);
    } catch (err: any) {
      error(err.message);
    }
    return;
  }

  if (action === 'create') {
    if (!profileName) { error('Usage: ccrpg profile create <name>'); return; }
    try {
      createProfile(profileName);
      console.log(`\n  ${chalk.green('✓')} Created profile "${profileName}" and set as active.\n`);
    } catch (err: any) {
      error(err.message);
    }
    return;
  }

  if (action === 'delete') {
    if (!profileName) { error('Usage: ccrpg profile delete <name>'); return; }
    try {
      deleteProfile(profileName);
      console.log(`\n  ${chalk.yellow('↻')} Deleted profile "${profileName}".\n`);
    } catch (err: any) {
      error(err.message);
    }
    return;
  }

  // P0-F3 (Fresh-User UX Audit): `profile show` — surface the synthesized
  // insights, patterns, and active focus that the post-session synthesis
  // (synthesizeSessionInsights) writes to narrative-memory.md and goals.yaml.
  // Before this command, the game printed "✓ Profile updated: insight +
  // pattern + active focus" after every session but gave the player NO way to
  // see what those insights/patterns/focus actually were. The Veil principle
  // (never show clinical labels) was being over-extended to hide the player's
  // own patterns from the player. This command respects the Veil — it shows
  // the qualitative narrative memory (the LLM's own synthesized sentences),
  // not the raw clinical primitives (G_z/P_z, quadrant codes, drive scores).
  if (action === 'show') {
    const targetName = profileName ?? getActiveProfileName();
    if (!targetName) {
      // NF-7 (Fresh-User Re-Audit): The old message told users to run
      // `ccrpg setup-profile`, but that command requires interactive mode
      // and fails in headless. The game auto-creates a profile on the first
      // session anyway. The honest message: play a session first.
      error('No active profile yet. Play a session (ccrpg session) and one will be created automatically. To customize your profile name and pronouns interactively, run `ccrpg setup-profile` in a real terminal.');
      return;
    }
    const profile = loadProfile(targetName);
    if (!profile) {
      error(`Profile "${targetName}" not found. Run \`ccrpg profile list\` to see options.`);
      return;
    }

    banner(`Profile: ${targetName}`);

    const id = profile.identity || {};
    const goals = profile.goals || {};
    const dev = profile.developmentalState || {};

    // ── Identity ──
    console.log(`\n  ${chalk.bold('Stage:')} ${stageColor(id.current_stage || 'Red')(id.current_stage || 'Red')}`);
    console.log(`  ${chalk.bold('Sessions:')} ${id.total_sessions ?? 0}  |  ${chalk.bold('Encounters:')} ${id.total_encounters ?? 0}`);
    console.log(`  ${chalk.bold('Lifecycle:')} ${id.lifecycle || 'Onboarding'}`);
    console.log(`  ${chalk.bold('Last active:')} ${id.last_active ? new Date(id.last_active as string).toLocaleString() : 'never'}`);

    // ── Active Focus ──
    // NF-1 (Fresh-User Re-Audit): The YAML parser returns {} (empty object)
    // for an empty `active_focus:` value. String({}) === '[object Object]',
    // which is what the user saw in the most important reflection field.
    // Fix: coerce to string safely; treat non-string / empty-object as unset.
    const rawFocus = goals.active_focus;
    const focusStr = (typeof rawFocus === 'string')
      ? rawFocus
      : (rawFocus && typeof rawFocus === 'object' && Object.keys(rawFocus).length === 0)
        ? ''  // empty object from YAML parser — treat as unset
        : String(rawFocus ?? '');
    if (focusStr.trim()) {
      console.log(`\n  ${chalk.cyan.bold('▸ Active Focus')}`);
      console.log(`  ${chalk.dim('What the game senses you are currently processing:')}`);
      console.log(`  ${chalk.italic(focusStr)}`);
      // NF3-5 (Fresh-User Audit 3): Show when the Active Focus was last
      // updated so the player can calibrate trust. The audit found players
      // can't tell if the focus is current or stale from a failed-synthesis
      // session. The last_synthesis_session field is written by
      // synthesizeSessionInsights() (with "(fallback)" suffix when the
      // lighter-weight fallback ran).
      const rawSynthTime = goals.last_synthesis_session;
      const synthStr = (typeof rawSynthTime === 'string')
        ? rawSynthTime
        : (rawSynthTime && typeof rawSynthTime === 'object' && Object.keys(rawSynthTime).length === 0)
          ? ''
          : String(rawSynthTime ?? '');
      if (synthStr.trim()) {
        const isFallback = synthStr.includes('(fallback)');
        const timePart = synthStr.replace(/\s*\(fallback\)\s*$/, '').trim().replace(/^"|"$/g, '');
        const timeLabel = isFallback ? 'last updated (placeholder)' : 'last updated';
        const dateStr = timePart ? new Date(timePart).toLocaleString() : 'unknown';
        const suffix = isFallback ? chalk.yellow(' — full synthesis pending') : '';
        console.log(`  ${chalk.dim(`${timeLabel}: ${dateStr}`)}${suffix}`);
      }
    } else {
      console.log(`\n  ${chalk.dim('▸ Active Focus: (not yet set — play a session to generate one)')}`);
    }

    // ── Self-declared goals ──
    if (Array.isArray(goals.self_declared) && goals.self_declared.length > 0) {
      console.log(`\n  ${chalk.cyan.bold('▸ Your Stated Goals')}`);
      for (const g of goals.self_declared) console.log(`  • ${g}`);
    }

    // ── Narrative memory: parse the markdown sections ──
    // narrative-memory.md has sections: Key Insights, Patterns, Active Work,
    // Resolved, Unresolved. Each section has bullet lines (- **...**: text).
    const mem = profile.narrativeMemory || '';
    if (mem.trim().length > 50) {
      const sections: Array<{ key: string; label: string; hint: string }> = [
        { key: 'Key Insights', label: 'Insights (what landed)', hint: 'Synthesized from your sessions — moments the game named something that resonated.' },
        { key: 'Patterns', label: 'Patterns (recurring themes)', hint: 'Things that showed up across multiple encounters.' },
        { key: 'Active Work', label: 'Active Work', hint: 'What the game senses is currently being processed.' },
        { key: 'Resolved', label: 'Resolved (integrated)', hint: 'Patterns that have been worked through.' },
        { key: 'Unresolved', label: 'Unresolved (surfaced, not yet worked)', hint: 'Patterns that surfaced but are still open.' },
      ];
      for (const sec of sections) {
        const bullets = extractMdSectionBullets(mem, sec.key);
        if (bullets.length > 0) {
          console.log(`\n  ${chalk.cyan.bold('▸ ' + sec.label)}`);
          console.log(`  ${chalk.dim(sec.hint)}`);
          for (const b of bullets) console.log(`  ${chalk.dim('•')} ${b}`);
        }
      }
    }

    // ── Shadow ledger (Veil-compliant: qualitative description only) ──
    // P0-F3: The shadow-ledger.json stores clinical quadrant codes
    // (DarkAddiction, DarkAllergy, GoldenAddiction, GoldenAverted) and drive
    // labels. The Veil principle says the game never shows clinical labels.
    // `profile show` respects this by translating the codes into plain
    // qualitative movement descriptions. The player sees "a pull toward
    // over-reliance on a lower capacity" (DarkAddiction) or "a rejection of
    // a lower capacity" (DarkAllergy), not the codes themselves.
    const shadows = profile.shadowLedger?.shadows ?? [];
    if (shadows.length > 0) {
      const surfacing = shadows.filter((s: any) => s.status !== 'integrated');
      const integrated = shadows.filter((s: any) => s.status === 'integrated');
      if (surfacing.length > 0) {
        console.log(`\n  ${chalk.cyan.bold('▸ Surfacing Patterns')}`);
        console.log(`  ${chalk.dim('Recurring edges the game has noticed — not diagnoses, just movements to be aware of:')}`);
        for (const s of surfacing) {
          const ss = s as any;
          const movement = veilShadowMovement(ss.quadrant);
          const drive = ss.drive || ss.line || 'an unnamed drive';
          console.log(`  ${chalk.dim('•')} ${movement} — in the ${ss.line || 'unknown'} line  ${chalk.dim(`(${ss.sessions_active ?? 1} session${ss.sessions_active === 1 ? '' : 's'})`)}`);
        }
      }
      if (integrated.length > 0) {
        console.log(`\n  ${chalk.green.bold('▸ Integrated Patterns')}`);
        console.log(`  ${chalk.dim('Movements that have been worked through:')}`);
        for (const s of integrated) {
          const ss = s as any;
          const movement = veilShadowMovement(ss.quadrant);
          console.log(`  ${chalk.green('✓')} ${movement} — in the ${ss.line || 'unknown'} line`);
        }
      }
    }

    // ── Recent sessions ──
    const sessions = profile.sessionHistory?.sessions ?? [];
    if (sessions.length > 0) {
      console.log(`\n  ${chalk.cyan.bold('▸ Recent Sessions')}`);
      for (const s of sessions.slice(-5)) {
        const ss: any = s;
        const date = ss.date ? new Date(ss.date).toLocaleDateString() : '?';
        // NF-8 (Fresh-User Re-Audit): Truncate at word boundary, not mid-word.
        // The old code did ss.key_shift (which was sliced at 200 chars with no
        // word-boundary awareness), so the user saw 'That's the wor' instead
        // of 'That's the work.' Now we truncate at the last word boundary
        // under 200 chars and add an ellipsis if truncated.
        const raw = ss.key_shift || ss.theme || 'session';
        const truncated = truncateAtWordBoundary(raw, 200);
        console.log(`  ${chalk.dim(date)} — ${truncated}`);
      }
    }

    console.log('');
    return;
  }

  error(`Unknown profile action: ${action}. Valid: list, switch, create, delete, show`);
}

/**
 * Extract bullet lines from a named markdown section in narrative-memory.md.
 * Sections look like: `## Key Insights\n- **Session 1:** text\n- **...:** text\n\n## Next Section`
 * Returns the bullet text (without the leading `- ` and without the `## ` header).
 */
function extractMdSectionBullets(md: string, sectionName: string): string[] {
  const header = `## ${sectionName}`;
  const idx = md.indexOf(header);
  if (idx < 0) return [];
  const afterHeader = idx + header.length;
  const nextSection = md.indexOf('\n## ', afterHeader);
  const sectionText = nextSection >= 0 ? md.slice(afterHeader, nextSection) : md.slice(afterHeader);
  const bullets: string[] = [];
  for (const line of sectionText.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ')) {
      // Strip the leading "- " and return the rest (which may include **bold** labels)
      bullets.push(trimmed.slice(2));
    }
  }
  return bullets;
}

/**
 * Translate a clinical shadow-quadrant code into a Veil-compliant qualitative
 * movement description. Used by `profile show` so the player sees a plain
 * English movement ("a pull toward over-reliance on a familiar capacity")
 * instead of the raw code ("DarkAddiction").
 *
 * The four quadrants (per AGENTS.md §5.2):
 *   DarkAddiction  → submergent fixation  (clings to lower capacity)
 *   DarkAllergy    → submergent aversion  (rejects lower capacity)
 *   GoldenAddiction → emergent fixation   (bypasses toward higher without integration)
 *   GoldenAversion → emergent aversion   (refuses the call to grow)
 */
function veilShadowMovement(quadrant: string | undefined): string {
  switch (quadrant) {
    case 'DarkAddiction':  return 'A pull toward over-reliance on a familiar, lower capacity';
    case 'DarkAllergy':    return 'A rejection of a lower capacity that still has something to offer';
    case 'GoldenAddiction': return 'A pull to bypass toward higher capacities without integrating the lower';
    case 'GoldenAversion': return 'A resistance to the call to grow';
    default:               return 'An unnamed movement';
  }
}

/**
 * P1-F10 (Fresh-User UX Audit): Translate a raw session-strategy theme name
 * into a Veil-compliant qualitative hint. The game's session strategy engine
 * silently shifts theme based on the player's surfacing shadows, drive
 * imbalances, and transformation proximity — but the raw theme names
 * ('shadow-integration', 'drive-rebalancing', etc.) are engine labels the
 * player shouldn't see. This function returns a one-line qualitative hint
 * that lets the player FEEL the game responding without breaking the Veil.
 */
function veilThemeHint(theme: string): string {
  switch (theme) {
    case 'shadow-integration':   return 'The work turns toward what has been avoided.';
    case 'drive-rebalancing':    return 'The work seeks balance between forces that have pulled apart.';
    case 'polarity-alignment':   return 'The work seeks alignment between inner and outer.';
    case 'transformation-prep':  return 'The work prepares the ground for a shift.';
    case 'balanced-development': return 'The field is open; the work moves where it will.';
    default:                     return 'The work continues.';
  }
}

/**
 * NF-5 (Fresh-User Re-Audit): Translate a raw drive-directionality code into
 * a Veil-compliant qualitative description. Used by --verbose so the player
 * sees 'Agency: a pull toward over-reliance on a familiar capacity' instead
 * of 'Agency:DarkAddicted'. The four directions (per the polarity trace):
 *   DarkAddicted   → submergent fixation (clings to lower capacity)
 *   DarkAverted    → submergent aversion (rejects lower capacity)
 *   GoldenAddicted → emergent fixation (bypasses toward higher)
 *   GoldenAverted  → emergent aversion (refuses the call to grow)
 *   HealthyBalanced→ filtered out before this function is called
 */
function veilDriveDirection(direction: string): string {
  switch (direction) {
    case 'DarkAddicted':    return 'a pull toward the familiar';
    case 'DarkAverted':     return 'a rejection of something familiar';
    case 'GoldenAddicted':  return 'a pull to bypass toward the higher';
    case 'GoldenAverted':   return 'a resistance to the call forward';
    case 'HealthyBalanced': return 'balanced';
    default:                return 'an unnamed movement';
  }
}

async function runSetupProfile(): Promise<void> {
  if (HEADLESS || JSON_MODE) {
    error('setup-profile requires interactive mode. Run in a real terminal.');
    return;
  }

  banner('CCRPG Profile Setup');

  // Step 1: Name
  const nameInput = await clackText({ message: 'What should I call you?', defaultValue: '' });
  if (typeof nameInput !== 'string' || !nameInput.trim()) { error('Name is required.'); return; }
  const name = nameInput.trim();

  // Step 2: Pronouns
  const pronounChoice = await select({
    message: 'What pronouns should I use?',
    options: [
      { value: 'she/her', label: 'she/her' },
      { value: 'he/him', label: 'he/him' },
      { value: 'they/them', label: 'they/them' },
      { value: 'other', label: 'Other (type below)' },
    ],
  });
  let pronouns = typeof pronounChoice === 'string' ? pronounChoice : 'they/them';
  if (pronouns === 'other') {
    const custom = await clackText({ message: 'Enter your pronouns:', defaultValue: '' });
    if (typeof custom === 'string' && custom.trim()) pronouns = custom.trim();
  }

  // Step 3: Communication style
  const metaphorChoice = await select({
    message: 'What metaphor style resonates with you?',
    options: [
      { value: 'contemporary', label: 'Contemporary — modern language, no fantasy' },
      { value: 'mythic', label: 'Mythic — warrior, blade, arena archetypes' },
      { value: 'clinical', label: 'Clinical — precise, psychological' },
      { value: 'poetic', label: 'Poetic — metaphor-heavy, literary' },
    ],
  });
  const metaphor = typeof metaphorChoice === 'string' ? metaphorChoice : 'contemporary';

  const intensityChoice = await select({
    message: 'How direct should I be?',
    options: [
      { value: 'gentle', label: 'Gentle — supportive, soft' },
      { value: 'moderate', label: 'Moderate — honest but kind' },
      { value: 'direct', label: 'Direct — confrontational, no cushioning' },
    ],
  });
  const intensity = typeof intensityChoice === 'string' ? intensityChoice : 'moderate';

  // Step 4: What brings you here?
  console.log(`\n  ${chalk.bold('A few questions to get started:')}`);
  const bringInput = await clackText({ message: 'What brings you here?', defaultValue: '' });
  const bring = typeof bringInput === 'string' ? bringInput.trim() : '';

  const workInput = await clackText({ message: 'What are you working on (in yourself)?', defaultValue: '' });
  const work = typeof workInput === 'string' ? workInput.trim() : '';

  // Create profile
  try {
    createProfile(name, { pronouns, metaphor_preference: metaphor, intensity });

    // Write goals from onboarding answers
    const profileDir = path.join(getProfilesDir(), name);
    const goalsPath = path.join(profileDir, 'goals.yaml');
    const fs2 = await import('fs');
    const goalsContent = `self_declared:\n${bring ? `  - "${bring}"\n` : ''}${work ? `  - "${work}"\n` : ''}\ninferred: []\nactive_focus: "${work || bring || ''}"\n`;
    fs2.writeFileSync(goalsPath, goalsContent, 'utf8');

    // Write initial narrative memory
    const memPath = path.join(profileDir, 'narrative-memory.md');
    const memContent = `# Narrative Memory — ${name}\n\n## Key Insights\n(Insights from LLM responses that landed — added after each session)\n\n## Patterns\n(Recurring themes across sessions)\n\n## Active Work\n${work || bring || '(Not yet specified)'}\n\n## Resolved\n(Integrated patterns)\n\n## Unresolved\n(Surfaced but not yet worked through)\n`;
    fs2.writeFileSync(memPath, memContent, 'utf8');

    console.log(`\n  ${chalk.green('✓')} Profile "${name}" created and set as active.`);
    console.log(`  ${chalk.dim('Profile directory: ' + profileDir)}`);
    console.log(`\n  ${chalk.dim('Run `ccrpg` to start your first session.')}\n`);
  } catch (err: any) {
    error(err.message);
  }
}

// Refactored to use ProviderRegistry instead of the hardcoded PROVIDERS catalog.
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
    // R11-R2: stageAesthetics map removed — use describeStage from veilDescriptors.
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
        // P1-F5: resolved runtime config (env vars + config file + CLI flags),
        // not just the saved config file. Matches the pretty-print path.
        provider,
        providerName: resolvedLLM.providerName,
        endpoint: baseUrl,
        model,
        llmActive: LLM_ACTIVE,
        hasApiKey: !!(apiKey && apiKey !== 'sk-placeholder'),
        apiKeyPrefix: (apiKey && apiKey !== 'sk-placeholder') ? apiKey.slice(0, 8) + '...' : null,
      },
      system: {
        modulesLoaded: moduleRegistry.count(),
        holons: 36, // matches diagnostic; kept stable for scriptability
      },
    };
    if (sig) {
      // R11-R2: use describePersonalResonance for player-responsive resonance.
      const aesthetic = describePersonalResonance(sig);
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
  info('config', fs.existsSync(CONFIG_FILE) ? CONFIG_FILE : '(no config file — using env vars)');
  // P1-F5 (Fresh-User UX Audit): Show the RESOLVED runtime LLM config, not
  // the stale saved config file. Before this fix, `status` reported
  // 'provider: gemini (default)' and 'api key: not set' even when the LLM
  // was clearly active via env vars (OPENCODE_API_KEY + MODEL) — because it
  // read from the saved config file, which was empty. The `diagnostic`
  // command correctly showed 'LLM: active' because it used the resolved
  // config. This inconsistency made users think nothing was configured.
  // Now both commands use the resolved runtime config.
  info('provider', `${provider} (${resolvedLLM.providerName})`);
  info('endpoint', baseUrl);
  info('model', model);
  info('api key', apiKey && apiKey !== 'sk-placeholder' ? `${apiKey.slice(0, 8)}...` : 'not set');
  info('llm active', LLM_ACTIVE ? `${chalk.green('yes')}` : `${chalk.red('no')}`);

  console.log(`\n  ${chalk.bold('Game State')}`);
  if (hasSave()) {
    const sig = loadSave();
    if (sig) {
      // T-3.4 (Veil compliance): show only player id + qualitative state.
      // No stage name, no encounter count, no altitudes chart, no shadow/drive displays.
      info('player', sig.id);

      // R11-R2: use describePersonalResonance for player-responsive resonance.
      // The resonance now changes based on the player's shadow patterns and
      // drive imbalances, not just their stage label.
      const aesthetic = describePersonalResonance(sig);
      info('resonance', `The world feels ${aesthetic}. ${chalk.dim('(the poetic texture of your current stage)')}`);

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
          // R11-P2 (Fresh-User UX Audit): Suppress the misleading "100% cleared"
          // report when no shadows have actually been detected. Without U3
          // (LLM-based shadow detection), shadows.entries is typically empty,
          // which the engine reads as "no blocking shadows" — but the player
          // reads as "my shadows are resolved." Make the absence visible.
          //
          // R11-Phase2 update: Now that the LLM fix (U1) is in place, shadow
          // detection actually fires. Distinguish three states:
          // 1. No shadows detected at all → "not yet engaged"
          // 2. Shadows detected but none critical (severity < 0.7) → "X patterns surfaced (working through)"
          // 3. Critical shadows blocking → original bar display
          const totalShadows = sig.shadows.entries.length;
          const unresolvedShadows = sig.shadows.entries.filter(e => e.resolvedAt === null).length;
          if (totalShadows === 0) {
            console.log(`    shadow clearance ${chalk.dim('— not yet engaged —')} (detection requires more encounters)`);
          } else if (report.shadowClearance >= 1) {
            console.log(`    shadow clearance ${chalk.dim(bar(report.shadowClearance))} ${chalk.dim(pct(report.shadowClearance))} (${unresolvedShadows} pattern${unresolvedShadows === 1 ? '' : 's'} surfaced, none critical)`);
          } else {
            console.log(`    shadow clearance ${chalk.dim(bar(report.shadowClearance))} ${chalk.dim(pct(report.shadowClearance))} (critical shadows resolved)`);
          }
          // Actionable hint based on the weakest dimension
          // R11-P2: only include shadow clearance in the focus hint if shadows
          // have actually been detected. Otherwise the hint would recommend
          // shadow-work to a player who has no detected shadows, which is
          // confusing.
          const dims = [
            { name: 'convergence', val: report.convergence, hint: 'Play encounters across more lines' },
            { name: 'saturation', val: report.saturation, hint: 'Play more encounters at your current stage' },
            ...(shadowsDetected
              ? [{ name: 'shadow clearance', val: report.shadowClearance, hint: 'Engage with shadow-work encounters' }]
              : []),
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
//
// R11-Y3 (Fresh-User UX Audit): The 23-term dump was experienced by fresh
// users as "walking into a graduate seminar 6 months late." Now shows only
// the 5 player-facing terms by default (Holon, Significator, Line, Stage,
// Shadow). The full 23-term set is gated behind `ccrpg glossary --full`.
// JSON_MODE still emits all terms for backwards compatibility (machine
// consumers expect the full set).
function runGlossary(showFull = false): void {
  banner(showFull ? 'CCRPG Glossary (full)' : 'CCRPG Glossary');
  // ponytail: glossary data extracted to src/core/data/glossary.ts (shared with WebUI /glossary route).
  // R11-Y3: player-facing terms by default; full set only with --full.
  const terms = showFull ? GLOSSARY_TERMS : PLAYER_GLOSSARY_TERMS;
  if (JSON_MODE) {
    // JSON consumers (WebUI, agents) always get the full set.
    process.stdout.write(JSON.stringify({
      type: 'glossary',
      terms: GLOSSARY_TERMS,
      playerTerms: PLAYER_GLOSSARY_TERMS,
      advancedTerms: ADVANCED_GLOSSARY_TERMS,
    }) + '\n');
    return;
  }
  console.log('');
  for (const { term, def } of terms) {
    console.log(`  ${chalk.bold.cyan(term.padEnd(16))} ${chalk.dim(def)}`);
  }
  if (!showFull) {
    console.log(`\n  ${chalk.dim(`— ${PLAYER_GLOSSARY_TERMS.length} essentials. Run \`ccrpg glossary --full\` for all ${GLOSSARY_TERMS.length} terms. —`)}`);
  }
  console.log(`\n  ${chalk.dim('For the full theoretical foundation, see docs/foundations/ and docs/02-glossary.md.')}\n`);
}

// ── Usage help ──────────────────────────────────────────────────────
function printHelp(): void {
  // R11-Y5 (Fresh-User UX Audit): removed --force-shadow=Q from the FORCED
  // ENCOUNTERS section. The flag is now hidden in commander's auto-help and
  // was a documented source of user confusion. The printHelp() banner should
  // not duplicate it.
  console.log(`\n${chalk.bold}${chalk.cyan}CCRPG${chalk.reset} v${VERSION}\n\n${chalk.bold}USAGE${chalk.reset}\n  ccrpg                        Start an interactive session\n  ccrpg session                Same as above\n  ccrpg setup                  Configure LLM and preferences\n  ccrpg diagnostic             Show system diagnostics\n  ccrpg status                 Show current save state\n  ccrpg glossary               Show ${PLAYER_GLOSSARY_TERMS.length} essential terms (use --full for all ${GLOSSARY_TERMS.length})\n  ccrpg profile show           See what the game has noticed about you\n  ccrpg new-game               Reset progress and start fresh\n\n${chalk.bold}SESSION OPTIONS${chalk.reset}\n  --encounters=N               Number of encounters (default: ${fileConfig.session?.defaultEncounters ?? 20})\n  --headless                   Run without user interaction\n  --json                       Machine-readable JSON output\n  --verbose                    Show additional encounter detail (feedback, drives, arc)\n  --no-llm                     Disable LLM, use module assessments only\n  --dev                        Show holistic primitives (G_z/P_z, rayProfile)\n  --version                    Show version\n\n${chalk.bold}FORCED ENCOUNTERS (for testing)${chalk.reset}\n  --line=LINE                  Force a specific line\n  --stage=STAGE                Force a specific stage\n  --modality=MOD               Force a specific modality\n  --responses=1,2,3            Force specific option selections\n\n${chalk.bold}CONFIGURATION${chalk.reset}\n  API key:   ~/.ccrpg/config.json or OPENCODE_API_KEY env var\n  Model:     ~/.ccrpg/config.json or MODEL env var\n  Saves:     ~/.ccrpg/profiles/<name>/\n\n${chalk.bold}EXAMPLES${chalk.reset}\n  ccrpg                                       # interactive session\n  ccrpg --headless --encounters=5             # headless session\n  ccrpg setup                                 # configure API key\n  ccrpg session --encounters=5 --json         # JSON event stream\n  ccrpg glossary                              # learn the terminology\n  ccrpg profile show                          # see your synthesized insights\n  ccrpg diagnostic                            # system diagnostics\n`);
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
  const NON_INTERACTIVE_SUBCOMMANDS = new Set(['status', 'glossary', 'profile']);
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
  if (subcommand === 'glossary') {
    // R11-Y3 / P1-F9: `ccrpg glossary --full` shows all terms; bare `ccrpg glossary`
    // shows only the 5 player-facing essentials.
    const wantsFull = program.args.includes('--full') || program.args.includes('-f');
    runGlossary(wantsFull);
    return;
  }
  if (subcommand === 'profile') { await runProfile(program.args[1], program.args[2]); return; }
  if (subcommand === 'setup-profile') { await runSetupProfile(); return; }
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
    // UX-P1-1 / P2-F13+F15 (Fresh-User UX Audit): First-run onboarding.
    // The old welcome dumped 5 glossary terms in one breath before the
    // player had seen a single question — high cognitive load, felt like
    // "walking into a graduate seminar 6 months late." The new welcome is
    // softer: one orienting sentence, a theory disclosure (so the player
    // knows they're being measured against a specific developmental model,
    // not objective truth), and a single command hint. Terms are introduced
    // contextually via `ccrpg glossary` when the player hits one they don't
    // know, not dumped up front.
    if (!hasSave()) {
      console.log(`\n${chalk.dim('Welcome. This is a contemplative game — it will ask you honest questions')}`);
      console.log(`${chalk.dim('and reflect your answers back as mythopoetic prose. There are no wrong answers.')}`);
      console.log(`${chalk.dim('Take your time. Say as much or as little as you want.')}`);
      // P2-F15 (Fresh-User UX Audit): Theory disclosure. CCRPG is grounded
      // in Integral Theory (Ken Wilber), Spiral Dynamics, and the Law of One
      // cosmology. A player deserves to know they're being measured against
      // one specific developmental model, not objective truth. This is a
      // one-line disclosure, not a lecture — the full theory unfolds
      // through play and is available in docs/foundations/ for those who
      // want it.
      console.log(`\n${chalk.dim('The game draws on Integral Theory and Spiral Dynamics for its')}`);
      console.log(`${chalk.dim('developmental model. You can see what it has noticed about you at any')}`);
      console.log(`${chalk.dim('time with')} ${chalk.bold('ccrpg profile show')}${chalk.dim('.')}`);
      console.log(`\n${chalk.dim('Useful commands:')}`);
      console.log(`  ${chalk.dim('ccrpg glossary      — definitions for unfamiliar terms')}`);
      console.log(`  ${chalk.dim('ccrpg status         — your progress')}`);
      console.log(`  ${chalk.dim('ccrpg new-game       — start over')}\n`);
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
