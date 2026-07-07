/**
 * ProfileManager — multi-user profiling system with YAML-based persistent memory.
 *
 * Architecture:
 *   ~/.ccrpg/profiles/<name>/
 *     ├── identity.yaml
 *     ├── developmental-state.yaml
 *     ├── session-history.yaml
 *     ├── narrative-memory.md
 *     ├── shadow-ledger.yaml
 *     ├── goals.yaml
 *     └── preferences.yaml
 *   ~/.ccrpg/profiles/_active → symlink to active profile
 *
 * Design: human-readable YAML/MD (LLM-native, versionable, sandboxable).
 * No external YAML deps — lightweight parser handles our schema subset.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const CCRPG_DIR = path.join(os.homedir(), '.ccrpg');
const PROFILES_DIR = path.join(CCRPG_DIR, 'profiles');
const ACTIVE_SYMLINK = path.join(PROFILES_DIR, '_active');
const SAVES_DIR = path.join(CCRPG_DIR, 'saves');

// ── Types ────────────────────────────────────────────────────────────

export interface UserProfile {
  readonly identity: Record<string, any>;
  readonly preferences: Record<string, any>;
  readonly developmentalState: Record<string, any>;
  readonly sessionHistory: Record<string, any>;
  readonly narrativeMemory: string;
  readonly shadowLedger: Record<string, any>;
  readonly goals: Record<string, any>;
}

// ── YAML read/write (lightweight, no external deps) ──────────────────

function yamlRead(filePath: string): Record<string, any> {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return parseSimpleYaml(content);
  } catch { return {}; }
}

function yamlWrite(filePath: string, data: Record<string, any>): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, serializeSimpleYaml(data), 'utf8');
}

function mdRead(filePath: string): string {
  try { return fs.readFileSync(filePath, 'utf8'); } catch { return ''; }
}

function mdWrite(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function parseSimpleYaml(content: string): Record<string, any> {
  
  const lines = content.split('\n');
  let i = 0;
  function parseBlock(indent: number): Record<string, any> {
    const obj: Record<string, any> = {};
    while (i < lines.length) {
      const line = lines[i]!;
      if (line.trim() === '' || line.trim().startsWith('#')) { i++; continue; }
      const currentIndent = line.length - line.trimStart().length;
      if (currentIndent < indent) break;
      const trimmed = line.trim();
      if (trimmed.startsWith('- ')) {
        const lastKey = Object.keys(obj).pop();
        if (lastKey && Array.isArray(obj[lastKey])) obj[lastKey].push(trimmed.slice(2));
        i++; continue;
      }
      const colonIdx = trimmed.indexOf(':');
      if (colonIdx === -1) { i++; continue; }
      const key = trimmed.slice(0, colonIdx).trim();
      const value = trimmed.slice(colonIdx + 1).trim();
      if (value === '' || value === '[]') {
        i++;
        if (i < lines.length) {
          const nextLine = lines[i]!;
          const nextIndent = nextLine.length - nextLine.trimStart().length;
          if (nextIndent > currentIndent && nextLine.trim().startsWith('- ')) {
            obj[key] = [];
            while (i < lines.length && lines[i]!.trim().startsWith('- ')) {
              obj[key].push(lines[i]!.trim().slice(2)); i++;
            }
            continue;
          }
          if (nextIndent > currentIndent) { obj[key] = parseBlock(nextIndent); continue; }
        }
        obj[key] = value === '[]' ? [] : {};
      } else {
        obj[key] = parseScalar(value); i++;
      }
    }
    return obj;
  }
  return parseBlock(0);
}

function parseScalar(value: string): any {
  if (value === 'null' || value === '~') return null;
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^-?\d+$/.test(value)) return parseInt(value, 10);
  if (/^-?\d+\.\d+$/.test(value)) return parseFloat(value);
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))
    return value.slice(1, -1);
  return value;
}

function serializeSimpleYaml(data: Record<string, any>, indent = 0): string {
  const lines: string[] = [];
  const pad = '  '.repeat(indent);
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) { lines.push(`${pad}${key}: null`); }
    else if (Array.isArray(value)) {
      if (value.length === 0) { lines.push(`${pad}${key}: []`); }
      else { lines.push(`${pad}${key}:`); for (const item of value) lines.push(`${pad}  - ${String(item)}`); }
    } else if (typeof value === 'object') {
      lines.push(`${pad}${key}:`); lines.push(serializeSimpleYaml(value, indent + 1));
    } else { lines.push(`${pad}${key}: ${formatScalar(value)}`); }
  }
  return lines.join('\n');
}

function formatScalar(value: any): string {
  if (typeof value === 'string') {
    if (value.includes(':') || value.includes('#') || value.startsWith('-') || value.startsWith('['))
      return `"${value.replace(/"/g, '\\"')}"`;
    return value;
  }
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (value === null) return 'null';
  return String(value);
}

// ── Profile Management API ───────────────────────────────────────────

export function getProfilesDir(): string { return PROFILES_DIR; }

export function getActiveProfileDir(): string | null {
  try { if (fs.existsSync(ACTIVE_SYMLINK)) return fs.realpathSync(ACTIVE_SYMLINK); } catch {}
  return null;
}

export function getActiveProfileName(): string | null {
  const dir = getActiveProfileDir();
  return dir ? path.basename(dir) : null;
}

export function listProfiles(): string[] {
  try {
    if (!fs.existsSync(PROFILES_DIR)) return [];
    return fs.readdirSync(PROFILES_DIR, { withFileTypes: true })
      .filter(e => e.isDirectory() && !e.name.startsWith('_') && !e.name.startsWith('.'))
      .map(e => e.name);
  } catch { return []; }
}

export function createProfile(name: string, prefs?: Partial<Record<string, any>>): string {
  const profileDir = path.join(PROFILES_DIR, name);
  if (fs.existsSync(profileDir)) throw new Error(`Profile "${name}" already exists.`);
  fs.mkdirSync(profileDir, { recursive: true });
  const now = new Date().toISOString();
  const allLines = ['Cognitive', 'Emotional', 'Moral', 'Intrapersonal', 'Spiritual', 'Interpersonal', 'Somatic', 'Willpower'];
  const altitudes: Record<string, string> = {}; for (const l of allLines) altitudes[l] = 'Red';

  yamlWrite(path.join(profileDir, 'identity.yaml'), {
    name, created: now, last_active: now, lifecycle: 'Onboarding',
    total_sessions: 0, total_encounters: 0, current_stage: 'Red', inferred_stage: 'Red',
  });
  yamlWrite(path.join(profileDir, 'preferences.yaml'), {
    pronouns: prefs?.pronouns ?? 'they/them',
    metaphor_preference: prefs?.metaphor_preference ?? 'contemporary',
    intensity: prefs?.intensity ?? 'moderate', pacing: prefs?.pacing ?? 'reflective',
  });
  yamlWrite(path.join(profileDir, 'developmental-state.yaml'), {
    altitudes, drives: { agency: 0.5, communion: 0.5, eros: 0.5, agape: 0.5 },
    ray_profile: { Red: 0, Orange: 0, Yellow: 0, Green: 0, Blue: 0, Indigo: 0, Violet: 0 },
    transformation: { phase: 'idle', target_stage: null, sessions_in_phase: 0, knots_resolved: 0 },
    cci: 0.5,
  });
  yamlWrite(path.join(profileDir, 'session-history.yaml'), { sessions: [] });
  mdWrite(path.join(profileDir, 'narrative-memory.md'),
    `# Narrative Memory — ${name}\n\n## Key Insights\n(Insights from LLM responses that landed)\n\n## Patterns\n(Recurring themes)\n\n## Active Work\n(What the user is processing)\n\n## Resolved\n(Integrated patterns)\n\n## Unresolved\n(Surfaced but not worked through)\n`);
  yamlWrite(path.join(profileDir, 'shadow-ledger.yaml'), { shadows: [] });
  yamlWrite(path.join(profileDir, 'goals.yaml'), { self_declared: [], inferred: [], active_focus: '' });

  setActiveProfile(name);
  return profileDir;
}

export function setActiveProfile(name: string): void {
  const profileDir = path.join(PROFILES_DIR, name);
  if (!fs.existsSync(profileDir)) throw new Error(`Profile "${name}" does not exist.`);
  try { fs.unlinkSync(ACTIVE_SYMLINK); } catch {}
  fs.symlinkSync(profileDir, ACTIVE_SYMLINK);
}

export function deleteProfile(name: string): void {
  if (name === '_active') throw new Error('Cannot delete _active');
  const dir = path.join(PROFILES_DIR, name);
  if (!fs.existsSync(dir)) throw new Error(`Profile "${name}" does not exist.`);
  fs.rmSync(dir, { recursive: true, force: true });
  try { fs.unlinkSync(path.join(SAVES_DIR, `${name}-save-all.json`)); } catch {}
  const active = getActiveProfileDir();
  if (active && path.basename(active) === name) { try { fs.unlinkSync(ACTIVE_SYMLINK); } catch {} }
}

export function loadProfile(name?: string): UserProfile | null {
  const dir = name ? path.join(PROFILES_DIR, name) : getActiveProfileDir();
  if (!dir || !fs.existsSync(dir)) return null;
  return {
    identity: yamlRead(path.join(dir, 'identity.yaml')),
    preferences: yamlRead(path.join(dir, 'preferences.yaml')),
    developmentalState: yamlRead(path.join(dir, 'developmental-state.yaml')),
    sessionHistory: yamlRead(path.join(dir, 'session-history.yaml')),
    narrativeMemory: mdRead(path.join(dir, 'narrative-memory.md')),
    shadowLedger: yamlRead(path.join(dir, 'shadow-ledger.yaml')),
    goals: yamlRead(path.join(dir, 'goals.yaml')),
  };
}

/**
 * Build the LLM context injection string from the active profile.
 * This is prepended to the LLM system prompt so it knows the user.
 */
