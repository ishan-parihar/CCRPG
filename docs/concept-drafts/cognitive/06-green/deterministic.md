# Cognitive / Green — Deterministic Game Concept

> **Axis:** Objective multi-perspectival measurement — perspective-holding accuracy, task-switching speed, complex span, contradiction tolerance.  **Why this axis for this module:** Green cognition must be measurable independent of verbal sophistication; deterministic tasks isolate the raw capacity to hold and switch between multiple frameworks under load.

---

## 1. Game Identity

**Name:** Prism Chamber
**Core loop:** Player simultaneously tracks 4 rule-streams (colour, shape, number, position) that each define a different "correct" response. Stimuli require applying the contextually-appropriate rule without collapsing the others. Rapid shifts between which rule is active. Complex span maintained across shifts.
**Session length:** 3-7 minutes (infinite checkpoint).
**Felt experience:** A crystalline puzzle-space where light refracts through multiple lenses — the player IS the prism holding all frequencies.

## 2. Catalyst Delivery

**Catalyst type:** Timed multi-framework rule application with contradiction tolerance.
**Shadow provocation:** DA surfaces as hesitation/timeout when multiple rules yield contradictory responses. DAll surfaces as rigid adherence to one rule-stream. GA surfaces as premature "meta-rule" invention. GAll surfaces as refusal to prioritise when forced.
**Drive engagement:** Agency = committing to one rule per trial. Communion = maintaining awareness of all 4 simultaneously. Eros = reaching toward faster integration. Agape = returning to embody each rule fully.
**Progression:** Diagnosis (baseline shift-cost, span) → Healing (shadow-targeted difficulty curves) → Evolution (fluid multi-framework mastery).

## 3. Game Design

**Mechanics:**
- 4 concurrent rule-streams displayed as coloured "lenses" at screen edges
- Each trial: stimulus appears, one lens illuminates (active rule), player responds
- Shift cadence increases adaptively (IRT-calibrated)
- Contradiction trials: 2+ lenses illuminate simultaneously, player must hold both valid responses and select contextually
- Complex span: secondary processing task (arithmetic verification) between rule-application trials
- n-back overlay: remember which lens was active n trials ago while responding to current

**Difficulty staircase:**
- Level 1: 2 rules, predictable shifts, n=2
- Level 2: 3 rules, semi-random shifts, n=3
- Level 3: 4 rules, rapid shifts, n=3-4, contradiction trials introduced
- Level 4: 4 rules, unpredictable shifts, n=4, 30% contradiction trials

**Shadow-specific adaptations:**
- DA detected: reduce time pressure, reward commitment speed
- DAll detected: increase rule-count, penalise single-rule perseveration
- GA detected: remove meta-rule shortcuts, require per-perspective accuracy
- GAll detected: introduce forced-priority trials

## 4. Item Pool

**Stimuli:** Abstract geometric forms (culture-fair) varying on 4 dimensions: colour (4), shape (4), numerosity (1-4), quadrant position (4). Total unique stimuli: 256.
**Rule-streams:** Each maps one dimension to one response set. Rules are internally consistent but mutually contradictory across streams.
**Contradiction sets:** Pre-validated stimulus pairs where 2+ rules yield incompatible correct responses. 64 contradiction pairs.
**Adaptive parameters:** Shift probability, ISI, n-back load, contradiction frequency, time-limit per trial.

## 5. Technical Requirements

**Timing precision:** ±16ms response capture (requestAnimationFrame-locked).
**IRT model:** 4PL per rule-stream, joint calibration across streams.
**Metrics captured:** Shift-cost (ms), perseveration rate, contradiction-tolerance index, complex span score, n-back accuracy per stream, response consistency across contradiction trials.
**Shadow scoring:** DA = high timeout rate + low commitment speed. DAll = low shift flexibility + high single-stream perseveration. GA = high meta-rule attempts + low per-stream accuracy. GAll = high contradiction-avoidance + low forced-priority compliance.
**Storage:** ~200 bytes/trial, ~60 trials/session.
**Accessibility:** Colour-blind safe palette, shape redundancy for all colour cues, adjustable stimulus duration.
