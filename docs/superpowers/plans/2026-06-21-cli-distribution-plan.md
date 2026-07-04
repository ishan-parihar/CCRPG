# CCRPG CLI Distribution Plan

> **Goal:** Make CCRPG installable as `npm install -g ccrpg` with a `ccrpg` command that works out of the box.

---

## 1. Current State

| Aspect | Status | Issue |
|---|---|---|
| `"private": true` | ❌ | Blocks `npm publish` |
| No `"bin"` field | ❌ | No CLI command registered |
| CLI runs via `npx tsx` | ❌ | Requires `tsx` devDependency at runtime |
| Path aliases (`@core/*`) | ❌ | Won't resolve after install without bundling |
| Phaser in `dependencies` | ❌ | CLI doesn't use Phaser — adds ~2MB for nothing |
| No `"files"` field | ❌ | Would publish everything (tests, docs, etc.) |
| `.env` for LLM config | ⚠️ | Won't find `.env` on user machines |
| No first-run setup | ❌ | No `~/.ccrpg/` directory, no config wizard |
| README has no install instructions | ❌ | Users can't discover the CLI |

---

## 2. Architecture: What Hermes-Agent Does (Reference)

Hermes-agent (Python) uses this pattern:

```
pip install hermes-agent       # installs package
hermes                         # global command via console_scripts
hermes setup                   # interactive first-run wizard
hermes model                   # configure LLM provider
```

Key patterns we adopt:
- **Binary wrapper:** `hermes` shell script → Python entry point
- **`setup` subcommand:** Interactive wizard for first-run config
- **Modular CLI:** `hermes_cli/` package with separate command modules
- **Remote install script:** `curl | bash` for one-liner setup
- **Config directory:** `~/.hermes/` for persistent state

---

## 3. What We're Building

```
npm install -g ccrpg            # or npx ccrpg
ccrpg                           # interactive session
ccrpg --help                    # usage info
ccrpg --headless --no-llm       # automated test
ccrpg setup                     # configure LLM API key
ccrpg diagnostic                # system diagnostics
ccrpg new-game                  # start fresh
```

---

## 4. Implementation Plan

### Phase 1: Bundle the CLI (Sprint 1)

**Problem:** The CLI currently runs via `npx tsx scripts/cli-game.ts`, which requires the full source tree + devDependencies. After `npm install -g`, none of that exists.

**Solution:** Use `tsup` (built on esbuild) to compile the CLI into a single self-contained JS file.

#### 4.1 Install tsup

```bash
npm install --save-dev tsup
```

#### 4.2 Create `tsup.config.ts`

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['scripts/cli-game.ts'],
  outDir: 'dist/cli',
  format: ['esm'],
  target: 'node18',
  platform: 'node',
  bundle: true,
  clean: true,
  minify: false,  // Keep readable for debugging
  sourcemap: false,
  banner: {
    js: '#!/usr/bin/env node',
  },
  // Externalize native Node modules (already available at runtime)
  external: [],
  // Resolve path aliases during bundling
  noExternal: [],
});
```

#### 4.3 Handle Path Aliases

`tsup`/`esbuild` don't resolve `tsconfig.json` paths. Two options:

**Option A (Recommended): Use `tsc-alias`**
```bash
npm install --save-dev tsc-alias
```
Build script: `"build:cli": "tsc --noEmit && tsc-alias && tsup"`

**Option B: Use `package.json#imports`**
Add `"imports": { "@core/*": "./src/core/*" }` — modern Node.js resolves these natively. But tsup still needs the alias resolved at bundle time.

#### 4.4 Handle JSON Import

The CLI imports `red-layer-holons.json`. tsup handles this natively when bundling, but we need `resolveJsonModule: true` in tsconfig (already set).

#### 4.5 Handle env.ts Import

The CLI imports `../env.ts` for config. tsup bundles this automatically.

#### 4.6 Build Script

Add to `package.json`:
```json
{
  "scripts": {
    "build:cli": "tsup",
    "dev:cli": "tsx scripts/cli-game.ts",
    "cli": "tsx scripts/cli-game.ts"
  }
}
```

#### 4.7 Output Structure

After `npm run build:cli`:
```
dist/cli/
  cli-game.js    # Single bundled file with shebang
```

---

### Phase 2: Package for npm (Sprint 2)

#### 4.8 Update `package.json`

