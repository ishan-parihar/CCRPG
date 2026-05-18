# Somatic / Amber — Deterministic

> **Axis:** The deterministic axis provides OBJECTIVE, LLM-free measurement of somatic capacity at Amber. Pure psychophysics: timing, accuracy, duration, synchrony. The body's capacity measured without interpretation.
>
> **Why this axis:** The disciplined body is measurable — posture duration, form accuracy, breath-movement coupling, synchrony precision. This modality provides the ground-truth calibration for all other Somatic/Amber games.

---

## §1 Game Identity

- **Title:** "The Stance Trials"
- **Core mechanic:** Objective measurement of disciplined body capacity — sustained holds, form reproduction, breath-gated timing, group synchrony, coordination under load. Pure psychophysics. No narrative, no interpretation — just the body's measurable capacity.
- **Duration:** 2-4 minutes per session (infinite checkpoints; fatigue-monitored)
- **Internal progression:** The First Hold → The Reproduced Form → The Breath-Gate → The Shared Beat → The Loaded Stance

---

## §2 Catalyst Delivery

**What it uniquely presents:** Raw somatic challenge with zero narrative or interpretive layer. The body meets the form directly.

**How it differs from other 6:** Only modality with NO LLM, NO narrative, NO interpretation. Pure psychophysics. Provides ground-truth calibration that validates all other modalities.

**What it uniquely surfaces:** Objective capacity gaps — exact hold duration, precise synchrony deviation, measurable form accuracy. Cannot be faked or self-reported inaccurately.

**Successful integration:** The body demonstrates Amber-level somatic mastery — disciplined, coordinated, breath-coupled, synchronised — as measured objectively.

---

## §3 Game Design

### Setup
A clean measurement space. No narrative — just the body and the form. Stances demonstrated; player reproduces. Beats played; player synchronises. Breath cadence set; player couples. Aesthetic: Amber-stage training ground — clean stone floor, form-master demonstrating, player's body-outline responding.

### Interaction Phases
- **The First Hold (1-5):** Sustained posture. Hold for 4s → 6s → 8s. With 0 → 1 → 2 distractors.
- **The Reproduced Form (5-15):** Form reproduction. 2-element → 3-element → 4-element sequences.
- **The Breath-Gate (15-30):** Breath-coupled movement. 3-breath → 4-breath → 6-breath cadences.
- **The Shared Beat (30-50):** Group synchrony. 80 BPM → 100 BPM → 120 BPM. Precision measured.
- **The Loaded Stance (50+):** Coordination under load. Posture + classification. Form + counting. Breath + sequencing.

### Feedback
- Clean hold → "The stance holds. Disciplined. Good."
- Cannot release → "Release now. The form includes the rest. Let go."
- Breaks early → "Shorter. Just two seconds. Perfect. Build from there."
- Overreaches → "Not yet. Master this form first."
- Freezes at novel → "New stance. Just try. Attempt is enough."

### Difficulty Adaptation
- Hold duration: 2s → 4s → 6s → 8s (distractors: 0 → 1 → 2)
- Form length: 2-element → 3-element → 4-element
- Breath cadence: 3-breath → 4-breath → 6-breath
- Synchrony BPM: 80 → 100 → 120 (precision: ±50ms → ±40ms → ±30ms)
- Dual-task load: none → simple → moderate

### Progression Table
| Phase | Checkpoints | What changes |
|---|---|---|
| The First Hold | 1-5 | Sustained posture (duration + distractors) |
| The Reproduced Form | 5-15 | Form reproduction (sequence length) |
| The Breath-Gate | 15-30 | Breath-coupled movement (cadence length) |
| The Shared Beat | 30-50 | Group synchrony (BPM + precision) |
| The Loaded Stance | 50+ | Coordination under dual-task load |

---

## §4 Item Pool

| Type | Pool size |
|---|---|
| Hold trials (varying duration + distractor load) | 20+ |
| Form trials (varying sequence length) | 20+ |
| Breath trials (varying cadences) | 15+ |
| Synchrony trials (varying BPM + precision) | 15+ |
| Dual-task trials (form/posture under cognitive load) | 10+ |

---

## §5 Technical Requirements

- **Inputs:** Hold (sustained touch/press); sequence-tap (form reproduction); rhythm-tap (synchrony); breath-paced-tap (breath-gating)
- **Timing:** Millisecond precision for synchrony; sub-second for hold duration; breath-rate calibration at session start
- **NPC/AI:** Form demonstration system; beat generation (metronome); breath calibration; distractor generation; fatigue detection (accuracy degradation, RT increase); adaptive difficulty (all parameters scale independently)
- **LLM level:** None — fully deterministic, pure psychophysics
- **State persistence:** Hold duration history; form accuracy history; breath-coupling metrics; synchrony precision history; dual-task scores; fatigue indicators; shadow signals; drive/shadow state; checkpoint position; breath-rate calibration
