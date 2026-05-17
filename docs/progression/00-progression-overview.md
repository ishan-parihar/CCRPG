# progression/00 — Progression Overview

## 1. Purpose

Specify how the player *grows* in CCRPG — the long-loop architecture
that turns individual encounters into a developmental arc. Detailed
algorithms (staircase tuning, threshold values, regression triggers)
are deferred to implementation; this document is the *philosophy*.

The slogan:

> Progression is what you have *demonstrated*, not what you have
> *unlocked*. There is no XP-to-stage. There is only practice and
> demonstration, recorded honestly.

## 2. The five progression timescales

CCRPG's progression operates at five interlocking timescales:

| Timescale | Loop | What changes |
|---|---|---|
| **Per-trial** (≈ 2–8 s) | Single cognitive micro-task | Staircase level on one task per line |
| **Per-encounter** (≈ 90 s – 4 min) | Single fight | Multiple staircases update; encounter-level reward; narrative beat |
| **Per-session** (≈ 30 min) | Play session | Per-line altitude estimates refine; horizon-line shifts; fatigue accumulates |
| **Per-season** (≈ 5 sessions) | Pattern of consistent choices | Slow lines (Moral, Spiritual, Willpower) advance; shadow signals consolidated |
| **Per-stage** (≈ 10–20 hours) | Stage advancement | Stage gate cleared; new world unlocks; codex entry written by player |

Each timescale has its own feedback loop and its own UI surface.
Confusing them — e.g., showing per-trial feedback at per-stage
cadence — produces poor UX.

## 3. The progression "shape"

CCRPG's progression is **not** a single XP bar. It is, in order of
importance:

### 3.1 The radial chart (psychograph)

Eight spokes, one per line. Concentric rings, one per stage. Quadrant
tinting on the spokes. This *is* the player's progression view.

Reading the chart:
- The **horizon line** (lowest spoke) is the developmental bottleneck.
- The **leading line** (highest spoke) is the player's edge.
- **Quadrant skew** tells the player whether they have been
  exteriorising or interiorising.
- **Repression patterns** (static spoke while others grow) surface as
  fading colour.

### 3.2 The synthesised stage (the marker)

A single stage label — Red, Amber, Orange, etc. — derived purely as a
*function* of the radial chart (the synthesizer in
`foundations/02 §3.2`). The stage is *visible*, but it is *secondary*
— a summary of the chart, not a separate quantity.

### 3.3 The state-access chart (optional, parallel)

The five states (`foundations/04`) tracked separately. Not a
progression bar; a *capacity-access* chart showing how often and how
deeply the player can summon each state.

### 3.4 The shadow log

Detected fixations, regressions, repressions; resolved or unresolved
shadow encounters. Browseable in the codex.

### 3.5 The codex / world-bible

Player-authored entries — what they encountered, what they chose,
what they noted. Not a checklist; a *journal*. The closing entry
(at White) is the player's own developmental summary.

These five surfaces together compose the progression view; no single
surface tells the whole story.

## 4. The four progression mechanisms

### 4.1 The transformed up-down staircase (per task, per line)

Already specified in `foundations/08`. Operates at per-trial cadence.
Adjusts the difficulty of *every* cognitive task to keep the player
at ~70.7% accuracy. Invisible to the player.

### 4.2 Altitude estimation (per line)

A *running estimate* of the player's altitude on each line, derived
from their staircase levels and recent encounter performance. Updates
at per-session cadence. The estimate has hysteresis so it doesn't
jitter.

### 4.3 Stage synthesis (whole-player)

A pure function of the eight altitudes. Derives the synthesised
stage with the two-line breakthrough rule from `foundations/02 §3.4`.
Updates whenever any altitude changes.

### 4.4 Shadow detection (per line)

The detector in `foundations/10`. Operates at per-session cadence.
Identifies fixation, regression, and repression patterns. Surfaces
shadow encounters to the player as *invitations*.

## 5. The line-balance problem and the gentle pull

Without a counter-mechanism, players will pump their strongest line.
CCRPG counters via *gentle pull*, never *hard wall*:

- The **stage gate** requires *every* line to clear (the floor) — so
  ignoring a line eventually blocks stage advancement.
- The **encounter scheduler** prefers encounters touching the
  horizon (lowest) line, but the player can override.
