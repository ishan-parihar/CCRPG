/**
 * FileKeyValueStore — Node file-backed KeyValueStore adapter.
 * One JSON document per key under a directory (default: the active
 * Mysterium profile dir, mirroring SaveRepository resolution).
 */
import type { KeyValueStore } from './KeyValueStore.js';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

function defaultDir(): string {
  const home = typeof os.homedir === 'function' ? os.homedir() : '/tmp/.mysterium';
  const legacy = path.join(home, '.mysterium');
  try {
    const activeSymlink = path.join(legacy, 'profiles', '_active');
    if (fs.existsSync(activeSymlink)) {
      const resolved = fs.realpathSync(activeSymlink);
      if (fs.existsSync(resolved)) return resolved;
    }
  } catch { /* fall through to legacy */ }
  return legacy;
}

const SAFE_KEY = /^[A-Za-z0-9._:-]+$/;

export class FileKeyValueStore implements KeyValueStore {
  private readonly dir: string;

  constructor(dir?: string) {
    this.dir = dir ?? defaultDir();
  }

  private fileFor(key: string): string {
    if (!SAFE_KEY.test(key)) throw new Error(`Unsafe KV key: ${key}`);
    return path.join(this.dir, `${key}.json`);
  }

  async get(key: string): Promise<string | null> {
    try {
      const raw = await fs.promises.readFile(this.fileFor(key), 'utf8');
      return raw;
    } catch {
      return null;
    }
  }

  async set(key: string, value: string): Promise<void> {
    await fs.promises.mkdir(this.dir, { recursive: true });
    const file = this.fileFor(key);
    // Atomic write: temp + rename within the same directory.
    const tmp = `${file}.${process.pid}.tmp`;
    await fs.promises.writeFile(tmp, value, 'utf8');
    await fs.promises.rename(tmp, file);
  }

  async remove(key: string): Promise<void> {
    try {
      await fs.promises.unlink(this.fileFor(key));
    } catch { /* already gone */ }
  }

  async clear(): Promise<void> {
    try {
      const entries = await fs.promises.readdir(this.dir);
      await Promise.all(
        entries.filter((e) => e.endsWith('.json')).map((e) => fs.promises.unlink(path.join(this.dir, e))),
      );
    } catch { /* dir missing */ }
  }
}
