# Interpersonal / Green — Embodied-Somatic Game Concept

> **Axis:** Body as site of relating — physical co-presence, embodied vulnerability, relational posture.  **Why this axis for this module:** Authentic relating is not merely cognitive; the body reveals relational truth before the mind can narrate it — tension, openness, collapse, and rigidity are the somatic signatures of shadow.

---

## 1. Game Identity

**Name:** Relational Body  
**Core loop:** Player engages in body-awareness tasks that reveal somatic relational patterns — how the body responds to vulnerability cues, closeness/distance dynamics, and relational pressure. Breath, posture, tension, and rhythm are measurement channels.  
**Session length:** 4–7 minutes per checkpoint.  
**Infinite checkpoint:** Each somatic exercise is self-contained; player exits between exercises.

## 2. Catalyst Delivery

**Shadow surfacing:** DA surfaces as somatic collapse — body loses tone, breath becomes shallow, physical boundaries dissolve (leaning in excessively, mirroring without awareness). DAll surfaces as somatic rigidity — body armours, breath holds, physical distance maintained regardless of context.  
**Drive probing:** Agency measured by capacity to maintain somatic coherence (upright, boundaried, present) during relational stimuli. Communion measured by capacity to soften and physically attune without collapse. Eros measured by somatic willingness to expand toward unfamiliar relational territory. Agape measured by capacity to ground and embody relational presence.  
**Catalyst→Experience→Integration:** Exercises begin with baseline somatic awareness, introduce relational stimuli that surface shadow-patterns in the body, then guide somatic integration — maintaining openness WITH coherence.

## 3. Game Design

**Exercise types:**  
- *Relational breath:* Breath synchronisation with NPC partner. Measures capacity to attune (Communion) without losing own rhythm (Agency). DA = total sync loss of self-rhythm. DAll = refuses synchronisation.  
- *Proximity response:* Virtual character approaches/retreats. Player's physiological response or self-reported body-state reveals comfort thresholds and shadow activation.  
- *Vulnerability posture:* Guided body-opening exercises while relational audio plays. Measures capacity to maintain open posture during vulnerability-triggering content.  
- *Boundary embodiment:* Player practices somatic "yes" and "no" — physical gestures of welcome and limit-setting. Measures clarity of somatic boundary signals.  
**Measurement:** Accelerometer data (mobile), self-report scales (collapsed/coherent/rigid), breath rate via microphone, optional heart-rate sensor.  
**Adaptive difficulty:** Relational stimuli increase in emotional intensity. Proximity dynamics become more ambiguous. Vulnerability content approaches player's shadow territory.

## 4. Item Pool

**Structure:** 100+ somatic exercises across 4 categories (breath-relational, proximity, posture-vulnerability, boundary-embodiment). Each tagged with: shadow probed, drive measured, intensity tier (1–5), sensor requirements.  
**Shadow-specific items:** DA items invite merging and measure whether body maintains coherence. DAll items invite opening and measure whether body allows softening. GA items present "transcendent" body states and measure grounding. GAll items invite somatic expansion beyond comfort.  
**Sensor-adaptive:** Full pool with accelerometer only. Enhanced items with heart-rate. All items have self-report fallback.  
**Refresh:** Exercise sequences rotate on 14-day cycles. Intensity progression personalised to player's somatic edge.

## 5. Technical Requirements

**Sensor integration:** Accelerometer (required). Microphone for breath detection (optional). Heart-rate via device sensor or wearable API (optional). Graceful degradation to self-report.  
**Timing:** Real-time exercises. Somatic data sampled at 30Hz minimum. Breath detection requires 10s minimum sample.  
**Scoring:** Somatic coherence index from variability metrics. Shadow-pattern detection via characteristic somatic signatures. Drive-health updated per exercise block.  
**Privacy:** Raw sensor data processed on-device only. Only derived scores transmitted.  
**Accessibility:** Non-movement alternatives for mobility-limited players. Visual and audio guidance. Intensity controls respect player-set limits.
