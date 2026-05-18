# Willpower × Infrared — Deterministic Game

## 1. Game Identity

**Title:** Drive Pulse
**Modality:** Deterministic (objective measurement)
**Unique Lateral:** Objective drive-mobilisation measurement — response latency to need-cues, mobilisation speed, satiation detection.
**Core Loop:** Need-cue appears → player mobilises (taps/moves) → satiation signal → player rests (or doesn't). Pure stimulus-response with precise timing measurement.

## 2. Catalyst Delivery

**Shadow Surfacing:**
- **DA (Drive-Fixation):** Continued mobilisation after satiation cue. Response latency DECREASES when it should plateau — the body won't stop.
- **DAll (Drive-Collapse):** Response latency exceeding baseline by >2σ. Need-cue present but no mobilisation follows.
- **GA (Premature Wishing):** Partial-mobilisation patterns — input initiated but not completed. Movement begins then aborts.
- **GAll (Drive Fortress):** Perfect mobilisation scores but zero response to novel-need cues. Reflex intact, emergence refused.

**Drive Probes:**
- Eros: Novel need-cues introduced at edge of familiar set. Does mobilisation extend toward the new?
- Agape: Satiation windows. Does mobilisation cease when need is met?
- Agency: Solo mobilisation trials. No external prompt — only internal need-cue.
- Communion: Synchronised mobilisation trials. Need-cue shared with co-present entity.

## 3. Game Design

**Mechanics:** Screen displays a need-icon (water, warmth, food, rest). Player taps/holds to "mobilise." Icon fills as mobilisation sustains. Satiation = icon complete → release. Extremely simple. Pre-verbal. No text, no instructions beyond the icon.

**Progression:**
- Phase 1: Single need-cue, generous timing window. Baseline measurement.
- Phase 2: Need-cue + satiation detection. Does the player release on time?
- Phase 3: Multiple need-cues in sequence. Recovery time between measured.
- Phase 4: Novel cues introduced. Mobilisation-toward-unknown measured.

**Infinite Checkpoint:** Each trial is a checkpoint. Session = 1–50 trials. Player exits anytime.

**Adaptive Difficulty:** Timing windows narrow as baseline stabilises. Novel cues increase in unfamiliarity. Satiation windows shorten.

## 4. Item Pool

| Item ID | Type | Parameters | Shadow Target |
|---|---|---|---|
| DP-01 | Standard need-cue | 800ms window, clear icon | Baseline |
| DP-02 | Extended need-cue | 2000ms sustain required | DAll detection |
| DP-03 | Satiation trial | Need-cue + release signal | DA detection |
| DP-04 | Novel cue | Unfamiliar icon, same mechanic | GAll detection |
| DP-05 | Partial-mobilisation trap | Cue that rewards full commitment | GA detection |
| DP-06 | Agency trial | Delayed cue, self-initiated timing | Agency probe |
| DP-07 | Communion trial | Synchronised cue with NPC pulse | Communion probe |
| DP-08 | Eros trial | Cue at edge of known set | Eros probe |
| DP-09 | Agape trial | Satiation with rest-reward | Agape probe |

## 5. Technical Requirements

**Inputs:** Tap, hold, release. Touch or mouse. No complex gestures.
**Timing Precision:** ±16ms (frame-accurate). Response latency is primary metric.
**Metrics Captured:** Mobilisation latency (ms), sustain duration (ms), release latency after satiation (ms), novel-cue response (binary + latency), inter-trial recovery (ms).
**Adaptive Engine:** Bayesian threshold estimation on mobilisation latency. Shadow scores updated per-trial via exponential moving average.
**Session Length:** 45–180 seconds. Minimum 8 trials for valid scoring.
**Accessibility:** High-contrast icons, haptic feedback on mobilisation, audio cue option for satiation signal.
