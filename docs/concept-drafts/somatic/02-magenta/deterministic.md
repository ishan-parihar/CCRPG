# Somatic / Magenta — Deterministic Game Concept

> **Axis:** The deterministic axis provides OBJECTIVE measurement of somatic capacity — no LLM interpretation, no subjective scoring. Pure psychometric signal. At Magenta, this means: can the player hold a posture stably, tap in rhythm, and identify body-states accurately?
>
> **Why this axis for Somatic/Magenta:** This is the GROUND TRUTH for the module. All other modalities cross-validate against deterministic. If the player can't hold a posture or tap a beat here, their performance elsewhere is either magical-thinking (dark-addiction) or performance without awareness (golden-addiction).

---

## 1. Game Identity

- **Title:** "The Body-Reader"
- **Core mechanic:** Objective measurement of body-awareness capacity: postural hold stability, rhythm synchronisation accuracy, and body-state identification. Pure somatic psychometrics wrapped in magical aesthetics.
- **Duration:** 2-4 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** The Held Pose → The Beat → The Body-Sense → The Boundary → The Living Body

---

## 2. Catalyst Delivery

**Catalyst:** "Hold this pose. Feel your body. Tap the beat. Where does your body end?" The contact boundary is: "Can you sense and control your body?"

**Unconscious response:**
- *Submergent:* Does the player engage the body at all? Do they hold postures as magic (dark-addiction)? Refuse to engage (dark-allergy)?
- *Emergent:* Can they hold stably? Tap accurately? Identify states? Do they rush to intensity (golden-addiction)? Fear sensation (golden-allergy)?

**Integration path:** Rewards ACCURATE body-engagement — stable holds, accurate rhythm, correct state-identification. Not magical ritual, not avoidance, not intensity-seeking.

**Successful integration:** The player holds postures stably, taps rhythms accurately, and identifies body-states correctly — genuine somatic capacity.

---

## 3. Game Design

### Setup
The Body-Reader: objective somatic measurement in a magical space. The player holds postures, taps rhythms, and identifies body-states. The aesthetic: Magenta-stage body-temple — a space where the body is honoured, measured, and known. Glowing body-outlines, pulsing rhythms, gentle light.

### Interaction
- **The Held Pose (1-5):** Hold a posture for increasing duration. Stability measured. Simple hold.
- **The Beat (5-15):** Tap in time with a simple beat. Synchronisation accuracy measured.
- **The Body-Sense (15-30):** Identify current body-state (tense/relaxed/neutral). Accuracy measured.
- **The Boundary (30-50):** Identify body-zone locations. Proprioceptive accuracy.
- **The Living Body (50+):** Full integration — hold, rhythm, state-identification, boundary-sense, all accurate.

### Feedback
- Stable hold → "Your body is steady. You're HERE. Present."
- Accurate rhythm → "Your body moves with the beat. You feel the pulse."
- Correct state-ID → "You know your body. Tense. Relaxed. You can tell."
- Ritual additions → "Simpler. Just hold. No ceremony. Just your body, stable."
- Disengagement → "Your body is waiting. Just notice it. One moment of attention."

### Difficulty Adaptation
- Hold duration: 2s → 4s → 6s → 10s
- Rhythm complexity: single beat → varied tempo → syncopation seed
- State-identification: binary (tense/relaxed) → ternary → gradient
- Boundary precision: gross (arm/leg) → moderate (hand/foot) → fine (finger/toe)

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| The Held Pose | 1-5 | Simple postural hold; stability measured |
| The Beat | 5-15 | Rhythm synchronisation; accuracy measured |
| The Body-Sense | 15-30 | Body-state identification; awareness measured |
| The Boundary | 30-50 | Proprioceptive accuracy; spatial body-sense |
| The Living Body | 50+ | Full somatic integration |

---

## 4. Item Pool

### Item types
- **Postural holds:** Various postures with increasing duration/stability demands
- **Rhythm patterns:** Beats at various tempos and complexities
- **State-identification items:** Body-state queries at various granularities
- **Boundary items:** Body-zone identification at various precisions
- **Integration items:** Combined hold + rhythm + awareness tasks

### Minimum pool size
- 25+ holds, 25+ rhythms, 20+ state-IDs, 15+ boundary, 10+ integration

### Drive/shadow mapping
- Ritual additions → dark-addiction; zero engagement → dark-allergy
- Excessive force → golden-addiction; approach-withdrawal → golden-allergy

---

## 5. Technical Requirements

### Input types
- Sustained touch (postural hold); timed tap (rhythm); tap-to-select (state-ID, boundary-ID)

### Timing requirements
- Hold stability at ≥30Hz sampling; rhythm at ±16ms precision; state-ID untimed

### NPC/AI requirements
- None. Pure player-vs-task. Environmental aesthetics only.

### LLM requirements
- **Low:** Feedback text generation; contextual framing. Core somatic psychometrics entirely algorithmic.

### State persistence
- Hold stability history; rhythm asynchrony distributions; state-ID accuracy; boundary accuracy; consistency metrics; ritual-addition indicators; disengagement indicators; force-level indicators; approach-withdrawal indicators; drive/shadow signals; fatigue state; checkpoint position
