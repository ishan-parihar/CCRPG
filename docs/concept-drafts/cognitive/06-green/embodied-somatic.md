# Cognitive / Green — Embodied-Somatic Game Concept

> **Axis:** Body as site of perspectival cognition — embodied perspective-taking, physical metaphors for holding complexity.  **Why this axis for this module:** Multi-perspectival reasoning is not merely intellectual; the body holds or collapses complexity. Somatic tasks reveal whether pluralistic cognition is embodied or merely performed.

---

## 1. Game Identity

**Name:** The Stance Weave
**Core loop:** Player physically shifts between 4 body-stances, each representing a cognitive perspective. Must maintain fluid transitions while performing perspective-specific cognitive tasks in each stance. The body becomes the container for multiple frameworks.
**Session length:** 3-6 minutes (infinite checkpoint).
**Felt experience:** A martial-arts form where each position opens a different way of seeing — the player weaves between worldviews with their whole body.

## 2. Catalyst Delivery

**Catalyst type:** Embodied perspective-switching with somatic markers for cognitive complexity.
**Shadow provocation:** DAll surfaces as body rigidity (locked in one stance, refuses to shift). DA surfaces as somatic overwhelm (cannot settle into any stance). GA surfaces as rushing through stances without inhabiting them. GAll surfaces as equal time in all stances but refusing the "integration stance."
**Drive engagement:** Agency = committing fully to each stance. Communion = feeling the transitions between stances as relational. Eros = reaching toward the integration stance. Agape = returning to embody each individual stance completely.
**Progression:** Diagnosis (stance fluidity, transition cost, inhabitation depth) → Healing (shadow-targeted stance sequences) → Evolution (spontaneous somatic integration).

## 3. Game Design

**Mechanics:**
- 4 stances mapped to device input (swipe directions / tilt zones / tap quadrants)
- Each stance activates a perspective-specific mini-task (pattern-match, categorise, sequence, relate)
- Rhythm layer: stances must shift on beat (tempo increases adaptively)
- Contradiction trials: two stances illuminate simultaneously — player must find the "between" position
- Breath-gating: certain transitions only available on timed pause (breath sensor if available)
- Integration stance: a 5th position that emerges when all 4 are inhabited fluidly — brief, cannot be forced

**Somatic markers tracked:**
- Transition smoothness (accelerometer jerk if mobile, input timing if desktop)
- Stance inhabitation duration (time spent fully in each position)
- Breath coherence during transitions (HRV if available, input rhythm proxy if not)
- Contradiction-position stability (how long player holds "between" stance)

**Shadow-specific adaptations:**
- DAll detected: increase required stance variety, reward novel transitions
- DA detected: extend minimum inhabitation time per stance, reward stillness
- GA detected: block integration stance until all 4 individually mastered
- GAll detected: introduce integration-stance rewards, gentle hierarchy cues

## 4. Item Pool

**Stances:** 4 base stances + 1 emergent integration stance. Each has 3 difficulty variants.
**Per-stance tasks:** 8 items per stance per difficulty level. Culture-fair cognitive tasks.
**Rhythm patterns:** 16 beat-sequences at 4 tempo levels (60, 80, 100, 120 BPM).
**Contradiction pairs:** 6 stance-pair combinations × 4 "between" positions = 24 contradiction trials.
**Adaptive parameters:** Tempo, stance-switch frequency, contradiction frequency, minimum inhabitation time, integration-stance threshold.

## 5. Technical Requirements

**Input modes:** Touch (swipe/tap quadrants), accelerometer (tilt zones), keyboard (arrow keys). Auto-detected.
**Timing:** Beat-locked to audio engine (Web Audio API), ±30ms tolerance window.
**Metrics captured:** Per-stance inhabitation time, transition cost (ms), rhythm accuracy, contradiction-hold duration, integration-stance emergence frequency, somatic smoothness index.
**Shadow scoring:** DAll = low stance variety + high perseveration. DA = high transition frequency + low inhabitation. GA = premature integration attempts. GAll = equal distribution + zero integration engagement.
**Audio:** Generative ambient soundtrack shifting timbre per stance. Integration stance has harmonic convergence.
**Storage:** ~100 bytes/trial (stance sequence, timing, task accuracy, somatic markers).
**Accessibility:** Non-motion alternative (tap-based), visual-only rhythm cues, adjustable tempo floor.
