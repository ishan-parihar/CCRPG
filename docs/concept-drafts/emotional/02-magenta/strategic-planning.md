# Emotional / Magenta — Strategic-Planning Game Concept

> **Axis:** The strategic-planning axis probes emotional intelligence through MOOD-SEQUENCING — can the player anticipate how feelings will unfold? At Magenta, this is proto-emotional-forecasting: "If I go to the scary place, I'll feel scared. If I go to the warm place, I'll feel warm." One-step emotional prediction.
>
> **Why this axis for Emotional/Magenta:** Before emotions can be regulated (Red+), they must be PREDICTED. At Magenta: "This will make me feel X." The simplest emotional planning — knowing that actions produce feelings. This modality tests whether the player can form action→feeling links.

---

## 1. Game Identity

- **Title:** "The Mood-Map"
- **Core mechanic:** The player predicts what they'll feel in different situations. "If you go there, how will you feel?" One-step emotional forecasting. Not regulation — just PREDICTION. Can they anticipate the emotional consequence of an action?
- **Duration:** 2-4 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** The Feeling-Guess → The Mood-Prediction → The Two-Mood → The Feeling-Sequence → The Emotional Forecast

---

## 2. Catalyst Delivery

**Catalyst:** "If you go to the dark cave, how will you feel? If you go to the sunny meadow, how will you feel?" The contact boundary is: "Can you predict your own emotional responses?"

**Unconscious response:**
- *Submergent:* Can the player link situations to feelings? The Mood-Flooder predicts overwhelm everywhere. The Affect-Denier predicts "nothing" everywhere. The Premature Empath predicts complex emotional sequences beyond capacity. The Feeling-Refuser won't engage with emotional prediction.
- *Emergent:* Can they form simple situation→feeling links?

**Integration path:** Rewards ACCURATE EMOTIONAL PREDICTION — correctly anticipating how a situation will feel. Not predicting overwhelm everywhere, not predicting nothing, not over-predicting complexity, not refusing to predict.

**Successful integration:** The player accurately predicts simple emotional outcomes — the seed of emotional planning.

---

## 3. Game Design

### Setup
The Mood-Map: an emotional forecasting space. Situations are presented (visually, atmospherically) and the player predicts how they'll feel. Then they ENTER the situation and compare prediction to reality. The aesthetic: Magenta-stage crystal ball — the player looks into situations and predicts the feeling, then enters and discovers.

### Interaction
- **The Feeling-Guess (1-5):** Obvious situation → predict one feeling. Enter. Compare.
- **The Mood-Prediction (5-15):** Less obvious situations → predict with calibrated intensity.
- **The Two-Mood (15-30):** Predict TWO feelings in sequence: "First X, then Y."
- **The Feeling-Sequence (30-50):** Predict how feelings will CHANGE within a situation.
- **The Emotional Forecast (50+):** Full emotional prediction: situation → forecast → enter → compare → learn.

### Feedback
- Accurate prediction → "You knew! Your feeling-sense predicted right. You know yourself."
- All-intense → "Not that intense. Gentler. The real feeling was quieter. Can you predict quieter?"
- All-nothing → "Something DID happen. See? A little feeling. Next time, predict the little one."
- Over-complex → "Simpler than that. The main feeling was just 'happy.' That's enough."
- Refuses → "Just a guess. Look at the picture. What MIGHT you feel? No wrong answer."

### Difficulty Adaptation
- Situation clarity: obvious → moderate → ambiguous
- Prediction precision: basic emotion → intensity level → sequence
- Comparison feedback: immediate → delayed
- Situation novelty: familiar → novel
- Prediction format: choose from 3 → choose from 5 → generate own

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| The Feeling-Guess | 1-5 | Predict one feeling for obvious situations |
| The Mood-Prediction | 5-15 | Calibrated intensity predictions |
| The Two-Mood | 15-30 | Two-feeling sequences |
| The Feeling-Sequence | 30-50 | Predict feeling-changes within situations |
| The Emotional Forecast | 50+ | Full emotional prediction integration |

---

## 4. Item Pool

### Item types
- **Obvious situations:** Clear emotional valence (dark cave, sunny meadow)
- **Moderate situations:** Less obvious emotional tone
- **Sequence situations:** Feelings that change within the situation
- **Ambiguous situations:** No single "right" emotional prediction
- **Comparison items:** Prediction vs. reality feedback pairs

### Minimum pool size
- 25+ obvious, 20+ moderate, 15+ sequence, 15+ ambiguous, 10+ comparison

### Drive/shadow mapping
- All-intense predictions → dark-addiction; all-flat predictions → dark-allergy
- Over-complex predictions → golden-addiction; prediction-refusal → golden-allergy

---

## 5. Technical Requirements

### Input types
- Tap-to-select (predicted feeling); intensity slider; sequence-builder (drag feelings into order)

### Timing requirements
- Prediction latency tracked; comparison timing; no time pressure on prediction

### NPC/AI requirements
- Situation visualization (scenes with emotional atmospheres)
- Prediction→reality comparison system
- Learning feedback (shows prediction vs. actual)
- Optional: companion who shares predictions

### LLM requirements
- **Low-Medium:** Novel situation generation; sequence evaluation; prediction-reality comparison narratives. Core prediction-matching partially algorithmic.

### State persistence
- Prediction accuracy rates; intensity calibration scores; differentiation quality; sequence prediction capacity; learning rates; all-intense indicators; all-flat indicators; over-complexity indicators; refusal indicators; drive/shadow signals; fatigue state; checkpoint position
