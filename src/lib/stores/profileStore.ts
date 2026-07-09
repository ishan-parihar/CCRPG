/**
 * profileStore — WebUI multi-profile system.
 * Parity with CLI ProfileManager (adapted for browser localStorage).
 *
 * CLI uses YAML files in ~/.ccrpg/profiles/<name>/.
 * WebUI uses localStorage keys: ccrpg:profiles, ccrpg:active-profile,
 * ccrpg:profile:<name>:encounter-log, ccrpg:profile:<name>:narrative-memory.
 *
 * Both: identity, encounter log, narrative memory, session synthesis.
 * ponytail: the CLI's YAML parser is 200 LOC — the WebUI uses JSON (native).
 */
import { writable } from 'svelte/store';

export interface ProfileIdentity {
  readonly name: string;
  readonly createdAt: number;
  readonly totalSessions: number;
  readonly totalEncounters: number;
}

export interface ProfileSummary {
  readonly name: string;
  readonly createdAt: number;
  readonly totalSessions: number;
  readonly totalEncounters: number;
}

const PROFILES_KEY = 'ccrpg:profiles';
const ACTIVE_KEY = 'ccrpg:active-profile';

const isBrowser = typeof window !== 'undefined';

function loadProfiles(): Record<string, ProfileIdentity> {
  if (!isBrowser) return {};
  try {
    const raw = localStorage.getItem(PROFILES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveProfiles(profiles: Record<string, ProfileIdentity>): void {
  if (!isBrowser) return;
  try {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  } catch {
    // best-effort
  }
}

export const profilesStore = writable<Record<string, ProfileIdentity>>(loadProfiles());
export const activeProfileStore = writable<string | null>(
  isBrowser ? localStorage.getItem(ACTIVE_KEY) : null
);

if (isBrowser) {
  profilesStore.subscribe((p) => saveProfiles(p));
  activeProfileStore.subscribe((name) => {
    if (name) localStorage.setItem(ACTIVE_KEY, name);
    else localStorage.removeItem(ACTIVE_KEY);
  });
}

export function getActiveProfileName(): string | null {
  if (!isBrowser) return null;
  return localStorage.getItem(ACTIVE_KEY);
}

export function createProfile(name: string): void {
  const identity: ProfileIdentity = {
    name,
    createdAt: Date.now(),
    totalSessions: 0,
    totalEncounters: 0,
  };
  profilesStore.update((p) => ({ ...p, [name]: identity }));
}

export function deleteProfile(name: string): void {
  profilesStore.update((p) => {
    const next = { ...p };
    delete next[name];
    return next;
  });
  if (isBrowser) {
    localStorage.removeItem(`ccrpg:profile:${name}:encounter-log`);
    localStorage.removeItem(`ccrpg:profile:${name}:narrative-memory`);
  }
  activeProfileStore.update((active) => (active === name ? null : active));
}

export function setActiveProfile(name: string): void {
  activeProfileStore.set(name);
}

export function updateProfileAfterSession(name: string, encountersCompleted: number): void {
  profilesStore.update((p) => {
    const existing = p[name];
    if (!existing) return p;
    return {
      ...p,
      [name]: {
        ...existing,
        totalSessions: existing.totalSessions + 1,
        totalEncounters: existing.totalEncounters + encountersCompleted,
      },
    };
  });
}

// ─── Encounter log (parity with CLI appendEncounterLog) ──────────────

export function appendEncounterLog(profileName: string, entry: string): void {
  if (!isBrowser) return;
  const key = `ccrpg:profile:${profileName}:encounter-log`;
  const existing = localStorage.getItem(key) ?? '';
  const updated = existing + entry;
  try {
    localStorage.setItem(key, updated);
  } catch {
    // best-effort — log might be too large
  }
}

export function readEncounterLog(profileName: string): string {
  if (!isBrowser) return '';
  return localStorage.getItem(`ccrpg:profile:${profileName}:encounter-log`) ?? '';
}

// ─── Narrative memory (parity with CLI agentReadProfileFile/agentWriteProfileFile) ────

export function readNarrativeMemory(profileName: string): string {
  if (!isBrowser) return '';
  return localStorage.getItem(`ccrpg:profile:${profileName}:narrative-memory`) ?? '';
}

export function appendNarrativeMemory(profileName: string, section: 'insights' | 'patterns' | 'active', text: string): void {
  if (!isBrowser) return;
  const key = `ccrpg:profile:${profileName}:narrative-memory`;
  const existing = localStorage.getItem(key) ?? '';
  const header = section === 'insights' ? '## Key Insights' : section === 'patterns' ? '## Patterns' : '## Active Work';
  const lines = existing.split('\n');
  const headerIdx = lines.findIndex((l) => l.trim() === header);
  if (headerIdx >= 0) {
    // Find the next header or end
    let insertAt = headerIdx + 1;
    while (insertAt < lines.length && !lines[insertAt]!.startsWith('## ')) insertAt++;
    lines.splice(insertAt, 0, `- ${text}`);
  } else {
    lines.push(header);
    lines.push(`- ${text}`);
    lines.push('');
  }
  try {
    localStorage.setItem(key, lines.join('\n'));
  } catch {
    // best-effort
  }
}
