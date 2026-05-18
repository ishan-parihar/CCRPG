# Cognitive / Infrared — Deterministic Game Concept

> **Axis:** Objective perceptual measurement — tracking accuracy, reaction time, habituation curves.  **Why this axis for this module:** Sensorimotor intelligence IS psychophysics; deterministic measurement captures the raw capacity without interpretation.

---

## 1. Game Identity

**Name:** Pulse  
**Core loop:** A luminous dot moves across a dark field. The player tracks it with touch/gaze. Accuracy is measured continuously. The dot occasionally vanishes behind occluders (object permanence), changes velocity (dishabituation), or follows simple A-B patterns.

**Session length:** 45–120 seconds per checkpoint. Infinite checkpoints.  
**Felt experience:** Meditative focus. The dot is hypnotic. Tracking feels like breathing — effortless when healthy, strained when shadowed.

## 2. Catalyst Delivery

**DA surfacing:** Dot speed increases until tracking becomes compulsive. Healthy response: voluntary blink/pause. Shadow response: eyes lock, cannot disengage, stress markers rise.  
**DAll surfacing:** Dot moves gently but player's tracking degrades — not from difficulty but from withdrawal. Latency increases, gaze drifts off-target.  
**GA surfacing:** Random dot movements are followed by a "did you see a pattern?" probe. Shadow response: reports patterns in pure noise.  
**GAll surfacing:** Clear A-B-A-B patterns emerge. Shadow response: tracks accurately but denies pattern existence in post-probe.

**Catalyst → Experience → Integration:** The dot IS the catalyst. The player's perceptual response IS the experience. Integration occurs when tracking is accurate, disengagement is voluntary, and patterns are neither over- nor under-read.

## 3. Game Design

**Mechanics:**
- Continuous tracking: finger/gaze follows dot. Deviation from dot centre = error signal.
- Occlusion events: dot passes behind barrier. Player predicts emergence point (object permanence).
- Velocity shifts: dot accelerates/decelerates. Dishabituation = faster re-lock after change.
- Pattern probes: after 8–12 movements, system shows two movement replays, player taps matching one (non-verbal).
- Rest gates: dot pauses. Player MUST lift finger to proceed. Measures voluntary disengagement.

**Difficulty staircase:** Dot speed, occlusion duration, pattern complexity (A-B → A-B-C), rest-gate timing all adapt via 2-up/1-down.

**Drive probing:**
- Agency: rest gates measure sovereign disengagement
- Communion: tracking accuracy measures openness to stimulus
- Eros: pattern detection measures readiness for emergence
- Agape: return-to-rest latency after high-speed segments

## 4. Item Pool

| Item ID | Type | Parameters | Shadow Probed |
|---|---|---|---|
| P-01 | Linear track | Speed 1–5, no occlusion | Baseline |
| P-02 | Occluded track | 0.5–2s occlusion | Object permanence |
| P-03 | Velocity shift | ±30–80% speed change | Dishabituation |
| P-04 | Rest gate | 2–5s pause required | DA (disengagement) |
| P-05 | Noise pattern | Random movement + probe | GA (false pattern) |
| P-06 | Clear pattern | A-B-A-B + probe | GAll (pattern denial) |
| P-07 | Gentle drift | Very slow, low contrast | DAll (withdrawal) |
| P-08 | Multi-target | 2 dots, track one | Agency (selection) |

**Adaptive selection:** IRT-based. Items selected to maximise information at current theta estimate. Shadow-probing items inserted at 20% rate once baseline is stable.

## 5. Technical Requirements

**Input:** Touch position (mobile) or gaze position (webcam eye-tracking fallback). Sampling ≥60 Hz.  
**Rendering:** Single dot on dark field. Minimal GPU. Occluders as simple rectangles.  
**Scoring engine:** Continuous deviation integral (pixels × ms). Occlusion prediction error (pixels). RT to velocity shift. Rest-gate compliance (binary + latency). Pattern probe accuracy (binary).  
**Data model:** Per-item response vector → IRT theta → drive-health decomposition → shadow flags.  
**Accessibility:** Dot size and contrast adapt to visual acuity. Audio-haptic mode for low-vision (vibration intensity = proximity to target).  
**Session persistence:** Checkpoint after every 10 items. Resume from last checkpoint.
