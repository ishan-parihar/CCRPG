# 00 — Vision

## 1. Purpose

CCRPG (Cognitive-Capacity-Driven RPG) is a single-player and multiplayer
role-playing fighting game whose mechanics are *literally* validated cognitive,
emotional, moral, somatic, intrapersonal, spiritual, willpower, and
interpersonal assessments — embedded inside a real-time combat engine that
spans the eight stages of human consciousness.

The elevator pitch:

> A fighting game where every spell you cast is a working-memory test, every
> parry is an inhibitory-control test, every choice is a moral test, every
> stance-shift is a cognitive-flexibility test, and the only way to ascend
> from one stage of consciousness to the next is to demonstrate, across all
> eight lines of intelligence, that you actually have.

It is a *literal* cognitive-training tool that hides inside a *legitimate*
action-RPG. The training honesty makes the play real; the play depth makes
the training survivable. Neither half of the project succeeds without the
other.

## 2. Scientific basis

CCRPG sits at the intersection of three mature research traditions:

- **Cognitive psychology of executive function** — Miyake & Friedman's three
  core EFs (inhibitory control, working memory, cognitive flexibility),
  expanded by Diamond into higher-order reasoning, planning, and fluid
  intelligence. Every combat micro-task is drawn from the laboratory canon
  (n-back, Stroop, Simon, Go/No-Go, Corsi, WCST, Tower of London, complex
  span, dual-task, task-switching).
- **Integral developmental theory** — Wilber's AQAL framework synthesising
  Piaget (cognitive), Kohlberg (moral), Fowler (faith), Gardner (multiple
  intelligences), Loevinger (ego), Goleman (emotional). The game's
  macro-progression IS the eight stages (Infrared → White / Archaic →
  Super-Integral). The skill-tree IS the lines × stages matrix.
- **Psychophysics of skill acquisition** — the transformed up-down staircase
  (1-up/2-down rule), which converges difficulty to the player's 70.7%
  performance threshold, the empirically established sweet-spot for both
  engagement (flow theory) and neuroplastic gain.

Optional metaphysical / aesthetic layer: the Law-of-One energy-ray
correspondence (Red→Violet) which the user has indicated maps cleanly onto
the integral stages as a sub-octave pattern. Used in CCRPG **only as a
visual/sonic/narrative scaffold** — never as a load-bearing claim about
empirical psychology. Kept separable in `foundations/06-law-of-one-correspondence.md`
so it can be removed without breaking the science.

## 3. Game-design mapping

The vision compresses to one rule:

> **Every gameplay verb must be the gamification of a validated developmental
> assessment, and every progression milestone must be the demonstration of
> that assessment at a new altitude.**

The corollary rules:

- A combat encounter is a *probe* — it tests one or more lines at one or more
  stages, and emits telemetry that updates the player's developmental profile.
- A side-character encodes exactly one (line × task) pair.
- A mini-boss encodes exactly one (line₁ × line₂) interference pair.
- A main boss encodes a (stage) — every line at that stage's altitude must be
  exercised inside the fight.
- A shadow-encounter encodes a *pathology* of a line at a stage (regression,
  fixation, repression). They are optional, off-the-critical-path, and
  rewarded in proportion to the integration work they require.
- A cosmetic / narrative reward never bypasses a developmental gate. There is
  no pay-to-stage. There is no XP-to-stage. There is only demonstration.

## 4. Architectural contract

The vision dictates the engineering boundaries:

1. **The cognitive-evaluation core is pure TypeScript.** No Phaser, no
   Capacitor, no Colyseus. It must be runnable from a CLI, a Vitest suite, a
   future iOS port, a future research-lab desktop variant, or a future
   web-only build. This is the irreducible asset.
2. **The skill-tree is data, not code.** Adding a new line, a new stage, a
   new shadow archetype must be a JSON / TS-data change, not a code change.
3. **All cognitive evaluation is server-authoritative in multiplayer.** The
   client never decides "did you pass the n-back." Latency compensation
   operates on a fixed tickrate so that reaction-time validity is preserved.
4. **All telemetry is opt-in, on-device by default, encrypted at rest, and
   never sold.** The data is sensitive — it is, in effect, neuropsychometric.
5. **The architecture must support a 60 fps experience on a mid-range
   Android device.** Object pooling, texture atlases, and a fixed logical
   viewport are non-negotiable. See `architecture/07-rendering-and-performance.md`.

## 5. Open questions

- **Audience.** The same eight-stage progression can be tuned for an 8-year-old
  child (early Amber play with parental Magenta callbacks) or a 35-year-old
  adult (Orange/Green play with Turquoise reach). The user has not yet
  specified the target. The vision document is age-agnostic; the MVP must
  pick.
- **Length of the developmental arc.** Real human stage-development takes
  decades. Game stage-development cannot. What is the *temporal honesty
  ratio* — i.e., how compressed is each stage relative to its real-world
  analogue, and is that compression truthful or a metaphor? `validation/00`
  must answer this.
- **Multiplayer-as-development.** Some lines (interpersonal, moral) are best
  trained *between* humans, not against AI. Whether this means co-op is
  necessary for full progression, or merely expressive, is unresolved.

## 6. Principles served

Principles **1** (what the game trains), **2** (validity), **4** (earned
progression), and **7** (codebase honesty).
