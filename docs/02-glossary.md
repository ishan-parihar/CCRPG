# 02 — Glossary

## 1. Purpose

A single, canonical, alphabetised definition for every domain term used
anywhere in `/docs/`. If a term has nuance, the glossary entry says so and
points to the document where the nuance is explored.

Terms are normative: when a document uses one of these words, it uses *this*
definition. Conflicts are resolved by editing this file, not the using
document.

## 2. Scientific basis

Each entry cites the originating literature where applicable. When a
concept is contested between literatures (e.g., "stage" in Piaget vs.
Wilber vs. Kohlberg), the glossary records the Mysterium-canonical reading and
cross-references the alternatives.

## 3. Game-design mapping

The glossary doubles as the *vocabulary the player will eventually
encounter* — every term that surfaces in tooltips, codex entries, or
stage-up screens must appear here so that in-game text remains consistent
with the design canon.

## 4. Architectural contract

Every TypeScript identifier in `core/domain/` that names a concept defined
here must spell it identically. E.g., `Stage`, `Line`, `Quadrant`, `Ray` are
top-level types whose string-literal members exactly match the slug column
below.

```
type Stage = 'Infrared'|'Magenta'|'Red'|'Amber'|'Orange'|'Green'|'Turquoise'|'White';
type Line  = 'Cognitive'|'Emotional'|'Moral'|'Intrapersonal'|'Spiritual'|'Somatic'|'Willpower'|'Interpersonal';
type Quadrant = 'UL'|'UR'|'LL'|'LR';
type State = 'Gross'|'Subtle'|'Causal'|'Witness'|'NonDual';
type Drive = 'Agency'|'Communion'|'Eros'|'Agape';
type Ray   = 'Red'|'Orange'|'Yellow'|'Green'|'Blue'|'Indigo'|'Violet';   // canon — see foundations/06
type BlueFlow = 'in'|'out';                                              // required when Ray === 'Blue'
```

These are the canonical strings. Using `'IndividualInterior'` instead of
`'UL'` anywhere in `core/` is a lint failure.

## 5. Glossary entries

### Top-level structures

| Term | Slug | Definition |
|---|---|---|
| **AQAL** | `AQAL` | Wilber's "all quadrants, all levels" meta-framework. Mysterium uses the four-quadrant version (UL, UR, LL, LR) plus levels (= stages) and lines. |
| **Altitude** | `altitude` | The level a *single line* has reached, independent of other lines. A player has eight altitudes simultaneously. Distinguished from *stage*, which is a synthesis. |
| **Battler** | `Battler` | The runtime entity (player or enemy) participating in combat. Defined in `core/domain/Battler.ts`. |
| **Bestiary** | `bestiary` | The full catalogue of enemies, side-characters, mini-bosses, main bosses, and shadows. See `enemies/04-stage-bestiaries.md`. |
| **Boss (main)** | `MainBoss` | A synthesis encounter that exercises *every* line at a single stage's altitude. |
| **Boss (mini)** | `MiniBoss` | A dual-task encounter that exercises a pair of lines under interference. |
| **Combat verb** | `combat_verb` | A discrete player action whose resolution requires a cognitive micro-task (e.g., *cast spell* → n-back; *parry* → Stroop). |
| **Drive** | `Drive` | One of {Agency, Communion, Eros, Agape}. The polarity engine that motivates story-level conflict and gives each line a "tilt." |
| **Encounter** | `encounter` | A single fight. Always typed by `(line, stage, role, drives_in_play)`. |
| **Holon** | `holon` | Wilber's term for "a whole that is part of a larger whole." Used in Mysterium to describe sub-octaves and recursive level structures. |
| **Line (of intelligence)** | `Line` | A relatively-independent developmental stream. Mysterium canonises eight: see table above. |
| **Quadrant** | `Quadrant` | One of UL (individual interior), UR (individual exterior), LL (collective interior), LR (collective exterior). |
| **Side-character** | `SideCharacter` | A standard enemy that encodes exactly one (line × stage × task) pair. |
| **Stage (of consciousness)** | `Stage` | One of the eight macro-developmental levels Infrared → White. Stage is reached only when *every* line has cleared the threshold, not when one has. |
| **State** | `State` | One of {Gross, Subtle, Causal, Witness, Non-Dual}. Orthogonal to stage; trains via meditative mini-game. |
| **Sub-octave** | `sub_octave` | The fractal recapitulation of the eight-stage octave inside a single stage. Used in the optional Law-of-One layer. |
| **Synthesis exam** | `synthesis_exam` | The main boss fight that gates progression to the next stage. |

### Lines, expanded

| Line | Slug | Quadrant home | One-line definition |
|---|---|---|---|
| Cognitive | `Cognitive` | UR | The capacity to take perspectives; depth of cognitive complexity. |
| Emotional | `Emotional` | UL | The capacity to register, regulate, and read feelings — own and other. |
| Moral | `Moral` | UL→LL | The capacity to discern right action; egocentric→ethnocentric→worldcentric→kosmocentric. |
| Intrapersonal | `Intrapersonal` | UL | The capacity to introspect and accurately self-report. |
| Spiritual | `Spiritual` | UL | The capacity to discern what is most fundamentally important; "ultimate concern." |
| Somatic | `Somatic` | UR | The capacity to inhabit and skilfully use the body. |
| Willpower | `Willpower` | UL→UR | The capacity to set a goal and execute toward it across time. |
| Interpersonal | `Interpersonal` | LL | The capacity to skilfully attune to and engage other selves. |

### Stages, expanded

