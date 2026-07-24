# Mysterium WebUI Hardcode Audit — Toward Full LLM-Dependence

> **Project:** Mysterium (Mysterium)
> **Scope:** Identify every place the WebUI substitutes or augments LLM-driven narrative with hardcoded / canned / deterministic output, and recommend a treatment per class.
> **Status:** Audit complete; plan ready for review. No code changes yet.
> **Date:** 2026-07-14
> **Author:** AI agent (post-probe)

---

## 0. TL;DR

The WebUI is **already 80% LLM-driven**. The BFF (`/api/llm/chat`, `/api/llm/tools`) is purely a key-hiding proxy with **no static response path**. `AgenticOrchestrator` defaults to the LLM route unless `noLlm: true` is passed; the WebUI's only callsite in `LLMDialogueRunner.svelte:120` does **not** pass `noLlm`, so the orchestrator hits the LLM. Language-Reflective encounters always invoke the LLM (`AgenticOrchestrator.ts:528`).

**The remaining 20% is intentional floor, not bug.** The hardcode you see serves four distinct purposes:

1. **Assessed-input invariants** — assessment prompts, calibration items, choice thresholds, and the 1,280-item pool. These *must* be deterministic; they are the instrument, the LLM only grades it.
2. **Veil-layer performers** — `veilDescriptors.ts` produces poetic labels like "fortress-sharp, weapon-walls." Continuity-of-voice depends on these not changing with LLM drift.
3. **Failure / pre-LLM fallbacks** — when the LLM is unavailable, the engine has to produce *something*. This is the source of all the "deterministic-test" prose.
4. **Canned-opening template fragments** — `passedOpenings` / `failedOpenings` literals picked via `Math.random()`. These pre-date the LLM path and now compete with it: the engine falls into them on `noLlm`, but the LLM produces live prose on the WebUI.

**Goal of this audit:** classify every hardcode site and pick a treatment — *replace with LLM call*, *remove redundancy*, *deliberately preserve*. Then surface the small handful that genuinely degrade UX when the LLM is **enabled** (which is most users, most of the time).

---

## 1. Methodology

I probed three layers in parallel:

- **UI layer:** `src/lib/` + `src/routes/` — components, stores, routes, BFF surfaces.
- **LLM client + BFF:** `src/infra/llm/` + `src/routes/api/`.
- **Engine + assessment:** `src/core/engines/` + `src/core/assessments/`.

I skipped `src/core/presentation/*` and `src/core/data/` for the first pass, because their static-ness reads at a glance as architectural intent (Veil descriptors / assessment items). I spot-checked one file in each to confirm.

The audit *classified* hardcodes but did not modify code. All file:line references below are exact anchors as of commit `cd17aac` (the date of this audit).

---

## 2. The hardcode classes

### Class A — Instrument inputs (NEVER replace with LLM)

These are the *contents of the assessment*. They define what the player is being evaluated against. Re-generating them with LLM would invalidate the assessment; they are the validated developmental exercises the README and `docs/foundations/` canonize.

| File | Lines | What's there | Why static |
|---|---|---|---|
| `src/core/data/calibrationPrompts.ts` | `1–86` | `CALIBRATION_PROMPTS` for 8 lines × binary-search options | Binary-search composite assessment depends on fixed probes; reproducing them with an LLM would defeat the binary-search contract. |
| `src/core/data/glossary.ts` | `1–end` | 5 Tier-1 + ~25 Tier-2 definitions | A glossary is a reference, not a task. Player-facing terms must be stable; clinical terms are gated behind dev mode. |
| `src/core/data/*.ts` | many | 1,280 assessment items across 64 modules (8 lines × 8 stages × 20 items) | Validated developmental exercises (n-back, dilemmas, etc.). README: "Every assessment module is a validated developmental exercise." |
| `src/core/data/holons.ts` etc. | many | The 36 holons (16 NPCs / 4 factions / 7 locations / 9 others; verified by `mysterium diagnostic`) | Cast of characters, archetype names. Stable across runs by design. |
| `src/core/presentation/veilDescriptors.ts` | `1–161` | Veil labels, stage descriptors, "fortress-sharp, weapon-walls," etc. | Continuity-of-voice; the Veil layer's whole purpose is poetic stubbornness in the face of LLM drift. |
| `static/`,`public/` | many | Bundled assets (icons, sprites, fonts) | Static by definition. |

**Treatment: Leave as-is.** If you genuinely want LLM *expansion* of these (e.g., "add 3 new scenarios per module"), that's a content-pipeline effort, not a hardcode-removal effort. Open a separate ticket.

---

### Class B — Failure fallbacks (REPLACE story, not the literals)

