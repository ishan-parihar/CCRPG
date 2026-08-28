import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * Canonical Mysterium directory resolution.
 * Previously duplicated in FileKeyValueStore.defaultDir (11:22),
 * SaveRepository.getCliLegacyDir/getSaveDir (145:168), and
 * CLITelemetry.legacyKV (47:54) with drift (profile vs legacy).
 * Single source now: all persistence layers call these helpers.
 */
export function getMysteriumHome(): string {
  const home = typeof (os as unknown as { homedir?: () => string }).homedir === 'function'
    ? (os as unknown as { homedir: () => string }).homedir!()
    : '/tmp/.mysterium';
  return home;
}

export function getMysteriumLegacyDir(): string {
  return path.join(getMysteriumHome(), '.mysterium');
}

export function getMysteriumProfileDir(): string {
  const legacy = getMysteriumLegacyDir();
  const link = path.join(legacy, 'profiles', '_active');
  try {
    if (fs.existsSync(link)) {
      const resolved = fs.realpathSync(link);
      if (fs.existsSync(resolved)) return resolved;
    }
  } catch { /* fallback to legacy */ }
  return legacy;
}

export function getMysteriumDirForScope(scope: 'legacy' | 'auto' = 'auto'): string {
  return scope === 'legacy' ? getMysteriumLegacyDir() : getMysteriumProfileDir();
}