export function buildContextInjection(profile: UserProfile): string {
  const parts: string[] = [];
  const id = profile.identity || {};
  const prefs = profile.preferences || {};

  parts.push(`# User Profile: ${id.name || 'Unknown'}`);
  parts.push(`Pronouns: ${prefs.pronouns || 'they/them'}`);
  parts.push(`Communication: ${prefs.metaphor_preference || 'contemporary'} metaphors, ${prefs.intensity || 'moderate'} intensity, ${prefs.pacing || 'reflective'} pacing`);
  parts.push(`Lifecycle: ${id.lifecycle || 'Exploring'} | Stage: ${id.current_stage || 'Red'} | Sessions: ${id.total_sessions || 0} | Encounters: ${id.total_encounters || 0}`);

  const goals = profile.goals || {};
  if (goals.active_focus) parts.push(`\n## Active Focus\n${goals.active_focus}`);
  if (goals.self_declared?.length) parts.push(`\n## User's Stated Goals\n${goals.self_declared.map((g: any) => `- ${g}`).join('\n')}`);

  const sessions = profile.sessionHistory?.sessions ?? [];
  if (sessions.length > 0) {
    parts.push(`\n## Recent Sessions`);
    for (const s of sessions.slice(-5)) parts.push(`- ${typeof s === 'object' ? (s as any).date || '' : s}: ${typeof s === 'object' ? (s as any).key_shift || '' : ''}`);
  }

  if (profile.narrativeMemory && profile.narrativeMemory.trim().length > 50) {
    parts.push(`\n## Narrative Memory\n${profile.narrativeMemory}`);
  }

  const shadows = profile.shadowLedger?.shadows ?? [];
  if (shadows.length > 0) {
    parts.push(`\n## Active Shadows`);
    for (const s of shadows) {
      if (typeof s === 'object' && (s as any).pattern)
        parts.push(`- ${(s as any).pattern} [${(s as any).status || 'surfacing'}]`);
    }
  }

  parts.push(`\n## Communication Style`);
  parts.push(`- Use ${prefs.pronouns || 'they/them'} pronouns for the user.`);
  parts.push(`- Metaphor style: ${prefs.metaphor_preference || 'contemporary'} (avoid warrior/blade metaphors if 'contemporary').`);
  parts.push(`- Intensity: ${prefs.intensity || 'moderate'}.`);
  parts.push(`- Pacing: ${prefs.pacing || 'reflective'}.`);

  return parts.join('\n');
}

