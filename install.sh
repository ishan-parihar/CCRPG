#!/usr/bin/env bash
#
# CCRPG + TDG-Rust integrated installer
#
# Installs:
#   1. CCRPG (this repo) — Node.js + TypeScript + dependencies
#   2. TDG-Rust — persistent graph memory (optional but recommended for
#      the full Persistent Developmental Agent experience)
#   3. All system prerequisites (Node.js, Rust toolchain if needed)
#
# After install, the user can run:
#   ccrpg                                  # interactive session (AgenticOrchestrator)
#   ccrpg session --agent                  # PersistentAgent with 15-tool surface
#   ccrpg diagnostic                       # system diagnostics
#
# Usage:
#   bash install.sh                  # full install (CCRPG + TDG-Rust)
#   bash install.sh --no-tdg         # CCRPG only, skip TDG-Rust
#   bash install.sh --uninstall      # remove everything
#   bash install.sh --help
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
INSTALL_TDG=true
UNINSTALL=false
CCRPG_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

for arg in "$@"; do
    case "$arg" in
        --no-tdg)        INSTALL_TDG=false ;;
        --uninstall)     UNINSTALL=true ;;
        --help|-h)
            cat <<EOF
CCRPG + TDG-Rust integrated installer

Usage: bash install.sh [OPTIONS]

Options:
  --no-tdg        Skip TDG-Rust installation (CCRPG-only)
  --uninstall     Remove CCRPG + TDG-Rust artifacts
  --help, -h      Show this help

Environment:
  HERMES_HOME     Override Hermes/TDG home directory (default: ~/.hermes)

After install:
  ccrpg                                 Interactive session (default agent)
  ccrpg session --agent                 Persistent Developmental Agent (15-tool)
  ccrpg diagnostic                      System diagnostics
  ccrpg --help                          Full CLI help
EOF
            exit 0
            ;;
        *)
            warn "Unknown option: $arg (ignored)"
            ;;
    esac
done

# ── Uninstall ───────────────────────────────────────────────────────
if [[ "$UNINSTALL" == "true" ]]; then
    step "Uninstalling CCRPG + TDG-Rust"
    info "Removing CCRPG node_modules..."
    [[ -d "$CCRPG_DIR/node_modules" ]] && rm -rf "$CCRPG_DIR/node_modules" && ok "Removed node_modules" || info "node_modules not present"
    info "Removing CCRPG build artifacts..."
    [[ -d "$CCRPG_DIR/dist" ]] && rm -rf "$CCRPG_DIR/dist" && ok "Removed dist" || true
    info "Removing CCRPG save data (~/.ccrpg)..."
    [[ -d "$HOME/.ccrpg" ]] && rm -rf "$HOME/.ccrpg" && ok "Removed ~/.ccrpg" || true
    if [[ "$INSTALL_TDG" == "true" ]]; then
        info "Removing TDG-Rust (~/.hermes/tdg-rust)..."
        if [[ -f "$HOME/.hermes/tdg-rust/tdg-rust" ]]; then
            TDG_UNINSTALL=1 bash <(curl -fsSL https://raw.githubusercontent.com/ishan-parihar/tdg-rust/main/install.sh) || warn "TDG-Rust uninstall script failed (manual cleanup may be needed)"
            ok "TDG-Rust removed"
        else
            info "TDG-Rust not installed — skipping"
        fi
    fi
    echo ""
    ok "Uninstall complete"
    exit 0
fi

# ── Banner ──────────────────────────────────────────────────────────
echo -e "${BOLD}${CYAN}"
echo "  ╔═══════════════════════════════════════════════════════════╗"
echo "  ║  CCRPG + TDG-Rust Integrated Installer                   ║"
echo "  ║  Developmental RPG with persistent graph memory          ║"
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

# Detect architecture for TDG-Rust binary
ARCH=""
case "$(uname -m)" in
    x86_64|amd64)  ARCH="x86_64" ;;
    aarch64|arm64) ARCH="aarch64" ;;
    *) warn "Unsupported architecture for TDG-Rust: $(uname -m) (will skip TDG)"; INSTALL_TDG=false ;;
esac
[[ -n "$ARCH" ]] && ok "Architecture: $ARCH"

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