```json
{
  "name": "ccrpg",
  "version": "0.1.0",
  "description": "Cognitive-Capacity-Driven RPG — a gamified developmental assessment engine",
  "type": "module",
  "bin": {
    "ccrpg": "./dist/cli/cli-game.js"
  },
  "files": [
    "dist/cli/",
    "src/core/data/",
    "README.md"
  ],
  "scripts": {
    "build:cli": "tsup",
    "dev:cli": "tsx scripts/cli-game.ts",
    "cli": "tsx scripts/cli-game.ts",
    "prepublishOnly": "npm run build:cli"
  },
  "dependencies": {
    "phaser": "^3.80.1"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "tsx": "^4.22.2",
    "typescript": "^5.4.5",
    "vite": "^5.4.10",
    "vitest": "^2.1.4",
    "jsdom": "^29.1.1",
    "@capacitor/cli": "^6.1.2"
  },
  "engines": {
    "node": ">=18"
  }
}
```

Key changes:
- **Remove `"private": true`** — allows npm publish
- **Add `"bin"` field** — registers `ccrpg` command
- **Add `"files"` field** — only publish CLI bundle + data + README
- **Add `"engines"` field** — specify Node.js >= 18
- **Add `"prepublishOnly"`** — auto-build CLI before publish
- **Move Phaser to `dependencies`** — only included because it's a game (but CLI doesn't need it; consider making it optional or peer)

#### 4.9 .npmignore (Alternative to files field)

If using `.npmignore` instead of `files`:
```
src/
tests/
docs/
scripts/
.github/
*.test.ts
tsconfig.json
vite.config.ts
capacitor.config.json
.env
.android/
dist/web/
```

**Recommendation:** Use `"files"` field (whitelist) — it's more explicit and less error-prone.

---

### Phase 3: First-Run Experience (Sprint 3)

#### 4.10 Config Directory: `~/.ccrpg/`

Following hermes-agent's pattern, create a config directory on first run:

```
~/.ccrpg/
  config.json      # LLM settings, preferences
  saves/            # Game saves
    significator.json
    world-state.json
  sessions/         # Session history (optional)
```

#### 4.11 `ccrpg setup` Subcommand

```typescript
// In cli-game.ts, add a 'setup' mode:
case 'setup':
  await runSetup();
  break;

async function runSetup(): Promise<void> {
  banner('CCRPG Setup Wizard');
  
  // 1. Create config directory
  const configDir = path.join(os.homedir(), '.ccrpg');
  fs.mkdirSync(configDir, { recursive: true });
  
  // 2. Check for existing config
  const configPath = path.join(configDir, 'config.json');
  const existing = fs.existsSync(configPath) 
    ? JSON.parse(fs.readFileSync(configPath, 'utf8')) 
    : {};
  
  // 3. Interactive prompts (or use LLM to guide)
  console.log('\n  This wizard will configure CCRPG for your system.\n');
  
  // LLM API Key
  const apiKey = await ask('  Enter your LLM API key (or press Enter to skip): ');
  
  // Model selection
  console.log('\n  Available models:');
  console.log('    1. gemma-4-31b-it (Google, free tier)');
  console.log('    2. gpt-4o-mini (OpenAI)');
  console.log('    3. claude-3-haiku (Anthropic)');
  console.log('    4. Local (Ollama, LM Studio)');
  const modelChoice = await ask('  Select model [1]: ');
  
  // Save config
  const config = {
    llm: {
      provider: /* based on choice */,
      apiKey: apiKey || undefined,
      model: /* based on choice */,
      baseUrl: /* based on choice */,
    },
    session: {
      defaultEncounters: 20,
      defaultMode: 'full',
    },
  };
  
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  
  // 4. Create save directory
  fs.mkdirSync(path.join(configDir, 'saves'), { recursive: true });
  
  success(`Configuration saved to ${configPath}`);
  console.log(`\n  Run ${C.bold}ccrpg${C.reset} to start your developmental journey.\n`);
}
```

#### 4.12 Config Loading Priority

```
1. Environment variables (CCRPG_API_KEY, CCRPG_MODEL, etc.)
2. ~/.ccrpg/config.json (setup wizard output)
3. .env file in current directory (development mode)
4. Built-in defaults (placeholder key, fallback model)
```

#### 4.13 Save File Location

Currently saves to current working directory. Change to:
```
~/.ccrpg/saves/significator.json
~/.ccrpg/saves/world-state.json
```

This ensures saves persist regardless of where `ccrpg` is run from.

---

### Phase 4: CLI Polish (Sprint 4)

#### 4.14 Subcommand Structure

Transform from flag-based to subcommand-based CLI:

