/**
 * sessionControlStore — user-configurable session parameters.
 * Parity with CLI flags: --encounters, --line, --stage, --modality, --dev.
 * ponytail: defaults match the CLI defaults. Stored in localStorage.
 */
import { writable } from 'svelte/store';

export interface SessionControl {
  /** Number of encounters per session. Parity with --encounters. */
  readonly encounterCount: number;
  /** Force a specific line (null = auto). Parity with --line. */
  readonly forceLine: string | null;
  /** Force a specific stage (null = auto). Parity with --stage. */
  readonly forceStage: string | null;
  /** Force a specific modality (null = auto). Parity with --modality. */
  readonly forceModality: string | null;
  /** Dev mode: show G_z/P_z, rayProfile, phase position. Parity with --dev. */
  readonly devMode: boolean;
}

const STORAGE_KEY = 'ccrpg:session-control';

const DEFAULT: SessionControl = {
  encounterCount: 5,
  forceLine: null,
  forceStage: null,
  forceModality: null,
  devMode: false,
};

const isBrowser = typeof window !== 'undefined';

function load(): SessionControl {
  if (!isBrowser) return DEFAULT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT;
  }
}

export const sessionControlStore = writable<SessionControl>(load());

if (isBrowser) {
  sessionControlStore.subscribe((s) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {
      // best-effort
    }
  });
}

export function updateSessionControl(partial: Partial<SessionControl>): void {
  sessionControlStore.update((s) => ({ ...s, ...partial }));
}

export function resetSessionControl(): void {
  sessionControlStore.set(DEFAULT);
}
