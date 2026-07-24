# `/docs/` -- Index

> The research foundation of Mysterium. The binding build plan lives at
> the repo root in `UNIFIED-IMPLEMENTATION-PLAN.md`. This tree is the *why* and the
> *what*; the unified plan is the *how* and the *when*.

## Reading order for a new contributor

1. `../UNIFIED-IMPLEMENTATION-PLAN.md` -- the binding build plan.
2. `REQUIREMENTS.md` -- the document-of-documents (this tree's contract).
3. `00-vision.md`
4. `01-first-principles.md`
5. `02-glossary.md`
6. `03-research-methodology.md`
7. `foundations/00-...34-...` (in order -- **00-09 substrate, 10-14 lesser cycle, 15-27 greater cycle, 28-34 curriculum expansion**)
8. `lines/00-overview-multi-line.md` then `01-...08-...` (any order)
9. `stages/00-overview-eight-stages.md` then `01-...08-...` (in order)
10. `STAGE-ASSESSMENT-ARCHITECTURE.md`
11. `progression/00-progression-overview.md`
12. `narrative/00-narrative-architecture.md`
13. `concept-drafts/README.md` then a sampled module to see the lesser-cycle design briefs in concrete form
14. `CHANGELOG.md` -- what changed, and when.

> **For the impatient:** read `00-vision.md`, then `foundations/15` and `foundations/21`. That gives you the world's metaphysics and the master architectural synthesis. Everything else fills in detail.

## The foundational documents

### Meta layer (5)

- `REQUIREMENTS.md` -- the contract for the whole tree
- `00-vision.md`
- `01-first-principles.md`
- `02-glossary.md`
- `03-research-methodology.md`

### `foundations/` (34)

#### Theoretical substrate (00–09)

- `00-integral-theory.md`
- `01-aqal-quadrants.md`
- `02-eight-stages-overview.md`
- `03-lines-of-intelligence-overview.md`
- `04-states-of-consciousness.md`
- `05-drives-and-polarities.md`
- `06-law-of-one-correspondence.md` ← **canonical metaphysics**
- `07-neuroscience-of-development.md`
- `08-psychophysics-and-staircase.md`
- `09-flow-and-engagement-theory.md`

#### Lesser-cycle game design (10–14)
> Mechanises the **Matrix → Potentiator → Catalyst → Experience** archetypes — the per-encounter metabolic engine.

- `10-shadow-and-pathology.md` — 4-quadrant shadow model
- `11-game-modalities.md` — the 7 modalities, modality×line affinity
- `12-drive-assessment-mechanics.md` — per-module drive probes, dual-domain scoring
- `13-architecture-of-consciousness.md` — 5-layer topography, contact boundary, Matrix/Potentiator
- `14-game-as-developmental-catalyst.md` — catalyst→experience→integration mechanics

#### Greater-cycle game design (15–22)
> Mechanises the **Significator → Transformation → Great Way → Choice** archetypes — the per-incarnation evolutionary engine. The Veil of Forgetting governs all of it. `21` is the master synthesis.

- `15-macro-scale-archetypal-mind.md` — pure theoretical substrate (the Logos blueprint)
- `16-significator-architecture.md` — player-as-persistent-soul-pattern, distortion ledger
- `17-transformation-mechanics.md` — frame-change at stage thresholds, the Lovers crucible
- `18-great-way-world-architecture.md` — world as PESTLE-mapped collective holons
- `19-choice-and-polarity-engine.md` — STO/STS vectors, consequence propagation
- `20-veil-of-forgetting.md` — the implicit-operation principle
- `21-incarnation-architecture.md` ← **master synthesis (Option C)**
- `22-holon-context-engine.md` — LLM-driven world implementation
- `23-polarity-ontology.md` -- per-line x stage polarity texture catalogue (64 cells)
- `24-encounter-scheduler.md` -- encounter selection algorithm & macro-catalyst engine
- `25-cumulative-consciousness-index.md` -- CCI composite metric
- `26-unified-core-architecture.md` -- the unified core architecture spec
- `27-auto-mode-strategy-engine.md` -- auto-mode session strategy generation
- `28-holoos-open-joints-mapping.md` -- HoloOS open-joints tracking

#### Curriculum expansion (29–34)
> The theoretical substrate and architectural contract for extending Mysterium with modular curriculum support — knowledge taxonomies, subject concepts, depth rubrics, and progression. These documents ground the curriculum plug system in meta-learning science and holonic architecture.

- `29-meta-learning-science.md` — the neuroscience and cognitive science of how learning works
- `30-holonic-curriculum-architecture.md` — holonic principles applied to knowledge organization
- `31-depth-assessment-model.md` — surface-to-transformative depth spectrum, dual-depth assessment
- `32-agentic-curriculum-linter.md` — the three-agent validation workflow (Generator → Critic → Integrator)
- `33-self-directed-dashboard.md` — the five dashboard views for learner self-direction
- `34-curriculum-engine-bridge.md` — the integration contract between curriculum modules and the existing engine

### `lines/` (9) — one per line of intelligence

- `00-overview-multi-line.md`
- `01-cognitive.md`
- `02-emotional.md`
- `03-moral.md`
- `04-intrapersonal.md`
- `05-spiritual.md`
- `06-somatic.md`
- `07-willpower.md`
- `08-interpersonal.md`

### `stages/` (9) — one world bible per stage

- `00-overview-eight-stages.md`
- `01-infrared-archaic.md`
- `02-magenta-magic.md`
- `03-red-power.md`
- `04-amber-mythic.md`
- `05-orange-rational.md`
- `06-green-pluralistic.md`
- `07-turquoise-integral.md`
- `08-white-superintegral.md`

### Architecture-philosophy (4)

- `STAGE-ASSESSMENT-ARCHITECTURE.md` -- module contract, composition rules, 4 execution modes
- `ONBOARDING-REDESIGN-PLAN.md` -- binary-search composite assessment for Significator seeding
- `progression/00-progression-overview.md`
- `narrative/00-narrative-architecture.md`

## Mandatory document contract

Every document in this tree carries the **six required headings**:

```
1. Purpose
2. Scientific basis
3. Game-design mapping
4. Architectural contract
5. Open questions
6. Principles served
```

A document missing any of the six is incomplete and is flagged for
review.

## Deferred documents

The deeper engineering layers (`progression/01-06`, `narrative/01-04`,
`architecture/`, `ux/`, `validation/`, `roadmap/`) listed in
`REQUIREMENTS.md` are **deferred to the implementation phase**. Each is
referenced from its parent philosophy document with a one-line intent
that AI agents can pick up using the philosophy as a binding contract.

> **Note:** The `combat/` and `enemies/` directories have been archived
> to `docs/archive/`. The combat philosophy is superseded by the
> assessment-module architecture in `STAGE-ASSESSMENT-ARCHITECTURE.md`
> and `UNIFIED-IMPLEMENTATION-PLAN.md`.

## Canon

As of v2.0 (2026-05-18) the architectural pivot is complete: ATB combat
removed, assessment modules ARE the gameplay, Significator replaces
PlayerProfile. See `CHANGELOG.md` and `REQUIREMENTS.md`. The
binding build plan is `../UNIFIED-IMPLEMENTATION-PLAN.md`.
