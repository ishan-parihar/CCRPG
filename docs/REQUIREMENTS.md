# CCRPG Research Requirements — The Document of Documents

> **Status:** Draft v0.1 — Research phase, no code is to be modified until this entire
> document tree is complete and the user signs off on the system-architecture
> first-principles. See `architecture/00-overview.md` for the binding architectural
> contract that the eventual codebase must obey.

---

## 0. Purpose of this file

This file is the **contract for the research phase**. It enumerates every document
that must exist under `/docs/` before a single new line of game code is written, and
it explains *why* each document is necessary, *what* it must contain, and *which
other documents it depends on*. It exists so that:

1. The whole research phase can be planned, parallelised, reviewed, and signed off
   as a coherent body of work rather than a pile of disconnected notes.
2. Every later code change can be traced back to a specific research document, and
   every research document can be traced back to the user's stated intent: build a
   role-playing fighting game whose mechanics legitimately exercise *every* line of
   human development across *every* stage of consciousness.
3. New contributors (human or AI) can onboard in a fixed reading order without
   having to reverse-engineer the design from the source.

If a topic is not covered in any document below, the design has a hole and the hole
must be filled before implementation. Adding a new document is a first-class change
to this file.

---

## 1. The seven first-principles the research must defend

Every document in `/docs/` is, ultimately, an answer to one of these seven
questions. Whenever a document is written, the author must explicitly cite which
of the seven principles it speaks to, and how.

| # | First-principle question | Why it matters |
|:-:|-----------------------------------------------------------------|--------------------------------------------------------|
| 1 | **What is the game actually training?** Not "cognition" abstractly — *which* lines of intelligence at *which* stages, in *which* AQAL quadrants? | Determines every mechanic, enemy, level, and metric. |
| 2 | **How do we know it is training that thing and not a proxy?** | Validity. Without this, the game is just stylised Lumosity. |
| 3 | **How do we keep the player at their growth edge without breaking immersion?** | The 70.7% staircase, flow theory, narrative pacing. |
| 4 | **How do we make stage progression feel earned, not unlocked?** | Stages of consciousness cannot be bought; they must be *demonstrated*. |
| 5 | **How do we represent multi-line, multi-quadrant development on a phone screen without overwhelming the player?** | UX is the bottleneck. The richest model is useless if it cannot be felt in the thumb. |
| 6 | **How do we keep the simulation honest?** | Server authority, anti-cheat, data-privacy, ethical use of neuropsychometric data. |
| 7 | **How do we keep the codebase honest?** | Clean architecture so the cognitive science is testable in isolation from Phaser, Capacitor, Colyseus, and any future engine swap. |

Every document below ends with a **"Principles served"** footer listing the
subset of {1…7} it advances.

---

## 2. The /docs directory tree