# Build the CLI bundle so `ccrpg` is runnable without tsx
info "Building CLI bundle (tsup)..."
if npx tsup >/dev/null 2>&1; then
    ok "CLI bundle built → dist/cli/cli-game.js"
else
    warn "CLI bundle build failed — you can still run via 'npx tsx scripts/cli-game.ts'"
fi

# ── Step 4: Install TDG-Rust (optional) ─────────────────────────────
HERMES_HOME="${HERMES_HOME:-$HOME/.hermes}"

if [[ "$INSTALL_TDG" == "true" ]]; then
    step "Installing TDG-Rust (persistent graph memory)"

    # TDG-Rust's install script requires ~/.hermes to exist (it expects Hermes
    # Agent to be installed). For CCRPG's standalone use, we create ~/.hermes
    # ourselves so the install script can proceed. CCRPG only needs the binary
    # + DB — it doesn't need the full Hermes Agent gateway.
    mkdir -p "$HERMES_HOME"
    ok "Ensured $HERMES_HOME exists"

    # Run the TDG-Rust installer non-interactively.
    # --skip-config: don't patch Hermes config.yaml (we don't have one)
    # yes N: don't re-download if already installed
    #
    # NOTE: The TDG installer's `init_database` step has a bug — it invokes
    # the tdg-rust binary without setting LD_LIBRARY_PATH, so the binary fails
    # to load libonnxruntime.so.1. The installer still exits 0 (its `set -e`
    # doesn't catch the failure inside the pipe), but the DB may not be
    # initialized. We work around this by initializing the DB ourselves below
    # with the correct env.
    info "Running TDG-Rust installer (non-interactive)..."
    info "  (if prompted to re-download, answering N)"
    yes N | bash <(curl -fsSL https://raw.githubusercontent.com/ishan-parihar/tdg-rust/main/install.sh) --skip-config 2>&1 | tail -20 || true
    # Don't rely on the installer's exit code — verify the binary directly instead.
    if [[ ! -x "$HERMES_HOME/tdg-rust/tdg-rust" ]]; then
        warn "TDG-Rust binary not found at $HERMES_HOME/tdg-rust/tdg-rust after install"
        warn "CCRPG will run without TDG (use --no-tdg to suppress this in future)"
        INSTALL_TDG=false
    else
        ok "TDG-Rust binary present at $HERMES_HOME/tdg-rust/tdg-rust"
    fi

    # Initialize the database ourselves (the install script's init_database
    # step fails because it doesn't set LD_LIBRARY_PATH). This is the
    # workaround for the install.sh LD_LIBRARY_PATH bug.
    if [[ "$INSTALL_TDG" == "true" ]] && [[ -x "$HERMES_HOME/tdg-rust/tdg-rust" ]]; then
        step "Initializing TDG-Rust database (workaround for install.sh LD_LIBRARY_PATH bug)"

        export LD_LIBRARY_PATH="$HERMES_HOME/tdg-rust/lib:${LD_LIBRARY_PATH:-}"
        if [[ ! -f "$HERMES_HOME/tdg/graph.db" ]]; then
            info "Creating fresh graph.db..."
            if TDG_HOME="$HERMES_HOME" "$HERMES_HOME/tdg-rust/tdg-rust" init 2>&1 | tail -3; then
                ok "graph.db initialized at $HERMES_HOME/tdg/graph.db"
            else
                warn "tdg-rust init failed — the database may need manual initialization"
                warn "  Manual fix: LD_LIBRARY_PATH=$HERMES_HOME/tdg-rust/lib TDG_HOME=$HERMES_HOME $HERMES_HOME/tdg-rust/tdg-rust init"
            fi
        else
            ok "graph.db already exists — skipping init"
        fi

        # Verify the binary actually runs (with LD_LIBRARY_PATH set)
        info "Verifying tdg-rust binary..."
        if TDG_HOME="$HERMES_HOME" "$HERMES_HOME/tdg-rust/tdg-rust" --version 2>&1 | head -1; then
            ok "TDG-Rust binary verified"
        else
            warn "TDG-Rust binary verification failed — graph memory will be unavailable"
            warn "  This usually means libonnxruntime is missing. Check $HERMES_HOME/tdg-rust/lib/"
            INSTALL_TDG=false
        fi

        # Run a quick stats check to confirm the DB is readable
        if [[ "$INSTALL_TDG" == "true" ]]; then
            info "Checking TDG database stats..."
            if TDG_HOME="$HERMES_HOME" "$HERMES_HOME/tdg-rust/tdg-rust" stats 2>&1 | head -5; then
                ok "TDG database is readable"
            fi
        fi
    fi
else
    step "Skipping TDG-Rust (--no-tdg)"
    info "CCRPG will run with CCRPG-native 8 tools only (no graph memory)"
    info "To install TDG-Rust later: bash install.sh"
fi

# ── Step 5: Final verification ──────────────────────────────────────
step "Final verification"

info "CCRPG CLI smoke test (--headless --no-llm)..."
if npx tsx scripts/cli-game.ts session --headless --no-llm --encounters=1 --json >/dev/null 2>&1; then
    ok "CCRPG CLI runs (headless mode)"
else
    warn "CCRPG CLI smoke test failed — check the output above"
fi

if [[ "$INSTALL_TDG" == "true" ]] && [[ -x "$HERMES_HOME/tdg-rust/tdg-rust" ]]; then
    info "CCRPG + TDG-Rust integration smoke test..."
    # This exercises the TDGClient spawn + MCP handshake + tool registration.
    # Uses a real script file (not inline -e) because tsx's inline mode doesn't
    # support top-level await in CJS output.
    export LD_LIBRARY_PATH="$HERMES_HOME/tdg-rust/lib:${LD_LIBRARY_PATH:-}"
    if TDG_HOME="$HERMES_HOME" npx tsx "$CCRPG_DIR/scripts/tdg-probe.ts" 2>&1 | tail -15; then
        ok "CCRPG ↔ TDG-Rust integration verified"
    else
        warn "Integration smoke test failed — CCRPG will run without TDG"
        warn "  The TDG binary is installed but CCRPG couldn't talk to it via MCP."
        warn "  This is non-fatal — CCRPG will use the 8-tool CCRPG-native surface."
    fi
fi

# ── Post-install summary ────────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}  CCRPG installed successfully!${NC}"
echo -e "${GREEN}${BOLD}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${BOLD}CCRPG location:${NC}  $CCRPG_DIR"
if [[ "$INSTALL_TDG" == "true" ]] && [[ -x "$HERMES_HOME/tdg-rust/tdg-rust" ]]; then
    echo -e "  ${BOLD}TDG-Rust binary:${NC} $HERMES_HOME/tdg-rust/tdg-rust"
    echo -e "  ${BOLD}TDG database:${NC}    $HERMES_HOME/tdg/graph.db"
    echo -e "  ${BOLD}Graph memory:${NC}    ${GREEN}active${NC} (15-tool agent surface available)"
else
    echo -e "  ${BOLD}TDG-Rust:${NC}        ${YELLOW}not installed${NC} (8-tool agent surface only)"
fi
echo ""
echo -e "  ${BOLD}Quick start:${NC}"
echo -e "    cd $CCRPG_DIR"
echo -e "    npx tsx scripts/cli-game.ts                    ${CYAN}# interactive session${NC}"
echo -e "    npx tsx scripts/cli-game.ts session --agent    ${CYAN}# 15-tool PersistentAgent${NC}"
echo -e "    npx tsx scripts/cli-game.ts diagnostic         ${CYAN}# system diagnostics${NC}"
echo -e "    npx tsx scripts/cli-game.ts --help             ${CYAN}# full help${NC}"
echo ""
if [[ "$INSTALL_TDG" == "true" ]]; then
    echo -e "  ${BOLD}TDG-Rust note:${NC} the binary requires LD_LIBRARY_PATH to find libonnxruntime."
    echo -e "  The CCRPG TDGClient sets this automatically when spawning the binary."
    echo -e "  If you run tdg-rust directly, export LD_LIBRARY_PATH=$HERMES_HOME/tdg-rust/lib first."
fi
echo ""
echo -e "  ${BOLD}Configure LLM (optional, for full agent experience):${NC}"
echo -e "    npx tsx scripts/cli-game.ts setup"
echo ""
echo -e "  ${BOLD}Uninstall:${NC}  bash install.sh --uninstall"
echo ""