export function updateProfileAfterSession(profileName: string, updates: {
  totalEncounters: number; totalSessions: number; currentStage: string;
  altitudes: Record<string, string>; drives: Record<string, number>; cci: number;
  sessionEntry?: Record<string, any>; narrativeInsight?: string;
  newShadow?: Record<string, any>; activeFocus?: string;
}): void {
  const dir = path.join(PROFILES_DIR, profileName);
  if (!fs.existsSync(dir)) return;
  const now = new Date().toISOString();

  const identity = yamlRead(path.join(dir, 'identity.yaml'));
  identity.last_active = now;
  identity.total_sessions = updates.totalSessions;
  identity.total_encounters = updates.totalEncounters;
  identity.current_stage = updates.currentStage;
  if (identity.lifecycle === 'Onboarding') identity.lifecycle = 'Exploring';
  yamlWrite(path.join(dir, 'identity.yaml'), identity);

  const devState = yamlRead(path.join(dir, 'developmental-state.yaml'));
  devState.altitudes = updates.altitudes;
  devState.drives = updates.drives;
  devState.cci = updates.cci;
  yamlWrite(path.join(dir, 'developmental-state.yaml'), devState);

  const history = yamlRead(path.join(dir, 'session-history.yaml'));
  if (!history.sessions) history.sessions = [];
  if (updates.sessionEntry) {
    history.sessions.push(updates.sessionEntry);
    if (history.sessions.length > 20) history.sessions = history.sessions.slice(-20);
  }
  yamlWrite(path.join(dir, 'session-history.yaml'), history);

  if (updates.narrativeInsight) {
    const memPath = path.join(dir, 'narrative-memory.md');
    let memory = mdRead(memPath);
    const insight = `- **Session ${updates.totalSessions}:** ${updates.narrativeInsight}\n`;
    const idx = memory.indexOf('## Key Insights');
    if (idx >= 0) {
      const next = memory.indexOf('\n## ', idx + 18);
      const at = next >= 0 ? next : memory.length;
      memory = memory.slice(0, at) + insight + memory.slice(at);
    }
    mdWrite(memPath, memory);
  }

  if (updates.newShadow) {
    const ledger = yamlRead(path.join(dir, 'shadow-ledger.yaml'));
    if (!ledger.shadows) ledger.shadows = [];
    ledger.shadows.push(updates.newShadow);
    yamlWrite(path.join(dir, 'shadow-ledger.yaml'), ledger);
  }

  if (updates.activeFocus) {
    const goals = yamlRead(path.join(dir, 'goals.yaml'));
    goals.active_focus = updates.activeFocus;
    yamlWrite(path.join(dir, 'goals.yaml'), goals);
  }
}

