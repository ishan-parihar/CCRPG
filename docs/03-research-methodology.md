# 03 — Research Methodology

## 1. Purpose

How do we know we are doing the research right? This document specifies the
methods, evidence hierarchy, citation rules, and conflict-resolution
procedure used across the entire `/docs/` tree. It binds *us* to a process
in the same way that `architecture/01-clean-architecture.md` binds the code
to module boundaries.

## 2. Scientific basis

Three methodological frameworks structure this work:

### 2.1 DSR — Design Science Research

Hevner et al.'s seven-phase pattern, adapted for a cognitive-game context:

| Phase | Activity in CCRPG |
|---|---|
| 1. Problem identification | "Cognitive-training apps fail at retention." `00-vision.md`. |
| 2. Define objectives | The seven first-principles. `01-first-principles.md`. |
| 3. Design & development | This `/docs/` tree, then the codebase. |
| 4. Demonstration | Vertical-slice MVP (Red stage, three lines). `roadmap/01-mvp-scope.md`. |
| 5. Evaluation | Construct-validity studies. `validation/00`. |
| 6. Communication | Open-source release; potentially a peer-reviewed paper. |
| 7. Iteration | The post-MVP roadmap. `roadmap/02-iteration-plan.md`. |

DSR is *iterative* — phases 3–5 cycle. Each cycle should refine *this*
document.

### 2.2 OMDE — Objects → Mechanics → Dynamics → Emotions

A bottom-up gamification pattern:

- **Objects** — the entities (Battler, Spell, Stat, Stage, Line). Defined in
  `architecture/04-data-model.md`.
- **Mechanics** — the rules that operate on objects (ATB fill, damage
  formula, n-back scoring). Defined in `combat/*` and `core/usecases/*`.
- **Dynamics** — the player-visible patterns that emerge when mechanics
  meet a player (the staircase converging, the radial chart filling, the
  shadow encounter unlocking). Defined in `progression/*` and `ux/03`.
- **Emotions** — the felt-sense the player experiences (challenge, growth,
  insight, integration). Documented in `narrative/*`, validated in
  playtesting.

Every feature must be specified at all four OMDE levels before it is
considered complete.

### 2.3 INFORM — Interaction Design For the Core Mechanic

Provides 12 micro-elements that link *representation* (how info is
displayed) and *interaction* (what the player does with it) to *cognitive
demand*. CCRPG uses INFORM to specify each cognitive overlay UI in `ux/01`.
The 12 micro-elements are the checklist for "is this overlay unambiguously
soliciting the cognitive demand we want?"

## 3. Game-design mapping

Methodology shapes every document via the **mandatory six headings**
(`REQUIREMENTS.md §3`). Each document is a DSR mini-paper:

1. *Purpose* = problem identification
2. *Scientific basis* = literature review
3. *Game-design mapping* = design proposition
4. *Architectural contract* = falsifiable engineering claim
5. *Open questions* = future work
6. *Principles served* = positioning in the larger argument

Documents that lack any of these are not yet ready for review.

## 4. Architectural contract

Methodology compiles into three engineering rules:

1. **No undocumented science.** Every cognitive task in code must trace
   back to a `combat/02-cognitive-task-library.md` entry, which itself
   cites the originating laboratory paradigm.
2. **No undocumented stage-line claims.** Any feature claiming to "train
   moral development at Orange" must point at a `lines/03-moral.md` × 
   `stages/05-orange-rational.md` cell that explains *how*.
3. **All thresholds are sourced.** The 70.7% target, the n-back load
   ceilings, the dual-task interference ratios — all carry citations in
   `foundations/08-psychophysics-and-staircase.md`.

## 5. Evidence hierarchy

When sources conflict, this is the order of priority:

1. **Replicated empirical findings** in peer-reviewed literature with
   pre-registration or large meta-analyses (e.g., the n-back transfer
   debate — Au et al. 2015 vs. Melby-Lervåg 2016 — both cited; the
   *uncertainty* is documented; CCRPG does not claim transfer it cannot
   defend).
2. **Theoretical syntheses** by recognised integrators (Wilber, Diamond,
   Bavelier) — used as scaffolding, but never as a substitute for primary
   data on the specific claim.
3. **Practitioner consensus** in adjacent fields (clinical neuropsychology,
   developmental coaching) — used to inform aesthetic and narrative
   choices, not capacity claims.
4. **Esoteric / metaphysical sources** (Law-of-One, energy-ray
   correspondence, contemplative traditions) — used *only* in the optional
   `foundations/06` and the world-building of `narrative/03`. Never used to
   justify a mechanic.

A claim from level 4 cannot override a claim from levels 1–3. This is the
firewall.

## 6. Citation policy

- Inline format: `(Author Year)` — e.g., `(Diamond 2013)`. Full references
  collated in a `BIBLIOGRAPHY.md` to be created in `validation/`.
- Each foundation document ends with its references list inline; the global
  bibliography is a roll-up.
- When a claim has *no* citation, the document must say "design hypothesis,
  not yet validated" — and the claim is added to that document's *Open
  questions*.

## 7. Conflict-resolution procedure

When two documents disagree:

1. The conflict is recorded in *both* documents' *Open questions*.
2. A new entry in `validation/00` schedules an empirical or analytical
   tie-break.
3. Until tie-broken, the conflict is surfaced in `ROADMAP.md →
   risk-register`.
4. Once resolved, the loser is corrected; this glossary or the relevant
   foundation is updated; the resolution is logged in a `CHANGELOG.md` to
   be created at the docs root.

This procedure is itself reviewable — if it fails, edit it here.

## 8. Open questions

- **Pre-registration.** Should the eventual transfer / construct-validity
  studies be pre-registered? Cost: schedule pressure. Benefit: scientific
  credibility. Default: yes, when feasible.
- **Open vs. closed data.** Anonymised aggregate telemetry is a research
  asset. Releasing it is generous; the privacy / consent structure required
  to do so safely is non-trivial. `validation/02` must specify.
- **AI-assisted research.** Many of these documents are co-authored with
  language models. The question of *how* AI involvement is disclosed in
  the eventual write-ups is open.

## 9. Principles served

Principles **2** (validity), **6** (honesty), **7** (codebase honesty).