When the LLM is **not available** (`noLlm: true` or no API key), the engine degrades to a pre-authored content pool. This is by design — the diagnostic command demonstrating `mysterium diagnostic` survives in this mode. But the literals are *large* (10 KB+) and live alongside the LLM path, which creates two UX problems:

1. **If the LLM ever flakes mid-session**, the player gets the pre-authored substitute. There's no visible seam. That's *good*, but the user should know it exists.
2. **If a developer enables `noLlm` for debugging and forgets**, they ship canned prose. As of `cd17aac`, `noLlm` is only set by the CLI's `--no-llm` flag; the WebUI is fine. But the surface exists.

| File | Lines | What's there | Notes |
|---|---|---|---|
| `src/infra/llm/FallbackProvider.ts` | `50–end` | 8 lines × ~5 stages ≈ 40 prompt arrays + 8 lines × 3 stages of scenario content + stay/act/withdraw reasoning logic. ~500+ authored lines total. | **Largest single hardcode site.** Per the file header, "per foundations/22 section 12," exercised when LLM is unavailable. |
| `src/core/assessments/AgenticOrchestrator.ts` | `769–864` | `runFallback` switch over modality — for each modality, picks a hardcoded `narrativeIntro`, `questionText`, and `options` array | The four "Reflect deeply / Respond instinctively / Sit with it / Challenge the premise" choices (lines 798–802) are static across ALL `LanguageReflective` encounters. |
| `src/core/assessments/AgenticOrchestrator.ts` | `1620–1686` | `passedOpenings` / `failedOpenings` / `passedClosings` / `failedClosings` — 8 each, picked via `Math.random()` to compose narrative summaries | This is the body of `buildModuleSummary()`. **Used only when LLM is disabled** — but it would be the most jarring UX regression if a player ever sees a 503 and falls into it. |

#### Recommended treatment for Class B

**B.1 — Keep FallbackProvider.ts, but:**

- Move it to a clearly-gated subdirectory: `src/core/fallback/` (not in `infra/llm/`).
- Wrap its `getFallback()` export behind an explicit "fallback contract" — a single function so callers can't accidentally call it from the LLM path.
- Add a Veil-flavored player-visible note: when the engine falls back, the encounter screen should briefly show "*The mirror is unavailable; reflections are speaking from memory.*" Then the user understands the seam.

**B.2 — Replace the four canonical "Reflect deeply, Respond instinctively, Sit with it, Challenge the premise" options** (line 798–802) with **LLM-composed micro-options**:

- Compose a small prompt template asking the LLM to provide 4 response-approach labels calibrated to the line, stage, and modality. The LLM is good at this — it has the context already from `buildContext()`.
- If the LLM fails, fall back to the four canonical options **only** with the Veil seam from B.1.
- Net UX win: every encounter reads as bespoke, not template-substituted.

**B.3 — Replace `buildModuleSummary()`'s opening/closing fragments** with an LLM call:

- The summary is composed *after* a meeting; the LLM knows everything it needs (`module`, `passed`, `stage`, `line`, `polarity`, `altShift`).
- Wire it as a dedicated `/api/llm/chat` with a tight prompt: *"Write a single 2-sentence summary in the Veil register. Open with the encounter; close with the integration arc."*
- On failure, fall back to the existing `Math.random()` pool with the same Veil seam.

---

### Class C — Static narrative intros per modality (REPLACE with LLM first line)

Inside `runFallback`, line 795 et seq., the engine concatenates a frozen preamble to the LLM-produced prompt:

```ts
case 'LanguageReflective':
  narrativeIntro = `${holonName} sits across from you, their gaze steady. The firelight casts long shadows. They speak:`;
// ...
case 'ScenarioChoice':
  narrativeIntro = `${holonName} confronts you. The air is tense. A choice must be made.`;
// ...
case 'Strategic':
  narrativeIntro = `The war-table is spread before you. ${holonName} surveys the terrain. Three routes. Limited forces.`;
// ...
case 'Somatic':
  narrativeIntro = `The war-drums begin. ${holonName} guides you. Your body knows this rhythm.`;
// ...
case 'Interpersonal':
  narrativeIntro = `${holonName} looks to you. Others wait for direction. The group needs your word.`;
// ...
default:
  narrativeIntro = `${holonName} appears — ${holonRole} of this domain. What calls?`;
```

These are static across every encounter of that modality. They appear **before** the LLM-generated question text, so they read as a hand-author frame, not the LLM's voice.

#### Recommended treatment