- The **synergy bonus** rewards multi-line encounters, encouraging
  weaker lines to be exercised in *combination* with stronger ones.
- The **line ceilings** (`lines/00`) prevent any line from running
  more than +1 or +2 stages ahead of cognitive — keeping the
  development *integrated*.

What CCRPG **never** does: penalise or reduce a strong-line altitude
because a weak line is behind. Strength is honoured; weakness is
*invited*, not *punished*.

## 6. The session arc (per `foundations/09 §3.1`)

A typical session:

| Beat | Duration | Purpose |
|---|---|---|
| Warm-up encounter | 2 min | Re-orient, friendly feedback |
| Skill-edge encounter | 3–5 min | Flow channel |
| Reflection (radial chart, codex) | 1 min | Consolidation |
| Skill-edge encounter | 3–5 min | Flow channel |
| Choice / dilemma | 1–2 min | Autonomy, narrative |
| Optional skill-edge or shadow | up to 10 min | Player-driven |
| End-session ritual (save, codex) | 30 s | Closure, anticipation |

CCRPG is designed for **5–6 sessions per week, 30 minutes each** —
closer to a meditation app's cadence than a typical RPG. Long binges
are not supported by the progression model; the per-session staircase
warm-up actively undermines them.

## 7. Stage advancement — the rite

Stage advancement is *narratively marked*. After clearing a synthesis
exam (the main boss) and meeting all six advancement criteria from
the relevant world bible, the player enters a **stage rite**:

- A scripted contemplative interlude (~3–5 minutes).
- The player authors a brief *value commitment* — a one-line statement
  organising the next stage of play.
- The radial chart is shown filling toward the new stage's ring.
- The new world unlocks.

The stage rite is the mechanism by which progression *becomes
self-authored*. The game does not say "you have ascended"; the player
*declares* what they are ascending *toward*.

## 8. Regression as a feature

Regression in CCRPG is **not** a punishment. It is a *capacity*.

A player at Orange may *deliberately* regress to Amber to clear a
shadow encounter rooted there. Visited stages remain accessible
through "memory dungeon" overlays — the same world, with new content
visible only at the player's current altitude. This makes the older
stages alive, not abandoned.

The progression UI distinguishes *current stage* from *deepest
visited stage*; the gap between them is where shadow work lives.

## 9. The "no end-game grind" rule

CCRPG does **not** ship endless-grind end-game content of the
loot-treadmill kind. The end-game (`stages/08-white-superintegral.md`)
is *contemplative* — the player returns to mentor others (multiplayer),
to clear remaining shadow encounters, or to start a new character with
different drive weights.

This is commercially unusual but ethically necessary. Variable-ratio
reward grinds are *exactly* the design pattern CCRPG cannot use
without contradicting Principle 6 (honest engagement).

## 10. The downstream documents (deferred)

| Deferred doc | One-line intent |
|---|---|
| `progression/01-staircase-dda.md` | Implementation of the 1-up/2-down across tasks. Mostly captured in `foundations/08`. |
| `progression/02-skill-tree-progression.md` | The data-driven skill tree generator from `(line × stage)`. |
| `progression/03-stage-advancement-criteria.md` | Concrete thresholds for each stage gate. |
| `progression/04-line-balancing-and-altitude.md` | Tuning of ceilings and gentle pulls. |
| `progression/05-shadow-work-and-regression.md` | Shadow detection thresholds, encounter unlock flow. |
| `progression/06-state-training-meditation.md` | The state mini-game. |

The *intent* for each is established here and in `foundations/*` and
`lines/*`. Implementation can proceed.

## 11. Open questions

- **Pacing variance.** Some players will outpace the design (powering
  through Red); some will lag (lingering at Amber). Both are valid;
  the progression must not penalise either. The encounter scheduler
  must adapt.
- **Multi-character runs.** A player who wants to experience
  different drive profiles starts a new character. Should some
  progression be cross-character (e.g., codex entries)? Default: no
  — each character is a *fresh life*.
- **Multiplayer-only altitudes.** Some line altitudes (Interpersonal
  ≥ Green) can only be earned in multiplayer. This is a deliberate
  honesty; for solo-only players, the progression view shows the
  cap explicitly.

## 12. Principles served

Principles **3, 4, 6** — the staircase keeps the player at the
growth edge, every advancement is earned and demonstrated, the
engagement loop is honest about what it does and does not exploit.
