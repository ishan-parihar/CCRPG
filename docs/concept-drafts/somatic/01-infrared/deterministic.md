# Somatic / Infrared — Deterministic Game Concept

> **Axis:** Objective reflex measurement — reaction time, startle habituation, grip accuracy.  **Why this axis for this module:** Pure psychomotor reflex is the most direct, measurable expression of Infrared somatic capacity; deterministic scoring removes ambiguity from the body's raw response.

---

## 1. Game Identity

**Name:** Pulse  
**Core loop:** Stimuli appear → body responds (tap/dodge/grip) → latency and accuracy are measured → difficulty adapts → reflex completes or fails to complete.  
**Feel:** A dark field with sudden flashes, impacts, vibrations. Primal. No narrative, no symbols — just stimulus and response. The game feels like the body's own nervous system rendered visible.  
**Session length:** 60–180 seconds per checkpoint. Infinite checkpoints.

## 2. Catalyst Delivery

**Catalyst frequency:** Red-ray survival reflex — the most basic somatic catalyst possible.  
**Catalyst → Experience:** Stimuli provoke genuine startle/reflex activation. The body experiences real arousal spikes and must resolve them through motor response. This is not simulated — the haptic/visual/audio stimulus genuinely activates the nervous system.  
**Experience → Integration:** Repeated exposure with successful resolution teaches the body that arousal can complete. Startle habituates. Fight-or-flight cycles close. The body learns it can respond AND return to rest.

**Drive probing:**
- **Agency:** Speed and decisiveness of response (tap force, reaction latency)
- **Communion:** Response attunement to stimulus rhythm (not just fast, but matched)
- **Eros:** Willingness to engage escalating stimuli (reach toward challenge)
- **Agape:** Ability to return to baseline between stimuli (embodied rest)

**Shadow surfacing:**
- DA: Reaction time never stabilises; inter-stimulus rest periods show no deceleration
- DAll: Non-responses, delayed responses >2σ, grip force drops to zero
- GA: Attempts to anticipate/pre-empt stimuli rhythmically before pattern exists
- GAll: Responds only to threat-coded stimuli, ignores neutral/playful ones

## 3. Game Design

**Mechanics:**
- Tap targets appear with variable ISI (inter-stimulus interval): 200ms–2000ms
- Startle probes: unexpected high-intensity stimuli measure habituation curve
- Grip-hold tasks: sustain touch pressure within a force band for 1–3 seconds
- Dodge tasks: swipe away from approaching threat-stimulus within window
- Rest phases: no stimulus for 5–10s, measures return-to-baseline (touch-pressure variability)

**Adaptive staircase:**
- ISI narrows as reaction time improves
- Startle intensity decreases as habituation demonstrates
- Grip band narrows as coordination improves
- If DA detected: extend rest phases, reward deceleration
- If DAll detected: reduce stimulus intensity, reward ANY response

**Progression (within-session):**
1. Baseline: simple tap responses, establish reaction-time distribution
2. Escalation: faster ISI, startle probes introduced
3. Integration: mixed stimuli with mandatory rest phases between bursts
4. Completion: final probe set measuring habituation and baseline return

## 4. Item Pool

| Item Category | Examples | Shadow Targeted |
|---|---|---|
| Stimulus type | Flash, vibration, sound-burst, edge-approach | All (varied activation) |
| ISI range | 200ms, 500ms, 1000ms, 2000ms | DA (short), DAll (long) |
| Startle intensity | Low/med/high haptic + audio | DA (habituation), DAll (threshold) |
| Grip bands | Wide (±30%), medium (±15%), narrow (±5%) | Agency (precision) |
| Rest durations | 3s, 5s, 8s, 12s | DA (cannot rest), Agape (return) |
| Dodge windows | 800ms, 500ms, 300ms | Agency (mobilisation speed) |

Items are selected adaptively based on current shadow-profile and drive-health scores. No item is purely diagnostic — each simultaneously measures AND trains the reflex.

## 5. Technical Requirements

**Input:** Touch (tap, hold, swipe), accelerometer (device shake for startle)  
**Output:** Haptic feedback (vibration patterns), audio (low-frequency pulses), visual (flash, edge-glow)  
**Timing precision:** ≤16ms input sampling; all reaction times measured to millisecond  
**Sensors used:** Touch-pressure (force-touch or pressure proxy), accelerometer  
**Data captured:** Per-trial RT, grip force curve, startle habituation slope, ISI-by-RT function, rest-phase pressure variability  
**Adaptive engine:** 2-up/1-down staircase on ISI; Bayesian estimate of habituation rate; drive-health updated per-trial  
**Accessibility:** Audio-only mode (all stimuli have audio correlates); high-contrast mode; adjustable base intensity
