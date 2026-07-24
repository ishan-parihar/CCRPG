/**
 * P0-F4 (Fresh-User UX Audit): Tests for migrateLegacySave().
 *
 * The fresh-user audit found that after 5 sessions / 18 encounters, `status`
 * reported only 13 encounters across 4 sessions. Root cause: migrateLegacySave()
 * copied the legacy save envelope to `live-state.json` but SaveRepository reads
 * from `save.json` / `save-all.json` — so the next session found no save and
 * created a fresh Significator with totalEncounters=0, silently destroying
 * Session 1's progress.
 *
 * These tests verify the fix: migration must write all three save files
 * (save-all.json, save.json, world.json) so the next session loads correctly.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const ORIGINAL_HOME = process.env.HOME;
let tempHome: string;

beforeEach(() => {
  tempHome = fs.mkdtempSync(path.join(os.tmpdir(), 'mysterium-test-'));
  process.env.HOME = tempHome;
  // ProfileManager resolves Mysterium_DIR at module-load time via os.homedir().
  // We must reset the module cache so each test gets a fresh Mysterium_DIR bound
  // to the temp HOME. SaveRepository resolves lazily (via a function call),
  // but we reset it too for consistency.
  vi.resetModules();
});

afterEach(() => {
  process.env.HOME = ORIGINAL_HOME;
  try { fs.rmSync(tempHome, { recursive: true, force: true }); } catch { /* ignore */ }
});

// Helper: build a full valid Significator via createSignificator, then
// patch the count fields so we can test migration of accumulated progress.
async function makeSig(totalEncounters: number, totalSessions: number) {
  const { createSignificator } = await import('../../src/core/domain/Significator.js');
  const allRed = {
    Cognitive: 'Red', Emotional: 'Red', Moral: 'Red', Intrapersonal: 'Red',
    Spiritual: 'Red', Somatic: 'Red', Willpower: 'Red', Interpersonal: 'Red',
  } as Record<string, string>;
  const sig = createSignificator('cli-player', allRed as any, 'Red');
  return { ...sig, totalEncounters, totalSessions };
}

describe('migrateLegacySave (P0-F4)', () => {
  it('migrates legacy save-all.json envelope to profile with all three save files', async () => {
    const { migrateLegacySave, loadProfile, getActiveProfileName } = await import('../../src/infra/profiles/ProfileManager.js');
    const { loadSave, loadAll } = await import('../../src/infra/persistence/SaveRepository.js');

    const mysteriumDir = path.join(tempHome, '.mysterium');
    fs.mkdirSync(mysteriumDir, { recursive: true });
    const sig = await makeSig(7, 1);
    const world = { holons: [], lastTick: 0 };
    const envelope = { version: 2, savedAt: Date.now(), sig, world };
    fs.writeFileSync(path.join(mysteriumDir, 'save-all.json'), JSON.stringify(envelope, null, 2));

    const migratedName = migrateLegacySave();

    expect(migratedName).toBe('default');
    expect(getActiveProfileName()).toBe('default');

    const profile = loadProfile('default');
    expect(profile?.identity?.total_encounters).toBe(7);
    expect(profile?.identity?.total_sessions).toBe(1);

    // P0-F4 core: the save files SaveRepository reads must exist with correct counts.
    const loadedSig = loadSave();
    expect(loadedSig).not.toBeNull();
    expect(loadedSig?.totalEncounters).toBe(7);
    expect(loadedSig?.totalSessions).toBe(1);

    const loadedAll = loadAll();
    expect(loadedAll).not.toBeNull();
    expect(loadedAll?.sig.totalEncounters).toBe(7);
    expect(loadedAll?.world).toBeDefined();

    // Legacy file must be deleted.
    expect(fs.existsSync(path.join(mysteriumDir, 'save-all.json'))).toBe(false);
  });

  it('returns null when no legacy save exists', async () => {
    const { migrateLegacySave } = await import('../../src/infra/profiles/ProfileManager.js');
    const result = migrateLegacySave();
    expect(result).toBeNull();
  });

  it('preserves counts across a migration + reload cycle (the regression scenario)', async () => {
    // The exact scenario the fresh-user audit caught:
    // Session 1 runs without a profile → saves to legacy ~/.mysterium/save-all.json
    // Session 2 triggers migration → Session 1's counts must survive.
    const { migrateLegacySave } = await import('../../src/infra/profiles/ProfileManager.js');
    const { loadSave, saveAll } = await import('../../src/infra/persistence/SaveRepository.js');

    const mysteriumDir = path.join(tempHome, '.mysterium');
    fs.mkdirSync(mysteriumDir, { recursive: true });
    const session1Sig = await makeSig(5, 1);
    fs.writeFileSync(path.join(mysteriumDir, 'save-all.json'),
      JSON.stringify({ version: 2, savedAt: Date.now(), sig: session1Sig, world: { holons: [] } }, null, 2));

    // Session 2: migrate, then load — must see 5 encounters, not 0.
    migrateLegacySave();
    const loaded = loadSave();
    expect(loaded?.totalEncounters).toBe(5);

    // Session 2 runs 3 more encounters → totalEncounters should be 8.
    const updatedSig = { ...loaded!, totalEncounters: 8, totalSessions: 2 };
    saveAll(updatedSig, { holons: [] } as any);

    // Session 3: load again — must see 8, not reset.
    const reloaded = loadSave();
    expect(reloaded?.totalEncounters).toBe(8);
    expect(reloaded?.totalSessions).toBe(2);
  });
});
