# Cognitive / Infrared — Embodied-Somatic Game Concept

> **Axis:** Body as perceptual organ — whole-body tracking, reflex responses, sensorimotor integration.  **Why this axis for this module:** Cognition at Infrared IS the body perceiving; this modality probes whether perceptual tracking is grounded in somatic response rather than disembodied eye-movement.

---

## 1. Game Identity

**Name:** Sway  
**Core loop:** The device emits directional cues — a vibration on the left, a tone from the right, a flash above. The player orients their body toward the cue. Whole-body movement is the response, not finger-taps. The game measures orientation speed, accuracy, and return-to-centre quality.

**Session length:** 45–120 seconds per checkpoint. Infinite checkpoints.  
**Felt experience:** Like being gently called from different directions. The body turns toward stimulus like a plant toward light. Grounding, embodying.

## 2. Catalyst Delivery

**DA surfacing:** Cues arrive from multiple directions rapidly. Shadow response: body jerks between orientations without settling, cannot return to centre, perpetual motion without rest.  
**DAll surfacing:** Gentle single-direction cues. Shadow response: body does not orient. Player remains still regardless of stimulus. Accelerometer shows no movement.  
**GA surfacing:** Random cue directions. Shadow response: player begins moving BEFORE cues arrive — anticipates a pattern that doesn't exist, body moves to imagined stimuli.  
**GAll surfacing:** Cues establish clear spatial pattern (left-right-left-right). Shadow response: orients accurately per-cue but never anticipates — body waits for each cue as if no pattern exists.

**Catalyst → Experience → Integration:** Directional cue IS catalyst. Body orientation IS experience. Integration = accurate orientation + smooth return-to-centre + appropriate anticipation.

## 3. Game Design

**Mechanics:**
- Directional cues: haptic (vibration location), audio (stereo pan), visual (screen-edge flash). Multi-sensory redundancy.
- Orientation response: device accelerometer/gyroscope measures body tilt/rotation toward cue direction.
- Return-to-centre: after each orientation, player must return to neutral. Smoothness measured.
- Rest intervals: no cue for 3–5s. Any movement = DA flag.
- Reflex trials: sudden loud cue — measures startle-orient latency (pure reflex).
- Pattern trials: repeating directional sequence. Measures anticipatory lean.

**Difficulty staircase:** Cue subtlety (strong → gentle), inter-cue interval (3s → 1s), number of directions (2 → 4 → 6), pattern length. Adapts via orientation accuracy + latency.

**Drive probing:**
- Agency: rest intervals — can the body be still by choice?
- Communion: orientation accuracy — can the body join with the cue direction?
- Eros: anticipatory lean — is the body ready for the next cue?
- Agape: return-to-centre quality — can the body come home after orienting?

## 4. Item Pool

| Item ID | Type | Parameters | Shadow Probed |
|---|---|---|---|
| S-01 | Single orient | One direction, strong cue | Baseline |
| S-02 | Rapid multi | 4 cues, 1.5s apart | DA (no rest) |
| S-03 | Gentle single | Soft cue, 4s window | DAll (non-response) |
| S-04 | Random sequence | No pattern, 6 cues | GA (false anticipation) |
| S-05 | Clear pattern | L-R-L-R × 4 | GAll (no anticipation) |
| S-06 | Rest interval | 5s silence | DA (restlessness) |
| S-07 | Reflex startle | Sudden loud cue | Pure reflex latency |
| S-08 | Return quality | Post-orient settle time | Agape (grounding) |

**Adaptive selection:** Items chosen by information gain. Movement quality metrics (jerk, smoothness) supplement accuracy. Shadow probes at 20% rate.

## 5. Technical Requirements

**Input:** Device accelerometer + gyroscope (mobile). Sampling ≥30 Hz. Orientation vector computed as tilt angle from vertical.  
**Audio:** Stereo/spatial audio for directional cues. Low-latency haptic API for vibration patterns.  
**Scoring engine:** Orientation accuracy (angular error in degrees). Latency (ms to peak orientation). Return-to-centre smoothness (jerk integral). Rest-interval movement (total displacement). Anticipation index (pre-cue movement in pattern trials).  
**Data model:** Per-trial orientation vector + timing → somatic-theta → drive-health decomposition → shadow flags.  
**Accessibility:** All cues multi-modal (haptic + audio + visual). Any single channel sufficient. Seated mode available (upper-body only).  
**Session persistence:** Checkpoint after every 8 trials. Resume from last checkpoint.
