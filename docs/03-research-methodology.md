# 03 — Research Methodology

> **Status:** canonical (the discipline itself is HoloOS canonical; Mysterium adoption is canonical for Mysterium).

## 0. Epistemic discipline (adopted from HoloOS Method of Holonic Inquiry)

Mysterium adopts the HoloOS Method of Holonic Inquiry (`_THEORY/01_Epistemology/0_Method_of_Holonic_Inquiry.md`, canonical) with the following three Acts, seven Obligations, and status ladder.

### 0.1 Three Acts

1. **Grounding** — reduce every claim to a trusted anchor. The trusted anchor for Mysterium ontology is HoloOS `02.1_Microcosmic_Metabolic_Architecture.md` (canonical). The trusted anchor for Mysterium game-mechanics is the running code in `src/core/`.
2. **Construction** — build new claims via fractal recursion (every element is itself a holon) and structural mirroring (separate invariant from decoration).
3. **Validation** — red-team every claim; run Type Validation (T1/T2/T3, §0.3 below); retain provenance.

### 0.2 Seven Obligations

1. Name the anchor.
2. Show derivation.
3. Separate invariant from decoration.
4. Expose joints (where two primitives connect).
5. Refuse borrowed rigor (don't import empirical validity from another domain).
6. Stay cosmological (don't conflate game-mechanic with metaphysical claim).
7. Mark the unmodelable (the Absolute is not modeled).

### 0.3 Type Validation Protocol (T1 / T2 / T3)

Mysterium adopts HoloOS's three-test Type Validation Protocol (`_THEORY/01_Epistemology/4_Type_Validation_Protocol.md`, canonical-hypothesis):

- **T1 Behavioral match** — observed bonding patterns match the Type signature's predictions. For Mysterium: a player assigned PolarityTexture X should show drive-choice patterns consistent with X across ≥3 encounters.
- **T2 Excitation-invariance** — the Type signature stays fixed as Stage changes. For Mysterium: a player's underlying Type (once we have one — see `foundations/23` §3.1) should persist across Stage transitions, with only surface expressions varying.
- **T3 Fixed-point persistence** — the Type signature persists across metabolic cycles without immediately firing Transformation. For Mysterium: a player's Type should be stable across ≥10 encounters before a Transformation event.

A Type claim that fails any test is demoted from `canonical-hypothesis` to `ai-draft`. A Type claim that passes all three is promoted to `canonical`.

### 0.4 Status ladder

Every claim in `docs/foundations/` is tagged with one of:

| Status | Meaning | When to use |
|---|---|---|
| `ai-draft` | Proposed, not yet validated | Initial proposals; brainstorming outputs |
| `canonical-hypothesis` | Derived from canonical anchor, not yet empirically validated | Theoretical claims grounded in canonical anchor but not yet tested |
| `canonical` | Validated | Empirically validated (for game-mechanics) or cross-scale homological (for metaphysics) |
| `superseded` | Replaced by a later claim; retained for provenance | Old claims that have been replaced |

A claim without a status tag is treated as `ai-draft`.

### 0.5 Active refactor methodology

Per HoloOS `_THEORY/02_Ontology/08.8.9_Depth_Asymmetry_and_Epistemology_Audit.md` Part II, when Mysterium performs an active refactor (audit → reconcile → validate → document), the refactor must:

1. **Audit** — produce or update `AUDIT-HOLOOS-ALIGNMENT.md` (or equivalent) identifying what changed and why.
2. **Reconcile** — update all stale references in the docs tree (file-number references, cross-doc citations, glossary entries).
3. **Validate** — run `tsc --noEmit` and `vitest run`; confirm zero regressions.
4. **Document** — append a section to the audit doc enumerating the substantive changes, superseded claims, and any new open joints.

This closes the loop: every refactor produces a traceable artifact, and successor agents can reconstruct the reasoning.

---

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

| Phase | Activity in Mysterium |
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
demand*. Mysterium uses INFORM to specify each cognitive overlay UI in `ux/01`.
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
   *uncertainty* is documented; Mysterium does not claim transfer it cannot
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
