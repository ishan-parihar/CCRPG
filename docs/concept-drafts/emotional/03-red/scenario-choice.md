# Emotional / Red — Scenario-Choice Game Concept

> **Axis:** The scenario-choice axis probes emotional intelligence through DECISIONS that require emotional wisdom — situations where the player must choose HOW to use emotion, WHEN to channel vs. contain, and WHAT emotional response serves the goal. Not "can you feel" but "can you choose wisely ABOUT feeling?"
>
> **Why this axis for Emotional/Red:** At Red, emotional choices are CONCRETE: "Do I let my rage loose or hold it back?" "Do I show fear or hide it?" "Do I use pride as armour or let it go?" These are VOLITIONAL-EMOTIONAL decisions — the intersection of will and feeling.

---

## 1. Game Identity

- **Title:** "The Wroth-Chooser's Trial"
- **Core mechanic:** The player faces emotional dilemmas — situations where different emotional responses lead to different outcomes. The game tests emotional WISDOM: not just "can you feel" but "can you choose the RIGHT feeling for the RIGHT moment?"
- **Duration:** 4-7 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** Binary Emotions → Weighted Choices → Competing Feelings → Emotional Revision → The Impossible Feeling

---

## 2. Catalyst Delivery

**Catalyst:** A situation demands an emotional response. Multiple options exist. The player must CHOOSE — and the choice reveals their emotional wisdom, their shadow patterns, and their drive-health.

**Unconscious response:**
- *Submergent:* Do they always choose rage (dark-addiction)? Always suppress (dark-allergy)? Always choose the "sophisticated" option (golden-addiction)? Always choose the "strong" option (golden-allergy)?
- *Emergent:* Can they choose contextually? Can they select the emotion that SERVES the situation?

**Integration path:** The game rewards CONTEXTUAL emotional choice — sometimes rage IS correct, sometimes containment IS correct. The wisdom is in the MATCHING, not in always choosing one way.

**Successful integration:** The player demonstrates emotional flexibility — choosing different emotional responses for different contexts, matching emotion to situation with increasing accuracy.

---

## 3. Game Design

### Setup
The Wroth-Chooser's Trial: emotional dilemmas in a Red-stage context. Warriors face situations requiring emotional decisions. The War-Sage presents scenarios; the player chooses. Outcomes reveal wisdom. The aesthetic: war-council, firelit deliberation, the weight of emotional choice before battle.

### Interaction
- **Binary Emotions:** "Rage or restraint?" Simple two-option emotional choices with clear contexts.
- **Weighted Choices:** Three emotional options with different costs/benefits. Must weigh.
- **Competing Feelings:** Two emotions are both valid; must choose which to PRIORITISE.
- **Emotional Revision:** Mid-scenario, conditions change. Original emotional choice may need revision.
- **The Impossible Feeling:** Dilemmas where NO emotional response is perfect; must choose least-bad.

### Feedback
- Contextually wise choice → "Your feeling matched the moment. That is the warrior's wisdom."
- Compulsive choice (same every time) → "You chose rage again. Is rage ALWAYS the answer?"
- Avoidant choice → "You chose nothing. But the moment demanded SOMETHING."
- Contextual flexibility → "Different moments, different feelings. You read the field."

### Difficulty Adaptation
- Options: 2 → 3 → 4; Context complexity: obvious → ambiguous → contradictory
- Time pressure: unlimited → 10s → 5s; Revision frequency: none → occasional → frequent
- Consequence visibility: immediate → delayed → uncertain

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| Binary Emotions | 1-5 | Two options, obvious contexts, immediate outcomes |
| Weighted Choices | 5-15 | Three options, cost/benefit weighing |
| Competing Feelings | 15-30 | Both-valid dilemmas, prioritisation |
| Emotional Revision | 30-50 | Changing conditions, adaptive choice |
| The Impossible Feeling | 50+ | No-perfect-answer dilemmas, wisdom under uncertainty |

---

## 4. Item Pool

### Item types
- **Binary dilemmas:** Two emotional options with clear contexts
- **Weighted dilemmas:** Multiple options with varied costs/benefits
- **Competing-feeling dilemmas:** Both-valid scenarios requiring prioritisation
- **Revision scenarios:** Changing-condition dilemmas
- **Impossible dilemmas:** No-perfect-answer situations

### Minimum pool size
- 30+ binary, 25+ weighted, 20+ competing, 15+ revision, 10+ impossible

### Generation rules
- All dilemmas grounded in Red-stage contexts (power, territory, combat, allies)
- Each dilemma must have a "contextually optimal" response (validated)
- Dilemmas must cover all 5 basic emotions as potential correct answers
- No dilemma should have "always choose X" as the pattern across the pool

### Drive/shadow mapping
- Rage-choice rate regardless of context → dark-addiction
- Suppression-choice rate regardless of context → dark-allergy
- Always-sophisticated choice → golden-addiction
- Never-vulnerability choice → golden-allergy
- Ally-cost sensitivity → Agency; other-matching → Communion; novelty-seeking → Eros; foundation quality → Agape

---

## 5. Technical Requirements

### Input types
- Tap-to-select (choose emotional option from presented choices)
- Timed selection (decision under time pressure)
- Revision input (change previous choice when conditions shift)

### Timing requirements
- Decision time tracked (diagnostic); no millisecond precision needed

### NPC/AI requirements
- War-Sage NPC: presents dilemmas, evaluates choices, provides wisdom
- Scenario NPCs: populate dilemma contexts (allies, enemies, situations)

### LLM requirements
- **High:** Generates contextual dilemmas, evaluates choice-quality, adapts scenarios to player's shadow pattern. Some scoring algorithmic (choice-pattern analysis).

### State persistence
- Choice patterns per emotion-type; contextual accuracy history; flexibility score; revision quality; drive/shadow signals; checkpoint position
