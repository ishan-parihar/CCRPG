# Moral / Magenta — Strategic-Planning Game Concept

> **Axis:** The strategic-planning axis probes moral intelligence through CONSEQUENCE ANTICIPATION — can the player predict what happens when taboo is violated or sacred is honoured? At Magenta, this is magical-consequence: "If I break this taboo, what will the spirits do? If I honour this sacred thing, what will happen?"
>
> **Why this axis for Moral/Magenta:** Before rational consequence-analysis (Orange+), moral planning is MAGICAL — "the spirits will punish/reward." This modality tests whether the player can anticipate moral consequences through magical thinking — the proto-form of moral reasoning.

---

## 1. Game Identity

- **Title:** "The Sacred-Consequence"
- **Core mechanic:** The player predicts what will happen when sacred things are honoured or taboo is violated. Not rational cause-effect — MAGICAL consequence. "If you break this taboo, what will the spirits do? If you honour this sacred thing, what will come?" One-step moral prediction.
- **Duration:** 2-4 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** The First Consequence → The Spirit-Response → The Two-Consequences → The Hidden-Outcome → The Moral Forecast

---

## 2. Catalyst Delivery

**Catalyst:** "If you break this taboo, what happens? If you honour this sacred thing, what comes? Not what SHOULD happen — what WILL happen. What do the spirits do?" The contact boundary is: "Can you anticipate moral consequences?"

**Unconscious response:**
- *Submergent:* How does the player predict moral consequences? The Taboo-Slave predicts CATASTROPHE for everything ("terrible things will happen"). The Profane-Breaker predicts NOTHING ("nothing happens"). The Premature Rule-Maker predicts by RULE ("punishment because it's wrong"). The Ritual-Refuser predicts accurately but doesn't care.
- *Emergent:* Can they predict moral consequences with calibrated intensity — neither catastrophic nor flat?

**Integration path:** Rewards CALIBRATED MORAL PREDICTION — accurately anticipating consequences proportional to the sacred weight involved. Not catastrophic, not flat, not rule-based, not disengaged.

**Successful integration:** The player anticipates moral consequences with appropriate intensity — the foundation of moral planning.

---

## 3. Game Design

### Setup
The Sacred-Consequence: a moral prediction space. Actions are presented (honouring sacred / violating taboo). The player predicts what will happen. Then observes. Prediction → observation → calibration. The aesthetic: Magenta-stage oracle — looking into a seeing-pool to predict what the spirits will do.

### Interaction
- **The First Consequence (1-5):** Clear taboo-break → "What will happen?" Binary prediction (good/bad).
- **The Spirit-Response (5-15):** More options → "What KIND of consequence?" Specific prediction.
- **The Two-Consequences (15-30):** Predict consequences for BOTH honouring AND violating.
- **The Hidden-Outcome (30-50):** Predict consequences for ambiguous moral content.
- **The Moral Forecast (50+):** Full moral prediction: proportional + specific + felt + novel.

### Feedback
- Calibrated prediction → "You knew! You sensed what would happen. Your moral forecasting is true."
- Catastrophic → "Not that big. Small break = small consequence. Feel the proportion. Not everything is catastrophe."
- Nothing → "Something DID happen. See? The break had a result. Actions have weight."
- Rule-based → "Not just 'punishment.' WHAT happens? Feel it. What specifically?"
- Disengaged → "You were right. And it matters. This affects things. Feel the weight of knowing."

### Difficulty Adaptation
- Consequence clarity: obvious → moderate → subtle
- Prediction specificity: binary (good/bad) → categorical → specific
- Proportionality: clear proportion → ambiguous proportion
- Novelty: familiar moral content → novel sacred/taboo
- Complexity: single consequence → multiple consequences → cascading

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| The First Consequence | 1-5 | Binary prediction (good/bad outcome) |
| The Spirit-Response | 5-15 | Specific consequence prediction |
| The Two-Consequences | 15-30 | Predict both honour and violation outcomes |
| The Hidden-Outcome | 30-50 | Predict under ambiguity |
| The Moral Forecast | 50+ | Full moral prediction integration |

---

## 4. Item Pool Specification

### Item types
- **Clear violations:** Obvious taboo-breaks with predictable consequences
- **Clear honours:** Obvious sacred-honouring with predictable rewards
- **Proportional items:** Varying sacred weight → varying consequence intensity
- **Ambiguous items:** Unclear moral status → uncertain consequences
- **Novel items:** Unfamiliar sacred/taboo requiring fresh prediction

### Minimum pool size
- 25+ clear violations, 25+ clear honours, 20+ proportional, 15+ ambiguous, 10+ novel

### Drive/shadow mapping
- Catastrophic predictions → dark-addiction; zero predictions → dark-allergy
- Rule-based predictions → golden-addiction; accurate but disengaged → golden-allergy

---

## 5. Technical Requirements

### Input types
- Tap-to-select (predicted consequence); sequence-builder (cascading predictions); intensity-slider (proportionality)

### Timing requirements
- Prediction latency tracked; comparison timing; no time pressure

### NPC/AI requirements
- Consequence system (sacred/taboo actions → proportional outcomes)
- Prediction→outcome comparison system
- Proportionality engine (sacred weight → consequence intensity)
- Feedback system (shows prediction vs. actual)

### LLM requirements
- **Low-Medium:** Proportionality assessment; specificity evaluation; felt-sense distinction. Core prediction-matching algorithmic.

### State persistence
- Prediction accuracy rates; proportionality scores; specificity quality; felt-sense indicators; calibration trajectory; catastrophic indicators; flat indicators; rule-based indicators; disengagement indicators; drive/shadow signals; fatigue state; checkpoint position
