# CCRPG — Cognitive-Capacity-Driven RPG

> 🚧 **Under Development** — Core architecture complete. First playable
> (Red stage vertical slice) ready for internal testing. Full 64-cell
> assessment module system implemented with 1,280 items across all 8
> stages.

An assessment-module-driven developmental RPG whose every gameplay
encounter is the gamification of a validated developmental assessment,
whose macro-progression is the eight stages of consciousness (64-cell
module architecture: 8 lines x 8 stages), and whose endgame is the
harvest into 4th-density unity in the canonical Law-of-One framing.
Built personally. Designed to be globally deployable. Adaptive to any
age, any developmental altitude.

---

## What this is

CCRPG is **two things at once**:

1. An assessment-module-driven developmental RPG with narrative arcs,
   immersive gameplay, and a 64-cell module architecture (8 lines of
   intelligence x 8 stages of consciousness). Every encounter is a
   module executing in one of four modes (calibration, encounter,
   practice, shadow work).
2. A **literal cognitive / developmental practice** -- every assessment
   module is a validated developmental exercise that simultaneously
   diagnoses AND heals/evolves the player. The game's progression IS
   the demonstration of integrated growth across all eight lines of
   intelligence.

The vision is documented in `docs/00-vision.md`. The binding build
plan is `UNIFIED-IMPLEMENTATION-PLAN.md` at the repo root.

## The four canon decisions

| # | Decision |
|:-:|---|
| 1 | **Law-of-One layer = canon, fully integrated.** Seven energy rays as first-class types; harvest into 4th density as canonical endgame. |
| 2 | **No clinical / IRB ambition.** Commitment to *legitimate* neurological / biological / psychological efficacy via validated tasks and honest telemetry — without regulated medical-device certification. |
| 3 | **Adaptive onboarding for any age, any altitude.** Built personally, deployed globally. |
| 4 | **MVP = modular foundation of everything.** All 8 lines, 8 stages, 7 rays, 4 quadrants registered as modules at MVP launch. Red stage as the first vertical slice. Adding the rest is content drops. |

## Repository layout

```
CCRPG/
├── README.md                       <- you are here
├── UNIFIED-IMPLEMENTATION-PLAN.md  <- the binding build plan
├── MVP-BLUEPRINT.md                <- vision & philosophy (implementation details superseded)
│
├── docs/                           <- the research foundation
│   ├── INDEX.md                    <- navigation
│   ├── REQUIREMENTS.md             <- the document-of-documents
│   ├── CHANGELOG.md                <- canon-decision history
│   ├── STAGE-ASSESSMENT-ARCHITECTURE.md <- module contract & execution modes
│   ├── ONBOARDING-REDESIGN-PLAN.md <- binary-search composite assessment
│   ├── 00-vision.md
│   ├── 01-first-principles.md
│   ├── 02-glossary.md
│   ├── 03-research-methodology.md
│   ├── foundations/                <- 28 theoretical foundations (00-27)
│   ├── lines/                      <- 8 lines of intelligence + overview
│   ├── stages/                     <- 8 stages of consciousness + overview
│   ├── progression/                <- progression overview
│   ├── narrative/                  <- narrative architecture
│   ├── archive/                    <- obsolete docs (combat/, enemies/, plan.md, etc.)
│   └── concept-drafts/             <- 512 game concept documents (64 modules x 8 files)
│
├── src/                            <- Phaser 3 + TypeScript scaffold (seed of MVP)
│   ├── core/                       <- pure TS -- domain & use cases
│   ├── infra/                      <- persistence + native bridges
│   └── game/                       <- Phaser scenes + UI + objects
│
├── tests/                          <- Vitest specs
└── public/                         <- static assets
```

## Status

| Layer | Status |
|---|---|
| Research / design documentation | ✅ Complete — 28 foundations + concept-drafts, canon-locked. |
| Concept-drafts (512 modules) | ✅ Complete — all 512 concept-drafts exist. |
| Unified build plan | ✅ Complete — `UNIFIED-IMPLEMENTATION-PLAN.md` at repo root. |
| Implementation Phase 0: Legacy Removal | ✅ Complete — ATB removed, Significator is sole state vessel. |
| Implementation Phase 1: Core Architecture | ✅ Complete — Assessment engine, CCI, AutoMode, Scheduler, all 64 modules with 1,280 items. |
| Implementation Phase 2: First Playable | ✅ Complete — Full developmental loop, encounter selection UI, checkpoint system, accessibility layer. |
| Implementation Phase 3: Polish | ✅ Complete — Macro-catalyst engine, WorldState enrichment, transformation lifecycle. |
| Global deploy (web + Android) | ⏳ Planned. |

The `src/` contains the **full assessment-module architecture** —
64 registered modules (8 lines × 8 stages), each with 20 assessment
items, mode-aware execution (capacity/encounter/shadow/calibration/practice),
adaptive item selection, and the complete developmental loop from
CCI computation through encounter scheduling to Significator mutation.

## Quick start (the existing scaffold)

