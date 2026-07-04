# Emotional × Infrared — Social-Cooperative Game

## 1. Game Identity

**Modality:** Social-Cooperative (affect-contagion)
**Unique axis:** Basic emotional synchrony with another presence — can affect pass between organisms? Can two bodies pulse together?
**Core loop:** Other-creature pulses → player's body responds (or doesn't) → synchrony measured → healthy contagion vs pathological patterns scored
**Fantasy frame:** Two creatures in adjacent caves. A membrane between them transmits pulses. When one creature feels, the membrane vibrates. Can the other creature feel it too — without losing its own rhythm?

---

## 2. Catalyst Delivery

**DA (Affect-Storm):** The other creature's pulse triggers unresolvable activation in the player — contagion without off-switch. Catalyst: membrane dampening that teaches "I can feel yours AND return to mine."
**DAll (Affect-Numbness):** The membrane vibrates but the player-creature doesn't respond. No contagion at all. Catalyst: membrane amplification — increasing vibration until response threshold is reached.
**GA (Premature Contagion):** The player-creature responds to the other BEFORE feeling its own pulse. Mimicry without ground. Catalyst: require self-pulse confirmation before membrane-response registers.
**GAll (Affect Fortress):** The player-creature feels its own pulse but refuses membrane-contact. Will not allow other's feeling to enter. Catalyst: gentle, non-threatening membrane pulses that model safe reception.

**Drive probes:**
- Eros: synchrony-reach — does the player move toward the other's rhythm?
- Agape: self-return — does the player return to own rhythm after synchrony?
- Agency: own-pulse sovereignty — does the player maintain self-rhythm during contagion?
- Communion: membrane-receptivity — does the player allow the other's pulse through?

---

## 3. Game Design

**Mechanic:** Split-screen or adjacent zones. Other-creature pulses visually/audibly. Player taps in response to own internal rhythm AND in response to other's pulse. Game measures: self-pulse consistency, other-response latency, synchrony accuracy, and self-return speed.

**Key distinction:** Healthy = feel other's pulse AND maintain own. Unhealthy = lose self in other (GA), refuse other entirely (GAll), get stuck in other's activation (DA), or feel nothing from other (DAll).

**Progression:**
- Phase 1 (diagnosis): Simple other-pulses with clear self-pulse baseline. Measure synchrony, self-maintenance, and response patterns.
- Phase 2 (catalyst): Other-pulse patterns that challenge detected shadows. Storm gets dampened membrane. Numbness gets amplified membrane. Contagion gets self-first gates. Fortress gets gentle invitations.
- Phase 3 (integration): Complex other-rhythms. Confirm synchrony WITH self-maintenance across varied patterns.

**Infinite checkpoint:** Each synchrony-cycle (other-pulse → response → self-return) is a checkpoint. Sessions = 1–40 cycles.

---

## 4. Item Pool

| Item | Mechanic | Shadow targeted |
|---|---|---|
| Membrane Filter | Reduces other-pulse intensity by 30% | DA |
| Membrane Amp | Increases other-pulse intensity by 30% | DAll |
| Self-First Gate | Requires own-pulse before other-response registers | GA |
| Soft Opening | Other-pulse arrives gradually (not sudden) | GAll |
| Return Rhythm | Bonus for self-pulse within 500ms of other-response | DA / Agape |
| First Resonance | Bonus for responding to other within 400ms | DAll / Communion |
| Own Beat | Bonus for maintaining self-rhythm during synchrony | GA / Agency |
| Reaching Sync | Bonus for matching other's rhythm at new complexity | GAll / Eros |

---

## 5. Technical Requirements

**Input:** Tap rhythm (self-pulse) and tap response (other-pulse acknowledgment). Two distinct input channels or timing-differentiated single channel.
**Other-creature AI:** Procedural pulse patterns at calibrated complexity. Rhythm varies per session. Patterns designed to probe specific shadows.
**Scoring model:** Affect-contagion health = f(synchrony_accuracy, self_maintenance, response_latency, return_speed). Drive scores from probe-specific contagion behaviours.
**Adaptive difficulty:** Other-pulse complexity increases with health. Membrane sensitivity adjusts. Self-pulse baseline recalibrated per session.
**Data emitted:** Per-cycle: other_pulse_time, response_time, self_pulse_maintained(bool), synchrony_accuracy, return_ms. Per-session: shadow_scores[4], drive_scores[4], contagion_health.
