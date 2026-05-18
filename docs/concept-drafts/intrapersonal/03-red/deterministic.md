# Intrapersonal / Red — Deterministic Game Concept

> **Axis:** The deterministic axis provides OBJECTIVE measurement of self-knowledge — does the player's self-report match their actual behaviour? This is the ground-truth anchor for the intrapersonal module. No LLM interpretation needed; pure behavioural comparison.
>
> **Why this axis for Intrapersonal/Red:** Self-knowledge is uniquely vulnerable to self-deception. The deterministic modality provides the BEHAVIOURAL EVIDENCE against which all self-report is validated. "You said you'd fight. Did you fight? You said you were calm. Were you calm?"

---

## 1. Game Identity

- **Title:** "The Self-Reader"
- **Core mechanic:** The player makes self-predictions and self-assessments; the game measures whether these match actual behaviour. Pure accuracy scoring — no interpretation, no narrative, just "did you know yourself?"
- **Duration:** 2-4 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** The Label → The Prediction → The Pattern → The Blind Spot → The Mirror

---

## 2. Catalyst Delivery

**Catalyst:** "What are you feeling right now? What will you do next? How strong are you?" The contact boundary is: "Do you ACTUALLY know yourself, or do you just think you do?"

**Unconscious response:**
- *Submergent:* The gap between self-report and behaviour surfaces. Inflated self-image (Narcissist)? Refusal to report (Unexamined)? Sophisticated but inaccurate report (Premature Witness)? Accurate but rigid report (Identity-Clinger)?
- *Emergent:* Can they improve accuracy? Can they notice their own blind spots?

**Integration path:** Rewards ACCURACY over confidence. A humble "I don't know" scores higher than a confident wrong answer. The game teaches that honest self-knowledge is more powerful than self-deception.

**Successful integration:** Self-predictions match behaviour. Self-assessments match observable indicators. The player KNOWS themselves accurately.

---

## 3. Game Design

### Setup
The Self-Reader: a mirror-game where the player's self-knowledge is tested against reality. Before each action, predict. After each action, assess. The game compares prediction to reality, assessment to evidence. The aesthetic: Red-stage warrior examining their reflection in a blade — not vanity but tactical self-knowledge.

### Interaction
- **The Label (1-5):** Name your current state from a list. Binary accuracy (correct/incorrect based on behavioural indicators).
- **The Prediction (5-15):** Predict your next action/choice/performance. Score: did it match?
- **The Pattern (15-30):** Identify your own patterns ("I always X when Y"). Score: does the pattern hold?
- **The Blind Spot (30-50):** Identify what you DON'T know about yourself. Score: can you name your uncertainty?
- **The Mirror (50+):** Full self-knowledge integration — accurate labels, predictions, patterns, and blind-spot awareness.

### Feedback
- Accurate self-knowledge → "You knew. The mirror confirms. That knowledge is power."
- Inflated → "You said 8. Reality said 5. The gap costs you. Know your true strength."
- Refused → "The mirror waits. One word. Name what you see."
- Performed → "Beautiful words. Wrong prediction. Know yourself SIMPLY before you know yourself DEEPLY."

### Difficulty Adaptation
- State complexity: binary (angry/calm) → multi-state → nuanced
- Prediction horizon: immediate → next action → next session
- Pattern complexity: single → compound → contextual
- Blind-spot demand: acknowledge existence → name specifically → predict consequences

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| The Label | 1-5 | Binary state-labelling; immediate verification |
| The Prediction | 5-15 | Self-prediction; behavioural confirmation |
| The Pattern | 15-30 | Pattern recognition; multi-session validation |
| The Blind Spot | 30-50 | Uncertainty awareness; naming what's unknown |
| The Mirror | 50+ | Full self-knowledge ecology |

---

## 4. Item Pool Specification

### Item types
- **State-labelling tasks:** Name current state from options (verified against behavioural indicators)
- **Self-prediction tasks:** Predict next action/choice/performance (verified against actual)
- **Capacity-assessment tasks:** Rate own ability (verified against demonstrated performance)
- **Pattern-identification tasks:** Name own patterns (verified across sessions)
- **Blind-spot tasks:** Identify areas of self-ignorance (verified against cross-modality data)

### Minimum pool size
- 30+ state-labels, 25+ prediction contexts, 20+ capacity domains, 15+ pattern types, 10+ blind-spot probes

### Drive/shadow mapping
- Inflated assessments → dark-addiction; refused assessments → dark-allergy
- Sophisticated but inaccurate → golden-addiction; accurate but rigid → golden-allergy

---

## 5. Technical Requirements

### Input types
- Tap-to-select (state labels, predictions from options); slider (capacity self-rating); forced-choice (pattern identification)

### Timing requirements
- No millisecond precision; self-assessment is untimed; prediction windows are generous
- Cross-session tracking essential (patterns validated over 3+ sessions)

### NPC/AI requirements
- Minimal. The "opponent" is the player's own behaviour record.
- Behavioural indicator system must track observable states for verification.

### LLM requirements
- **Low:** Contextual framing and feedback narration. All scoring is algorithmic comparison.

### State persistence
- Full self-assessment history; all predictions + outcomes; capacity ratings + demonstrated performance; identified patterns + validation status; blind-spot nominations; accuracy trends; drive/shadow signals; inflation/deflation ratios; fatigue state; checkpoint position