```bash
npm install
npm run dev          # local Vite dev server with HMR (open http://localhost:5173)
npm run build        # type-check + production bundle in dist/
npm test             # vitest unit tests for the core
```

Capacitor / Android targets:

```bash
npm run cap:sync     # build + cap sync
npm run cap:android  # build, sync, open in Android Studio
```

## Reading the documentation

If you have **30 minutes** and want the picture:

1. `docs/00-vision.md`
2. `docs/01-first-principles.md`
3. `UNIFIED-IMPLEMENTATION-PLAN.md`

If you have **2 hours** and want the architecture:

1. The above
2. `docs/INDEX.md`
3. `docs/foundations/00-integral-theory.md`
4. `docs/foundations/06-law-of-one-correspondence.md` (the canon)
5. `docs/STAGE-ASSESSMENT-ARCHITECTURE.md`

If you want **all of it**, follow the reading order in `docs/INDEX.md`.

## Architecture in one paragraph

The codebase is split into three layers — `core/` (pure TypeScript,
no Phaser, no native, no network — runs in Node, in tests, in the
browser, anywhere a TS engine runs); `infra/` (I/O adapters —
persistence, native bridges, telemetry, locale); and `game/` (the
Phaser scenes that *visualise* the core). The MVP introduces eight
**registries** (`LineRegistry`, `StageRegistry`, `RayRegistry`,
`TaskRegistry`, `AbilityRegistry`, `EncounterRegistry`,
`DriveRegistry`, `NarrativeRegistry`) so that adding a new stage,
line, ray, task, ability, encounter, drive, or narrative beat is a
data-and-adapter change, never a rewrite.

## The eight-stage developmental arc, at a glance

| # | Stage | Energy ray | Defining capacity |
|:-:|---|---|---|
| 1 | Infrared / Archaic | Red | Survival, sensori-motor |
| 2 | Magenta / Magic | Orange | Symbol, magical agency |
| 3 | Red / Power | Yellow | Ego, will, dominance |
| 4 | Amber / Mythic | Green | Belonging, rule-and-role |
| 5 | Orange / Rational | Blue (in) | Reason, achievement |
| 6 | Green / Pluralistic | Blue (out) | Sensitivity, plurality |
| 7 | Turquoise / Integral | Indigo | Vision-logic, holism |
| 8 | White / Super-Integral | Violet | Non-dual, harvest |

Per-stage world bibles are in `docs/stages/`.

## The eight lines of intelligence

| Line | Quadrant home | Assessment style |
|---|---|---|
| Cognitive | UR | Planning, working-memory, Tower-of-London |
| Emotional | UL | Empathy reads, affect-regulation, mood recognition |
| Moral | UL->LL | Choice-based dilemmas, value-priority assessments |
| Intrapersonal | UL | Witness pause, self-tag, integrate |
| Spiritual | UL | State-shifting, value-priority modules |
| Somatic | UR | Rhythm, proprioception, breath-gated abilities |
| Willpower | UL->UR | Goal-locking, fatigue resistance |
| Interpersonal | LL | Co-op synergies, conflict resolution |

Per-line documents are in `docs/lines/`.

## Contributing

This project is **personally authored** by [@ishan-parihar](https://github.com/ishan-parihar)
and shipped globally. External contributions of the cognitive
content (cultural reviewers for affect-recognition stimuli,
linguistic localisation of narration, accessibility expertise) are
welcomed once the MVP is stable. Until then, please use Issues for
discussion. PRs against the early scaffold are accepted at the
maintainer's discretion.

A `CONTRIBUTING.md` will be added during Phase 5.

## License

License to be finalised before public deploy. The architectural
blueprint (now archived) and the entire `docs/` tree are provided
*as-is for study and reference*; the implementation, when complete,
will carry an explicit OSS license (MIT or Apache-2.0, leaning MIT).

## Acknowledgements

- **Ken Wilber** — Integral / AQAL theory; the eight-stage developmental
  framework
- **The Ra material** (L/L Research) — the seven-ray cosmology canonised
  into CCRPG's metaphysics
- **Adele Diamond, Akira Miyake, Naomi Friedman** — the executive-functions
  taxonomy CCRPG's combat verbs are gamifications of
- **Mihaly Csikszentmihalyi** — the flow-channel theory underpinning the
  staircase difficulty system
- **Jean Piaget, Lawrence Kohlberg, James Fowler, Jane Loevinger,
  Susanne Cook-Greuter, Robert Kegan** — the developmental-stages
  research synthesised into the eight-stage canon
- **Phaser**, **TypeScript**, **Vite**, **Capacitor**, **Vitest** — the
  technical foundation

The full bibliography will live in `docs/validation/BIBLIOGRAPHY.md`
during Phase 5.

---

*"Reality is not constructed; it is unfolded from a pre-existing whole."*
---
Developed by [Ishan Parihar](https://github.com/ishan-parihar) — If you find this useful, [consider supporting](https://rzp.io/rzp/ishan-parihar)
