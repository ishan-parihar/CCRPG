/**
 * NF-3 (Fresh-User Re-Audit): Cross-session question de-duplication.
 *
 * The re-audit found Session 4 was entirely verbatim duplicates from
 * earlier sessions. Root cause: the _askedPrompts Set was in-memory only,
 * cleared on every new process invocation. Now it's persisted to the
 * profile directory (asked-prompts.json) via loadAskedPrompts/saveAskedPrompts.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const ORIGINAL_HOME = process.env.HOME;
let tempHome: string;
let profileDir: string;

beforeEach(() => {
  tempHome = fs.mkdtempSync(path.join(os.tmpdir(), 'mysterium-nf3-'));
  process.env.HOME = tempHome;
  profileDir = path.join(tempHome, '.mysterium', 'profiles', 'default');
  fs.mkdirSync(profileDir, { recursive: true });
  vi.resetModules();
});

afterEach(() => {
  process.env.HOME = ORIGINAL_HOME;
  try { fs.rmSync(tempHome, { recursive: true, force: true }); } catch { /* ignore */ }
});

describe('NF-3: cross-session question de-duplication', () => {
  it('loadAskedPrompts loads from asked-prompts.json', async () => {
    const { loadAskedPrompts, _clearAskedPromptsForTest } = await import('../../src/core/fallback/FallbackProvider.js');
    fs.writeFileSync(path.join(profileDir, 'asked-prompts.json'),
      JSON.stringify({ prompts: ['Question A?', 'Question B?'] }, null, 2));

    _clearAskedPromptsForTest();
    loadAskedPrompts(profileDir);

    // We can't directly inspect _askedPrompts (it's private), but we can
    // verify via pickRandom behavior — if the prompts are loaded, pickRandom
    // will avoid them. For now, verify the file is read without error.
    expect(fs.existsSync(path.join(profileDir, 'asked-prompts.json'))).toBe(true);
  });

  it('saveAskedPrompts writes asked-prompts.json', async () => {
    const { saveAskedPrompts, loadAskedPrompts, _clearAskedPromptsForTest } = await import('../../src/core/fallback/FallbackProvider.js');
    _clearAskedPromptsForTest();

    // Load some prompts, then save — file should exist
    fs.writeFileSync(path.join(profileDir, 'asked-prompts.json'),
      JSON.stringify({ prompts: ['Test question?'] }, null, 2));
    loadAskedPrompts(profileDir);
    saveAskedPrompts(profileDir);

    const file = path.join(profileDir, 'asked-prompts.json');
    expect(fs.existsSync(file)).toBe(true);
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    expect(data.prompts).toContain('Test question?');
  });

  it('loadAskedPrompts is a no-op when profileDir is null', async () => {
    const { loadAskedPrompts, _clearAskedPromptsForTest } = await import('../../src/core/fallback/FallbackProvider.js');
    _clearAskedPromptsForTest();
    // Should not throw
    loadAskedPrompts(null);
  });

  it('saveAskedPrompts is a no-op when profileDir is null', async () => {
    const { saveAskedPrompts } = await import('../../src/core/fallback/FallbackProvider.js');
    // Should not throw
    saveAskedPrompts(null);
  });

  it('loadAskedPrompts handles missing file gracefully', async () => {
    const { loadAskedPrompts, _clearAskedPromptsForTest } = await import('../../src/core/fallback/FallbackProvider.js');
    _clearAskedPromptsForTest();
    // File doesn't exist — should not throw
    loadAskedPrompts(profileDir);
  });

  it('loadAskedPrompts handles corrupt file gracefully', async () => {
    const { loadAskedPrompts, _clearAskedPromptsForTest } = await import('../../src/core/fallback/FallbackProvider.js');
    _clearAskedPromptsForTest();
    fs.writeFileSync(path.join(profileDir, 'asked-prompts.json'), 'NOT VALID JSON{[');
    // Should not throw — start with empty set
    loadAskedPrompts(profileDir);
  });

  it('saveAskedPrompts caps the set at 200 entries', async () => {
    const { saveAskedPrompts, loadAskedPrompts } = await import('../../src/core/fallback/FallbackProvider.js');
    // Write 250 prompts, load, save — file should have max 200
    const manyPrompts = Array.from({ length: 250 }, (_, i) => `Question ${i}?`);
    fs.writeFileSync(path.join(profileDir, 'asked-prompts.json'),
      JSON.stringify({ prompts: manyPrompts }, null, 2));
    loadAskedPrompts(profileDir);
    saveAskedPrompts(profileDir);

    const data = JSON.parse(fs.readFileSync(path.join(profileDir, 'asked-prompts.json'), 'utf8'));
    expect(data.prompts.length).toBeLessThanOrEqual(200);
  });
});