```
docs/
├── REQUIREMENTS.md                   ← this file (the contract)
│
├── 00-vision.md                      ← what the game is, in one read
├── 01-first-principles.md            ← the seven questions, expanded
├── 02-glossary.md                    ← every term used anywhere in /docs
├── 03-research-methodology.md        ← DSR, OMDE, INFORM, citation policy
│
├── foundations/                      ← the science the game is built on
│   ├── 00-integral-theory.md
│   ├── 01-aqal-quadrants.md
│   ├── 02-eight-stages-overview.md
│   ├── 03-lines-of-intelligence-overview.md
│   ├── 04-states-of-consciousness.md
│   ├── 05-drives-and-polarities.md
│   ├── 06-law-of-one-correspondence.md
│   ├── 07-neuroscience-of-development.md
│   ├── 08-psychophysics-and-staircase.md
│   ├── 09-flow-and-engagement-theory.md
│   └── 10-shadow-and-pathology.md
│
├── lines/                            ← one document per line of intelligence
│   ├── 00-overview-multi-line.md     ← how lines interact, "altitude" vs "stage"
│   ├── 01-cognitive.md
│   ├── 02-emotional.md
│   ├── 03-moral.md
│   ├── 04-intrapersonal.md
│   ├── 05-spiritual.md
│   ├── 06-somatic.md
│   ├── 07-willpower.md
│   └── 08-interpersonal.md
│
├── stages/                           ← one document per stage of consciousness
│   ├── 00-overview-eight-stages.md
│   ├── 01-infrared-archaic.md
│   ├── 02-magenta-magic.md
│   ├── 03-red-power.md
│   ├── 04-amber-mythic.md
│   ├── 05-orange-rational.md
│   ├── 06-green-pluralistic.md
│   ├── 07-turquoise-integral.md
│   └── 08-white-superintegral.md
│
├── combat/                           ← how lines × stages become gameplay
│   ├── 00-combat-philosophy.md
│   ├── 01-atb-engine.md
│   ├── 02-cognitive-task-library.md
│   ├── 03-skill-tree-architecture.md
│   ├── 04-damage-and-resistance-model.md
│   ├── 05-stance-and-state-shifting.md
│   └── 06-multiplayer-combat.md
│
├── enemies/                          ← who the player fights, and why
│   ├── 00-enemy-taxonomy.md
│   ├── 01-side-characters-cognitive-drills.md
│   ├── 02-mini-bosses-dual-task.md
│   ├── 03-main-bosses-synthesis.md
│   ├── 04-stage-bestiaries.md
│   └── 05-shadow-encounters.md
│
├── progression/                      ← how the player grows
│   ├── 00-progression-overview.md
│   ├── 01-staircase-dda.md
│   ├── 02-skill-tree-progression.md
│   ├── 03-stage-advancement-criteria.md
│   ├── 04-line-balancing-and-altitude.md
│   ├── 05-shadow-work-and-regression.md
│   └── 06-state-training-meditation.md
│
├── narrative/                        ← story, world, characters
│   ├── 00-narrative-architecture.md
│   ├── 01-protagonist-arc.md
│   ├── 02-antagonist-archetypes.md
│   ├── 03-world-aesthetic-per-stage.md
│   └── 04-environmental-storytelling.md
│
├── architecture/                     ← the engineering contract
│   ├── 00-overview.md
│   ├── 01-clean-architecture.md
│   ├── 02-state-pattern-and-fsm.md
│   ├── 03-event-system.md
│   ├── 04-data-model.md
│   ├── 05-multiplayer-colyseus.md
│   ├── 06-persistence.md
│   ├── 07-rendering-and-performance.md
│   ├── 08-deployment-capacitor.md
│   ├── 09-analytics-and-telemetry.md
│   └── 10-testing-strategy.md
│
├── ux/                               ← what the player sees and feels
│   ├── 00-ux-philosophy.md
│   ├── 01-cognitive-overlay-ui.md
│   ├── 02-skill-tree-visualisation.md
│   ├── 03-progression-feedback.md
│   └── 04-accessibility-and-safe-areas.md
│
├── validation/                       ← is this game actually doing what it claims?
│   ├── 00-cognitive-validation-protocol.md
│   ├── 01-neuroplasticity-evidence.md
│   ├── 02-ethics-and-data-privacy.md
│   └── 03-clinical-and-educational-applications.md
│
└── roadmap/                          ← when, in what order, with what risks
    ├── 00-development-phases.md
    ├── 01-mvp-scope.md
    ├── 02-iteration-plan.md
    └── 03-risk-register.md
```

Total: **1 master file + 4 meta-architecture files + 11 foundations + 9 lines + 9
stages + 7 combat + 6 enemies + 7 progression + 5 narrative + 11 architecture + 5
ux + 4 validation + 4 roadmap = 83 documents.**

---

## 3. The mandatory contents of each document

Every document, regardless of section, **must contain** the following six headings,
in order. This is so that any reader can scan the same six headings across the
whole tree and assemble a complete picture of any topic.

```
1. Purpose                — the question this document answers in one paragraph.
2. Scientific basis       — the citations / models / frameworks underlying it.
3. Game-design mapping    — how the science becomes a mechanic.
4. Architectural contract — what the codebase must guarantee for this to work.
5. Open questions         — what is *not* yet resolved; lists pull-forward risk.
6. Principles served      — which of the seven first-principles (§1) it serves.
```

A document that lacks any of the six headings is not yet ready for review.

---

## 4. Document index — one-line summaries and dependency graph

### 4.0 Meta-architecture layer (read first)

