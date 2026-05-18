# Moral / Green — Deterministic Game Concept

> **Axis:** Objective contextual-ethics measurement through care-justice integration accuracy and moral framework flexibility.  **Why this axis for this module:** Green moral capacity requires measurable behavioural evidence of contextual sensitivity that cannot be performed through language or social signalling alone.

---

## 1. Game Identity

**Name:** The Scales of Context
**Core loop:** Player receives moral scenarios with embedded contextual variables and must assign weight to competing ethical considerations (care vs. justice, individual vs. collective, universal vs. situated) via precise slider/allocation mechanics. No verbal reasoning — pure moral-weight judgement.
**Session length:** 4–8 minutes (12–20 items per session).
**Infinite checkpoint:** Each item is self-contained; exit between any two items.

## 2. Catalyst Delivery

**Catalyst frequency:** Green moral — contextual ethical sensitivity.
**Shadow provocation:** Items systematically vary contextual complexity. DA surfaces as uniform non-differentiation (all sliders centred). DAll surfaces as rigid allocation patterns (same weights regardless of context). GA surfaces as over-complex allocations that don't match scenario demands. GAll surfaces as refusal to rank competing frameworks when ranking is appropriate.
**Drive probing:** Eros — items requiring reach toward unfamiliar moral frameworks. Agape — items requiring return to embodied care. Agency — items requiring decisive commitment. Communion — items requiring relational moral sensitivity.
**Integration path:** Diagnosis (baseline allocation patterns) → Healing (adaptive items targeting detected shadow) → Evolution (items requiring simultaneous care-justice integration under time pressure).

## 3. Game Design

**Mechanic:** Each trial presents a moral scenario as a visual vignette (no text-heavy reading) with 3–5 competing ethical considerations displayed as labelled nodes. Player allocates 100 "weight points" across nodes using drag-allocation. Contextual variables shift between trials (culture, relationship, stakes, reversibility).
**Adaptive difficulty:** Early items have clear contextual cues; later items introduce genuine ambiguity. Staircase adjusts contextual complexity based on integration accuracy.
**Scoring dimensions:** (a) Context-sensitivity: do allocations shift appropriately with contextual variables? (b) Care-justice balance: does player honour both orientations? (c) Commitment clarity: are allocations decisive or uniformly hedged? (d) Framework flexibility: can player shift moral lens across scenarios?
**Shadow-specific items:** DA-probing items have clear contextual demands (non-differentiation = shadow). DAll-probing items require genuine contextual shift from prior allocation. GA-probing items are simple (over-complexity = shadow). GAll-probing items require explicit ranking of frameworks.

## 4. Item Pool

**Pool structure:** 200+ scenario-vignettes across 8 contextual domains (family, civic, professional, ecological, cultural, interpersonal, institutional, existential). Each vignette has expert-validated "contextual-sensitivity range" — acceptable allocation windows that honour both care and justice.
**Rotation:** No item repeats within 30 days. Items drawn from domains where player shows least contextual sensitivity.
**Difficulty tiers:** Tier 1 (clear context, 2–3 nodes), Tier 2 (ambiguous context, 3–4 nodes), Tier 3 (genuine dilemma, 4–5 nodes with no "correct" allocation — only shadow-revealing patterns).
**Cultural calibration:** Vignettes are culturally diverse; expert panels validate that contextual-sensitivity ranges are not Western-biased.

## 5. Technical Requirements

**Input:** Touch/mouse drag-allocation on node graph. Minimum 44px touch targets.
**Timing:** No per-item time limit (deliberation is valid) but total allocation-time is recorded as a secondary metric (excessive deliberation may indicate DA).
**Telemetry:** Per-item allocation vector, time-to-first-move, time-to-commit, revision count, contextual-shift-delta (difference from previous item's allocation).
**Adaptive engine:** IRT-based item selection targeting player's current contextual-sensitivity boundary. Shadow-detection algorithm flags consistent non-differentiation, rigidity, over-complexity, or ranking-refusal across 5+ items.
**Accessibility:** Colour-blind safe node labels; screen-reader compatible scenario descriptions; motor-impairment mode with sequential allocation rather than drag.
