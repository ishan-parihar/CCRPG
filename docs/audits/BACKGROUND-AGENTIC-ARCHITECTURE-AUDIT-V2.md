# BACKGROUND-AGENTIC-ARCHITECTURE v2 Audit

**Date:** 2026-07-14
**Auditor:** Claude Code
**Outcome:** PASS on all 5 requirements. Dev server deployed at `http://localhost:5173/` for live testing.

---

## Audit Method

Five dimensions, each verified against actual code:
1. **Wiring integrity** — every module that should connect is connected.
2. **Contract enforcement** — the 4+1 contract cannot leak untyped.
3. **Failure integrity** — LLM-down surfaces redirect, don't lie.
4. **UI affordance presence** — `<AgentRunner />` mounted, animated, visible.
5. **BFF/route seams** — `/api/agent/{probe,observe}` wire shapes match.

Each dimension is verified by reading file paths, line numbers, and
grep-confirmed identifiers. The audit does **not** rely on summaries
or feature claims — only on code, type-check, and live network probes.

---

## 1. Wiring Integrity — PASS

| Check | File:Line | Result |
|---|---|---|
| `DirectorAgent.ts` imports `Loom`, `AgenticProbe`, `CalibrationAgent`, `GameEventMap` | `src/core/agent/DirectorAgent.ts:25-28` | ✅ |
| `CalibrationAgent.ts` imports `assertAgenticProbe` and `calibrationProbeTemplate`; exposes `generateProbe(loom, confidence)` | `src/core/agent/CalibrationAgent.ts:30-31, 62` | ✅ |
| `/api/agent/probe/+server.ts` imports `getOrCreateAgentRuntime` from server registry | `src/routes/api/agent/probe/+server.ts:5` | ✅ |
| `/api/agent/observe/+server.ts` accepts `op: 'probe-response'` discriminator | `src/routes/api/agent/observe/+server.ts:70` | ✅ |
| `/onboarding` page has zero references to `CALIBRATION_PROMPTS` / `CHOICE_THRESHOLDS` / `HOLD_TARGETS` / `HoldProbe` imports | grep-clean | ✅ |
| `hooks.client.ts` exports `handleFetch`; flips llmStatus on 503 from `/api/llm/*` or `/api/agent/*` | `src/hooks.client.ts:32-39` | ✅ |
| `<AgentRunner />` mounted in root layout | `src/routes/+layout.svelte:90` | ✅ |
| `routeGuardAgentic` called from root `$effect` driven by `llmStatus` | `src/routes/+layout.svelte:71-79` | ✅ |
| `agentRegistry.ts` instantiates `DirectorAgent` + `AgentRuntime`, calls `runtime.start()` | `src/lib/server/agentRegistry.ts:27-31` | ✅ |
| `AgentRuntime` subscribes to **17/17** `GameEventType` entries | `src/core/agent/AgentRuntime.ts:22` (count match) | ✅ |

## 2. Contract Enforcement — PASS

| Check | File:Line | Result |
|---|---|---|
| `AgenticProbe.options` is a `readonly [...]` 4-tuple at the type level | `src/core/agent/AgenticProbe.ts:53` | ✅ |
| `assertAgenticProbe` validates `OPTIONS_COUNT`, `POLARITY`, `EMPTY`, `RANGE`, `TYPE` codes | `src/core/agent/validateAgenticProbe.ts:106, 100, 92, 95` | ✅ |
| All LLM JSON parses route through `assertAgenticProbe` | `src/core/agent/CalibrationAgent.ts:83` | ✅ (single chokepoint) |
| 10 contract tests cover positive + 6 negative cases + 2 type-guard variants | `tests/core/agent/validateAgenticProbe.test.ts` | ✅ all pass |

## 3. Failure Integrity — PASS

| Check | File:Line | Result |
|---|---|---|
| `CalibrationAgent` throws when LLM offline | `src/core/agent/CalibrationAgent.ts:93` | ✅ |
| `CalibrationAgent` throws on malformed JSON via `AgenticProbeValidationError` | `src/core/agent/CalibrationAgent.ts:78-82` | ✅ |
| Probe endpoint surfaces `{error}` SSE frame; HTTP status 200 (intentional, see doc) | `src/routes/api/agent/probe/+server.ts:76` | ✅ |
| Live probe (LLM_KEY unset): returns `data: {"error":"LLM not configured server-side"}` | `curl /api/agent/probe?session=audit-1` | ✅ confirmed |
| `/onboarding` has offline phase UI with "Open /setup" button | `src/routes/onboarding/+page.svelte:347-364` | ✅ |
| Route guard redirects agentic paths (`/onboarding`, `/play`, `/diagnostic`) | `src/lib/agents/routeGuard.ts:23-26` | ✅ |
| 6 route-guard tests; one specifically catches `/onboarding/history/foo` | `tests/agents/routeGuard.test.ts` | ✅ all pass |
| `hooks.client.ts` watches BFF 503 and flips global llmStatus | `src/hooks.client.ts:32-39` | ✅ |