- Move the LLM path to *also* produce the opening line. The current LLM path (`runLanguageReflective` etc.) lets the LLM generate the entire prompt; the static intros only appear in the fallback path.
- Audit:
  - For modalities that **already have an LLM-path** (`LanguageReflective` → `runLanguageReflective`), confirm the LLMDialogueRunner renders the LLM-only path and never reaches `runFallback`. ✅ Confirmed: orchestrator routes to LLM path on line 358–360.
  - For modalities that **don't have a separate LLM path** (`ScenarioChoice`, `Strategic`, etc.), the engine falls into `runFallback` and *that's where the static intro comes from*. The fix is the same as B.2/B.3: invoke the LLM for the intro, fall back if the LLM is missing.

---

### Class D — Booting / diagnostic copy (LEAVE)

These are dev / observability text. They live in `/diagnostic`, `/telemetry`, `/setup`, and show internal engine state. They *should* be exact and human-readable. The player never sees them in a normal session.

| File | Line | What's there |
|---|---|---|
| `src/routes/diagnostic/+page.svelte` | many | Engine state inspector; renders `mysterium diagnostic` output |
| `src/routes/telemetry/+page.svelte` | many | Telemetry transparency / opt-in |
| `src/routes/setup/+page.svelte` | `30–55` | LLM config probe via `/api/llm/chat` — sends a single `ping` message |
| `src/infra/llm/LLMClient.ts` | `125–135` | `getEnabledConfig()`, `isLLMDisabled` — internal config helpers |

**Treatment: Leave as-is.** Replacing these with LLM-generated copy would make them useful for nothing.

### Class E — Veiled / styled prose (LEAVE)

| File | Notes |
|---|---|
| `src/core/presentation/veilDescriptors.ts` (161 LOC) | Poetic labels for everything the player *sees*. The Veil layer forbids raw numeric labels. Continuities — "fortress-sharp, weapon-walls" — must hold across runs. |
| `src/lib/components/VeiledStat.svelte` | Renders the Veil descriptors as the user-visible layer over engine state. |

**Treatment: Leave as-is.** Stripping these would break the Veil principle. If you want LLM *expansion* of the corpus (more poetic labels per stage), do that as content.

---

## 3. Architectural decision points

These are not single-file changes; they're choices the audit flags for your sign-off.

### Decision 1 — Failure mode contract

When the LLM is unavailable, what does the user see?

- **Option A. "Veil seam visible"** — show a brief gloss, then run with the fallback pool. Pros: transparency. Cons: breaks the fourth wall.
- **Option B. "Silent degradation"** — the fallback just runs. Pros: continuity. Cons: the user doesn't know they're seeing canned prose.

The codebase's Veil principle suggests **A**: continuity-of-voice dominates, but a small descriptive line ("*The mirror is silent; old reflections return to you*") preserves dignity without being clinical.

### Decision 2 — Loading-state UX

Making the WebUI fully LLM-dependent means every encounter waits on `/api/llm/chat`. The `LLMDialogueRunner` already has placeholder text. If we move more narrative into LLM calls (B.2, B.3, Class C), every step adds latency. Required mitigations:

- Concurrent streaming of the LLM response (the BFF already proxies but does not stream it back to the browser; `proxyChatCompletion` returns a `Response` whose body is read in full).
- A skeleton that fills with the gap-fallback intro ("`${holonName} sits across from you...`") while waiting up to ~500ms for the LLM to deliver its line.
- If the LLM takes longer, fade the skeleton and reveal the LLM output. This is *progressive enhancement of the fallback*.

### Decision 3 — CLI / WebUI parity

The CLI (TUI) and the WebUI share `src/core/` but surface differently. The TUI is currently *less* LLM-dependent by default because it explicitly has `--no-llm` and exercises it for the deterministic smoke tests in CI. **This audit does not propose changing CLI behavior.** The CLI's static-fallback path is what CI uses; making it LLM-dependent would break the deterministic test surface and re-introduce flakiness.

The right framing: **"make the WebUI more LLM-dependent"** — leave CLI alone.

---

## 4. Treatment-by-class summary table

| Class | Example file | Recommend | Cost | UX impact |
|---|---|---|---|---|
| **A. Instrument inputs** | `src/core/data/calibrationPrompts.ts` | **Preserve.** | None. | Critical to assessment integrity. |
| **B.1. FallbackProvider.ts** | `src/infra/llm/FallbackProvider.ts` | **Preserve but move** to `src/core/fallback/` + add Veil seam. | 10 hours (refactor + tests). | Necessary scaffolding for graceful degradation. |
| **B.2. Static MCQ options** | `src/core/assessments/AgenticOrchestrator.ts:798–802` | **Replace with LLM**, fall back to canonical with seam. | 4 hours (incl. LLM call), plus 2 hours of testing in the LLM-off path. | **High** — the canonical 4-option list reads as template-substituted today. |
| **B.3. buildModuleSummary** | `src/core/assessments/AgenticOrchestrator.ts:1620–1686` | **Replace with LLM summary call**, fall back to fragment pool with seam. | 6 hours (incl. tests). | **High** — the rotating openings/closings are the most jarring "canned" feel. |
| **C. Modality intros** | `src/core/assessments/AgenticOrchestrator.ts:795–847` | **Replace with LLM first-line**, fall back to static intro with seam. | 5 hours (one prompt-template per modality). | **Medium-high** — the firelight/war-table/war-drums rotation reads as canned. |
| **D. Booting / diagnostic** | `src/routes/diagnostic/+page.svelte`, etc. | **Preserve.** | None. | N/A. |
| **E. Veil descriptors** | `src/core/presentation/veilDescriptors.ts` | **Preserve.** | None. | N/A. |