| File | One-line purpose | Depends on |
|------|------------------|------------|
| `00-vision.md` | The single-paragraph elevator pitch and the long-form "what this is, why it matters." | — |
| `01-first-principles.md` | The seven questions of §1 expanded with citations, counter-examples, and acceptance criteria. | `00-vision.md` |
| `02-glossary.md` | Every domain term (line, stage, quadrant, drive, state, ATB, n-back, holon, harvest, …) with a single canonical definition used across all docs. | — |
| `03-research-methodology.md` | DSR phases, OMDE, INFORM, evidence hierarchy, how we cite, how we resolve conflicts between Wilber, Diamond, Piaget, Kohlberg, Fowler, Goleman, Ra. | `00–02` |

### 4.1 Theoretical foundations

| File | One-line purpose | Depends on |
|------|------------------|------------|
| `foundations/00-integral-theory.md` | Wilber's AQAL framework as the master organising lens. | meta |
| `foundations/01-aqal-quadrants.md` | UL / UR / LL / LR — what each quadrant means and how the game must touch all four. | 00 |
| `foundations/02-eight-stages-overview.md` | The 8 stages as macro-progression; how they nest holographically (sub-octave theory). | 00, 01 |
| `foundations/03-lines-of-intelligence-overview.md` | Lines as relatively-independent developmental streams; "altitude" vs "stage." | 00, 01, 02 |
| `foundations/04-states-of-consciousness.md` | Gross / Subtle / Causal / Witness / Non-Dual — how state training differs from stage training. | 00 |
| `foundations/05-drives-and-polarities.md` | Agency / Communion / Eros / Agape and their pathologies; the polarity engine of conflict. | 00 |
| `foundations/06-law-of-one-correspondence.md` | The optional energy-ray sub-octave correspondence (from Integrated_Stage_Theory.md) — used as an aesthetic/world-design layer, kept *separable* from the empirical psychology. | 00, 02 |
| `foundations/07-neuroscience-of-development.md` | Brain regions per stage and per line: dlPFC, ACC, insula, amygdala, striatum, default-mode, etc. | 00, 02, 03 |
| `foundations/08-psychophysics-and-staircase.md` | Transformed up-down (1-up/2-down), 70.7% threshold, signal-detection theory, why Easy/Normal/Hard is broken. | 03 |
| `foundations/09-flow-and-engagement-theory.md` | Csikszentmihalyi flow, self-determination theory (autonomy, competence, relatedness), why an RPG wrapper is *necessary*, not decorative. | 03 |
| `foundations/10-shadow-and-pathology.md` | What happens when a line is repressed, regressed, or fixated; how shadow material becomes enemy archetypes. | 03, 05 |

### 4.2 Lines of intelligence — one document per line

