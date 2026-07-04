# Willpower × Infrared — Embodied-Somatic Game

## 1. Game Identity

**Title:** Reach and Grasp
**Modality:** Embodied-Somatic (body mobilising)
**Unique Lateral:** Physical effort of mobilisation — reaching, grasping, the body moving toward need. The somatic experience of will as MOVEMENT. Not timing, not choice — the felt-sense of effort-toward.
**Core Loop:** Need appears at distance → player physically reaches (device tilt/movement/sustained press-effort) → effort sustains until need is grasped → release into rest.

## 2. Catalyst Delivery

**Shadow Surfacing:**
- **DA (Drive-Fixation):** Effort continues after grasp. Cannot release. The body keeps reaching even when holding what it needs.
- **DAll (Drive-Collapse):** Effort fails to initiate or collapses mid-reach. The body starts but cannot sustain. Gives up before grasping.
- **GA (Premature Wishing):** Minimal effort with expectation of result. Taps once expecting full grasp. Effort-to-reward ratio skewed toward entitlement.
- **GAll (Drive Fortress):** Full effort on familiar reaches but refuses to extend reach-distance. Will not stretch beyond known range even when need is just slightly further.

**Drive Probes:**
- Eros: Reach-distance gradually extends. Does the body stretch toward the slightly-further?
- Agape: Rest phases between reaches. Does the body settle fully? Muscle-release measured.
- Agency: Self-paced reaching. No external timer — the body decides when to begin.
- Communion: Paired reaching. Two need-objects require simultaneous bilateral effort (or co-player sync).

## 3. Game Design

**Mechanics:** Device accelerometer detects tilt/movement, or sustained press with increasing resistance simulates effort. Screen shows a simple creature reaching toward a glowing need-object. Physical input maps to creature's reach-extension. Object "grasped" when effort threshold sustained for required duration.

**Progression:**
- Phase 1: Short reach, low effort threshold. Can the body mobilise at all?
- Phase 2: Longer reach, sustained effort. Can mobilisation persist?
- Phase 3: Reach + release cycles. Can the body alternate effort and rest?
- Phase 4: Extended reach (novel distance). Will the body stretch beyond familiar?

**Infinite Checkpoint:** Each reach-cycle is a checkpoint. 1–25 cycles per session.

**Adaptive Difficulty:** Effort thresholds calibrate to player's physical baseline. Reach-duration extends. Rest-windows shorten (testing DA). Novel distances introduced gradually.

## 4. Item Pool

| Item ID | Type | Parameters | Shadow Target |
|---|---|---|---|
| RG-01 | Short reach | 1s sustain, low threshold | Baseline / DAll |
| RG-02 | Long reach | 3s sustain, moderate threshold | DAll detection |
| RG-03 | Grasp-and-release | Effort then explicit release required | DA detection |
| RG-04 | Minimal-effort trap | Object appears close but requires full effort | GA detection |
| RG-05 | Extended distance | 20% beyond established range | GAll detection |
| RG-06 | Self-initiated reach | No start cue, player begins when ready | Agency probe |
| RG-07 | Bilateral reach | Two objects, both hands/sides | Communion probe |
| RG-08 | Rest cycle | Explicit rest phase, release quality measured | Agape probe |
| RG-09 | Stretch-beyond | Object at edge of possible range | Eros probe |

## 5. Technical Requirements

**Inputs:** Accelerometer (tilt/shake), gyroscope, or sustained touch-pressure. Fallback: hold-duration with visual effort meter.
**Sensor Precision:** Accelerometer at 60Hz minimum. Pressure sensitivity where available.
**Metrics Captured:** Effort onset latency (ms), sustain duration (ms), effort magnitude (tilt degrees or pressure level), release latency after grasp (ms), rest-phase muscle-release (return to baseline), extended-reach willingness (binary + magnitude).
**Adaptive Engine:** Effort thresholds set from first 3 trials (personal baseline). Shadow detection via deviation patterns over rolling window.
**Session Length:** 30–120 seconds. Minimum 5 reach-cycles for valid scoring.
**Accessibility:** Multiple input modes (tilt, press, voice-effort). Visual effort-meter always visible. Haptic confirmation on grasp.
