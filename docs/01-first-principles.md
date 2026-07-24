# 01 — First Principles

## 1. Purpose

This document is the *spine* of the research phase. It expands the seven
first-principles questions from `REQUIREMENTS.md §1` into stand-alone
arguments, with citations, counter-examples, and acceptance criteria. Every
later document is, in effect, a long-form answer to one of the seven.

When a design decision is made anywhere in Mysterium, it must be possible to
walk it back to one of these seven principles. If it cannot, either the
decision is wrong or the principle list is incomplete.

## 2. Scientific basis

The seven principles are not invented — they are the residue of merging
five literatures:

| Literature | What it contributes |
|---|---|
| Cognitive-training meta-analyses (Simons et al. 2016, Melby-Lervåg 2016) | The hard truth that *most* brain-training transfer claims are invalid. → Principle 2. |
| Action-video-game cognition research (Bavelier, Green) | The validated finding that action games genuinely improve attention and "learning to learn." → Principle 1. |
| Psychophysical method (Levitt 1971, Cornsweet 1962) | The transformed up-down staircase as the only known way to keep a participant at threshold. → Principle 3. |
| Integral developmental psychology (Wilber, Cook-Greuter, Kegan) | The discovery that lines develop at *different* altitudes within the same person — i.e., progression is *not* a single bar. → Principle 4. |
| Software architecture canon (Martin 2017, Evans 2003) | Clean architecture, DDD, the testability of pure use-cases. → Principle 7. |

Principles 5 (UX) and 6 (honesty/integrity) are emergent from the
intersection — they are the constraints that prevent the science from being
discarded by the player or weaponised against them.

## 3. Game-design mapping

### Principle 1 — *What is the game actually training?*

The game must, at all times, be able to answer "right now, this fight, this
turn, this micro-task — which line, which stage, which AQAL quadrant?" If
the answer is *unspecified*, the encounter is illegal.

**Acceptance criterion:** every enemy in the bestiary (`enemies/04`) carries
an explicit `(line, stage, quadrant, task)` quadruple in its data row. Any
enemy without one fails review.

### Principle 2 — *How do we know it is training that thing?*

For every cognitive task in `combat/02-cognitive-task-library.md`, we cite
its laboratory analogue, name its established psychometric properties, and
specify the in-game parameter band that preserves the construct. If the
in-game version of the task does not preserve construct validity (e.g., the
n-back becomes a memory + visual-search hybrid), it is renamed and
documented as a *new* task with its own validation arc.

**Acceptance criterion:** `validation/00-cognitive-validation-protocol.md`
specifies a correlation study design between in-game performance and the
laboratory analogue with `r ≥ 0.5` as the bar.

### Principle 3 — *Growth edge without breaking immersion*

The 1-up/2-down staircase converges to 70.7% accuracy. Combat must keep the
player there *without* surfacing the algorithm. The player should feel
*challenged*, not *measured*.

**Acceptance criterion:** in playtesting, when asked "did the game feel
like it was adjusting difficulty," ≤ 30% of players say yes. (Algorithm
detection by users in the Lumosity-style apps is much higher.)

### Principle 4 — *Stage progression must be earned*

A player at apparent Orange (Rational) on the cognitive line but stuck at
Red (Power) on the moral line is *not* an Orange player. Stage advancement
requires demonstration across **all eight lines and all four quadrants** at
the relevant altitude. See `progression/03-stage-advancement-criteria.md`
for the matrix and thresholds.

**Acceptance criterion:** a synthetic player profile with 8/8 cognitive
mastery but 1/8 moral or 1/8 interpersonal mastery is *blocked* from
advancing by the gate logic, in unit tests.

### Principle 5 — *Multi-line, multi-quadrant on a phone*

The challenge: a 720×1280 portrait viewport. The eight-line × eight-stage
matrix is 64 cells. The four quadrants overlay another 4 dimensions. We
cannot show 256 cells at once.

The chosen solution (defended in `ux/02-skill-tree-visualisation.md`):
*radial altitude chart* — eight spokes (lines), graduated rings (stages),
quadrant tinting (UL warm / UR cool / LL earth / LR neutral). Live updates
on the post-fight screen. The current "horizon" line shows the lowest line —
the developmental bottleneck.

**Acceptance criterion:** new players can identify their weakest line
within 10 seconds of viewing the chart.

### Principle 6 — *Honest simulation*

In a single-player context, *the game should still not lie to itself.* If
the player exploits a glitch to bypass a cognitive task, the gate must not
record a pass. In a multiplayer context, server authority is mandatory.

**Acceptance criterion:** automated adversarial testing of the
client→server boundary; any client-spoofed cognitive result is rejected and
logged. Telemetry encryption-at-rest. No sale of behavioural data, ever,
codified in `validation/02-ethics-and-data-privacy.md`.

### Principle 7 — *Honest codebase*

The `core/` directory imports from no game engine, no native bridge, no
networking library. It is portable to any future runtime. This is what
makes the cognitive science *survive* — not the Phaser code, not the
Capacitor wrapper, but the deterministic, pure, tested core.

**Acceptance criterion:** `npm test` passes with `core/` mocked of all I/O.
A future engine swap requires only changes to `game/` and `infra/`.

## 4. Architectural contract

These principles compile down to four hard rules at the architectural layer:

1. **Every domain entity has a `(stage, line, quadrant)` location** or is
   decorated by one of those at use-time. (Principle 1)
2. **Every cognitive use-case ships with a property-based test demonstrating
   construct validity.** (Principle 2)
3. **DDA state lives in `core/usecases/`, never in `game/scenes/`.**
   (Principles 3, 7)
4. **Stage-advancement is a pure function of the player profile.** Any UI
   that shows progress reads from this function; no UI ever sets stage
   directly. (Principles 4, 6, 7)

## 5. Open questions

- **Are the seven principles complete?** A reasonable challenge is "where
  is *fun*?" Fun is implicit in Principles 3 and 5, but the literature on
  flow distinguishes *enjoyment* from *engagement*. Should we promote fun to
  Principle 8?
- **Trade-offs between principles.** Principle 6 (honesty) and Principle 5
  (UX) frequently conflict — e.g., showing the staircase is honest but
  immersion-breaking. Each conflict needs a documented adjudication.
- **Falsifiability of Principle 2.** What would convince us the game is
  *not* training what it claims? `validation/00` must operationalise this.

## 6. Principles served

This document serves principles **1, 2, 3, 4, 5, 6, 7** — it *is* the
articulation of the seven.
