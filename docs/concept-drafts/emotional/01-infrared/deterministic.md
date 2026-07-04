# Emotional × Infrared — Deterministic Game

## 1. Game Identity

**Modality:** Deterministic (objective measurement)
**Unique axis:** Arousal response latency, activation/deactivation speed, startle-affect coupling
**Core loop:** Present stimulus → measure affective activation onset → measure resolution time → score affect-cycle health
**Fantasy frame:** A creature in a cave reacts to flashes of light and shadow. Each flash triggers a body-pulse; the pulse must rise and fall.

---

## 2. Catalyst Delivery

**DA (Affect-Storm):** Rapid successive stimuli with no pause — measures whether activation compounds without resolution. Healthy: each pulse resolves before the next. Storm: activation stacks endlessly.
**DAll (Affect-Numbness):** Strong stimuli that demand response — measures whether activation occurs at all. Healthy: clear onset spike. Numb: flatline regardless of stimulus intensity.
**GA (Premature Contagion):** Stimuli paired with "other-creature" signals — measures whether player responds to other before responding to self. Healthy: self-activation first. GA: other-response without self-response.
**GAll (Affect Fortress):** Gradually intensifying stimuli — measures whether activation scales with intensity. Healthy: proportional scaling. Fortress: activation caps at survival-minimum regardless of input.

**Drive probes:**
- Eros: novel stimulus types — does activation reach toward the unfamiliar?
- Agape: post-activation settling — does the organism return to baseline?
- Agency: stimulus-response sovereignty — is the response the player's own?
- Communion: stimulus-receptivity — does the organism allow itself to be touched?

---

## 3. Game Design

**Mechanic:** Timed reaction pulses. Screen flashes colour (red=danger, warm=pleasure, cold=startle). Player taps/holds during felt activation, releases when activation subsides. Duration and latency are the raw data.

**Progression:**
- Phase 1 (diagnosis): Single stimuli, long gaps. Measure baseline activation/deactivation.
- Phase 2 (catalyst): Stimuli patterns that challenge detected shadows. Storms get forced pauses. Numbness gets intensified stimuli. Fortress gets gradual escalation. Contagion gets self-before-other sequencing.
- Phase 3 (integration): Mixed stimuli at natural pace. Confirm all four affect-cycle metrics are healthy.

**Infinite checkpoint:** Each stimulus-response pair is a checkpoint. Player can leave after any pulse. Session = 1–100 pulses, player-determined.

---

## 4. Item Pool

| Item | Mechanic | Shadow targeted |
|---|---|---|
| Cooling Stone | Extends deactivation window by 200ms | DA |
| Spark Ember | Increases stimulus intensity by 15% | DAll |
| Root Anchor | Requires self-pulse before other-pulse registers | GA |
| Opening Crack | Raises activation ceiling by 10% per use | GAll |
| Settling Breath | Bonus score for clean baseline return | DA / Agape |
| Raw Nerve | Bonus score for first-response speed | DAll / Communion |
| Sovereign Pulse | Bonus for activation matching stimulus (not other) | GA / Agency |
| Growth Ring | Bonus for activation exceeding previous maximum | GAll / Eros |

---

## 5. Technical Requirements

**Input:** Single tap (activation onset), hold duration (activation length), release (deactivation marker). Touch or click.
**Timing precision:** ≤16ms input sampling. Activation latency measured to millisecond.
**Scoring model:** Activation-deactivation cycle health = f(onset_latency, peak_duration, resolution_speed, baseline_return). Drive scores derived from probe-specific stimulus responses.
**Adaptive difficulty:** Stimulus gap narrows as health improves. Intensity scales to maintain challenge within flow channel.
**Data emitted:** Per-pulse: onset_ms, peak_ms, release_ms, baseline_return_ms, stimulus_type, drive_probe_flag. Per-session: shadow_scores[4], drive_scores[4], cycle_health.
