#!/usr/bin/env bash
#
# CCRPG installer
#
# Installs:
#   1. CCRPG (this repo) — Node.js + TypeScript + dependencies
#   2. All system prerequisites (Node.js)
#
# After install, the user can run:
#   npm run cli                  # interactive session
#   npm run cli -- diagnostic    # system diagnostics
#   npm run cli -- --help        # full CLI help
#
# Usage:
#   bash install.sh                  # full install
#   bash install.sh --uninstall      # remove everything
#   bash install.sh --help
#
# P2-F11 (Fresh-User UX Audit / YAGNI): TDG-Rust installation removed.
# The CLI's --agent / PersistentAgent path was removed in YAGNI-EFF-3
# (USE_PERSISTENT_AGENT is always false). TDG-Rust + onnxruntime was
# ~200MB of dead weight that the CLI never activates. The install script
# now installs ONLY CCRPG. If TDG graph memory is needed in the future,
# it can be re-added as an optional install step.
#
set -euo pipefail

# ── Colors ──────────────────────────────────────────────────────────
if [[ -t 1 ]]; then
    RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[0;33m'
    BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'
else
    RED=''; GREEN=''; YELLOW=''; BLUE=''; CYAN=''; BOLD=''; NC=''
fi

info()  { echo -e "${BLUE}ℹ${NC}  $*"; }
ok()    { echo -e "${GREEN}✓${NC}  $*"; }
warn()  { echo -e "${YELLOW}⚠${NC}  $*"; }
err()   { echo -e "${RED}✗${NC}  $*" >&2; }
step()  { echo -e "\n${CYAN}${BOLD}── $* ──${NC}"; }

# ── Args ────────────────────────────────────────────────────────────
UNINSTALL=false
CCRPG_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

for arg in "$@"; do
    case "$arg" in
        --uninstall)     UNINSTALL=true ;;
        --help|-h)
            cat <<EOF
CCRPG installer

Usage: bash install.sh [OPTIONS]

Options:
  --uninstall     Remove CCRPG artifacts (node_modules, dist, ~/.ccrpg)
  --help, -h      Show this help

After install:
  npm run cli                                Interactive session (default)
  npm run cli -- diagnostic                  System diagnostics
  npm run cli -- --help                      Full CLI help
  npm run cli -- profile show                See what the game has noticed about you
  node dist/cli/cli-game.js                  Bundled CLI (no tsx needed)
EOF
            exit 0
            ;;
        --no-tdg)
            # P2-F11: --no-tdg is accepted for backwards compat but is now a no-op
            # (TDG-Rust is no longer installed by default). Silently ignored.
            ;;
        *)
            warn "Unknown option: $arg (ignored)"
            ;;
    esac
done

# ── Uninstall ───────────────────────────────────────────────────────
if [[ "$UNINSTALL" == "true" ]]; then
    step "Uninstalling CCRPG"
    info "Removing CCRPG node_modules..."
    [[ -d "$CCRPG_DIR/node_modules" ]] && rm -rf "$CCRPG_DIR/node_modules" && ok "Removed node_modules" || info "node_modules not present"
    info "Removing CCRPG build artifacts..."
    [[ -d "$CCRPG_DIR/dist" ]] && rm -rf "$CCRPG_DIR/dist" && ok "Removed dist" || true
    info "Removing CCRPG save data (~/.ccrpg)..."
    [[ -d "$HOME/.ccrpg" ]] && rm -rf "$HOME/.ccrpg" && ok "Removed ~/.ccrpg" || true
    echo ""
    ok "Uninstall complete"
    exit 0
fi

# ── Banner ──────────────────────────────────────────────────────────
echo -e "${BOLD}${CYAN}"
echo "  ╔═══════════════════════════════════════════════════════════╗"
echo "  ║  CCRPG Installer                                          ║"
echo "  ║  Developmental RPG — accelerates healing & evolution      ║"
echo "  ╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ── Step 1: System prerequisites ────────────────────────────────────
step "Checking system prerequisites"

if ! command -v node &>/dev/null; then
    err "Node.js not found. Install Node.js 18+ first:"
    err "  https://nodejs.org/en/download/"
    err "or via nvm:  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash && nvm install 20"
    exit 1
