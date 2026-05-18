# Emotional × Infrared — Embodied-Somatic Game

## 1. Game Identity

**Modality:** Embodied-Somatic (body as site of affect)
**Unique axis:** Where feeling lives in the body — activation patterns, felt-location of affect, body-as-emotional-ground
**Core loop:** Affect arises → player locates it in the body → body-area activates/deactivates → location accuracy confirms felt-contact
**Fantasy frame:** A creature made of glowing regions. When feeling arises, parts of the creature light up. The player touches where the glow belongs.

---

## 2. Catalyst Delivery

**DA (Affect-Storm):** The entire creature glows at once — no localisation, everything activated simultaneously. Catalyst: require specific-region touch, teaching that affect has location, not totality.
**DAll (Affect-Numbness):** No region glows regardless of stimulus. The creature is dark. Catalyst: gentle pulses in specific regions that invite attention — "feel here."
**GA (Premature Contagion):** The player touches where ANOTHER creature glows rather than locating feeling in self. Catalyst: other-creature hidden until self-location is confirmed.
**GAll (Affect Fortress):** Only one region ever glows (gut/survival centre). Refuses to acknowledge feeling elsewhere. Catalyst: stimuli that naturally activate non-gut regions, rewarding expanded body-map.

**Drive probes:**
- Eros: body-map expansion — does feeling appear in new regions?
- Agape: region settling — does activation in a region resolve cleanly?
- Agency: self-location — does the player locate feeling in OWN body (not other's)?
- Communion: body-receptivity — does the body allow feeling to arrive?

---

## 3. Game Design

**Mechanic:** Body-map touch interface. Silhouette of creature on screen divided into regions (head, chest, gut, limbs). Stimulus triggers affect; player taps the region where they feel it. Timing and location are scored.

**Regions:** Head (startle/alertness), Chest (warmth/connection), Gut (fear/survival), Limbs (rage/action), Whole-body (overflow indicator).

**Progression:**
- Phase 1 (diagnosis): Clear affect-stimuli with known body-mapping. Measure location accuracy, response time, and region variety.
- Phase 2 (catalyst): Stimuli that challenge detected shadows. Storm gets single-region requirements. Numbness gets amplified regional pulses. Fortress gets non-gut stimuli. Contagion gets self-only trials.
- Phase 3 (integration): Subtle stimuli, full body-map available. Confirm accurate, varied, timely localisation.

**Infinite checkpoint:** Each stimulus-locate cycle is a checkpoint. Sessions = 1–60 cycles.

---

## 4. Item Pool

| Item | Mechanic | Shadow targeted |
|---|---|---|
| Focus Lens | Narrows valid touch area (precision required) | DA |
| Warm Pulse | Adds gentle vibration to correct region as hint | DAll |
| Mirror Block | Hides other-creature's body-map during trial | GA |
| New Region | Bonus for first activation in previously-dark area | GAll |
| Settling Dark | Bonus for region deactivating within 2s of touch | DA / Agape |
| Body Wake | Bonus for responding to region-pulse within 500ms | DAll / Communion |
| Own Glow | Bonus for self-location without other-creature cue | GA / Agency |
| Spreading Light | Bonus for 3+ distinct regions activated in session | GAll / Eros |

---

## 5. Technical Requirements

**Input:** Touch/click on body-map regions. Region = tap target ≥48px. Multi-region detection for overflow measurement.
**Body-map:** 5 primary regions with sub-regions possible at higher difficulty. Region boundaries clearly defined visually.
**Scoring model:** Body-affect contact = f(location_accuracy, response_latency, region_variety, resolution_speed). Drive scores from probe-specific body-map behaviours.
**Adaptive difficulty:** Region granularity increases with health. Stimulus-affect mapping becomes subtler. Hint pulses fade as DAll resolves.
**Data emitted:** Per-cycle: stimulus_type, region_touched, correct_region, latency_ms, resolution_ms, overflow_flag. Per-session: shadow_scores[4], drive_scores[4], body_affect_health, region_variety_index.
