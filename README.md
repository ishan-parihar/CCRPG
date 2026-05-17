# CCRPG — Cognitive-Capacity-Driven RPG

> 🚧 **Under Development** — Research phase complete. MVP build phase
> beginning. Not yet playable as the full vision; an early Phaser 3 +
> TypeScript scaffold is included in `src/` for reference and as the
> seed of the MVP.

A role-playing fighting game whose every gameplay verb is the
gamification of a validated developmental assessment, whose
macro-progression is the eight stages of consciousness, and whose
endgame is the harvest into 4th-density unity in the canonical
Law-of-One framing. Built personally. Designed to be globally
deployable. Adaptive to any age, any developmental altitude.

---

## What this is

CCRPG is **two things at once**:

1. A real action RPG with active-time-battle combat, spells, parries,
   bosses, narrative arcs, and the felt experience of an immersive
   game world.
2. A **literal cognitive / developmental practice** — every spell is a
   working-memory test, every parry is an inhibitory-control test,
   every choice is a moral-development test, every stance-shift is a
   cognitive-flexibility test. The game's progression IS the
   demonstration of integrated growth across all eight lines of
   intelligence.

The vision is documented in `docs/00-vision.md`. The binding build
plan is `MVP-BLUEPRINT.md` at the repo root.

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
├── README.md                       ← you are here
├── MVP-BLUEPRINT.md                ← the binding build plan
├── plan.md                         ← the original architectural blueprint
│
├── docs/                           ← the research foundation (38 documents)
│   ├── INDEX.md                    ← navigation
│   ├── REQUIREMENTS.md             ← the document-of-documents
│   ├── CHANGELOG.md                ← canon-decision history
│   ├── 00-vision.md
│   ├── 01-first-principles.md
│   ├── 02-glossary.md
│   ├── 03-research-methodology.md
│   ├── foundations/                ← 11 theoretical foundations
│   ├── lines/                      ← 8 lines of intelligence + overview
│   ├── stages/                     ← 8 stages of consciousness + overview
│   ├── combat/                     ← combat philosophy
│   ├── enemies/                    ← enemy taxonomy
│   ├── progression/                ← progression overview
│   └── narrative/                  ← narrative architecture
│
├── src/                            ← Phaser 3 + TypeScript scaffold (seed of MVP)
│   ├── core/                       ← pure TS — domain & use cases
│   ├── infra/                      ← persistence + native bridges
│   └── game/                       ← Phaser scenes + UI + objects
│
├── tests/                          ← Vitest specs
└── public/                         ← static assets
```

## Status

| Layer | Status |
|---|---|
| Research / design documentation | ✅ **Complete** — 38 foundational documents, canon-locked. |
| MVP blueprint | ✅ **Complete** — `MVP-BLUEPRINT.md` at repo root. |
| Modular registries (lines / stages / rays / tasks / abilities / encounters / drives / narrative) | 🚧 **Phase 1 — in progress.** |
| Adaptive onboarding | 🚧 **Phase 1 — in progress.** |
| Red stage vertical slice | ⏳ **Phase 2 — planned.** |
| Other 7 stages (stub modules) | ⏳ **Phase 3 — planned.** |
| Law-of-One canonical layer (palette / audio / codex) | ⏳ **Phase 4 — planned.** |
| Global deploy (web + Android) | ⏳ **Phase 5 — planned.** |

The existing `src/` contains a working **early scaffold** from the
pre-canon `plan.md` — ATB engine, n-back task, Stroop task, basic
Phaser scenes, Capacitor wrapping, Vitest tests. It is the *seed*
the MVP grows from, not the MVP itself.

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
3. `MVP-BLUEPRINT.md` Parts I–IV

If you have **2 hours** and want the architecture:

1. The above
2. `docs/INDEX.md`
3. `docs/foundations/00-integral-theory.md`
4. `docs/foundations/06-law-of-one-correspondence.md` (the canon)
5. `MVP-BLUEPRINT.md` Parts V–VII

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

| Line | Quadrant home | Combat style |
|---|---|---|
| Cognitive | UR | Spellcasting, planning, n-back, Tower-of-London |
| Emotional | UL | Empathy reads, affect-regulation parries |
| Moral | UL→LL | Choice-based attacks, dilemma branches |
| Intrapersonal | UL | Witness pause, self-tag, integrate |
| Spiritual | UL | State-shifting, value-priority weapons |
| Somatic | UR | Rhythm, dodge, posture, breath-gated abilities |
| Willpower | UL→UR | Goal-locking buffs, fatigue resistance |
| Interpersonal | LL | Co-op synergies, group buffs, conflict resolution |

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
blueprint (`plan.md`) and the entire `docs/` tree are provided
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
