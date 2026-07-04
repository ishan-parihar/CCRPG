# Emotional × Infrared — Strategic-Planning Game

## 1. Game Identity

**Modality:** Strategic-Planning (basic affect-sequencing)
**Unique axis:** Activation then deactivation — the simplest possible "plan": feel, then settle. Arousal management as proto-strategy.
**Core loop:** Activation stimulus → player rides the arousal curve → player initiates settling → baseline return confirmed
**Fantasy frame:** A creature must cross a field of fire-geysers. Each geyser triggers a body-surge. The creature must surge WITH the geyser, then settle BEFORE the next one. Timing is survival.

---

## 2. Catalyst Delivery

**DA (Affect-Storm):** The creature surges but cannot settle — activation carries into the next geyser, compounding. Catalyst: forced settling windows that lengthen until resolution is learned.
**DAll (Affect-Numbness):** The creature does not surge — geysers pass without activation. Catalyst: geysers that require activation to cross (no surge = no movement forward).
**GA (Premature Contagion):** The creature surges when ANOTHER creature surges, not when its own geyser fires. Catalyst: asynchronous geyser timing — other-creature's geysers fire at different times.
**GAll (Affect Fortress):** The creature surges minimally — just enough to cross, never fully. Catalyst: geysers that require full-surge to clear, rewarding complete activation.

**Drive probes:**
- Eros: surge amplitude — does activation reach full intensity?
- Agape: settling completeness — does the organism return fully to baseline?
- Agency: self-timed surge — does activation follow OWN geyser, not other's?
- Communion: geyser-receptivity — does the organism allow the geyser to activate it?

---

## 3. Game Design

**Mechanic:** Two-phase input per cycle. Phase A: tap-and-hold during activation (hold duration = surge amplitude). Phase B: release and wait (wait duration = settling time). Next geyser arrives after settling window. Score = surge amplitude × settling completeness.

**The "plan":** At Infrared, strategy is simply: activate THEN deactivate. The sequence itself is the proto-plan. No multi-step thinking — just the most basic temporal ordering of affect-states.

**Progression:**
- Phase 1 (diagnosis): Generous timing. Measure surge amplitude, settling speed, and sequence consistency.
- Phase 2 (catalyst): Timing challenges that target detected shadows. Storm gets extended settling requirements. Numbness gets activation-gated progression. Fortress gets amplitude thresholds. Contagion gets self-timed sequences.
- Phase 3 (integration): Natural geyser rhythm. Confirm full surge + full settle in consistent sequence.

**Infinite checkpoint:** Each geyser-crossing is a checkpoint. Sessions = 1–50 crossings.

---

## 4. Item Pool

| Item | Mechanic | Shadow targeted |
|---|---|---|
| Cool Ground | Extends settling window by 300ms | DA |
| Hot Core | Increases geyser intensity (demands activation) | DAll |
| Own Rhythm | Decouples geyser timing from other-creature | GA |
| Full Surge | Bonus for activation reaching 90%+ amplitude | GAll |
| Deep Settle | Bonus for baseline return within settling window | DA / Agape |
| Quick Rise | Bonus for activation onset within 200ms of geyser | DAll / Communion |
| Solo Timing | Bonus for surge timed to own geyser (not other's) | GA / Agency |
| Peak Reach | Bonus for highest amplitude this session | GAll / Eros |

---

## 5. Technical Requirements

**Input:** Tap-and-hold (activation phase), release (settling phase). Hold duration and release timing are primary data.
**Timing:** Geyser onset signalled visually + audio. Settling window = configurable (starts generous, narrows with health). Next geyser delayed until settling confirmed or window expires.
**Scoring model:** Affect-sequence health = f(surge_amplitude, settling_completeness, sequence_consistency, timing_accuracy). Drive scores from probe-specific sequencing behaviours.
**Adaptive difficulty:** Geyser frequency increases with health. Settling window narrows. Amplitude threshold rises. Timing tolerance decreases.
**Data emitted:** Per-crossing: surge_onset_ms, surge_duration_ms, surge_amplitude, settle_onset_ms, settle_duration_ms, baseline_reached(bool), other_sync_flag. Per-session: shadow_scores[4], drive_scores[4], sequence_health.