fi
NODE_VERSION=$(node --version | sed 's/v//' | cut -d. -f1)
if [[ "$NODE_VERSION" -lt 18 ]]; then
    err "Node.js 18+ required (found $(node --version)). Upgrade: https://nodejs.org/"
    exit 1
fi
ok "Node.js $(node --version) found"

if ! command -v npm &>/dev/null; then
    err "npm not found (should come with Node.js)"
    exit 1
fi
ok "npm $(npm --version) found"

# ── Step 2: Install CCRPG dependencies ──────────────────────────────
step "Installing CCRPG dependencies (npm install)"

cd "$CCRPG_DIR"
if [[ ! -f "package.json" ]]; then
    err "package.json not found in $CCRPG_DIR — are you running from the CCRPG repo root?"
    exit 1
fi

if [[ -f "bun.lock" ]] && command -v bun &>/dev/null; then
    info "Using bun (faster) — bun install"
    bun install
    ok "Dependencies installed via bun"
elif [[ -f "package-lock.json" ]]; then
    info "Using npm — npm ci (frozen lockfile)"
    npm ci || { warn "npm ci failed, falling back to npm install"; npm install; }
    ok "Dependencies installed via npm"
else
    info "Using npm — npm install"
    npm install
    ok "Dependencies installed via npm"
fi

# ── Step 3: Verify CCRPG builds ─────────────────────────────────────
step "Verifying CCRPG build (tsc + invariants)"

info "Running tsc --noEmit..."
if npx tsc --noEmit; then
    ok "TypeScript compilation clean"
else
    err "TypeScript compilation failed — check the errors above"
    exit 1
fi

info "Running build invariants check..."
if npx tsx scripts/check-invariants.ts >/dev/null 2>&1; then
    ok "All build invariants pass"
else
    warn "Build invariants check failed (CCRPG may still run, but with warnings)"
fi

# Build the CLI bundle so `ccrpg` is runnable without tsx.
# Uses `npm run build:cli` which runs `svelte-kit sync && tsup` — the sync step
# is REQUIRED because tsup needs the SvelteKit-generated path aliases
# ($shared, $core, $infra) in .svelte-kit/tsconfig.json to resolve imports.
# Without sync, tsup fails with "Could not resolve '$shared/llm/VeilFilter.js'".
info "Building CLI bundle (svelte-kit sync + tsup)..."
if npm run build:cli >/dev/null 2>&1; then
    ok "CLI bundle built → dist/cli/cli-game.js"
else
    warn "CLI bundle build failed — try 'npm run build:cli' manually to see errors"
fi

# ── Step 4: Final verification ──────────────────────────────────────
step "Final verification"

info "CCRPG CLI smoke test (--headless --no-llm)..."
# P0-F1 fix: svelte-kit sync must run before tsx so path aliases resolve.
if npm run cli -- session --headless --no-llm --encounters=1 --json >/dev/null 2>&1; then
    ok "CCRPG CLI runs (headless mode)"
else
    warn "CCRPG CLI smoke test failed — check the output above"
fi

# ── Post-install summary ────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}  CCRPG installed successfully!${NC}"
echo -e "${GREEN}${BOLD}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${BOLD}CCRPG location:${NC}  $CCRPG_DIR"
echo ""
echo -e "  ${BOLD}Quick start:${NC}"
echo -e "    cd $CCRPG_DIR"
echo -e "    npm run cli                                    ${CYAN}# interactive session${NC}"
echo -e "    npm run cli -- diagnostic                      ${CYAN}# system diagnostics${NC}"
echo -e "    npm run cli -- --help                          ${CYAN}# full help${NC}"
echo -e "    npm run cli -- profile show                    ${CYAN}# see what the game has noticed${NC}"
echo -e "    node dist/cli/cli-game.js                      ${CYAN}# bundled CLI (no tsx needed)${NC}"
echo ""
echo -e "  ${BOLD}Configure LLM (required for reflective sessions):${NC}"
echo -e "    npm run cli -- setup"
echo -e "    ${CYAN}# or set env vars: OPENCODE_API_KEY=<key> MODEL=<model>${NC}"
echo ""
echo -e "  ${BOLD}Uninstall:${NC}  bash install.sh --uninstall"
echo ""
