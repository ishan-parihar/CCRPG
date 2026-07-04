# Intrapersonal / Red — Embodied-Somatic Game Concept

> **Axis:** The embodied-somatic axis probes self-knowledge THROUGH THE BODY — can the player read their own physical states? At Red, the body is the primary vehicle of self: "I am strong," "I am fast," "I am tired." This modality tests whether the player knows their body's signals accurately.
>
> **Why this axis for Intrapersonal/Red:** At Red, the self IS the body-self. "I am the one who fights" is a SOMATIC identity. The body provides the most accessible entry point for self-knowledge at this stage — before abstract introspection is available, the body's signals are the raw data of self-knowledge. Can you read your own fatigue? Your own readiness? Your own tension?

---

## 1. Game Identity

- **Title:** "The Self-Body"
- **Core mechanic:** The player assesses their own physical state (energy, tension, readiness, fatigue) and the game verifies against performance indicators. Do you know when you're tired? Do you know when you're ready? Can you read your own body?
- **Duration:** 2-4 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** The Energy-Read → The Tension-Read → The Readiness-Read → The Limit-Read → The Body-Mirror

---

## 2. Catalyst Delivery

**Catalyst:** "How does your body feel right now? Are you ready or tired? Tense or loose?" The contact boundary is: "Can you read your own body's signals accurately?"

**Unconscious response:**
- *Submergent:* The gap between body-state self-report and actual performance surfaces. Narcissist claims peak readiness when fatigued. Unexamined cannot report body-state at all. Premature Witness uses abstract body-language without accuracy. Identity-Clinger reports only "strong" regardless of actual state.
- *Emergent:* Can they read subtler body signals? Can they predict performance from body-state?

**Integration path:** Rewards ACCURATE body-reading. The player who knows they're tired and adjusts performs better than the one who denies fatigue and crashes. Body-knowledge = tactical advantage.

**Successful integration:** The player accurately reads their own physical state and uses this knowledge to optimise performance.

---

## 3. Game Design

### Setup
The Self-Body: a physical self-knowledge game where the player reads their own body-state and the game verifies. Before physical tasks, assess readiness. After physical tasks, assess fatigue. The game compares self-report to performance. The aesthetic: Red-stage warrior checking their body before battle — not meditation but TACTICAL body-reading.

### Interaction
- **The Energy-Read (1-5):** Binary: "Are you more energised or more fatigued right now?" Verified against performance on subsequent task.
- **The Tension-Read (5-15):** "Where is tension in your body? How much?" Verified against force/timing patterns.
- **The Readiness-Read (15-30):** "Rate your readiness 1-5." Verified against subsequent performance quality.
- **The Limit-Read (30-50):** "How many more rounds can you sustain?" Verified against actual fatigue curve.
- **The Body-Mirror (50+):** Full body-state awareness — energy, tension, readiness, limits, all accurate.

### Feedback
- Accurate body-read → "You knew your body. You rested at the right time. That's power."
- Inflated → "You said ready. Your body said tired. The crash cost you. Listen next time."
- Absent → "Your body spoke. You didn't hear. One signal — tired or ready? Start there."
- Abstract → "Beautiful words about your energy. But: will you perform better or worse next round? Simple answer."

### Difficulty Adaptation
- Body-state granularity: binary → 3-point → 5-point → continuous
- Verification delay: immediate → next task → next session
- State complexity: single dimension → multi-dimensional
- Prediction demand: current state → future state → performance prediction

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| The Energy-Read | 1-5 | Binary energy assessment; immediate verification |
| The Tension-Read | 5-15 | Tension location and intensity; pattern verification |
| The Readiness-Read | 15-30 | Multi-point readiness; performance-verified |
| The Limit-Read | 30-50 | Endurance prediction; fatigue-curve verification |
| The Body-Mirror | 50+ | Full body-state ecology; all dimensions accurate |

---

## 4. Item Pool

### Item types
- **Energy assessments:** Binary and scaled energy-level self-reports
- **Tension mapping:** Location and intensity of physical tension
- **Readiness ratings:** Pre-task readiness self-assessment
- **Endurance predictions:** How many rounds/tasks before fatigue
- **Performance predictions:** Predict next-task quality from body-state

### Minimum pool size
- 25+ energy contexts, 20+ tension contexts, 20+ readiness contexts, 15+ endurance predictions, 10+ performance predictions

### Drive/shadow mapping
- Always "peak" → dark-addiction; cannot report → dark-allergy
- Abstract without accuracy → golden-addiction; only "strong" → golden-allergy

---

## 5. Technical Requirements

### Input types
- Tap-to-select (binary/scaled body-state); slider (intensity ratings); body-map tap (tension location)

### Timing requirements
- No time pressure on body-reading; performance measurement at standard precision
- Session-level fatigue tracking for endurance verification

### NPC/AI requirements
- Minimal. The verification system is the player's own performance data.
- Performance baseline required for calibration (what does "peak" look like for THIS player?)

### LLM requirements
- **Low:** Contextual framing and feedback. All scoring is algorithmic (self-report vs. performance correlation).

### State persistence
- Energy-read history + performance correlations; tension patterns; readiness calibration data; endurance prediction accuracy; body-state tracking quality; inflation/deflation ratios; drive/shadow signals; performance baselines; fatigue state; checkpoint position
