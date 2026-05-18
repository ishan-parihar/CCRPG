# Emotional × Infrared — Immersive-RPG Game

## 1. Game Identity

**Modality:** Immersive-RPG (ecological affect)
**Unique axis:** Whether primary affect appears spontaneously in free-play — unstructured environment, no prompts, affect must arise from within
**Core loop:** Player explores freely → environment offers affordances → affect arises (or doesn't) → player acts from feeling → ecological affect-health scored
**Fantasy frame:** A creature wakes in a living cave system. No instructions, no goals. The cave breathes, glows, darkens, warms, chills. The creature simply IS — and what it feels (or doesn't) reveals everything.

---

## 2. Catalyst Delivery

**DA (Affect-Storm):** The creature cannot explore — every cave-feature triggers activation that doesn't resolve. Stuck in one chamber, overwhelmed. Catalyst: safe-zones that model settling. Cave-features that reward resolution before offering the next stimulus.
**DAll (Affect-Numbness):** The creature wanders without response. The cave glows and darkens but the creature shows no behavioural change. Catalyst: cave-features that require affective response to interact with (warm stones only respond to warmth-approach).
**GA (Premature Contagion):** The creature follows other cave-dwellers rather than exploring from own feeling. Catalyst: solo-exploration zones where other creatures are absent. Own-feeling required to navigate.
**GAll (Affect Fortress):** The creature explores only safe/known areas. Refuses novel chambers. Catalyst: gentle curiosity-rewards at chamber boundaries. Novel areas that reveal themselves slowly, non-threateningly.

**Drive probes:**
- Eros: exploration range — does the creature enter novel chambers?
- Agape: settling behaviour — does the creature rest between explorations?
- Agency: self-directed movement — does the creature choose its own path?
- Communion: environmental receptivity — does the creature respond to cave-changes?

---

## 3. Game Design

**Mechanic:** Free-roam 2D environment. No explicit objectives. Cave system with varied affective zones (warm, cold, bright, dark, pulsing, still). Player movement patterns, dwell times, approach/avoid behaviours, and response to environmental changes are all measured implicitly.

**Ecological validity:** This is the most naturalistic game. No structured trials. The environment IS the assessment. Affect-health is inferred from behaviour patterns over time.

**Progression:**
- Phase 1 (diagnosis): Open cave, minimal features. Measure baseline exploration, response patterns, and spontaneous affect indicators.
- Phase 2 (catalyst): Cave evolves based on detected shadows. Storm gets settling-chambers. Numbness gets intensified features. Fortress gets gentle boundary-expansion. Contagion gets solo-zones.
- Phase 3 (integration): Full cave system. Confirm varied exploration, appropriate responses, self-directed movement, and spontaneous settling.

**Infinite checkpoint:** Autosave on zone-transition. Player leaves whenever. Sessions = 30s to unlimited.

---

## 4. Item Pool

| Item | Mechanic | Shadow targeted |
|---|---|---|
| Still Pool | A settling-zone that rewards lingering | DA |
| Bright Vein | An intensified cave-feature demanding response | DAll |
| Solo Tunnel | A passage only the player-creature can enter | GA |
| Soft Threshold | A new chamber that reveals itself gradually | GAll |
| Rest Stone | Bonus for voluntary settling after exploration | DA / Agape |
| Cave Response | Bonus for behavioural change at environmental shift | DAll / Communion |
| Own Path | Bonus for unique route (not following others) | GA / Agency |
| Deep Chamber | Bonus for reaching furthest-explored point | GAll / Eros |

---

## 5. Technical Requirements

**Input:** Directional movement (touch/swipe/joystick). Dwell time, movement speed, direction changes, and zone-transitions as implicit data.
**Environment:** Procedurally varied cave system with affective zones. Zone properties: temperature (colour), intensity (brightness), rhythm (pulsing), and novelty (previously visited or not).
**Scoring model:** Ecological affect-health = f(exploration_range, response_variety, settling_frequency, self_direction). Drive scores inferred from movement-pattern analysis over session.
**Adaptive difficulty:** Cave complexity increases with health. Features become subtler. Novel zones appear at calibrated rate based on fortress/numbness scores.
**Data emitted:** Per-zone: entry_time, dwell_ms, exit_direction, response_behaviours[], other_creatures_present. Per-session: shadow_scores[4], drive_scores[4], ecological_affect_health, exploration_index.
