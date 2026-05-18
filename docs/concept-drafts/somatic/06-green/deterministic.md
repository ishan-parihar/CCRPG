# Somatic / Green — Deterministic Game Concept

> **Axis:** Objective psychophysical measurement of relational somatic sensitivity.  **Why this axis for this module:** Green somatic capacity must be measurable — interoceptive discrimination, co-regulation accuracy, and boundary detection have quantifiable signal-detection thresholds.

---

## 1. Game Identity

**Name:** Resonance Threshold
**Core loop:** Player detects, discriminates, and responds to somatic signals — distinguishing self-generated from other-generated body states with increasing subtlety.
**Feel:** A quiet laboratory of the body — precise, calibrated, intimate. Not performance but perception.
**Session length:** 4–8 minutes per checkpoint. Infinite checkpoints.

## 2. Catalyst Delivery

**Catalyst type:** Graded somatic discrimination tasks that reveal where sensitivity ends and projection begins.
**Shadow surfacing:** DAll surfaces as consistently low sensitivity scores despite adequate motor response (the body CAN but WON'T feel). DA surfaces as false-positive flooding (reports feeling everything, cannot discriminate). GA surfaces as high confidence + low accuracy on "field" items. GAll surfaces as high accuracy on near-signals + refusal/avoidance of transpersonal items.
**Drive probing:** Agency = boundary-detection accuracy. Communion = co-regulation synchrony. Eros = willingness to attempt subtle/transpersonal items. Agape = return-to-self accuracy after relational attunement.

## 3. Game Design

**Mechanic 1 — Signal Detection:** Player receives body-state cues (heartbeat variations, breath patterns, tension maps) and must identify: (a) which are self-generated, (b) which are other-generated, (c) which are noise. Adaptive staircase adjusts signal-to-noise ratio.
**Mechanic 2 — Co-Regulation Tracking:** An NPC body-rhythm is presented; player synchronises their input rhythm. Accuracy of phase-locking measured. Difficulty increases via rhythm complexity and multi-body scenarios.
**Mechanic 3 — Boundary Probe:** Mixed signals presented simultaneously — player must tag each as "mine," "theirs," or "shared." Scoring penalises both over-attribution (DA) and under-attribution (DAll).
**Progression:** Threshold → Discrimination → Co-regulation → Boundary → Multi-body → Transpersonal edge items.
**Infinite checkpoint:** Each threshold level is a saved checkpoint. Player can leave after any discrimination block.

## 4. Item Pool

| Item type | Example | Shadow diagnosed |
|---|---|---|
| Self-signal | Subtle heartbeat acceleration after exertion | Baseline (no shadow) |
| Other-signal | NPC breath pattern embedded in ambient rhythm | DAll (missed = allergy) |
| Noise | Random physiological fluctuation | DA (false-positive = addiction) |
| Shared-field | Synchronised rhythm emerging from co-regulation | GAll (avoided = allergy) |
| Transpersonal | Holistic body-field signal beyond dyadic | GA (claimed without accuracy) |

Minimum pool: 200 items across 5 types, 4 difficulty tiers each. Items are parameterised (signal strength, noise floor, temporal offset) not hand-crafted narratives.

## 5. Technical Requirements

**Input:** Rhythm-tapping (touch/click), categorical tagging (mine/theirs/shared), synchronisation tracking.
**Adaptive engine:** 2-down-1-up staircase for signal detection threshold. Bayesian estimation for co-regulation phase accuracy.
**Telemetry:** d-prime (sensitivity index), response bias (liberal/conservative), phase-lock accuracy, boundary-attribution confusion matrix.
**Scoring output:** Per-drive scores derived from: Agency ← boundary accuracy, Communion ← co-regulation sync, Eros ← transpersonal item engagement, Agape ← return-to-self latency.
**Session data:** ~50 trials per 5-minute block. Minimum 3 blocks for stable threshold estimate.
**No LLM dependency.** All items are parameterised psychophysical stimuli.