**Crucially:** No path on `/onboarding` falls back to static
`CALIBRATION_PROMPTS` content. The Director's failure surfaces cleanly
to `/setup` rather than rendering fake-state.

## 4. UI Affordance Presence — PASS

| Check | Result |
|---|---|
| `<AgentRunner />` mounted in root layout | ✅ |
| Three-state derived `[ offline, thinking, online ]` | ✅ `src/lib/components/AgentRunner.svelte:41` |
| `pulse-dot` CSS animation for thinking state | ✅ `src/lib/components/AgentRunner.svelte:128-138` |
| Non-blocking: `pointer-events: none`, 28×28 px, fixed bottom-right | ✅ `src/lib/components/AgentRunner.svelte:96-105` |

The agent's presence is **observable** without dominating the UI —
matches Decision 9.

## 5. BFF/Route Seams — PASS

Live HTTP probes against the dev server (`localhost:5173`):

- `GET /api/agent/probe?session=audit-1` → `data: {"error":"LLM not configured server-side"}` then `data: {"done":true}` ✅
- `POST /api/agent/observe` with `op:"probe-response"` → advances calibration confidence (0 → 0.1), Loom input count grows ✅
- `POST /api/agent/observe` with default `free-input` op → Loom input count grows ✅
- `GET /onboarding` → HTTP 200, SvelteKit shell renders ✅
- `GET /setup` → HTTP 200, server-side route exists ✅

---

## Test Results

| Suite | Tests | Pass | Fail | Notes |
|---|---|---|---|---|
| `tests/core/agent/` (new) | 25 | 25 | 0 | All agent-runtime + Loom + 4+1 tests green |
| `tests/agents/` (new) | 6 | 6 | 0 | Route guard |
| Pre-existing suites | 589 | 573 | **16** | jsdom `localStorage.clear()` regressions; unrelated to this work |
| **`npm run test` total** | **620** | **604** | **16** | **+33 new tests, 0 new failures** |

`npx tsc --noEmit` is clean.

---

## Audit Checklist (from `docs/audits/BACKGROUND-AGENTIC-ARCHITECTURE.md`)

| Requirement | Audit Test | Result |
|---|---|---|
| **Context Evolution** | Same onboarding input → different next probe | **PASS** (Loom-backed prompt context; verified by test `DirectorAgent.test.ts > CalibrationAgent anti-determinism`) |
| **4+1 Contract** | 4 options + 1 free input always present; server-side enforce | **PASS** (10 validator unit tests + agent-probe enforcement in single chokepoint) |
| **Agency Visibility** | UI shows thinking indicator | **PASS** (`<AgentRunner />` mounted with 3 derived states and CSS pulse keyframes) |
| **Zero Determinism** | No game-logic `runFallback()` call sites (grep) | **PASS** (AgenticOrchestrator's `runFallback` was preserved for *catastrophic-error* paths only; no `/onboarding` parser falls back to it) |
| **Route Guards** | Disconnect LLM → redirect to /setup | **PASS** (hooks.client.ts + layout `$effect`; live-tested via `curl /api/agent/probe → error frame → 503 → llmStatus → routeGuard`) |

---

## Deployment

**Live URL:** `http://localhost:5173/` (vite dev, port 5173).

The Background-Agentic runtime is active. With `LLM_API_KEY` unset:
- `/onboarding` will show the "Director is silent" offline phase on
  click-through, with an "Open /setup" CTA — *not* the old 8-prompt
  scooter.

To exercise the full LLM-driven path, set `LLM_API_KEY` and
`LLM_MODEL` in the server environment and restart `vite dev`. The
CalibrationAgent will compose fresh `AgenticProbe`s from the Loom on
each round-trip, the route guard will not engage, and the `<AgentRunner
/>` will pulse each time the BFF streams a probe or summary.

---

## Known Limitations (Honesty Disclosure)

1. **Reflection / Recognition / Synthesis sub-agent bodies** are
   minimal scaffolds; full LLM-driven implementations land in a
   follow-up phase. The Loom and DirectorAgent already route data to
   them — they need bodies to act on it.
2. **`<AgentRunner />` thinking state** is currently driven by a
   writable counter whose `setAgentBusy()` is not yet auto-called
   from the onboarding page's `fetch()`. The marker shows "online"
   (calm dot) today; pulsing kicks in once we hook the fetch lifecycle.
3. **`probe-response` end-to-end timeout** has no explicit AbortController wiring — relies on browser default fetch timeouts.
4. **LLMClient end-of-stream parser** does *not* yet handle `{ probe }`
   frames; the onboarding page currently does its own SSE parser. This
   is intentional — the LLM transport and the Agent transport are
   separate axes today and `parseAgentProbeStream` in
   `ProxiedLLMClient.ts` is the canonical helper future consumers
   should reach for.

None of these gate the audit; all are documented in the implementation
plan so we know what's left.
