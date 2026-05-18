# Somatic / Infrared — Language-Reflective Game Concept

> **Axis:** Pre-verbal body-sound — breath patterns, vocalisation-with-movement, proto-communication through the body.  **Why this axis for this module:** At Infrared there is no language, but the body already communicates through breath, grunt, cry — the somatic substrate of all future speech lives in reflex vocalisation.

---

## 1. Game Identity

**Name:** Breath-Voice  
**Core loop:** Body-state activates → breath pattern emerges → vocalisation couples with movement → the sound completes the reflex cycle → body settles.  
**Feel:** Deep, resonant, womb-like. Low frequencies, breath visualised as expanding/contracting fields. The player's own microphone input (breath, voice) drives the game world. Intimate and pre-verbal.  
**Session length:** 90–240 seconds per checkpoint. Infinite checkpoints.

## 2. Catalyst Delivery

**Catalyst frequency:** Red-ray survival expressed through the breath-body — the most primitive vocalisation (gasp, cry, exhale of relief).  
**Catalyst → Experience:** The game provokes genuine breath-pattern shifts. Startling stimuli elicit gasps; safety cues elicit sighs. The body's vocal-respiratory system is activated at reflex level.  
**Experience → Integration:** Coupling vocalisation with movement completes the arousal cycle. The exhale-with-sound teaches the body that activation can discharge through voice. Breath becomes a self-regulation tool.

**Drive probing:**
- **Agency:** Strength and clarity of vocalisation (volume, pitch stability)
- **Communion:** Breath synchrony with environmental rhythm (attunement)
- **Eros:** Willingness to vocalise at all (reaching beyond silence)
- **Agape:** Exhale completion, breath returning to rest after activation

**Shadow surfacing:**
- DA: Breath never slows; hyperventilation pattern; vocalisation is only gasping/panting
- DAll: Breath becomes inaudible; voice drops out; apneic pauses
- GA: Attempts melodic/tonal vocalisation before basic breath-coupling is established
- GAll: Will breathe but refuses to vocalise; breath stays silent and functional-only

## 3. Game Design

**Mechanics:**
- Microphone captures breath and vocalisation (amplitude, frequency, rhythm)
- Breath-field: visual environment expands on inhale, contracts on exhale — player sees their breath
- Activation prompts: sudden stimuli require audible exhale to "discharge" (gasp → sigh cycle)
- Movement-voice coupling: touch-drag movements paired with sustained vocalisation (hum while moving)
- Rest phases: silence required — measures whether breath actually settles

**Adaptive staircase:**
- Activation intensity scales with demonstrated breath-recovery speed
- Vocalisation threshold lowers if DAll detected (any sound is rewarded)
- Coupling complexity increases: breath-only → breath+touch → breath+touch+voice
- If DA detected: extend exhale phases, reward slow breath
- If GAll detected: introduce playful non-threat sounds to model vocalisation

**Progression (within-session):**
1. Breath-awareness: see your breath visualised, no demands
2. Activation-discharge: stimulus → gasp → guided exhale → settle
3. Voice-coupling: sustain sound while performing simple touch movements
4. Integration: free breath-voice-movement with periodic activation probes

## 4. Item Pool

| Item Category | Examples | Shadow Targeted |
|---|---|---|
| Activation stimuli | Sudden sound, screen flash, vibration burst | DA/DAll (arousal response) |
| Breath targets | 4s inhale, 6s exhale, 3s hold | DA (slow down), Agape (complete) |
| Vocalisation prompts | Hum-tone, open-vowel, sigh-model | GAll (invite voice), Eros (reach) |
| Coupling tasks | Drag-while-humming, tap-on-exhale | Agency (coordination) |
| Rest intervals | 5s, 8s, 12s silence | DA (cannot rest), baseline measure |
| Rhythm seeds | 2-beat breath cycle, 3-beat with voice | GA (premature if jumped to) |

Items adapt based on breath-data and vocalisation presence. The game never demands speech or words — only pre-verbal sound coupled with body-state.

## 5. Technical Requirements

**Input:** Microphone (breath amplitude, frequency, rhythm), touch (movement coupling)  
**Output:** Visual breath-field (expand/contract), low-frequency audio environment, haptic on exhale-completion  
**Audio processing:** Real-time amplitude envelope, fundamental frequency detection, breath-vs-voice classification  
**Privacy:** All audio processed on-device; no recordings stored; only extracted features (amplitude, frequency, duration) saved  
**Data captured:** Breath rate, exhale/inhale ratio, vocalisation presence/absence, coupling accuracy, recovery time post-activation  
**Adaptive engine:** Breath-rate target adjusts to player's baseline; vocalisation threshold personalised; activation intensity scaled to recovery speed  
**Accessibility:** Visual-only mode (breath tracked via touch-pressure proxy); no forced vocalisation — silence is valid data