```
ccrpg                        # interactive session (default)
ccrpg session                # same as above
ccrpg session --encounters=10 --headless
ccrpg setup                  # first-run wizard
ccrpg diagnostic             # system diagnostics
ccrpg new-game               # reset progress
ccrpg status                 # show current state (stage, CCI, encounters)
ccrpg help                   # usage info
```

#### 4.15 Help Text Enhancement

```
$ ccrpg --help

  CCRPG — Cognitive-Capacity-Driven RPG
  Developmental Assessment Engine v0.1.0

  USAGE
    ccrpg                    Start an interactive session
    ccrpg setup              Configure LLM and preferences
    ccrpg diagnostic         Show system diagnostics
    ccrpg new-game           Reset progress and start fresh
    ccrpg status             Show current developmental state

  SESSION OPTIONS
    --encounters=N           Number of encounters (default: 20)
    --headless               Run without user interaction
    --json                   Machine-readable JSON output
    --verbose                Show full narrative and feedback
    --no-llm                 Disable LLM, use module assessments only

  FORCED ENCOUNTERS (for testing)
    --line=LINE              Force a specific line (Cognitive, Emotional, etc.)
    --stage=STAGE            Force a specific stage (Red, Amber, etc.)
    --modality=MOD           Force modality (Deterministic, ScenarioChoice, etc.)
    --responses=1,2,3        Force specific option selections
    --force-shadow=Q         Force a shadow quadrant

  CONFIGURATION
    API key:   ~/.ccrpg/config.json or CCRPG_API_KEY env var
    Model:     ~/.ccrpg/config.json or CCRPG_MODEL env var
    Saves:     ~/.ccrpg/saves/

  EXAMPLES
    ccrpg                                    # interactive session
    ccrpg --headless --no-llm                # quick automated test
    ccrpg setup                              # configure API key
    ccrpg session --encounters=5 --json      # JSON event stream
    ccrpg diagnostic                         # system diagnostics

  DEVELOPMENTAL SYSTEM
    8 lines × 8 stages = 64 developmental modules
    7 modalities × 4 drives × 4 shadow quadrants
    Gamified assessment that simultaneously diagnoses AND heals
```

#### 4.16 Version Display

Add `--version` flag:
```typescript
const VERSION = '0.1.0';
if (flags.has('--version')) {
  console.log(`ccrpg ${VERSION}`);
  return;
}
```

---

### Phase 5: Testing & Validation (Sprint 5)

#### 4.17 Local Testing with `npm link`

```bash
# Build the CLI
npm run build:cli

# Link globally (creates symlink: ~/.nvm/.../bin/ccrpg → dist/cli/cli-game.js)
npm link

# Test from any directory
ccrpg --help
ccrpg --headless --no-llm --encounters=3
ccrpg diagnostic

# Unlink when done
npm unlink -g ccrpg
```

#### 4.18 Integration Tests

Add `tests/cli.test.ts` using `execa` (or native `child_process`):

```typescript
import { execSync } from 'child_process';
import { describe, it, expect } from 'vitest';

describe('CLI distribution', () => {
  it('prints help text', () => {
    const out = execSync('npx tsx scripts/cli-game.ts --help', {
      encoding: 'utf8',
      timeout: 10000,
    });
    expect(out).toContain('CCRPG');
    expect(out).toContain('USAGE');
    expect(out).toContain('ccrpg');
  });

  it('runs diagnostic mode', () => {
    const out = execSync('npx tsx scripts/cli-game.ts --mode=diagnostic', {
      encoding: 'utf8',
      timeout: 15000,
    });
    expect(out).toContain('64');
    expect(out).toContain('modules loaded');
  });

  it('runs 3 headless encounters', () => {
    const out = execSync(
      'npx tsx scripts/cli-game.ts --headless --no-llm --encounters=3 --new-game',
      { encoding: 'utf8', timeout: 30000 }
    );
    expect(out).toContain('PASSED');
    expect(out).toContain('encounters completed');
  });

  it('produces valid JSON output', () => {
    const out = execSync(
      'npx tsx scripts/cli-game.ts --json --headless --no-llm --encounters=1 --new-game',
      { encoding: 'utf8', timeout: 15000 }
    );
    const lines = out.trim().split('\n');
    for (const line of lines) {
      expect(() => JSON.parse(line)).not.toThrow();
    }
    expect(out).toContain('"type":"session_started"');
    expect(out).toContain('"type":"session_ended"');
  });
});
```

#### 4.19 CI/CD: Publish to npm