| Stage | Slug | Energy ray (canonical) | Defining capacity |
|---|---|---|---|
| Infrared | `Infrared` | Red | Survival, sensory-motor |
| Magenta | `Magenta` | Orange | Symbol, fantasy, magical agency |
| Red | `Red` | Yellow | Ego, will, dominance |
| Amber | `Amber` | Green | Belonging, rule-and-role |
| Orange | `Orange` | Blue (in) | Reason, achievement, science |
| Green | `Green` | Blue (out) | Sensitivity, plurality, inclusion |
| Turquoise | `Turquoise` | Indigo | Vision-logic, holism |
| White | `White` | Violet | Non-dual, harvest |

### Rays, expanded (canonical — see `foundations/06`)

| Ray | Slug | Energy centre | Stage hosted | Function in the world |
|---|---|---|---|---|
| Red | `Red` | Root / Muladhara | Infrared | Foundation; basic strengthening |
| Orange | `Orange` | Sacral / Svadhisthana | Magenta | Emotional / sacral identity |
| Yellow | `Yellow` | Solar plexus / Manipura | Red | Ego / will; "great stepping-stone ray" |
| Green | `Green` | Heart / Anahata | Amber | First true heart-opening |
| Blue | `Blue` (`in` / `out`) | Throat / Vishuddha | Orange (in) / Green (out) | Co-creator, bidirectional |
| Indigo | `Indigo` | Brow / Ajna | Turquoise | Gateway; vision-logic |
| Violet | `Violet` | Crown / Sahasrara | White | Total integration; harvest |

### Cognitive tasks (canonical task set — full library in `combat/02`)

| Task | Slug | Trains | In-game vehicle |
|---|---|---|---|
| n-back | `n_back` | Working memory, dlPFC | Echo Casting (offensive spells) |
| Stroop | `stroop` | Inhibitory control, ACC | Chromatic Parry (defensive parry) |
| Simon | `simon` | Spatial inhibitory control | Spatial Counter (block direction) |
| Go/No-Go | `go_no_go` | Behavioural inhibition | Phantom Feint defence |
| Corsi block-tapping | `corsi` | Visuospatial WM | Sigil Tracing (boss-armour break) |
| WCST | `wcst` | Cognitive flexibility | Elemental Shifting (stance-shift) |
| Tower of London | `tol` | Planning, pre-frontal | Combo Sequencing (planned chain) |
| Complex span | `complex_span` | WM under interference | Focus Channeling (dual-task) |
| Task switching | `task_switch` | Set-shifting | Asynchronous Wielding |

### Mechanics

| Term | Slug | Definition |
|---|---|---|
| **ATB (Active Time Battle)** | `ATB` | Each Battler has a hidden gauge filling at a rate determined by Agility; reaches 100 → action phase. See `combat/01-atb-engine.md`. |
| **Cognitive overlay** | `cognitive_overlay` | The parallel Phaser scene that owns the cognitive UI for the duration of a micro-task. Communicates with battle scene via typed events. |
| **DDA (Dynamic Difficulty Adjustment)** | `DDA` | The transformed up-down staircase. Per-line, per-task. |
| **Fill rate** | `fill_rate` | The per-frame ATB increment, derived from Agility via the diminishing-returns curve `BaseTick · (1 + a/100)` capped above 100. |
| **Focus point** | `focus_point` | A high-tier offensive spell charge gated by an n-back run. |
| **Object pool** | `object_pool` | Pre-allocated reusable sprite collection (projectiles, particles) — eliminates GC pauses. |
| **Skill tree** | `skill_tree` | The data-driven graph of {line × stage × node} unlocks. Generated, not authored. |
| **Stance** | `stance` | A cached set of damage / resistance multipliers selected by the player; stance-shifts have a WCST cost. |
| **Telemetry packet** | `telemetry_packet` | The per-task observation `{ task, line, stage, accuracy, rt, n, success }` written to the local store and (opt-in) synced. |
| **Threshold (70.7%)** | `threshold_70_7` | The convergence target for the 1-up/2-down staircase; the empirical sweet-spot for engagement and plasticity. |

### Process / methodology

| Term | Slug | Definition |
|---|---|---|
| **DSR** | `DSR` | Design Science Research — the seven-phase methodology guiding `validation/00`. |
| **INFORM** | `INFORM` | Interaction-design framework with 12 micro-elements that link representation/interaction to cognitive demand. |
| **OMDE** | `OMDE` | Objects → Mechanics → Dynamics → Emotions design-from-the-foundation pattern. |
| **PCG** | `PCG` | Procedural content generation — used here only for level dressing, never for cognitive payload. |

### Pathology / shadow

| Term | Slug | Definition |
|---|---|---|
| **Fixation** | `fixation` | The player's altitude on a line stalls for a sustained period. Triggers a shadow-encounter unlock. |
| **Regression** | `regression` | A line's measured altitude drops by ≥ 1 stage and stays there for ≥ N sessions. Triggers shadow-encounter and a softer DDA on that line. |
| **Repression** | `repression` | A line is consistently *underused* — the player avoids encounters that would surface it. Detected via sampling. |
| **Shadow encounter** | `shadow_encounter` | An optional boss fight that dramatises a fixation, regression, or repression for *integration*, not punishment. |

## 6. Open questions

- **Naming the lines.** Should `Interpersonal` be promoted to a quadrant
  rather than a line, since it lives in LL? The current decision (line) is
  pragmatic — it makes the radial chart symmetric (8 spokes). But it is
  technically a category-error in pure AQAL.
- **`Spiritual` vs `Intrapersonal` overlap.** Wilber distinguishes them;
  Goleman folds them; Fowler fuses them with moral. The canon decision is
  to keep them separate but document the overlap explicitly in `lines/05`.
- **Energy-ray slugs.** If the user promotes the Law-of-One layer to canon,
  these become first-class types alongside Stage. Currently they are a
  string label only.

## 7. Principles served

Principles **1, 5, 7** — definition discipline, UX consistency, codebase
honesty.