Each lines/* document has the same internal structure (so it can be read as a
column or a row in a matrix):

```
1. Purpose
2. Scientific basis
   2.1 Construct definition (Gardner, Wilber, Goleman, Kohlberg, Fowler, Diamond…)
   2.2 Validated assessments that already measure this line (so we know what we're gamifying)
   2.3 Brain regions / physiological substrate
3. Stage trajectory of THIS line across the 8 stages
   - what the line looks like at Infrared, Magenta, Red, Amber, Orange, Green, Turquoise, White
4. Game-design mapping
   4.1 Combat style associated with the line
   4.2 Attacks / defences / skills it powers
   4.3 RPG attribute(s) it backs
   4.4 Cognitive micro-task(s) used to evaluate it in real time
   4.5 Progression curve (what does "levelling up" this line feel like?)
5. Enemy / encounter structure that trains this line
   5.1 Side-character archetype(s)
   5.2 Mini-boss archetype(s)
   5.3 Main-boss archetype(s)
   5.4 Shadow encounter (what regression of this line looks like as a boss)
6. Architectural contract
   - data model, telemetry, isolation from other lines, server-authority needs
7. Open questions
8. Principles served
```

| File | Line | Quadrant home | Combat style |
|------|------|---------------|---------------|
| `lines/00-overview-multi-line.md` | meta | all | — |
| `lines/01-cognitive.md` | Cognitive | UR | Spellcasting, planning, n-back, Tower-of-London |
| `lines/02-emotional.md` | Emotional | UL | Empathy reads, affect-regulation parries, mood weather |
| `lines/03-moral.md` | Moral | UL→LL | Choice-based attacks, dilemma-driven branching |
| `lines/04-intrapersonal.md` | Intrapersonal | UL | Introspective meditation states, self-witness skills |
| `lines/05-spiritual.md` | Spiritual | UL | State-shifting, value-priority weapons |
| `lines/06-somatic.md` | Somatic | UR | Rhythm, dodge, posture, breath-gated abilities |
| `lines/07-willpower.md` | Willpower | UL→UR | Goal-locking buffs, fatigue resistance, follow-through |
| `lines/08-interpersonal.md` | Interpersonal | LL | Co-op synergies, group-buffs, conflict-resolution mechanics |

### 4.3 Stages of consciousness — one document per stage

Each stages/* document is a *level-design bible* for that stage. Same internal
structure:

```
1. Purpose
2. Stage definition (psychology, sociology, history, energetics)
3. What each line LOOKS LIKE at this stage (8 lines × this stage)
4. AQAL quadrant manifestations at this stage (UL, UR, LL, LR snapshots)
5. World aesthetic
   5.1 Visual language (palette, motifs, architecture)
   5.2 Sonic language (instrumentation, modal scales, rhythm)
   5.3 Narrative tone
6. Bestiary at this stage
   6.1 Side-characters (one per cognitive line, see lines/*)
   6.2 Mini-bosses (dual-line interference)
   6.3 Main boss (synthesis exam — must integrate all 8 lines at this stage)
   6.4 Shadow encounter (what regression FROM this stage to a previous one looks like)
7. Cognitive micro-task profile (which tasks dominate here, and at what difficulty band)
8. Stage advancement criteria (what the player must demonstrate, across all 8 lines and 4 quadrants, to move on)
9. Open questions
10. Principles served
```

| File | Stage | Energy ray (optional layer) | Defining capacity |
|------|-------|-----------------------------|-------------------|
| `stages/00-overview-eight-stages.md` | meta | — | The macro-arc |
| `stages/01-infrared-archaic.md` | 1 — Infrared | Red | Survival, sensory-motor |
| `stages/02-magenta-magic.md` | 2 — Magenta | Orange | Symbol, fantasy, magical agency |
| `stages/03-red-power.md` | 3 — Red | Yellow | Ego, will, dominance |
| `stages/04-amber-mythic.md` | 4 — Amber | Green | Belonging, rule-and-role |
| `stages/05-orange-rational.md` | 5 — Orange | Blue (in) | Reason, achievement, science |
| `stages/06-green-pluralistic.md` | 6 — Green | Blue (out) | Sensitivity, plurality, inclusion |
| `stages/07-turquoise-integral.md` | 7 — Turquoise | Indigo | Vision-logic, holism |
| `stages/08-white-superintegral.md` | 8 — White | Violet | Non-dual, harvest |

### 4.4 Combat — how lines × stages become real-time mechanics

| File | Purpose |
|------|---------|
| `combat/00-combat-philosophy.md` | Why ATB and not pure twitch; why every move must be *legibly* a cognitive demand. |
| `combat/01-atb-engine.md` | The maths: fill rate as f(agility), turn-stack, pause/resume, dead-skip. |
| `combat/02-cognitive-task-library.md` | The full library: n-back, Stroop, Simon, Go/No-Go, Corsi, WCST, Tower-of-London, complex-span, dual-n-back, task-switching, plus emotional/moral/spiritual analogues. Each task: parameters, scoring function, stage-of-difficulty band. |
| `combat/03-skill-tree-architecture.md` | How the skill tree is *generated* from {lines × stages}, not hand-authored, so adding a line or stage is a data change, not a code change. |
| `combat/04-damage-and-resistance-model.md` | How performance on a cognitive task converts to damage / mitigation / status. The deterministic core under the dice. |
| `combat/05-stance-and-state-shifting.md` | Cognitive-flexibility mechanics; stance as cached rule, stance-shift cost, WCST mid-fight. |
| `combat/06-multiplayer-combat.md` | Server-authoritative cognitive evaluation, fixed tickrate, latency compensation that does not destroy reaction-time validity. |

### 4.5 Enemies

| File | Purpose |
|------|---------|
| `enemies/00-enemy-taxonomy.md` | Enemy = (line targeted) × (stage of expression) × (role: side/mini/main/shadow). The combinatorial bestiary. |
| `enemies/01-side-characters-cognitive-drills.md` | One side-character archetype per (line × stage). Their attack patterns *encode* a single cognitive task. |
| `enemies/02-mini-bosses-dual-task.md` | Mini-bosses encode pairs of lines / dual-task interference. |
| `enemies/03-main-bosses-synthesis.md` | Main bosses are stage exams — every line tested, every quadrant touched. |
| `enemies/04-stage-bestiaries.md` | Stage-by-stage roster manifests with concrete enemies named, described, and statted. |
| `enemies/05-shadow-encounters.md` | Pathology / regression / repression as boss material — anti-bosses that test the *integration* of the line, not just the capacity. |

### 4.6 Progression

| File | Purpose |
|------|---------|
| `progression/00-progression-overview.md` | How the player ascends. Why ascent is multi-line, not a single XP bar. |
| `progression/01-staircase-dda.md` | The 1-up/2-down implementation, per-line, per-task. |
| `progression/02-skill-tree-progression.md` | How nodes unlock, how mastery is earned, how regressions are visualised. |
| `progression/03-stage-advancement-criteria.md` | The exact thresholds across all 8 lines + 4 quadrants required to ascend a stage. |
| `progression/04-line-balancing-and-altitude.md` | Preventing the "5/3/2/1/1/1/1/1" pathological imbalance; gentle nudges to weak lines without forcing them. |
| `progression/05-shadow-work-and-regression.md` | When the system detects a fixation/repression, the shadow encounter is unlocked. Optional, but rewarding. |
| `progression/06-state-training-meditation.md` | Optional state-side mini-game (gross→subtle→causal→witness→non-dual) parallel to stage progression. |

### 4.7 Narrative

| File | Purpose |
|------|---------|
| `narrative/00-narrative-architecture.md` | Story as scaffolding for stage progression. The protagonist is the player's developmental arc. |
| `narrative/01-protagonist-arc.md` | The eight-stage hero's journey, mapped to Campbell, Wilber, and the Bildungsroman. |
| `narrative/02-antagonist-archetypes.md` | Major antagonists as *fixations* at each stage. |
| `narrative/03-world-aesthetic-per-stage.md` | Visual / sonic / cultural world-bibles per stage. |
| `narrative/04-environmental-storytelling.md` | How the level itself communicates the stage without a single line of dialogue. |

### 4.8 Architecture

| File | Purpose |
|------|---------|
| `architecture/00-overview.md` | The binding architectural contract. The C4 context diagram. The module boundaries. |
| `architecture/01-clean-architecture.md` | core / usecases / infra / ui rules; no Phaser in core; no Capacitor in core; no Colyseus in core. |
| `architecture/02-state-pattern-and-fsm.md` | Battler state machine, enemy AI states, scene state machine, cognitive-task state machine. |
| `architecture/03-event-system.md` | Typed events as the only inter-module communication path. The full event catalogue. |
| `architecture/04-data-model.md` | Entities (Battler, Spell, Stats), value objects (Stage, Line, AQAL coords), aggregates (PlayerProfile), saved state schema. |
| `architecture/05-multiplayer-colyseus.md` | Schema design, room lifecycle, fixed-tick cognitive evaluation, anti-cheat. |
| `architecture/06-persistence.md` | KV store abstraction, namespacing, migrations, encryption-at-rest for sensitive cognitive telemetry. |
| `architecture/07-rendering-and-performance.md` | Object pools, texture atlases, tween budgets, fixed 60 fps target on mid-range Android. |
| `architecture/08-deployment-capacitor.md` | Webview, safe areas, hardware back, notification channels, Play-Store compliance. |
| `architecture/09-analytics-and-telemetry.md` | Per-line, per-task, per-session telemetry; on-device aggregation; opt-in cloud sync. |
| `architecture/10-testing-strategy.md` | Unit (core), integration (use-cases × infra), property-based (cognitive scoring), end-to-end (Phaser smoke). |

### 4.9 UX

| File | Purpose |
|------|---------|
| `ux/00-ux-philosophy.md` | "The richest model is useless if it cannot be felt in the thumb." |
| `ux/01-cognitive-overlay-ui.md` | How the cognitive task UI is summoned, how it sits with the battle scene, how it leaves no residue. |
| `ux/02-skill-tree-visualisation.md` | Eight-line, eight-stage radial chart. Altitude vs stage. Live updating. |
| `ux/03-progression-feedback.md` | Frame-by-frame, fight-by-fight, day-by-day, stage-by-stage feedback loops. |
| `ux/04-accessibility-and-safe-areas.md` | WCAG, reduced-motion, color-blind palettes, dyslexia-friendly type, notch/pinhole/punch-hole. |

### 4.10 Validation

| File | Purpose |
|------|---------|
| `validation/00-cognitive-validation-protocol.md` | How we will *prove* the game's tasks correlate with their established lab analogues. |
| `validation/01-neuroplasticity-evidence.md` | What we expect to see in transfer studies, and what would falsify the design. |
| `validation/02-ethics-and-data-privacy.md` | IRB, GDPR, child-safety, cognitive-data sensitivity, dark-pattern prohibition. |
| `validation/03-clinical-and-educational-applications.md` | Out-of-scope-for-MVP but required for honest scoping. |

### 4.11 Roadmap

| File | Purpose |
|------|---------|
| `roadmap/00-development-phases.md` | The five phases (research → vertical-slice → horizontal-pass → polish → release). |
| `roadmap/01-mvp-scope.md` | What ships first: a single stage (Red), three lines (Cognitive, Inhibitory/IC sub-line, Somatic), single-player only. |
| `roadmap/02-iteration-plan.md` | After MVP: which line / stage / multiplayer feature lands next, and why. |
| `roadmap/03-risk-register.md` | Technical, scientific, ethical, commercial risks; owners; mitigations. |

---

## 5. Reading order

For a new contributor, the canonical reading order is:

1. `REQUIREMENTS.md` (this file)
2. `00-vision.md`
3. `01-first-principles.md`
4. `02-glossary.md`
5. `foundations/00-integral-theory.md` → `foundations/10-shadow-and-pathology.md`
6. `lines/00-overview-multi-line.md` → `lines/08-interpersonal.md`
7. `stages/00-overview-eight-stages.md` → `stages/08-white-superintegral.md`
8. `combat/00-combat-philosophy.md` → `combat/06-multiplayer-combat.md`
9. `enemies/00-enemy-taxonomy.md` → `enemies/05-shadow-encounters.md`
10. `progression/00-progression-overview.md` → `progression/06-state-training-meditation.md`
11. `narrative/*` and `ux/*` (parallel)
12. `architecture/00-overview.md` → `architecture/10-testing-strategy.md`
13. `validation/*`
14. `roadmap/*`

The architecture section deliberately comes *after* foundations / lines / stages /
combat / enemies — because architecture exists to *serve* the design, never to
constrain it.

---

## 6. Open questions — resolved (canon decisions)

The five load-bearing questions have been resolved by the user and
are now **canon**. They are recorded here for posterity; the binding
build plan is `MVP-BLUEPRINT.md` at the repo root.

| # | Question | Canon answer |
|:-:|---|---|
| 1 | Energy-ray / Law-of-One layer — canon or aesthetic? | **CANON.** Fully integrated. Seven rays as first-class types; harvest into 4th density as canonical endgame. See `foundations/06` (revised) and `MVP-BLUEPRINT.md §14–18`. |
| 2 | MVP stage and line selection | **Red stage** as fully-playable content; **all 8 lines** registered with at least one MVP verb each; **Infrared prologue** as adaptive-onboarding host. See `MVP-BLUEPRINT.md §19–23`. |
| 3 | Multiplayer in MVP | **No.** Post-MVP integration path specified in `MVP-BLUEPRINT.md §39`. Single-player MVP, with NPC-ally interpersonal-line training. |
| 4 | Clinical / IRB ambition | **No clinical / regulated claim.** Commitment to *legitimate efficacy* — neurologically, biologically, psychologically — measured via validated tasks and honest telemetry, *without* clinical-device certification. See `MVP-BLUEPRINT.md §2`. |
| 5 | Audience / age band | **Adaptive — any age, any altitude.** The game self-calibrates to the player via the Adaptive Onboarding (`MVP-BLUEPRINT.md §9–13`). No fixed entry difficulty. Built personally, deployed globally. |

These five canon decisions reshape several documents. The reshaping
has been applied; the affected documents carry "Canon status" headers.

The new load-bearing question is the *implementation question*:
build the MVP per `MVP-BLUEPRINT.md`. That document supersedes any
conflict; it is the single source of truth from this point forward.

---

## 7. Principles served

This file serves principles **1, 2, 3, 4, 5, 6, 7** — i.e. all of them, because
it is the index. Every individual document below will serve a strict subset.