Add to `.github/workflows/deploy.yml`:

```yaml
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: https://registry.npmjs.org
      - run: npm ci
      - run: npm run build:cli
      - run: node dist/cli/cli-game.js --help  # Smoke test
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## 5. File Changes Summary

| File | Action | Description |
|---|---|---|
| `tsup.config.ts` | **Create** | tsup bundler configuration |
| `package.json` | **Modify** | Add bin, files, engines, scripts; remove private |
| `scripts/cli-game.ts` | **Modify** | Add setup mode, subcommands, config loading |
| `src/infra/persistence/SaveRepository.ts` | **Modify** | Support `~/.ccrpg/saves/` path |
| `.github/workflows/deploy.yml` | **Modify** | Add npm publish job |
| `tests/cli.test.ts` | **Create** | Integration tests for CLI |

---

## 6. Dependency Changes

| Package | Current | Action | Reason |
|---|---|---|---|
| `tsup` | — | **Add** devDep | Bundle CLI for distribution |
| `tsc-alias` | — | **Add** devDep | Resolve path aliases before bundling |
| `phaser` | dep | Keep as dep | Required for web build; CLI bundle externalizes it |
| `tsx` | devDep | Keep as devDep | Still needed for `npm run dev:cli` during development |
| `execa` | — | **Add** devDep | CLI integration testing |

---

## 7. Execution Order

```
Phase 1: Bundle the CLI (Day 1)
  ├── Install tsup + tsc-alias
  ├── Create tsup.config.ts
  ├── Build and verify dist/cli/cli-game.js works
  └── Smoke test: `node dist/cli/cli-game.js --help`

Phase 2: Package for npm (Day 1-2)
  ├── Update package.json (bin, files, engines, scripts)
  ├── Remove "private": true
  ├── Test with `npm link`
  └── Verify `ccrpg --help` works globally

Phase 3: First-Run Experience (Day 2-3)
  ├── Add config directory support (~/.ccrpg/)
  ├── Add `setup` subcommand
  ├── Update SaveRepository for ~/.ccrpg/saves/
  └── Add config loading priority chain

Phase 4: CLI Polish (Day 3)
  ├── Add subcommand structure (session, diagnostic, status, new-game)
  ├── Enhance help text with full usage guide
  ├── Add --version flag
  └── Update README with install instructions

Phase 5: Testing & Validation (Day 4)
  ├── Write integration tests
  ├── Add CI/CD publish workflow
  ├── Test npm publish --dry-run
  └── Final smoke test
```

---

## 8. Success Criteria

- [ ] `npm install -g ccrpg` installs successfully
- [ ] `ccrpg --help` shows comprehensive usage
- [ ] `ccrpg` starts an interactive session
- [ ] `ccrpg --headless --no-llm --encounters=5` runs 5 automated encounters
- [ ] `ccrpg setup` configures LLM API key
- [ ] Saves persist in `~/.ccrpg/saves/` across sessions
- [ ] `ccrpg diagnostic` shows 64 modules, 36 holons, CCI
- [ ] JSON mode produces clean, parseable output
- [ ] All 448+ tests pass
- [ ] Bundle size is reasonable (< 500KB)
- [ ] No Phaser code in the CLI bundle

---

## 9. Future Considerations

### 9.1 Homebrew Tap
Following hermes-agent's pattern, create a Homebrew formula:
```bash
brew tap ishanp/ccrpg
brew install ccrpg
```

### 9.2 Docker Support
```dockerfile
FROM node:20-slim
RUN npm install -g ccrpg
ENTRYPOINT ["ccrpg", "--headless", "--no-llm"]
```

### 9.3 Auto-Update Check
Check for new versions on startup (like hermes does):
```typescript
// In main(), before session start:
const latestVersion = await checkNpmVersion('ccrpg');
if (latestVersion !== VERSION) {
  info('update', `New version available: ${latestVersion} (current: ${VERSION})`);
  info('update', `Run ${C.bold}npm update -g ccrpg${C.reset} to upgrade`);
}
```

### 9.4 Interactive TUI (Ink/React Terminal)
For a richer interactive experience, consider migrating from readline to Ink (React for CLIs) — similar to how hermes-agent uses a TUI gateway. This would enable:
- Real-time CCI progress bars
- Animated transitions between encounters
- Color-coded shadow quadrant displays
- Interactive menu navigation

### 9.5 Plugin System
Allow users to add custom developmental modules:
```
ccrpg plugin add @ccrpg/custom-module
```