export function getSaveFilePath(profileName: string): string {
  fs.mkdirSync(SAVES_DIR, { recursive: true });
  return path.join(SAVES_DIR, `${profileName}-save-all.json`);
}

export function migrateLegacySave(): string | null {
  const legacy = path.join(CCRPG_DIR, 'save-all.json');
  if (!fs.existsSync(legacy)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(legacy, 'utf8'));
    const sig = data.sig ?? data;
    const name = (sig.id && sig.id !== 'cli-player') ? sig.id : 'default';
    createProfile(name);
    fs.copyFileSync(legacy, getSaveFilePath(name));
    const dir = path.join(PROFILES_DIR, name);
    const id = yamlRead(path.join(dir, 'identity.yaml'));
    id.total_sessions = sig.totalSessions ?? 0;
    id.total_encounters = sig.totalEncounters ?? 0;
    id.current_stage = sig.currentStage ?? 'Red';
    id.lifecycle = sig.lifecycle ?? 'Exploring';
    yamlWrite(path.join(dir, 'identity.yaml'), id);
    const ds = yamlRead(path.join(dir, 'developmental-state.yaml'));
    ds.altitudes = sig.altitudes ?? ds.altitudes;
    ds.drives = sig.drives?.weights ?? ds.drives;
    ds.ray_profile = sig.rayProfile ?? ds.ray_profile;
    yamlWrite(path.join(dir, 'developmental-state.yaml'), ds);
    return name;
  } catch { return null; }
}