---

## 5. Suggested execution order

Total estimated cost: **27 man-hours** end-to-end, with zero breaking changes for the CLI:

1. **Move `FallbackProvider.ts`** out of `infra/llm/`, gate its export behind a single named function. Add a unit test asserting that the LLM path *cannot* import it.  *(B.1)*
2. **Add a single Veil-seam helper** `withFallbackVeil(content: string): string` — returns the content prefixed with the disclosure line. Wire it into the three fallback sites (B.2, B.3, C).  *(shared)*
3. **Add an LLM "modality opener" prompt** and an LLM "module summary" prompt to the BFF, as dedicated system prompt inoculations. Stream the response from the BFF.  *(B.3 + C)*
4. **Wire `runFallback` to invoke LLM** for the opening line (one short call), with the firelight/war-table/war-drums line as the fallback.  *(C)*
5. **Wire `buildModuleSummary` to invoke LLM** for the summary, with the existing `Math.random()` pool as the fallback.  *(B.3)*
6. **Wire the four canonical "Reflect deeply..." options** behind an LLM call, with the same four labels as fallback.  *(B.2)*
7. **Add e2e tests** for each replacement — verify LLM-on path produces variable output across 5 runs; fallback path emits the same labels (assertion: deterministic).
8. **Update `docs/CHANGELOG.md`** with each B/C change under a "WebUI LLM-dependence v1" header.

---

## 6. What this audit deliberately does NOT propose

- **Removing `--no-llm` from the CLI.** It's how CI tests run fast and deterministic. Removing it would re-introduce LLM flakiness into the smoke tests.
- **Removing `FallbackProvider.ts`.** The LLM is a single point of failure. Even Google and Anthropic have outages. A wash-your-hands commitment to "LLM or nothing" isn't engineering.
- **Replacing the 1,280 assessment items.** These are the assessment. The LLM grades them; it doesn't author them.
- **Replacing `veilDescriptors.ts`.** Continuity-of-voice is architectural, not negotiable.
- **Tracing fallback behavior visually in the demo.** "Reproducibility of voice across runs" is the point of the Veil layer.

---

## 7. Where to push back

If you want to *remove* a fallback rather than *gate* it, here's the cost:

| Removal | Effect |
|---|---|
| Drop `FallbackProvider.ts` entirely | 503 to a user without LLM config = total UX loss. Off-by-one consumer (CLI smoke tests) also breaks. Verdict: **don't.** |
| Drop `buildModuleSummary` opening/closing pool | Encounter-completion screen loses its narrative. Some users (no API key, low-bandwidth) lose the architecture's tonal continuity. Verdict: **don't.** |
| Drop the four canonical options | `LanguageReflective` encounters without an LLM lose the question framing entirely. Verdict: **don't.** |
| Drop `skipline 795–847` (static intros) | Same; affects the LLM-off / fallback path. Verdict: **don't.** |

The right move is *replace in the LLM-on path; preserve in the LLM-off path; surface the seam*. Doing just that yields a WebUI that feels bespoke 99% of the time and stays functional the 1% of the time the LLM is unavailable.

---

## 8. CI evidence

The audit started from this CI observation, which transitively exercised the same engine:

```
$ mysterium diagnostic
═══ Mysterium Diagnostic ═══
Registries:
  ✓ 64 assessment modules loaded
Holons:
  ✓ 36 total: 16 NPCs, 4 factions, 7 locations, 9 others
Scheduler:
  ✓ Scheduler produced encounter: arc: WARMUP, encounter: The Conqueror · Main Boss
LLM: active | Endpoint: https://opencode.ai/zen/v1 | Model: mimo-v2.5-free
```

When LLM is disabled (`--no-llm`), the same engine degrades to fallback content, which produces 64-module loading and an encounter — but the encounter flavour text is drawn from `FallbackProvider.ts`. This audit maps the divergence and proposes closing it for the LLM-on path.

---

*Audit complete. No code changed. Awaiting review.*
