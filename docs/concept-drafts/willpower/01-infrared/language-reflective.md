# Willpower × Infrared — Language-Reflective Game

## 1. Game Identity

**Title:** Cry of Need
**Modality:** Language-Reflective (pre-verbal expression)
**Unique Lateral:** Pre-verbal drive-expression — vocalisation intensity, breath-effort coupling, proto-demand sounds. At Infrared, "language" is the body's sound: grunts, cries, breath-pushes that express need-urgency.
**Core Loop:** Need-state presented → player produces vocal/breath input → intensity and coupling measured → need satisfied proportional to expression quality.

## 2. Catalyst Delivery

**Shadow Surfacing:**
- **DA (Drive-Fixation):** Vocalisation intensity remains maximal even after need is met. Cannot modulate down. Breath stays effortful when rest is available.
- **DAll (Drive-Collapse):** No vocalisation produced. Breath remains shallow and passive. Need-state visible but no expressive output.
- **GA (Premature Wishing):** Vocalisation without breath-effort coupling. Sound produced but disconnected from body — performative rather than driven.
- **GAll (Drive Fortress):** Strong breath-effort present but vocalisation suppressed. The body works but refuses to express beyond minimal survival sounds.

**Drive Probes:**
- Eros: Vocalisation that reaches beyond current need — proto-calling, sounds directed outward/upward.
- Agape: Breath settling after expression. Return to quiet when need is met.
- Agency: Self-initiated vocalisation without prompt. The cry that comes from within.
- Communion: Responsive vocalisation — sound produced in answer to another's sound.

## 3. Game Design

**Mechanics:** Microphone captures vocal input (or breath via mic sensitivity). Screen shows a creature whose need-state is visible (shivering = cold, wilting = thirst). Player's vocal intensity/breath fills the creature's need-meter. No words. Pure sound-as-will.

**Progression:**
- Phase 1: Single need, any sound fills meter. Baseline vocal willingness.
- Phase 2: Intensity matching — louder/more sustained for urgent needs, softer for mild.
- Phase 3: Breath-effort coupling — sound must come FROM breath-push, not just throat.
- Phase 4: Modulation — intensity must decrease as need fills. Satiation-expression.

**Infinite Checkpoint:** Each need-cycle is a checkpoint. 1–20 cycles per session.

**Adaptive Difficulty:** Intensity thresholds calibrate to player's vocal range. Coupling detection tightens. Modulation windows narrow.

**Privacy:** Audio processed locally, never stored. Only intensity/frequency metrics retained.

## 4. Item Pool

| Item ID | Type | Parameters | Shadow Target |
|---|---|---|---|
| CN-01 | Basic need-cry | Any vocalisation accepted | Baseline / DAll |
| CN-02 | Urgent need | High intensity threshold | DAll detection |
| CN-03 | Satiation cycle | Need fills → silence required | DA detection |
| CN-04 | Breath-coupled cry | Diaphragmatic push detected | GA detection |
| CN-05 | Sustained tone | 3-second hold minimum | Agency probe |
| CN-06 | Call-response | NPC vocalises first, player responds | Communion probe |
| CN-07 | Novel need-sound | Unfamiliar creature, new sound shape | GAll detection |
| CN-08 | Diminishing cry | Intensity must decrease over trial | Agape probe |
| CN-09 | Reaching sound | Upward pitch shift rewarded | Eros probe |

## 5. Technical Requirements

**Inputs:** Microphone (breath/vocal). Fallback: sustained button-press with pressure sensitivity where available.
**Audio Processing:** Real-time amplitude envelope, fundamental frequency tracking, breath-onset detection. Processed on-device.
**Metrics Captured:** Peak amplitude, sustain duration, breath-voice coupling coefficient, post-satiation silence latency, intensity modulation slope.
**Adaptive Engine:** Calibrates to player's vocal baseline in first 3 trials. Shadow scoring via deviation from healthy modulation curve.
**Session Length:** 30–120 seconds. Minimum 5 cycles for valid scoring.
**Accessibility:** Visual-only fallback (sustained press with on-screen breath visualisation). No stored audio. Haptic feedback for coupling quality.
